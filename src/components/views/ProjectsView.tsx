import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ProjectItem } from '../../types/index.ts';
import {
  FolderKanban,
  Plus,
  Trash2,
  Code2,
  MessageSquare,
  Sparkles,
  FileText,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, saveProject, deleteProject, setCurrentProject, setActiveView, addToast } = useApp();

  const [showNewModal, setShowNewModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectItem['category']>('Website');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await saveProject({
      name: name.trim(),
      category,
      description: description.trim(),
      instructions: instructions.trim(),
      files: {
        'README.md': `# ${name}\n\n${description}\n`,
      },
      tasks: [],
      notes: '',
    });

    setName('');
    setDescription('');
    setInstructions('');
    setShowNewModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-fuchsia-400" />
            <span>Workspace & Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organized project vaults with dedicated files, tasks, notes, and AI instructions
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 font-semibold text-white text-xs shadow-lg shadow-fuchsia-500/25 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <form onSubmit={handleCreate} className="glass-panel rounded-2xl p-6 border border-fuchsia-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span>Initialize Project</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Android Voice Companion, Next.js Store"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Type / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="Website">Website</option>
                <option value="Android App">Android App</option>
                <option value="AI Assistant">AI Assistant</option>
                <option value="Coding Project">Coding Project</option>
                <option value="Study Project">Study Project</option>
                <option value="Custom">Custom Project</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Description</label>
            <textarea
              placeholder="What is the goal of this project?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">AI Instructions for this project</label>
            <input
              type="text"
              placeholder="e.g. Always write strict TypeScript with Tailwind classes and error boundaries..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-xs shadow-md shadow-fuchsia-600/20"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="glass-card rounded-2xl p-5 border border-white/10 hover:border-fuchsia-500/40 transition-all flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-bold">
                  {proj.category}
                </span>
                <button
                  onClick={() => deleteProject(proj.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity p-1"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-base text-white group-hover:text-fuchsia-300 transition-colors">
                {proj.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {proj.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                {Object.keys(proj.files || {}).length} files • {proj.tasks?.length || 0} tasks
              </span>

              <button
                onClick={() => {
                  setCurrentProject(proj);
                  setActiveView('coding');
                }}
                className="flex items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300 font-semibold"
              >
                <span>Open in Coder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
