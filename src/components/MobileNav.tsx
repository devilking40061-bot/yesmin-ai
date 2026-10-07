import React, { useState } from 'react';
import { useApp, ActiveView } from '../context/AppContext.tsx';
import {
  Home,
  MessageSquare,
  Radio,
  Code2,
  Settings,
  MoreHorizontal,
  Cpu,
  Search,
  FileText,
  Brain,
  FolderKanban,
  CheckSquare,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs: { id: ActiveView; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'coding', label: 'Code', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const moreTabs: { id: ActiveView; label: string; icon: any }[] = [
    { id: 'apps', label: 'Apps & Actions', icon: Cpu },
    { id: 'search', label: 'Web Search', icon: Search },
    { id: 'files', label: 'Files & Documents', icon: FileText },
    { id: 'memory', label: 'Memory Bank', icon: Brain },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks & Reminders', icon: CheckSquare },
  ];

  return (
    <>
      {/* Mobile Drawer for more tools */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/75 backdrop-blur-md">
          <div className="glass-panel border-t border-purple-500/30 p-5 rounded-t-3xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-sm text-purple-300">More Tools & Features</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-pink-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel border-t border-purple-500/25 px-2 py-2 backdrop-blur-2xl">
        <div className="flex items-center justify-around">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive ? 'text-pink-400 scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.id === 'live' ? (
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/40 -mt-3 border-2 border-[#050713]">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <Icon className="w-5 h-5 mb-0.5" />
                )}
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {isActive && tab.id !== 'live' && (
                  <span className="absolute bottom-0 w-4 h-0.5 bg-pink-400 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 text-slate-400 hover:text-slate-200"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
