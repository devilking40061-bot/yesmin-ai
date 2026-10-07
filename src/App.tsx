import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { HomeView } from './components/views/HomeView.tsx';
import { ChatView } from './components/views/ChatView.tsx';
import { LiveVoiceView } from './components/views/LiveVoiceView.tsx';
import { CodingView } from './components/views/CodingView.tsx';
import { AppsActionsView } from './components/views/AppsActionsView.tsx';
import { WebSearchView } from './components/views/WebSearchView.tsx';
import { FilesView } from './components/views/FilesView.tsx';
import { MemoryView } from './components/views/MemoryView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { TasksView } from './components/views/TasksView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeView,
    pendingAction,
    confirmAction,
    cancelAction,
    toasts,
    removeToast,
    settings,
  } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'chat':
        return <ChatView />;
      case 'live':
        return <LiveVoiceView />;
      case 'coding':
        return <CodingView />;
      case 'apps':
        return <AppsActionsView />;
      case 'search':
        return <WebSearchView />;
      case 'files':
        return <FilesView />;
      case 'memory':
        return <MemoryView />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return <TasksView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Container with Sidebar + View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto relative bg-gradient-to-b from-[#050713] via-[#070b22] to-[#040612]">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Sensitive Action Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel border border-pink-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-pink-950/60 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-pink-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Sensitive Action</h3>
                <p className="text-xs text-slate-400">Action requested by assistant requires approval</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs">
              <div className="font-semibold text-pink-300">Action: {pendingAction.type}</div>
              <p className="text-slate-300">{pendingAction.title}</p>
              {pendingAction.target && (
                <div className="font-mono text-[11px] text-slate-400 truncate">
                  Target: {pendingAction.target}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={cancelAction}
                className="px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                Deny & Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xs font-bold text-white shadow-lg shadow-pink-500/25 transition-all"
              >
                Approve & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Stack */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl glass-panel border shadow-xl flex items-center justify-between gap-3 text-xs transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : toast.type === 'error'
                ? 'border-rose-500/40 bg-rose-950/40 text-rose-200'
                : 'border-purple-500/40 bg-purple-950/40 text-purple-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
