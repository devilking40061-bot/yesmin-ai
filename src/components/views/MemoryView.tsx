import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MemoryItem } from '../../types/index.ts';
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';

export const MemoryView: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory, clearMemories, assistantName, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'personal' | 'instruction' | 'fact'>('preference');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredMemories = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newContent.trim()) return;

    await addMemory({
      key: newKey.trim(),
      content: newContent.trim(),
      category: newCategory,
      enabled: true,
    });

    setNewKey('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleToggleEnabled = (mem: MemoryItem) => {
    updateMemory({
      ...mem,
      enabled: !mem.enabled,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-pink-400" />
            <span>Persistent Memory Bank</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Information and preferences that {assistantName} naturally remembers across sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-semibold text-white text-xs shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>

          {memories.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all memories?')) clearMemories();
              }}
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-red-400 transition-colors"
              title="Clear all memories"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Add Memory Modal / Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel rounded-2xl p-6 border border-pink-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Teach {assistantName} something new</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Key / Topic</label>
              <input
                type="text"
                placeholder="e.g. favorite_color, birthday, tech_stack..."
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="preference">Preference</option>
                <option value="personal">Personal Detail</option>
                <option value="instruction">Instruction</option>
                <option value="fact">Fact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Content to Remember</label>
            <textarea
              placeholder="e.g. Jaan loves tea without sugar and prefers coding in TypeScript and Next.js..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs shadow-md shadow-pink-500/20"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
        <input
          type="text"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center text-slate-400 glass-card rounded-2xl border border-white/5 space-y-2">
            <Brain className="w-8 h-8 opacity-40 mx-auto" />
            <p className="text-xs">No memories found. Add one above to personalize your assistant!</p>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const isEditing = editingId === mem.id;

            return (
              <div
                key={mem.id}
                className="glass-card rounded-2xl p-4 border border-white/10 hover:border-purple-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-pink-300">{mem.key}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/20 text-purple-300">
                      {mem.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEnabled(mem)}
                      className={`p-1 text-xs flex items-center gap-1 ${
                        mem.enabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                      title={mem.enabled ? 'Enabled in AI context' : 'Disabled'}
                    >
                      {mem.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(mem.id);
                        setEditContent(mem.content);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteMemory(mem.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        updateMemory({ ...mem, content: editContent });
                        setEditingId(null);
                      }}
                      className="p-2 bg-pink-500 rounded-lg text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{mem.content}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
