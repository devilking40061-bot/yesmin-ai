import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TaskItem } from '../../types/index.ts';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Bell,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, saveTask, toggleTaskCompleted, deleteTask, assistantName, addToast } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [reminder, setReminder] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await saveTask({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || 'Today',
      priority,
      reminder,
      completed: false,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setShowAddForm(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Tasks & Reminders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {completedCount} of {tasks.length} tasks completed
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold text-white text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="glass-panel rounded-2xl p-6 border border-emerald-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Create Task</span>
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
              <label className="text-xs text-slate-300 font-medium block mb-1">Task Title</label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Due Date</label>
              <input
                type="text"
                placeholder="e.g. Today, Tomorrow, Friday 5 PM"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="reminder"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="reminder" className="text-xs text-slate-300 font-medium cursor-pointer">
                Notify me when due
              </label>
            </div>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 glass-card rounded-2xl border border-white/5 space-y-2">
            <CheckSquare className="w-8 h-8 opacity-40 mx-auto" />
            <p className="text-xs">No tasks yet. Create one to organize your day!</p>
          </div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTaskCompleted(t.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                t.completed
                  ? 'bg-white/5 border-white/5 opacity-60'
                  : 'glass-card border-white/10 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-3">
                {t.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                )}

                <div className="min-w-0">
                  <h4 className={`text-xs font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {t.title}
                  </h4>
                  {t.description && <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t.dueDate || 'Today'}
                </span>

                <span
                  className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                    t.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : t.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {t.priority}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
