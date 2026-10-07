import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import * as api from '../../services/api.ts';
import {
  Code2,
  Play,
  FileCode,
  FolderTree,
  Plus,
  Trash2,
  Sparkles,
  Terminal,
  Download,
  Check,
  RefreshCw,
  Wrench,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const CodingView: React.FC = () => {
  const { assistantName, addToast } = useApp();

  const [files, setFiles] = useState<Record<string, string>>({
    'index.ts': `// Sample TypeScript Task Runner
export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export function filterActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter(t => !t.done);
}

const sampleTasks: Task[] = [
  { id: '1', title: 'Connect Live Voice', done: true },
  { id: '2', title: 'Implement Sandbox Runner', done: true },
  { id: '3', title: 'Verify custom assistant name', done: false }
];

console.log("Active Tasks:", filterActiveTasks(sampleTasks));
`,
    'auth.ts': `// Firebase Authentication Helper
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

console.log("Validation test:", validateEmail("user@example.com"));
`,
  });

  const [activeFile, setActiveFile] = useState<string>('index.ts');
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  // Terminal state
  const [terminalOutput, setTerminalOutput] = useState<string>('Terminal initialized. Click "Run in Sandbox" to test.');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // AI Agent prompt state
  const [agentPrompt, setAgentPrompt] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string[]>([]);
  const [planExplanation, setPlanExplanation] = useState<string | null>(null);

  const handleRunCode = async () => {
    const code = files[activeFile];
    if (!code) return;

    setIsRunning(true);
    setTerminalOutput(`Executing ${activeFile} in secure isolated Node sandbox...\n`);

    try {
      const result = await api.runCodeInSandbox(code, 'javascript');
      setExecutionTime(result.executionTimeMs);

      if (result.success) {
        setTerminalOutput(`[Execution Success in ${result.executionTimeMs}ms]\n\n${result.output}`);
        addToast('Code executed successfully!', 'success');
      } else {
        setTerminalOutput(`[Execution Failed in ${result.executionTimeMs}ms]\n\nError:\n${result.error || ''}\n\nOutput:\n${result.output || ''}`);
        addToast('Execution failed. See terminal output.', 'error');
      }
    } catch (err: any) {
      setTerminalOutput(`Sandbox execution error: ${err.message}`);
      addToast(`Sandbox error: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAgentPlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agentPrompt.trim()) return;

    setIsPlanning(true);
    setCurrentPlan([]);
    setPlanExplanation(null);

    try {
      const planResult = await api.generateCodingPlan(agentPrompt, files);
      setCurrentPlan(planResult.plan || []);
      setPlanExplanation(planResult.explanation);

      if (planResult.files && planResult.files.length > 0) {
        const updatedFiles = { ...files };
        for (const fileItem of planResult.files) {
          updatedFiles[fileItem.name] = fileItem.content;
        }
        setFiles(updatedFiles);
        setActiveFile(planResult.files[0].name);
        addToast(`Generated ${planResult.files.length} file(s) for your project!`, 'success');
      }

      setAgentPrompt('');
    } catch (err: any) {
      addToast(`Coding agent error: ${err.message}`, 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const clean = newFileName.trim();
    if (files[clean]) {
      addToast('File already exists', 'error');
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [clean]: `// New file: ${clean}\n`,
    }));
    setActiveFile(clean);
    setNewFileName('');
    setShowNewFileInput(false);
    addToast(`Created file: ${clean}`, 'success');
  };

  const handleDeleteFile = (fileName: string) => {
    const fileKeys = Object.keys(files);
    if (fileKeys.length <= 1) {
      addToast('Cannot delete the last remaining file', 'error');
      return;
    }

    const newFiles = { ...files };
    delete newFiles[fileName];
    setFiles(newFiles);

    if (activeFile === fileName) {
      setActiveFile(Object.keys(newFiles)[0]);
    }
    addToast(`Deleted ${fileName}`, 'info');
  };

  const handleExportZip = () => {
    // Generate simple text download bundle
    const content = Object.entries(files)
      .map(([name, code]) => `=== FILE: ${name} ===\n${code}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_export.txt';
    a.click();
    addToast('Project bundle downloaded', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-[#050713]">
      {/* Top Coding Toolbar */}
      <div className="p-3 sm:px-6 glass-panel border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{assistantName} Coding Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                SANDBOX READY
              </span>
            </h2>
            <div className="text-xs text-slate-400">
              Autonomous multi-file planner & isolated container runner
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run in Sandbox'}</span>
          </button>

          <button
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-semibold"
            title="Download project files"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Grid: File Tree + Code Editor + Terminal + AI Agent Input */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: File Explorer */}
        <div className="w-full lg:w-60 glass-panel border-r border-purple-500/20 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Project Files</span>
            </span>
            <button
              onClick={() => setShowNewFileInput(!showNewFileInput)}
              className="p-1 text-slate-400 hover:text-white"
              title="Add new file"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showNewFileInput && (
            <div className="p-2 border-b border-white/10 flex items-center gap-1">
              <input
                type="text"
                placeholder="filename.ts"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
                className="flex-1 px-2 py-1 text-xs glass-input rounded text-white focus:outline-none"
              />
              <button
                onClick={handleAddFile}
                className="p-1 bg-pink-500 rounded text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {Object.keys(files).map((fileName) => {
              const isSelected = activeFile === fileName;
              return (
                <div
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-600/30 text-pink-300 border border-purple-500/40'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(fileName);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-purple-500/20">
          <div className="px-4 py-2 border-b border-white/10 glass-card flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Editing: <strong className="text-white">{activeFile}</strong></span>
            <span>{files[activeFile]?.split('\n').length || 0} lines</span>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#060817]">
            <textarea
              value={files[activeFile] || ''}
              onChange={(e) =>
                setFiles({
                  ...files,
                  [activeFile]: e.target.value,
                })
              }
              className="w-full h-full p-4 font-mono text-xs sm:text-sm text-slate-200 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-purple-600 selection:text-white"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right / Bottom: AI Planner & Terminal Output */}
        <div className="w-full lg:w-96 flex flex-col shrink-0 bg-[#070a20]">
          {/* AI Coding Agent Planner Input */}
          <div className="p-4 border-b border-purple-500/20 glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Agent Instructions</span>
              </span>
              {isPlanning && <span className="text-[10px] text-pink-400 animate-pulse">Planning...</span>}
            </div>

            <form onSubmit={handleAgentPlan} className="space-y-2">
              <textarea
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="e.g. 'Create a Firebase login page with form validation', 'Refactor this code', 'Fix runtime error'..."
                rows={3}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={isPlanning || !agentPrompt.trim()}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isPlanning ? 'Architecting...' : 'Generate / Fix Code'}</span>
              </button>
            </form>

            {/* Generated Plan Steps */}
            {currentPlan.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2 text-xs">
                <div className="font-bold text-purple-200">Execution Plan:</div>
                <ul className="space-y-1 text-slate-300">
                  {currentPlan.map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-pink-400 font-bold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                {planExplanation && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
                    {planExplanation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Terminal / Sandbox Output */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Sandbox Output</span>
              </span>
              {executionTime !== null && (
                <span className="text-[10px] font-mono text-slate-400">{executionTime}ms</span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-300 whitespace-pre-wrap selection:bg-emerald-700 selection:text-white">
              {terminalOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
