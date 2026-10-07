import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import * as api from '../../services/api.ts';
import {
  Settings as SettingsIcon,
  User,
  Bot,
  Volume2,
  Radio,
  Brain,
  Shield,
  Palette,
  Server,
  Lock,
  Info,
  Check,
  RefreshCw,
  Play,
  Trash2,
  Download,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    assistantName,
    userNickname,
    updateAssistantName,
    resetAssistantName,
    clearAllConversations,
    clearMemories,
    services,
    updateServiceConfig,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'profile'
    | 'ai'
    | 'voice'
    | 'live'
    | 'memory'
    | 'permissions'
    | 'appearance'
    | 'services'
    | 'privacy'
    | 'about'
  >('profile');

  // Profile form state
  const [tempAssistantName, setTempAssistantName] = useState(assistantName);
  const [tempNickname, setTempNickname] = useState(userNickname);
  const [tempPersonality, setTempPersonality] = useState(settings.profile.personality);
  const [tempLanguage, setTempLanguage] = useState(settings.profile.language);
  const [tempCustomInstructions, setTempCustomInstructions] = useState(settings.profile.customInstructions || '');

  // AI & Voice states
  const [activeProvider, setActiveProvider] = useState(settings.ai.activeProvider);
  const [activeModel, setActiveModel] = useState(settings.ai.model);
  const [voiceProvider, setVoiceProvider] = useState(settings.voice.provider);

  // ElevenLabs state
  const [elevenApiKey, setElevenApiKey] = useState(settings.voice.elevenlabs.apiKey || '');
  const [elevenVoiceId, setElevenVoiceId] = useState(settings.voice.elevenlabs.voiceId || '21m00Tcm4TlvDq8ikWAM');
  const [elevenStability, setElevenStability] = useState(settings.voice.elevenlabs.stability || 0.5);
  const [elevenSpeed, setElevenSpeed] = useState(settings.voice.elevenlabs.speed || 1.0);
  const [testingElevenLabs, setTestingElevenLabs] = useState(false);

  // Live Voice state
  const [liveVoiceName, setLiveVoiceName] = useState(settings.liveVoice.voice || 'Kore');

  // Appearance state
  const [accentColor, setAccentColor] = useState(settings.appearance.accentColor || 'pink');

  // Selected Service for detailed config
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null);

  useEffect(() => {
    setTempAssistantName(assistantName);
    setTempNickname(userNickname);
  }, [assistantName, userNickname]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAssistantName !== assistantName) {
      await updateAssistantName(tempAssistantName);
    }
    await updateSettings({
      profile: {
        ...settings.profile,
        assistantName: tempAssistantName.trim(),
        nickname: tempNickname.trim(),
        personality: tempPersonality,
        language: tempLanguage,
        customInstructions: tempCustomInstructions,
      },
    });
    addToast('Profile & Assistant saved! Changes active everywhere.', 'success');
  };

  const handleResetName = async () => {
    await resetAssistantName();
    setTempAssistantName('YESMIN AI');
  };

  const handleSaveVoice = async () => {
    await updateSettings({
      voice: {
        ...settings.voice,
        provider: voiceProvider,
        elevenlabs: {
          ...settings.voice.elevenlabs,
          apiKey: elevenApiKey,
          voiceId: elevenVoiceId,
          stability: elevenStability,
          speed: elevenSpeed,
          enabled: Boolean(elevenApiKey),
        },
      },
      liveVoice: {
        ...settings.liveVoice,
        voice: liveVoiceName,
      },
    });
    addToast('Voice settings updated', 'success');
  };

  const handleTestElevenLabs = async () => {
    setTestingElevenLabs(true);
    try {
      const audioBlob = await api.testElevenLabs(elevenApiKey, elevenVoiceId);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      addToast('ElevenLabs voice verified & playing!', 'success');
    } catch (err: any) {
      addToast(`ElevenLabs test failed: ${err.message}`, 'error');
    } finally {
      setTestingElevenLabs(false);
    }
  };

  const handleTestService = async (serviceId: string) => {
    setTestingServiceId(serviceId);
    try {
      const res = await api.testProviderConnection(serviceId, {});
      if (res.success) {
        addToast(`${serviceId.toUpperCase()} Connection Successful!`, 'success');
        updateServiceConfig(serviceId, { status: 'connected', lastTested: new Date().toISOString() });
      } else {
        addToast(`Test error: ${res.error}`, 'error');
        updateServiceConfig(serviceId, { status: 'error', errorMessage: res.error });
      }
    } catch (err: any) {
      addToast(`Connection failed: ${err.message}`, 'error');
    } finally {
      setTestingServiceId(null);
    }
  };

  const handleExportData = () => {
    const fullExport = {
      settings,
      timestamp: new Date().toISOString(),
      exportVersion: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yesmin_ai_export_${Date.now()}.json`;
    a.click();
    addToast('Complete user data exported to JSON!', 'success');
  };

  const navTabs = [
    { id: 'profile', label: 'Profile & Assistant', icon: User },
    { id: 'ai', label: 'AI & Intelligence', icon: Bot },
    { id: 'voice', label: 'Voice & ElevenLabs', icon: Volume2 },
    { id: 'live', label: 'Gemini Live Voice', icon: Radio },
    { id: 'services', label: 'API & Services (14)', icon: Server },
    { id: 'memory', label: 'Memory Bank', icon: Brain },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'appearance', label: 'Appearance & Neon', icon: Palette },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'about', label: 'About & System', icon: Info },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-pink-400" />
            <span>Control Center & Assistant Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize assistant identity, name, personality, voice APIs, and services
          </p>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500/50 shadow-md shadow-pink-500/20'
                  : 'glass-card border-white/5 text-slate-400 hover:text-white hover:border-purple-500/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Assistant Name Customization */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-pink-400" />
              <span>Assistant Identity & Custom Name</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize the assistant's name (e.g. from <em>YESMIN AI</em> to <em>Muskan</em>), your nickname, and personality.
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/40 border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-pink-400 font-bold block mb-1">
                Live Preview Greeting
              </span>
              <p className="text-sm font-semibold text-white">
                "Hi, {tempNickname}! I'm <strong className="text-pink-300 font-bold">{tempAssistantName}</strong>. How can I help you?"
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Preview
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Custom Assistant Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Assistant Name <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={tempAssistantName}
                onChange={(e) => setTempAssistantName(e.target.value)}
                placeholder="YESMIN AI, Muskan, Jarvis..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white font-semibold focus:outline-none"
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetName}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Reset to default "YESMIN AI"
                </button>
              </div>
            </div>

            {/* User Nickname */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                User Nickname <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="Jaan, Boss, Sir, Your Name..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white font-semibold focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400">How the assistant addresses you in chat, voice & greetings.</p>
            </div>
          </div>

          {/* Personality Mode & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Personality Mode</label>
              <select
                value={tempPersonality}
                onChange={(e) => setTempPersonality(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="companion">Girlfriend / Companion (Loving, Caring, Playful 💕)</option>
                <option value="friendly">Friendly Assistant (Cheerful & Warm 😊)</option>
                <option value="professional">Professional Jarvis (Sharp, Concise & Structured ⚡)</option>
                <option value="coding">Coding Architect (Technical & Production Code 💻)</option>
                <option value="study">Study Mentor (Patient & Pedagogical 📚)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Primary Conversation Language</label>
              <select
                value={tempLanguage}
                onChange={(e) => setTempLanguage(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="hinglish">Hinglish (Natural Hindi in Roman script + English blend)</option>
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>

          {/* Custom Personality Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">Custom Persona & System Directives</label>
            <textarea
              value={tempCustomInstructions}
              onChange={(e) => setTempCustomInstructions(e.target.value)}
              placeholder="Add your own custom rules for how your companion should think, joke, or react..."
              rows={3}
              className="w-full p-3 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all"
            >
              Save Name & Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: AI & Intelligence */}
      {activeTab === 'ai' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <span>AI Provider & LLM Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Configure active model and reasoning creativity</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Active AI Provider</label>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="gemini">Google Gemini (Recommended - Native Multimodal & Live Audio)</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                <option value="custom">Custom OpenAI-Compatible API</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Gemini Model</label>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Ultra-fast, Flagship General Intelligence)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning & STEM Coding)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Lowest Latency)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              updateSettings({ ai: { ...settings.ai, activeProvider, model: activeModel } });
              addToast('AI configuration updated', 'success');
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20"
          >
            Save AI Provider
          </button>
        </div>
      )}

      {/* Tab 3: Voice & ElevenLabs */}
      {activeTab === 'voice' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-pink-400" />
              <span>Voice Synthesis & ElevenLabs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select between ElevenLabs realistic speech, Gemini native audio TTS, or Browser Web Speech.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Primary Voice Provider</label>
              <select
                value={voiceProvider}
                onChange={(e) => setVoiceProvider(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="browser">Browser Web Speech API (Local & Instant)</option>
                <option value="gemini">Gemini Voice (gemini-3.8-flash-lite-tts WAV)</option>
                <option value="elevenlabs">ElevenLabs Neural Voice</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="autoSpeak"
                checked={settings.voice.autoSpeak}
                onChange={(e) => updateSettings({ voice: { ...settings.voice, autoSpeak: e.target.checked } })}
                className="w-4 h-4 accent-pink-500 rounded"
              />
              <label htmlFor="autoSpeak" className="text-xs text-slate-300 font-medium cursor-pointer">
                Auto-speak AI chat responses aloud
              </label>
            </div>
          </div>

          {/* ElevenLabs Specific Fields */}
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300">ElevenLabs Configuration</span>
              <span className="text-[10px] font-mono text-slate-400">api.elevenlabs.io</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">ElevenLabs API Key</label>
                <input
                  type="password"
                  value={elevenApiKey}
                  onChange={(e) => setElevenApiKey(e.target.value)}
                  placeholder="xi-api-key..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Voice ID</label>
                <input
                  type="text"
                  value={elevenVoiceId}
                  onChange={(e) => setElevenVoiceId(e.target.value)}
                  placeholder="21m00Tcm4TlvDq8ikWAM"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestElevenLabs}
                disabled={testingElevenLabs || !elevenApiKey}
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{testingElevenLabs ? 'Testing...' : 'Test ElevenLabs Voice'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveVoice}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs shadow-md shadow-pink-500/20"
          >
            Save Voice Configuration
          </button>
        </div>
      )}

      {/* Tab 4: Live Voice Configuration */}
      {activeTab === 'live' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>Gemini Live Realtime Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Official low-latency bidirectional voice session</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Prebuilt Voice Persona</label>
              <select
                value={liveVoiceName}
                onChange={(e) => setLiveVoiceName(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d24]"
              >
                <option value="Kore">Kore (Warm, Empathetic, Melodious Female)</option>
                <option value="Zephyr">Zephyr (Bright, Modern Female)</option>
                <option value="Puck">Puck (Energetic, Playful Male)</option>
                <option value="Charon">Charon (Deep, Grounded Male)</option>
                <option value="Fenrir">Fenrir (Authoritative Executive Male)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Interruption Handling</label>
              <div className="p-3 rounded-xl glass-card text-xs text-slate-300">
                Automatic echo cancellation & speech interruption active.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: API & Services Manager (Requirement 11) */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-pink-400" />
                <span>API & Services Hub</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Each external and internal service has a separate configuration card with real connection testing.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
              {services.length} Services Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{srv.name}</h3>
                    <span className="text-[10px] uppercase font-mono text-purple-400">{srv.category}</span>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                      srv.status === 'connected'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    {srv.status}
                  </span>
                </div>

                {srv.model && (
                  <p className="text-xs font-mono text-slate-300 truncate">Model: {srv.model}</p>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestService(srv.id)}
                    disabled={testingServiceId === srv.id}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingServiceId === srv.id ? 'animate-spin' : ''}`} />
                    <span>{testingServiceId === srv.id ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const newEnabled = !srv.enabled;
                      updateServiceConfig(srv.id, { enabled: newEnabled });
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      srv.enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/5'
                    }`}
                  >
                    {srv.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Permissions */}
      {activeTab === 'permissions' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Browser Device Permissions</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Microphone Access</h4>
                <p className="text-xs text-slate-400">Required for Live Voice mode and voice messages</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    addToast('Microphone permission granted!', 'success');
                  } catch (e) {
                    addToast('Microphone access denied', 'error');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
              >
                Request Access
              </button>
            </div>

            <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">System Notifications</h4>
                <p className="text-xs text-slate-400">Required for task reminders and alerts</p>
              </div>
              <button
                onClick={async () => {
                  if (Notification) {
                    const res = await Notification.requestPermission();
                    if (res === 'granted') addToast('Notifications permitted!', 'success');
                    else addToast('Notification permission denied', 'error');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
              >
                Request Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Appearance */}
      {activeTab === 'appearance' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <span>Futuristic Neon & Visual Theme</span>
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-bold text-white block">Accent Glow Color</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'pink', name: 'Cyber Magenta', color: 'bg-pink-500 border-pink-400' },
                { id: 'purple', name: 'Neon Purple', color: 'bg-purple-500 border-purple-400' },
                { id: 'cyan', name: 'Electric Cyan', color: 'bg-cyan-500 border-cyan-400' },
                { id: 'emerald', name: 'Jarvis Emerald', color: 'bg-emerald-500 border-emerald-400' },
              ].map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setAccentColor(acc.id as any);
                    updateSettings({ appearance: { ...settings.appearance, accentColor: acc.id as any } });
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                    accentColor === acc.id ? 'border-white bg-white/10' : 'border-white/10 glass-card'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${acc.color}`} />
                  <span className="text-xs font-semibold text-white">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Privacy & Data Export */}
      {activeTab === 'privacy' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-400" />
            <span>Privacy, Security & Data Management</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Export Full Profile & Workspace</h4>
                <p className="text-xs text-slate-400">Download complete settings and state as a JSON file</p>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl glass-card flex items-center justify-between border-red-500/20">
              <div>
                <h4 className="text-sm font-bold text-red-300">Clear All Conversations</h4>
                <p className="text-xs text-slate-400">Permanently wipe chat history from local database</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Delete all conversations permanently?')) clearAllConversations();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: About */}
      {activeTab === 'about' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{assistantName}</h2>
              <p className="text-xs text-pink-300 font-mono">v1.0.0 Production Edition</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-2">
            <p>
              <strong>AI Identity & Safety Notice:</strong> {assistantName} is an artificial intelligence assistant and personal companion. It is not a real biological human.
            </p>
            <p>
              Engineered with Gemini 3, bidirectional Live audio, sandboxed code execution, persistent memory, and modular extensible tool orchestration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
