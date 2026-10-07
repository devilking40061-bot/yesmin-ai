import React from 'react';
import { useApp, ActiveView } from '../context/AppContext.tsx';
import {
  Home,
  MessageSquare,
  Radio,
  Code2,
  Cpu,
  Search,
  FileText,
  Brain,
  FolderKanban,
  CheckSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, assistantName, conversations, memories, projects } = useApp();

  const navItems: { id: ActiveView; label: string; icon: any; count?: number; badge?: string }[] = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, count: conversations.length },
    { id: 'live', label: 'Gemini Live Voice', icon: Radio, badge: 'LIVE' },
    { id: 'coding', label: 'Coding Agent', icon: Code2 },
    { id: 'apps', label: 'Apps & Actions', icon: Cpu },
    { id: 'search', label: 'Web Search', icon: Search },
    { id: 'files', label: 'Files & Documents', icon: FileText },
    { id: 'memory', label: 'Memory Bank', icon: Brain, count: memories.length },
    { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length },
    { id: 'tasks', label: 'Tasks & Reminders', icon: CheckSquare },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-purple-500/20 p-4 shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation List */}
      <div className="flex-1 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300/60 px-3 mb-2">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/20 via-purple-600/30 to-purple-600/10 text-pink-300 border border-pink-500/40 shadow-lg shadow-pink-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-pink-400' : 'text-slate-400 group-hover:text-purple-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pink-500/30 text-pink-300 border border-pink-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/20">
                    {item.count}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-pink-400 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Assistant Card footer */}
      <div className="pt-4 border-t border-purple-500/20">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/50 to-pink-950/20 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-purple-200">Personal Companion</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Custom name: <strong className="text-pink-300">{assistantName}</strong>. Tailored to your voice, memory & heart.
          </p>
        </div>
      </div>
    </aside>
  );
};
