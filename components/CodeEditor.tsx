"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const languageMap: Record<string, string> = {
  "JavaScript / TypeScript": "typescript",
  "Python": "python",
  "Java": "java",
  "C++": "cpp",
  "Go": "go",
  "Rust": "rust",
  "C#": "csharp",
  "Ruby": "ruby",
  "Swift": "swift",
  "Kotlin": "kotlin",
};

const starterTemplates: Record<string, string> = {
  typescript: `// Write your solution here\n\nfunction solution() {\n  \n}\n`,
  python: `# Write your solution here\n\ndef solution():\n    pass\n`,
  java: `// Write your solution here\n\nclass Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n`,
  cpp: `// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n`,
  go: `// Write your solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello")\n}\n`,
  rust: `// Write your solution here\n\nfn main() {\n    \n}\n`,
  csharp: `// Write your solution here\nusing System;\n\nclass Solution {\n    static void Main() {\n        \n    }\n}\n`,
  ruby: `# Write your solution here\n\ndef solution\n  \nend\n`,
  swift: `// Write your solution here\n\nfunc solution() {\n    \n}\n`,
  kotlin: `// Write your solution here\n\nfun main() {\n    \n}\n`,
};

const languageDisplayNames: Record<string, string> = {
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
  csharp: "C#",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
};

interface CodeEditorProps {
  preferredLanguage?: string;
  onCodeStateChange?: (state: { code: string; executed: boolean; correct: boolean }) => void;
}

const CodeEditor = ({ preferredLanguage, onCodeStateChange }: CodeEditorProps) => {
  const monacoLang = languageMap[preferredLanguage || ""] || "typescript";
  const [code, setCode] = useState(starterTemplates[monacoLang] || starterTemplates.typescript);
  const [output, setOutput] = useState<string>("");
  const [showOutput, setShowOutput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Track execution state
  const [hasExecuted, setHasExecuted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Notify parent of state changes
  useEffect(() => {
    if (onCodeStateChange) {
      onCodeStateChange({
        code,
        executed: hasExecuted,
        correct: isCorrect,
      });
    }
  }, [code, hasExecuted, isCorrect, onCodeStateChange]);

  const handleRun = async () => {
    setShowOutput(true);
    setIsRunning(true);
    setOutput("Executing code...");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: monacoLang === "csharp" ? "csharp" : monacoLang === "cpp" ? "c++" : monacoLang,
          version: "*",
          files: [{ content: code }],
        }),
      });

      const data = await response.json();
      
      if (data.run) {
        let result = data.run.stdout || "";
        const hasError = !!data.run.stderr || data.run.code !== 0;
        if (data.run.stderr) {
          result += (result ? "\n" : "") + data.run.stderr;
        }
        setOutput(result || "Code executed successfully, but there was no output.");
        setHasExecuted(true);
        setIsCorrect(!hasError);
      } else {
        setOutput(data.message || "Failed to execute code.");
        setHasExecuted(true);
        setIsCorrect(false);
      }
    } catch (error: any) {
      setOutput(`Execution error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(starterTemplates[monacoLang] || starterTemplates.typescript);
    setShowOutput(false);
    setOutput("");
  };

  return (
    <div className="code-editor-container flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#1a1a1a]/20">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
            <span className="w-3 h-3 rounded-full bg-[#febc2e]"></span>
            <span className="w-3 h-3 rounded-full bg-[#28c840]"></span>
          </div>
          {/* Language Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] rounded-md border border-[#3c3c3c]">
            <svg className="w-3.5 h-3.5 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
            <span className="text-xs text-[#cccccc] font-mono">
              {languageDisplayNames[monacoLang] || "TypeScript"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-mono text-[#999] hover:text-white hover:bg-[#3c3c3c] rounded-md transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-white text-xs font-bold rounded-md transition-colors ${isRunning ? 'bg-[#15803d]/50 cursor-not-allowed' : 'bg-[#16a34a] hover:bg-[#15803d]'}`}
          >
            {isRunning ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "all",
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            suggestOnTriggerCharacters: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#999] text-sm font-mono">Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Output Panel */}
      {showOutput && (
        <div className="border-t border-[#3c3c3c]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526]">
            <span className="text-xs font-mono text-[#999]">OUTPUT</span>
            <button
              onClick={() => setShowOutput(false)}
              className="text-[#999] hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 py-3 bg-[#1e1e1e] max-h-24 overflow-y-auto">
            <pre className="text-xs font-mono text-[#cccccc] whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
