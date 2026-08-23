// pyodide-runner.js - Client-Side Python WebAssembly Execution Engine with NumPy Support

let pyodideInstance = null;
let isLoadingPyodide = false;
let pyodideLoadPromise = null;

export async function getPyodide(onProgress) {
  if (pyodideInstance) {
    return pyodideInstance;
  }
  if (pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  isLoadingPyodide = true;
  pyodideLoadPromise = (async () => {
    try {
      if (typeof loadPyodide === "undefined") {
        throw new Error("Pyodide script tag not loaded yet. Please check your internet connection.");
      }
      if (onProgress) onProgress("Downloading Python WebAssembly runtime...");
      
      const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
      });
      
      if (onProgress) onProgress("Loading NumPy package into WebAssembly...");
      await pyodide.loadPackage("numpy");
      
      if (onProgress) onProgress("Initializing modules (numpy, math, json, sys)...");
      await pyodide.runPythonAsync(`
import sys
import json
import math
import io
import numpy as np
`);
      pyodideInstance = pyodide;
      isLoadingPyodide = false;
      if (onProgress) onProgress("Python 3.11 & NumPy ready!");
      return pyodide;
    } catch (err) {
      isLoadingPyodide = false;
      pyodideLoadPromise = null;
      throw err;
    }
  })();

  return pyodideLoadPromise;
}

/**
 * Executes Python code against a specific testcase input (JSON object or string)
 */
export async function runPythonTest(userCode, problem, inputData, onProgress) {
  const pyodide = await getPyodide(onProgress);

  const inputJsonStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);

  // Helper preamble to support numpy serialization seamlessly
  const numpySerializationHelper = `
try:
    import numpy as np
except ImportError:
    pass
`;

  // Determine whether the userCode contains the full stdin driver or just the function body
  let executableScript = "";

  if (userCode.includes("json.loads(sys.stdin.read()") || userCode.includes("sys.stdin.read")) {
    // Full script in compiler
    executableScript = `
import sys
import json
import math
import io
${numpySerializationHelper}

input_str = ${JSON.stringify(inputJsonStr)}
sys.stdin = io.StringIO(input_str)
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

${userCode}

_output_str = sys.stdout.getvalue()
_error_str = sys.stderr.getvalue()
`;
  } else {
    // Function body only
    executableScript = `
import sys
import json
import math
import io
${numpySerializationHelper}

# User & Header definitions
${problem.headerCode}

${userCode}

# Setup stdio
input_str = ${JSON.stringify(inputJsonStr)}
sys.stdin = io.StringIO(input_str)
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

${problem.tailCode}

_output_str = sys.stdout.getvalue()
_error_str = sys.stderr.getvalue()
`;
  }

  const startTime = performance.now();
  try {
    await pyodide.runPythonAsync(executableScript);
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const outputRaw = pyodide.globals.get("_output_str") || "";
    const errorRaw = pyodide.globals.get("_error_str") || "";

    let parsedOutput = null;
    try {
      if (outputRaw.trim().length > 0) {
        parsedOutput = JSON.parse(outputRaw.trim());
      }
    } catch (e) {
      // not json or custom text output
    }

    return {
      success: true,
      rawOutput: outputRaw.trim(),
      parsedOutput: parsedOutput,
      errorOutput: errorRaw.trim(),
      executionTimeMs: durationMs
    };
  } catch (err) {
    const endTime = performance.now();
    return {
      success: false,
      error: formatPythonError(err.message),
      rawOutput: "",
      parsedOutput: null,
      executionTimeMs: Math.round(endTime - startTime)
    };
  }
}

/**
 * Tolerant float & nested array comparison
 */
export function deepCompare(actual, expected, tolerance = 1e-4) {
  if (actual === expected) return true;

  if (typeof actual === "number" && typeof expected === "number") {
    return Math.abs(actual - expected) <= tolerance;
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (!deepCompare(actual[i], expected[i], tolerance)) return false;
    }
    return true;
  }

  if (typeof actual === "object" && actual !== null && typeof expected === "object" && expected !== null) {
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) return false;
    for (const key of expectedKeys) {
      if (!actual.hasOwnProperty(key)) return false;
      if (!deepCompare(actual[key], expected[key], tolerance)) return false;
    }
    return true;
  }

  return false;
}

function formatPythonError(rawError) {
  if (!rawError) return "Unknown execution error";
  const lines = rawError.split("\n");
  const filtered = lines.filter(l => !l.includes("pyodide.runPythonAsync") && !l.includes("File \"<exec>\"") || l.includes("line"));
  return filtered.join("\n").trim() || rawError;
}
