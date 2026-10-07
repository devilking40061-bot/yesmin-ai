import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Orb } from '../Orb.tsx';
import {
  MessageSquare,
  Radio,
  Code2,
  Cpu,
  Search,
  UploadCloud,
  FolderKanban,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
  Heart,
  Volume2,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    assistantName,
    userNickname,
    assistantStatus,
    settings,
    setActiveView,
    conversations,
    setCurrentConversationId,
    projects,
    tasks,
    speakText,
  } = useApp();

  const quickActions = [
    {
      id: 'chat',
      title: 'Start Chat',
      desc: 'Deep talk, motivation & companion chats',
      icon: MessageSquare,
      color: 'from-pink-500/20 to-purple-600/20 text-pink-300 border-pink-500/30',
      action: () => setActiveView('chat'),
    },
    {
      id: 'live',
      title: 'Start Live Voice',
      desc: 'Real-time Gemini voice conversation',
      icon: Radio,
      color: 'from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-500/30',
      action: () => setActiveView('live'),
    },
    {
      id: 'coding',
      title: 'Coding Agent',
      desc: 'Build apps, write code & test in sandbox',
      icon: Code2,
      color: 'from-emerald-500/20 to-teal-600/20 text-emerald-300 border-emerald-500/30',
      action: () => setActiveView('coding'),
    },
    {
      id: 'search',
      title: 'Web Search',
      desc: 'Live verified web search & sources',
      icon: Search,
      color: 'from-amber-500/20 to-orange-600/20 text-amber-300 border-amber-500/30',
      action: () => setActiveView('search'),
    },
    {
      id: 'files',
      title: 'Upload File',
      desc: 'Analyze documents, images & code',
      icon: UploadCloud,
      color: 'from-indigo-500/20 to-purple-600/20 text-indigo-300 border-indigo-500/30',
      action: () => setActiveView('files'),
    },
    {
      id: 'projects',
      title: 'Open Projects',
      desc: 'Manage websites, Android apps & workspaces',
      icon: FolderKanban,
      color: 'from-fuchsia-500/20 to-pink-600/20 text-fuchsia-300 border-fuchsia-500/30',
      action: () => setActiveView('projects'),
    },
    {
      id: 'apps',
      title: 'Apps & Actions',
      desc: 'Direct trigger for YouTube, Gmail & tools',
      icon: Cpu,
      color: 'from-rose-500/20 to-red-600/20 text-rose-300 border-rose-500/30',
      action: () => setActiveView('apps'),
    },
  ];

  const recentConversations = conversations.slice(0, 3);
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full pb-24 md:pb-12">
      {/* Hero Section with Orb & Personalized Greeting */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden glass-panel border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-[#0a0d24]/60 to-[#050713]">
        {/* Ambient neon radial glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 animate-pulse" />
              <span>AI Companion & Personal Jarvis Assistant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Hi, <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 bg-clip-text text-transparent">{userNickname}</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-medium">
              I'm <strong className="text-pink-300 font-bold">{assistantName}</strong>. How can I help you today?
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Main hamesha aapke saath hoon — casual baatein, motivation, live voice calls, coding, web search aur tasks automate karne ke liye.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setActiveView('live')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Talk with {assistantName} (Live)</span>
              </button>

              <button
                onClick={() => setActiveView('chat')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl glass-card border-purple-500/40 hover:border-pink-500/60 text-slate-200 hover:text-white font-semibold text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span>Open Chat</span>
              </button>

              <button
                onClick={() =>
                  speakText(
                    `Hi ${userNickname}! I am ${assistantName}. Aapki loving AI companion aur Jarvis assistant. Aaj hum kya banayein?`
                  )
                }
                className="p-3 rounded-2xl glass-card border-white/10 hover:border-purple-500/40 text-purple-300 hover:text-white transition-all"
                title="Hear greeting voice"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive AI Orb Display */}
          <div className="flex flex-col items-center">
            <div className="relative p-4">
              <Orb
                status={assistantStatus}
                size="lg"
                interactive
                accentColor={settings.appearance.accentColor}
                onClick={() => setActiveView('live')}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-xs uppercase font-mono tracking-wider text-purple-300/80 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30">
                Status: {assistantStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Quick Actions</span>
          </h2>
          <span className="text-xs text-slate-400">Tap any tool to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                onClick={qa.action}
                className={`p-4 rounded-2xl glass-card border bg-gradient-to-br ${qa.color} text-left transition-all hover:scale-[1.02] hover:border-pink-500/50 group flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-white">
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">{qa.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{qa.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity: Conversations & Projects / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Recent Conversations</span>
            </h3>
            <button
              onClick={() => setActiveView('chat')}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
            >
              View all
            </button>
          </div>

          {recentConversations.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No conversations yet. Start one above!</p>
          ) : (
            <div className="space-y-2.5">
              {recentConversations.map((c) => {
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCurrentConversationId(c.id);
                      setActiveView('chat');
                    }}
                    className="w-full p-3 rounded-xl glass-card border border-white/5 hover:border-purple-500/40 text-left transition-all hover:bg-white/5 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <h4 className="font-semibold text-xs text-slate-200 truncate">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.content.slice(0, 60) : 'New conversation'}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks & Active Projects */}
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pending Tasks & Projects</span>
            </h3>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
            >
              View tasks
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl glass-card border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-200 truncate">{t.title}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0">
                  {t.priority}
                </span>
              </div>
            ))}

            {projects.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">Active Project:</div>
                <div
                  onClick={() => setActiveView('coding')}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">{projects[0].name}</h4>
                    <p className="text-[11px] text-slate-400">{projects[0].category}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    Open Code <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
