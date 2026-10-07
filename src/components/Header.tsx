import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Settings as SettingsIcon,
  Heart,
  Terminal,
  BookOpen,
  Briefcase,
  Smile,
} from 'lucide-react';

export const Header: React.FC<{ onToggleMobileMenu?: () => void }> = ({ onToggleMobileMenu }) => {
  const {
    assistantName,
    userNickname,
    assistantStatus,
    settings,
    isSpeaking,
    stopSpeaking,
    setActiveView,
    activeView,
  } = useApp();

  const personalityBadges: Record<string, { label: string; icon: any; color: string }> = {
    companion: { label: 'Companion', icon: Heart, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
    friendly: { label: 'Friendly', icon: Smile, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    professional: { label: 'Jarvis', icon: Briefcase, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    coding: { label: 'Coder', icon: Terminal, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    study: { label: 'Tutor', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  };

  const currentBadge = personalityBadges[settings.profile.personality] || personalityBadges.companion;
  const BadgeIcon = currentBadge.icon;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 px-4 py-3 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand / Assistant Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 text-left group transition-all"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#080b1e] rounded-[10px] flex items-center justify-center overflow-hidden">
                  <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                </div>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#050713] ${
                  assistantStatus === 'speaking'
                    ? 'bg-pink-500 animate-ping'
                    : assistantStatus === 'listening'
                    ? 'bg-cyan-400 animate-pulse'
                    : assistantStatus === 'thinking'
                    ? 'bg-purple-500 animate-spin'
                    : 'bg-emerald-400'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  {assistantName}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
                  v1.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="capitalize text-pink-300/90 font-medium">
                  {assistantStatus === 'speaking'
                    ? 'Speaking to you...'
                    : assistantStatus === 'thinking'
                    ? 'Processing thoughts...'
                    : assistantStatus === 'listening'
                    ? 'Listening carefully...'
                    : 'Online & ready'}
                </span>
              </div>
            </div>
          </button>

          {/* Personality Badge */}
          <div
            onClick={() => setActiveView('settings')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${currentBadge.color}`}
            title="Click to customize personality in Settings"
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{currentBadge.label} Mode</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Audio Speaking status & stop button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/30 text-xs font-medium transition-all animate-pulse"
              title="Stop speaking"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mute Voice</span>
            </button>
          )}

          {/* Start Live Voice Mode Button */}
          <button
            onClick={() => setActiveView('live')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
              activeView === 'live'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                : 'glass-card border-purple-500/30 text-slate-200 hover:border-pink-500/50 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="hidden xs:inline font-semibold">Live Voice</span>
          </button>

          {/* User Nickname greeting */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
            <span>Hi,</span>
            <span className="font-bold text-pink-300">{userNickname}</span>
          </div>

          {/* Settings Shortcut */}
          <button
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-xl transition-all ${
              activeView === 'settings'
                ? 'bg-purple-600 text-white'
                : 'glass-card border-white/10 text-slate-300 hover:text-white hover:border-purple-500/40'
            }`}
            title="Settings & Assistant Customization"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
