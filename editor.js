// editor.js - Monaco Editor integration matching reference site (agai-10m-q.onrender.com)

let editorInstance = null;

export function initMonacoEditor(containerElement, initialCode, onChangeCallback) {
  return new Promise((resolve) => {
    if (window.monaco) {
      createEditor();
    } else if (window.require) {
      window.require.config({
        paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" }
      });
      window.require(["vs/editor/editor.main"], () => {
        createEditor();
      });
    }

    function createEditor() {
      editorInstance = monaco.editor.create(containerElement, {
        value: initialCode,
        language: "python",
        theme: "vs-dark",
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
        fontLigatures: true,
        tabSize: 4,
        insertSpaces: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        lineNumbers: "on",
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoSurround: "brackets",
        suggestOnTriggerCharacters: true,
        quickSuggestions: { other: true, comments: false, strings: false },
        formatOnPaste: true,
        formatOnType: true,
        padding: { top: 12, bottom: 12 }
      });

      if (onChangeCallback) {
        editorInstance.onDidChangeModelContent(() => {
          onChangeCallback(editorInstance.getValue());
        });
      }

      // Keyboard shortcut handlers
      editorInstance.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
        const runBtn = document.getElementById("btn-run");
        if (runBtn) runBtn.click();
      });

      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        const submitBtn = document.getElementById("btn-submit");
        if (submitBtn) submitBtn.click();
      });

      resolve(editorInstance);
    }
  });
}

export function getEditorValue() {
  return editorInstance ? editorInstance.getValue() : "";
}

export function setEditorValue(code) {
  if (editorInstance) {
    editorInstance.setValue(code);
  }
}

export function setEditorTheme(themeName) {
  if (window.monaco) {
    monaco.editor.setTheme(themeName);
  }
}
