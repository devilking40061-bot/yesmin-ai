import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Cpu,
  Youtube,
  Mail,
  Search,
  MapPin,
  MessageCircle,
  Send,
  Instagram,
  Chrome,
  Calculator,
  Calendar,
  Camera,
  Play,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Code,
  Bell,
  Sparkles,
} from 'lucide-react';

export const AppsActionsView: React.FC = () => {
  const { assistantName, triggerAppAction, addToast } = useApp();
  const [actionInput, setActionInput] = useState('');
  const [calcExpr, setCalcExpr] = useState('250 * 18 / 100 + 450');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const quickApps = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
    { id: 'gmail', name: 'Gmail', icon: Mail, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
    { id: 'google', name: 'Google', icon: Search, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { id: 'maps', name: 'Maps', icon: MapPin, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-400 border-green-500/30 bg-green-500/10' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
    { id: 'chrome', name: 'Chrome', icon: Chrome, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
    { id: 'camera', name: 'Camera', icon: Camera, color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
  ];

  const handleLaunchApp = (appId: string, appName: string) => {
    triggerAppAction({
      type: 'OPEN_APP',
      title: `Open ${appName}`,
      target: appId,
      isSensitive: false,
    });
  };

  const handleCustomActionExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionInput.trim()) return;

    const lower = actionInput.toLowerCase();
    if (lower.includes('youtube')) {
      triggerAppAction({ type: 'OPEN_APP', title: 'Open YouTube', target: 'youtube', isSensitive: false });
    } else if (lower.includes('calc')) {
      triggerAppAction({ type: 'OPEN_APP', title: 'Open Calculator', target: 'calculator', isSensitive: false });
    } else if (lower.includes('search')) {
      const q = actionInput.replace(/search/i, '').trim();
      triggerAppAction({ type: 'SEARCH_WEB', title: `Search ${q}`, params: { query: q }, isSensitive: false });
    } else {
      triggerAppAction({
        type: 'SEARCH_WEB',
        title: `Search ${actionInput}`,
        params: { query: actionInput },
        isSensitive: false,
      });
    }

    setActionInput('');
  };

  const handleCalculate = () => {
    try {
      const safe = calcExpr.replace(/[^0-9+\-*/().]/g, '');
      const res = Function(`"use strict"; return (${safe})`)();
      setCalcResult(String(res));
      addToast(`Calculated: ${res}`, 'success');
    } catch {
      setCalcResult('Error in expression');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-pink-400" />
            <span>Apps & Actions Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Safe browser action dispatching & extensible Android WebView action bridge
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-xs text-purple-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security Guard Active</span>
        </div>
      </div>

      {/* Natural Language Action Dispatcher */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Natural Language Action Launcher</span>
        </h2>
        <form onSubmit={handleCustomActionExecute} className="flex gap-2">
          <input
            type="text"
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            placeholder={`Tell ${assistantName} what to open or do (e.g. "Open YouTube lo-fi", "Search latest AI news")...`}
            className="flex-1 px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-bold text-white text-sm shadow-lg shadow-pink-500/25 transition-all"
          >
            Execute
          </button>
        </form>
      </div>

      {/* Quick Launch App Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Supported Applications & Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickApps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleLaunchApp(app.id, app.name)}
                className={`p-4 rounded-2xl glass-card border ${app.color} text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:scale-105 hover:shadow-lg`}
              >
                <Icon className="w-7 h-7" />
                <span className="text-xs font-semibold text-slate-200">{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Built-in Calculator Tool */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/20 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-400" />
          <span>Quick Calculator Tool</span>
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={calcExpr}
            onChange={(e) => setCalcExpr(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input font-mono text-sm text-white focus:outline-none"
          />
          <button
            onClick={handleCalculate}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
          >
            Calculate
          </button>
        </div>
        {calcResult && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-sm font-mono text-pink-300">
            Result: <strong>{calcResult}</strong>
          </div>
        )}
      </div>

      {/* Native Android Bridge Architecture Info */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Android Companion / WebView Bridge Architecture</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Standard browser security policies restrict direct arbitrary access to native OS phone apps (like dialer, contacts, or native settings). When deployed inside an Android WebView or Android Companion wrapper, actions are safely dispatched through:
        </p>
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto">
          Web App (window.AndroidBridge.postMessage) → Android Action Manager → Native Android Intent
        </div>
      </div>
    </div>
  );
};
