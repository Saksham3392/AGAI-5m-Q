// app.js - Application Logic for AI Systems Lab Theme

import { PROBLEMS } from './problems.js?v=11.0';
import { initMonacoEditor, getEditorValue, setEditorValue } from './editor.js?v=11.0';
import { getPyodide, runPythonTest, deepCompare } from './pyodide-runner.js?v=11.0';

let currentProblemIndex = 0;
let currentTestcaseIndex = 0;
let isCustomTestcase = false;
let customInputData = {};
let isExecuting = false;
let solvedProblems = new Set(JSON.parse(localStorage.getItem('solved_problems_v3') || '[]'));

// Storage key helper
function getStorageKey(problemId) {
  return `code_lab_${problemId}`;
}

function getEffectiveCode(problem) {
  const saved = localStorage.getItem(getStorageKey(problem.id));
  if (!saved || !saved.includes("# Header") || !saved.includes("# Tail")) {
    return problem.starterCode;
  }
  return saved;
}

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  renderProblemDropdown();

  // Load initial problem
  const initialProblem = PROBLEMS[currentProblemIndex];
  renderProblemView(initialProblem);

  // Initialize Monaco Editor with full prewritten code
  const initialCode = getEffectiveCode(initialProblem);
  const editorContainer = document.getElementById("monaco-container");
  
  const monacoEditor = await initMonacoEditor(editorContainer, initialCode, (newCode) => {
    const curProb = PROBLEMS[currentProblemIndex];
    localStorage.setItem(getStorageKey(curProb.id), newCode);
  });

  // Track cursor position (Ln X, Col Y)
  if (monacoEditor) {
    monacoEditor.onDidChangeCursorPosition((e) => {
      const posEl = document.getElementById("editor-cursor-pos");
      if (posEl) {
        posEl.innerText = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
      }
    });
  }

  // Pre-fetch Pyodide in background
  getPyodide((status) => {
    updateCompilerStatus(status);
  }).catch((err) => {
    console.warn("Pyodide background preload:", err);
  });

  // Keyboard Shortcuts: Shift+Enter -> Run, Ctrl+Enter -> Submit
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      handleRunCurrentTestcase();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmitAll();
    }
  });
});

function setupEventListeners() {
  // Navigation Problem Dropdown / Buttons
  document.getElementById("btn-prev-problem")?.addEventListener("click", () => navigateProblem(-1));
  document.getElementById("btn-next-problem")?.addEventListener("click", () => navigateProblem(1));
  document.getElementById("problem-select")?.addEventListener("change", (e) => {
    switchProblem(parseInt(e.target.value, 10));
  });

  // Left Pane Sub-Tabs: Description vs Hints
  document.getElementById("tab-btn-desc")?.addEventListener("click", () => switchLeftSubtab("desc"));
  document.getElementById("tab-btn-hints")?.addEventListener("click", () => switchLeftSubtab("hints"));

  // Note Modal
  document.getElementById("btn-open-note")?.addEventListener("click", () => toggleNoteModal(true));
  document.getElementById("btn-close-note")?.addEventListener("click", () => toggleNoteModal(false));
  document.getElementById("note-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "note-modal") toggleNoteModal(false);
  });

  // Reset All Button
  document.getElementById("btn-reset-all")?.addEventListener("click", handleResetAll);

  // Editor Actions
  document.getElementById("btn-reset-code")?.addEventListener("click", resetCurrentCode);
  document.getElementById("btn-load-solution")?.addEventListener("click", loadSolutionIntoEditor);

  // Execution Buttons
  document.getElementById("btn-run")?.addEventListener("click", handleRunCurrentTestcase);
  document.getElementById("btn-submit")?.addEventListener("click", handleSubmitAll);

  // Bottom Panel Tabs
  document.querySelectorAll("[data-panel-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-panel-tab");
      switchBottomPanelTab(tabName);
    });
  });

  // Clear Console Button
  document.getElementById("btn-clear-console")?.addEventListener("click", clearResultConsole);

  // Custom JSON input sync
  document.getElementById("testcase-json-input")?.addEventListener("input", (e) => {
    if (isCustomTestcase) {
      try {
        customInputData = JSON.parse(e.target.value);
      } catch (err) {
        // Invalid json while typing
      }
    }
  });
}

function toggleNoteModal(open) {
  const modal = document.getElementById("note-modal");
  if (modal) modal.classList.toggle("hidden", !open);
}

function switchLeftSubtab(tabName) {
  const isDesc = tabName === "desc";
  const descBtn = document.getElementById("tab-btn-desc");
  const hintsBtn = document.getElementById("tab-btn-hints");
  const descContent = document.getElementById("subtab-content-desc");
  const hintsContent = document.getElementById("subtab-content-hints");

  if (descBtn) {
    descBtn.classList.toggle("active", isDesc);
    descBtn.classList.toggle("text-blue-400", isDesc);
    descBtn.classList.toggle("border-blue-500", isDesc);
    descBtn.classList.toggle("text-slate-400", !isDesc);
    descBtn.classList.toggle("border-transparent", !isDesc);
  }

  if (hintsBtn) {
    hintsBtn.classList.toggle("active", !isDesc);
    hintsBtn.classList.toggle("text-blue-400", !isDesc);
    hintsBtn.classList.toggle("border-blue-500", !isDesc);
    hintsBtn.classList.toggle("text-slate-400", isDesc);
    hintsBtn.classList.toggle("border-transparent", isDesc);
  }

  if (descContent) descContent.classList.toggle("hidden", !isDesc);
  if (hintsContent) hintsContent.classList.toggle("hidden", isDesc);
}

function renderProblemDropdown() {
  const selectElem = document.getElementById("problem-select");
  if (selectElem) {
    selectElem.innerHTML = PROBLEMS.map((p, idx) => {
      const isSolved = solvedProblems.has(p.id);
      return `<option value="${idx}" class="bg-[#0e1424] text-slate-100 py-2">${isSolved ? "✓ " : ""}${p.number}. ${p.title}</option>`;
    }).join("");
    selectElem.value = currentProblemIndex;
  }
}

export function switchProblem(index) {
  if (index < 0 || index >= PROBLEMS.length) return;
  currentProblemIndex = index;
  currentTestcaseIndex = 0;
  isCustomTestcase = false;

  const problem = PROBLEMS[currentProblemIndex];
  renderProblemView(problem);

  // Load saved or starter code with Header, Body, and Tail
  const effectiveCode = getEffectiveCode(problem);
  setEditorValue(effectiveCode);

  renderProblemDropdown();
  updateSolvedStatusBadge(problem.id);

  // Reset panels
  switchBottomPanelTab("testcase");
  switchLeftSubtab("desc");
  clearResultConsole();
}

function navigateProblem(direction) {
  const newIndex = currentProblemIndex + direction;
  if (newIndex >= 0 && newIndex < PROBLEMS.length) {
    switchProblem(newIndex);
  }
}

function renderProblemView(problem) {
  // Title & Difficulty
  document.getElementById("problem-title").innerText = `${problem.number}. ${problem.title}`;
  
  const diffBadge = document.getElementById("problem-difficulty");
  diffBadge.innerText = problem.difficulty;
  diffBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-medium ${
    problem.difficulty === 'Easy' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-600/40' : 'bg-amber-950/40 text-amber-400 border border-amber-600/40'
  }`;

  // Tags
  const tagsContainer = document.getElementById("problem-tags-container");
  if (tagsContainer && problem.tags) {
    tagsContainer.innerHTML = problem.tags.map(tag => {
      if (tag === "Exam Q") {
        return `<span class="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">⭐ Exam Q</span>`;
      }
      return `<span class="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-900 text-slate-300 border border-slate-800">${tag}</span>`;
    }).join("");
  }

  // Render Full Problem Description with Custom Rich Formatter & KaTeX
  const descEl = document.getElementById("problem-desc-body");
  if (descEl) {
    descEl.innerHTML = formatProblemDescription(problem.description);

    // Apply KaTeX math rendering if available
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(descEl, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn("KaTeX render error:", e);
      }
    }
  }

  // Render Hints
  renderHintsAccordion(problem.hints || []);

  // Render Testcase Tabs
  renderTestcaseTabs(problem);
}

function formatProblemDescription(rawText) {
  if (!rawText) return "";
  
  const text = rawText.trim().replace(/\r\n/g, "\n");
  const blocks = text.split(/\n\s*\n/);
  
  const htmlParts = blocks.map(block => {
    block = block.trim();
    if (!block) return "";
    
    // Section header (### ...)
    if (block.startsWith("### ")) {
      const heading = block.replace(/^###\s*/, "");
      return `<h3 class="problem-section-heading">${formatInline(heading)}</h3>`;
    }
    
    // Constraint / warning
    if (
      block.toLowerCase().includes("do not use numpy") ||
      block.toLowerCase().includes("do not use external") ||
      block.toLowerCase().includes("do not use pytorch") ||
      block.toLowerCase().startsWith("constraint:")
    ) {
      return `
        <div class="constraint-box">
          <div class="constraint-icon">⚠️</div>
          <div class="constraint-text">${formatInline(block)}</div>
        </div>
      `;
    }
    
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    
    // Bullet list (* or - or •)
    const isBulletList = lines.length > 0 && lines.every(l => l.startsWith("* ") || l.startsWith("- ") || l.startsWith("• "));
    if (isBulletList) {
      const itemsHtml = lines.map(line => {
        const itemContent = line.replace(/^[\*\-•]\s*/, "");
        return `
          <div class="param-item-card">
            <span class="param-glow-dot"></span>
            <div class="param-content">${formatInline(itemContent)}</div>
          </div>
        `;
      }).join("");
      return `<div class="param-list-container">${itemsHtml}</div>`;
    }
    
    // Numbered list (1. 2. 3.)
    const isNumberedList = lines.length > 0 && lines.every(l => /^\d+\.\s/.test(l));
    if (isNumberedList) {
      const itemsHtml = lines.map((line, idx) => {
        const itemContent = line.replace(/^\d+\.\s*/, "");
        return `
          <div class="step-item-card">
            <div class="step-badge">${idx + 1}</div>
            <div class="step-content">${formatInline(itemContent)}</div>
          </div>
        `;
      }).join("");
      return `<div class="step-list-container">${itemsHtml}</div>`;
    }
    
    // Standalone backticked formula or tensor shape
    if (block.startsWith("`") && block.endsWith("`") && block.indexOf("`", 1) === block.length - 1) {
      const codeContent = block.slice(1, -1);
      return `
        <div class="formula-box">
          <code class="formula-code">${escapeHtml(codeContent)}</code>
        </div>
      `;
    }
    
    // Standard paragraph with inline formatting
    return `<p class="problem-text">${formatInline(block)}</p>`;
  });
  
  return htmlParts.join("");
}

function formatInline(str) {
  if (!str) return "";
  let escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Code backticks: `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  // Bold: **bold**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  return escaped;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderHintsAccordion(hints) {
  const container = document.getElementById("hints-accordion-container");
  if (!container) return;

  if (!hints || hints.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500 font-mono">No hints available for this question.</p>`;
    return;
  }

  container.innerHTML = hints.map((hint, idx) => `
    <div class="border border-slate-800 bg-[#090d16] rounded-xl overflow-hidden">
      <button onclick="document.getElementById('hint-body-${idx}').classList.toggle('hidden')" class="w-full p-3 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors">
        <span class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-mono text-[10px] flex items-center justify-center font-bold">${idx + 1}</span>
          <span>Hint ${idx + 1}</span>
        </span>
        <span class="text-slate-400 font-mono text-[10px]">Toggle</span>
      </button>
      <div id="hint-body-${idx}" class="hidden p-3 pt-0 text-xs text-slate-300 leading-relaxed font-mono border-t border-slate-800/60 bg-[#060911]">
        ${hint}
      </div>
    </div>
  `).join("");
}

function renderTestcaseTabs(problem) {
  const pillsContainer = document.getElementById("testcase-tab-pills");
  if (!pillsContainer) return;

  let html = "";
  problem.testCases.forEach((tc, idx) => {
    const activeClass = (!isCustomTestcase && idx === currentTestcaseIndex)
      ? "bg-blue-950/70 text-blue-300 border-blue-600/70 font-semibold"
      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200";
    html += `
      <button onclick="window.selectTestcaseTab(${idx})" class="testcase-pill px-3 py-1 text-xs rounded-lg border transition-all ${activeClass}">
        Case ${idx + 1}
      </button>
    `;
  });

  const customActiveClass = isCustomTestcase
    ? "bg-blue-950/70 text-blue-300 border-blue-600/70 font-semibold"
    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200";

  html += `
    <button onclick="window.selectCustomCaseTab()" class="testcase-pill px-3 py-1 text-xs rounded-lg border transition-all ${customActiveClass}">
      + Custom Case
    </button>
  `;

  pillsContainer.innerHTML = html;
  populateTestcaseInputBox();
}

window.selectTestcaseTab = (idx) => {
  isCustomTestcase = false;
  currentTestcaseIndex = idx;
  const problem = PROBLEMS[currentProblemIndex];
  renderTestcaseTabs(problem);
};

window.selectCustomCaseTab = () => {
  isCustomTestcase = true;
  const problem = PROBLEMS[currentProblemIndex];
  if (!customInputData || Object.keys(customInputData).length === 0) {
    customInputData = JSON.parse(JSON.stringify(problem.testCases[0].input));
  }
  renderTestcaseTabs(problem);
};

function populateTestcaseInputBox() {
  const inputEl = document.getElementById("testcase-json-input");
  const hintEl = document.getElementById("custom-case-hint");
  if (!inputEl) return;

  const problem = PROBLEMS[currentProblemIndex];
  if (isCustomTestcase) {
    inputEl.value = JSON.stringify(customInputData, null, 2);
    inputEl.readOnly = false;
    if (hintEl) hintEl.classList.remove("hidden");
  } else {
    const tc = problem.testCases[currentTestcaseIndex];
    inputEl.value = JSON.stringify(tc ? tc.input : {}, null, 2);
    inputEl.readOnly = true;
    if (hintEl) hintEl.classList.add("hidden");
  }
}

function updateSolvedStatusBadge(problemId) {
  const isSolved = solvedProblems.has(problemId);
  const badge = document.getElementById("badge-status-solved");
  if (badge) {
    badge.classList.toggle("hidden", !isSolved);
  }
}

function switchBottomPanelTab(tabName) {
  document.querySelectorAll("[data-panel-tab]").forEach(b => {
    const active = b.getAttribute("data-panel-tab") === tabName;
    b.classList.toggle("active", active);
    b.classList.toggle("text-blue-400", active);
    b.classList.toggle("border-blue-500", active);
    b.classList.toggle("text-slate-400", !active);
    b.classList.toggle("border-transparent", !active);
  });

  const testcasePanel = document.getElementById("panel-testcase-inputs");
  const resultPanel = document.getElementById("panel-testcase-results");
  const consolePanel = document.getElementById("panel-console-log");

  if (testcasePanel) testcasePanel.classList.toggle("hidden", tabName !== "testcase");
  if (resultPanel) resultPanel.classList.toggle("hidden", tabName !== "result");
  if (consolePanel) consolePanel.classList.toggle("hidden", tabName !== "console");
}

function resetCurrentCode() {
  if (confirm("Reset code back to starter template? Your current edits will be discarded.")) {
    const curProb = PROBLEMS[currentProblemIndex];
    setEditorValue(curProb.starterCode);
    localStorage.removeItem(getStorageKey(curProb.id));
    showToast("Code reset to template.", "info");
  }
}

function loadSolutionIntoEditor() {
  const curProb = PROBLEMS[currentProblemIndex];
  setEditorValue(curProb.solutionCode);
  localStorage.setItem(getStorageKey(curProb.id), curProb.solutionCode);
  showToast("Reference solution loaded into editor!", "info");
}

function handleResetAll() {
  if (confirm("Reset all solved states and code across ALL questions back to default?")) {
    PROBLEMS.forEach(p => {
      localStorage.removeItem(getStorageKey(p.id));
    });
    localStorage.removeItem('solved_problems_v3');
    solvedProblems.clear();
    switchProblem(0);
    showToast("All progress reset.", "info");
  }
}

// Execution Handlers
async function handleRunCurrentTestcase() {
  if (isExecuting) return;
  const problem = PROBLEMS[currentProblemIndex];
  const userCode = getEditorValue();

  let inputData;
  if (isCustomTestcase) {
    try {
      const raw = document.getElementById("testcase-json-input").value;
      inputData = JSON.parse(raw);
    } catch (e) {
      showToast("Invalid JSON in custom input!", "error");
      return;
    }
  } else {
    inputData = problem.testCases[currentTestcaseIndex].input;
  }

  setExecutionState(true, "Running Python testcase...");
  switchBottomPanelTab("result");

  try {
    const result = await runPythonTest(userCode, problem, inputData, (status) => {
      updateCompilerStatus(status);
    });

    const expected = isCustomTestcase ? null : problem.testCases[currentTestcaseIndex].expectedOutput;
    const passed = expected !== null && result.success && deepCompare(result.parsedOutput, expected);

    renderSingleResultView(passed, result, expected, isCustomTestcase ? "Custom Case" : `Case ${currentTestcaseIndex + 1}`);
    appendConsoleOutput(`[Run] Executed ${isCustomTestcase ? "Custom Case" : `Case ${currentTestcaseIndex + 1}`} in ${result.executionTimeMs}ms\n${result.rawOutput}`);
    showToast(result.success ? (passed ? "Test Passed!" : "Wrong Answer") : "Runtime Error", passed ? "success" : "error");
  } catch (err) {
    renderErrorResultView(err.message);
  } finally {
    setExecutionState(false, "Python 3.11 + NumPy Ready");
  }
}

async function handleSubmitAll() {
  if (isExecuting) return;
  const problem = PROBLEMS[currentProblemIndex];
  const userCode = getEditorValue();

  setExecutionState(true, `Submitting against all ${problem.testCases.length} testcases...`);
  switchBottomPanelTab("result");

  const results = [];
  let allPassed = true;
  let totalTime = 0;

  for (let i = 0; i < problem.testCases.length; i++) {
    const tc = problem.testCases[i];
    updateCompilerStatus(`Running test case ${i + 1}/${problem.testCases.length}...`);

    try {
      const res = await runPythonTest(userCode, problem, tc.input);
      totalTime += res.executionTimeMs;
      const passed = res.success && deepCompare(res.parsedOutput, tc.expectedOutput);
      if (!passed) allPassed = false;
      results.push({
        caseNumber: i + 1,
        name: tc.name,
        passed: passed,
        executionTimeMs: res.executionTimeMs,
        expected: tc.expectedOutput,
        actual: res.parsedOutput,
        rawOutput: res.rawOutput,
        error: res.error || (res.success && !passed ? "Output mismatch" : null)
      });
    } catch (err) {
      allPassed = false;
      results.push({
        caseNumber: i + 1,
        name: tc.name,
        passed: false,
        executionTimeMs: 0,
        expected: tc.expectedOutput,
        actual: null,
        error: err.message
      });
    }
  }

  if (allPassed) {
    solvedProblems.add(problem.id);
    localStorage.setItem('solved_problems_v3', JSON.stringify(Array.from(solvedProblems)));
    renderProblemDropdown();
    updateSolvedStatusBadge(problem.id);
    showToast("🎉 Accepted! All test cases passed!", "success");
  } else {
    showToast("Wrong Answer on one or more testcases.", "error");
  }

  renderMultiResultView(allPassed, results, totalTime);
  setExecutionState(false, "Python 3.11 + NumPy Ready");
}

function renderSingleResultView(passed, result, expected, caseName) {
  const badge = document.getElementById("result-status-badge");
  const runtime = document.getElementById("result-runtime-text");
  const summary = document.getElementById("result-testcase-summary");
  const details = document.getElementById("result-case-details");
  const tabs = document.getElementById("result-cases-tabs");

  if (tabs) tabs.innerHTML = "";

  if (badge) {
    if (!result.success) {
      badge.innerText = "Runtime Error";
      badge.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-rose-950/60 text-rose-400 border border-rose-700/60";
    } else if (passed) {
      badge.innerText = "Accepted";
      badge.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-700/60";
    } else {
      badge.innerText = "Wrong Answer";
      badge.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-950/60 text-amber-400 border border-amber-700/60";
    }
  }

  if (runtime) runtime.innerText = `${result.executionTimeMs} ms`;
  if (summary) summary.innerText = caseName;

  if (details) {
    if (!result.success) {
      details.innerHTML = `
        <div class="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 whitespace-pre-wrap font-mono text-xs">
          ${result.error || "Unknown execution error"}
        </div>
      `;
    } else {
      details.innerHTML = `
        <div class="space-y-2">
          ${expected !== null ? `
          <div class="space-y-1">
            <span class="text-slate-400 text-[11px]">Expected Output:</span>
            <pre class="p-2 bg-[#05080f] border border-slate-800 rounded text-emerald-400 overflow-x-auto">${JSON.stringify(expected, null, 2)}</pre>
          </div>` : ''}
          <div class="space-y-1">
            <span class="text-slate-400 text-[11px]">Actual Output:</span>
            <pre class="p-2 bg-[#05080f] border border-slate-800 rounded ${passed ? 'text-emerald-400' : 'text-rose-400'} overflow-x-auto">${result.rawOutput || JSON.stringify(result.parsedOutput, null, 2)}</pre>
          </div>
        </div>
      `;
    }
  }
}

function renderMultiResultView(allPassed, results, totalTime) {
  const badge = document.getElementById("result-status-badge");
  const runtime = document.getElementById("result-runtime-text");
  const summary = document.getElementById("result-testcase-summary");
  const tabs = document.getElementById("result-cases-tabs");
  const details = document.getElementById("result-case-details");

  const passedCount = results.filter(r => r.passed).length;

  if (badge) {
    if (allPassed) {
      badge.innerText = "Accepted";
      badge.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-700/60";
    } else {
      badge.innerText = "Wrong Answer";
      badge.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-rose-950/60 text-rose-400 border border-rose-700/60";
    }
  }

  if (runtime) runtime.innerText = `${totalTime} ms`;
  if (summary) summary.innerText = `${passedCount}/${results.length} Passed`;

  if (tabs) {
    tabs.innerHTML = results.map((r, idx) => `
      <button onclick="window.selectResultCase(${idx})" class="result-case-pill px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${r.passed ? 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50' : 'bg-rose-950/40 text-rose-400 border-rose-700/50'} ${idx === 0 ? 'ring-1 ring-blue-400' : ''}">
        Case ${r.caseNumber} ${r.passed ? '✓' : '✕'}
      </button>
    `).join("");
  }

  window.submissionResults = results;
  window.selectResultCase(0);
}

window.selectResultCase = (idx) => {
  const results = window.submissionResults;
  if (!results || !results[idx]) return;
  const r = results[idx];
  const details = document.getElementById("result-case-details");

  if (details) {
    if (r.error && !r.actual) {
      details.innerHTML = `<div class="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 whitespace-pre-wrap font-mono text-xs">${r.error}</div>`;
    } else {
      details.innerHTML = `
        <div class="space-y-2">
          <div class="space-y-1">
            <span class="text-slate-400 text-[11px]">Expected Output:</span>
            <pre class="p-2 bg-[#05080f] border border-slate-800 rounded text-emerald-400 overflow-x-auto">${JSON.stringify(r.expected, null, 2)}</pre>
          </div>
          <div class="space-y-1">
            <span class="text-slate-400 text-[11px]">Actual Output:</span>
            <pre class="p-2 bg-[#05080f] border border-slate-800 rounded ${r.passed ? 'text-emerald-400' : 'text-rose-400'} overflow-x-auto">${r.rawOutput || JSON.stringify(r.actual, null, 2)}</pre>
          </div>
        </div>
      `;
    }
  }
};

function renderErrorResultView(errMsg) {
  const badge = document.getElementById("result-status-badge");
  const details = document.getElementById("result-case-details");
  if (badge) {
    badge.innerText = "Error";
    badge.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-rose-950/60 text-rose-400 border border-rose-700/60";
  }
  if (details) {
    details.innerHTML = `<div class="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 font-mono text-xs">${errMsg}</div>`;
  }
}

function clearResultConsole() {
  const details = document.getElementById("result-case-details");
  const banner = document.getElementById("result-status-badge");
  const consoleOutput = document.getElementById("console-output-text");
  if (details) details.innerHTML = `<p class="text-slate-500 font-mono text-xs">Run or submit code to view results.</p>`;
  if (banner) {
    banner.innerText = "Ready";
    banner.className = "px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-slate-800 text-slate-300";
  }
  if (consoleOutput) consoleOutput.innerText = "Console output cleared.";
}

function appendConsoleOutput(text) {
  const consoleOutput = document.getElementById("console-output-text");
  if (consoleOutput) {
    consoleOutput.innerText = text;
  }
}

function setExecutionState(running, statusMsg) {
  isExecuting = running;
  const runBtn = document.getElementById("btn-run");
  const submitBtn = document.getElementById("btn-submit");

  if (runBtn) runBtn.disabled = running;
  if (submitBtn) submitBtn.disabled = running;

  if (statusMsg) updateCompilerStatus(statusMsg);
}

function updateCompilerStatus(msg) {
  const textEl = document.getElementById("compiler-status-text");
  if (textEl) textEl.innerText = msg;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgClass = type === "success" ? "bg-emerald-950 border-emerald-600/70 text-emerald-200" :
                  type === "error" ? "bg-rose-950 border-rose-600/70 text-rose-200" :
                  "bg-slate-900 border-slate-700 text-slate-200";

  toast.className = `px-4 py-2.5 rounded-xl border shadow-2xl text-xs font-mono flex items-center gap-2 pointer-events-auto transition-all transform duration-300 translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove("translate-y-2", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
