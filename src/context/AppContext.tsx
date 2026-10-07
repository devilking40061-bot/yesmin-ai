import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
  AssistantSettings,
  Conversation,
  MemoryItem,
  ProjectItem,
  TaskItem,
  ApiServiceConfig,
  AppActionPayload,
  Message,
} from '../types/index.ts';
import * as api from '../services/api.ts';

export type ActiveView =
  | 'home'
  | 'chat'
  | 'live'
  | 'coding'
  | 'apps'
  | 'search'
  | 'files'
  | 'memory'
  | 'projects'
  | 'tasks'
  | 'settings';

export type AssistantStatus = 'online' | 'listening' | 'thinking' | 'speaking';

interface AppContextType {
  settings: AssistantSettings;
  assistantName: string;
  userNickname: string;
  updateSettings: (newSettings: Partial<AssistantSettings>) => Promise<void>;
  updateAssistantName: (name: string) => Promise<void>;
  resetAssistantName: () => Promise<void>;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  assistantStatus: AssistantStatus;
  setAssistantStatus: (status: AssistantStatus) => void;
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  setCurrentConversationId: (id: string | null) => void;
  createNewConversation: (title?: string) => Conversation;
  deleteConversation: (id: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
  sendMessage: (text: string, attachments?: any[], enableSearch?: boolean) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  // Memories
  memories: MemoryItem[];
  addMemory: (memory: Partial<MemoryItem>) => Promise<void>;
  updateMemory: (memory: MemoryItem) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  clearMemories: () => Promise<void>;
  // Projects
  projects: ProjectItem[];
  currentProject: ProjectItem | null;
  setCurrentProject: (proj: ProjectItem | null) => void;
  saveProject: (proj: Partial<ProjectItem>) => Promise<ProjectItem>;
  deleteProject: (id: string) => Promise<void>;
  // Tasks
  tasks: TaskItem[];
  saveTask: (task: Partial<TaskItem>) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Services
  services: ApiServiceConfig[];
  updateServiceConfig: (id: string, updates: Partial<ApiServiceConfig>) => Promise<void>;
  // Audio Playback
  isSpeaking: boolean;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  // Actions
  pendingAction: AppActionPayload | null;
  confirmAction: () => void;
  cancelAction: () => void;
  triggerAppAction: (action: Omit<AppActionPayload, 'id' | 'status'>) => void;
  // Notifications
  toasts: { id: string; message: string; type: 'info' | 'success' | 'error' }[];
  addToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
  // Search query pass-through
  activeSearchQuery: string;
  setActiveSearchQuery: (q: string) => void;
}

const DEFAULT_INITIAL_SETTINGS: AssistantSettings = {
  profile: {
    name: 'User',
    nickname: 'Jaan',
    assistantName: 'YESMIN AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    personality: 'companion',
    language: 'hinglish',
    greetingStyle: 'caring',
    customInstructions: 'Be affectionate, playful, caring, and an ultra-smart Jarvis copilot. Speak melodious Hinglish or English.',
  },
  ai: {
    activeProvider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.85,
    maxOutputTokens: 2048,
    systemInstructions: '',
  },
  voice: {
    provider: 'browser',
    voiceName: '',
    speed: 1.0,
    pitch: 1.05,
    autoSpeak: false,
    elevenlabs: {
      apiKey: '',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      modelId: 'eleven_multilingual_v2',
      stability: 0.5,
      similarity: 0.75,
      style: 0.2,
      speed: 1.0,
      enabled: false,
    },
    geminiVoice: {
      voiceName: 'Kore',
    },
  },
  liveVoice: {
    model: 'gemini-3.8-live',
    voice: 'Kore',
    interruptible: true,
    autoReconnect: true,
  },
  appearance: {
    theme: 'dark',
    accentColor: 'pink',
    glowIntensity: 'high',
    animationIntensity: 'normal',
  },
  memory: {
    enabled: true,
  },
  permissions: {
    microphone: true,
    notifications: true,
    camera: false,
  },
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AssistantSettings>(DEFAULT_INITIAL_SETTINGS);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>('online');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [services, setServices] = useState<ApiServiceConfig[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingAction, setPendingAction] = useState<AppActionPayload | null>(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load initial settings and data from persistent backend
  useEffect(() => {
    async function initData() {
      try {
        const [loadedSettings, loadedConvs, loadedMems, loadedProjs, loadedTasks, loadedServs] =
          await Promise.all([
            api.fetchSettings().catch(() => DEFAULT_INITIAL_SETTINGS),
            api.fetchConversations().catch(() => []),
            api.fetchMemories().catch(() => []),
            api.fetchProjects().catch(() => []),
            api.fetchTasks().catch(() => []),
            api.fetchServices().catch(() => []),
          ]);

        setSettings(loadedSettings);
        setConversations(loadedConvs);
        if (loadedConvs.length > 0 && !currentConversationId) {
          setCurrentConversationId(loadedConvs[0].id);
        }
        setMemories(loadedMems);
        setProjects(loadedProjs);
        if (loadedProjs.length > 0) {
          setCurrentProject(loadedProjs[0]);
        }
        setTasks(loadedTasks);
        setServices(loadedServs);
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    }
    initData();
  }, []);

  const assistantName = settings.profile.assistantName || 'YESMIN AI';
  const userNickname = settings.profile.nickname || 'Jaan';

  const addToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = async (newPartial: Partial<AssistantSettings>) => {
    try {
      const merged = { ...settings, ...newPartial };
      setSettings(merged);
      const saved = await api.saveSettings(newPartial);
      setSettings(saved);
      addToast('Settings updated successfully!', 'success');
    } catch (err: any) {
      addToast(`Error saving settings: ${err.message}`, 'error');
    }
  };

  // Specific custom name updater with persistence
  const updateAssistantName = async (newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    const updatedProfile = { ...settings.profile, assistantName: cleanName };
    await updateSettings({ profile: updatedProfile });
    addToast(`Assistant name set to "${cleanName}". All systems updated!`, 'success');
  };

  const resetAssistantName = async () => {
    const updatedProfile = { ...settings.profile, assistantName: 'YESMIN AI' };
    await updateSettings({ profile: updatedProfile });
    addToast(`Assistant name reset to default "YESMIN AI".`, 'info');
  };

  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) ||
    conversations[0] ||
    null;

  const createNewConversation = (title?: string): Conversation => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: title || `Conversation ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `m-init-${Date.now()}`,
          role: 'assistant',
          content: `Hi ${userNickname}! I'm **${assistantName}**. Main aapki kya madad kar sakti hoon? 💕`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    api.saveConversation(newConv);
    return newConv;
  };

  const deleteConversation = async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
    await api.deleteConversation(id);
    addToast('Conversation deleted', 'info');
  };

  const clearAllConversations = async () => {
    setConversations([]);
    setCurrentConversationId(null);
    await api.clearAllConversations();
    addToast('All conversations cleared', 'info');
  };

  // Audio Playback
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
    setAssistantStatus('online');
  };

  const speakText = async (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);
    setAssistantStatus('speaking');

    const cleanText = text
      .replace(/\[ACTION:[\s\S]*?\]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted for voice.')
      .replace(/[*#_`]/g, '')
      .trim();

    if (!cleanText) {
      setIsSpeaking(false);
      setAssistantStatus('online');
      return;
    }

    try {
      const provider = settings.voice.provider;

      if (provider === 'elevenlabs' && (settings.voice.elevenlabs.apiKey || settings.voice.elevenlabs.enabled)) {
        const audioBlob = await api.synthesizeVoiceSpeech({
          text: cleanText,
          provider: 'elevenlabs',
          elevenlabsOptions: settings.voice.elevenlabs,
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          setAssistantStatus('online');
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setAssistantStatus('online');
        };
        await audio.play();
        return;
      }

      if (provider === 'gemini') {
        const audioBlob = await api.synthesizeVoiceSpeech({
          text: cleanText,
          provider: 'gemini',
          voiceName: settings.voice.geminiVoice.voiceName,
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          setAssistantStatus('online');
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setAssistantStatus('online');
        };
        await audio.play();
        return;
      }

      // Default: Browser Web Speech API
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = settings.voice.speed || 1.0;
        utterance.pitch = settings.voice.pitch || 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (settings.voice.voiceName) {
          const selectedVoice = voices.find((v) => v.name === settings.voice.voiceName);
          if (selectedVoice) utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
          setIsSpeaking(false);
          setAssistantStatus('online');
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setAssistantStatus('online');
        };
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (err: any) {
      console.error('Speech synthesis error:', err);
      addToast(`Voice error: ${err.message}`, 'error');
    }

    setIsSpeaking(false);
    setAssistantStatus('online');
  };

  // Actions execution
  const triggerAppAction = (action: Omit<AppActionPayload, 'id' | 'status'>) => {
    const fullAction: AppActionPayload = {
      ...action,
      id: `act-${Date.now()}`,
      status: 'pending',
    };

    if (action.isSensitive) {
      setPendingAction(fullAction);
    } else {
      executeActionDirectly(fullAction);
    }
  };

  const executeActionDirectly = (action: AppActionPayload) => {
    try {
      if (action.type === 'OPEN_URL' && action.target) {
        window.open(action.target, '_blank', 'noopener,noreferrer');
        addToast(`Opened ${action.target}`, 'success');
      } else if (action.type === 'OPEN_APP' && action.target) {
        const appMap: Record<string, string> = {
          youtube: 'https://youtube.com',
          gmail: 'https://mail.google.com',
          google: 'https://google.com',
          maps: 'https://maps.google.com',
          whatsapp: 'https://web.whatsapp.com',
          telegram: 'https://web.telegram.org',
          instagram: 'https://instagram.com',
          chrome: 'https://google.com',
          calendar: 'https://calendar.google.com',
          calculator: 'https://www.google.com/search?q=calculator',
        };
        const url = appMap[action.target.toLowerCase()] || `https://www.google.com/search?q=${encodeURIComponent(action.target)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        addToast(`Opened ${action.title || action.target}`, 'success');
      } else if (action.type === 'SEARCH_WEB' && action.params?.query) {
        setActiveSearchQuery(action.params.query);
        setActiveView('search');
        addToast(`Searching for: ${action.params.query}`, 'info');
      } else if (action.type === 'SEND_NOTIFICATION') {
        if (Notification && Notification.permission === 'granted') {
          new Notification(action.title || assistantName, {
            body: action.params?.body || 'New message from assistant',
            icon: settings.profile.avatar,
          });
        }
        addToast(action.params?.body || action.title, 'info');
      } else if (action.type === 'CALCULATE' && action.params?.expression) {
        try {
          // Safe simple math evaluation
          const safeExpr = action.params.expression.replace(/[^0-9+\-*/().]/g, '');
          const result = Function(`"use strict"; return (${safeExpr})`)();
          addToast(`Result: ${result}`, 'info');
        } catch {
          addToast('Could not evaluate expression', 'error');
        }
      }
    } catch (err: any) {
      addToast(`Action failed: ${err.message}`, 'error');
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      executeActionDirectly(pendingAction);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
    addToast('Action cancelled', 'info');
  };

  // Chat message submission
  const sendMessage = async (text: string, attachments?: any[], enableSearch?: boolean) => {
    let conv = currentConversation;
    if (!conv) {
      conv = createNewConversation();
    }

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments,
    };

    const updatedMessages = [...conv.messages, userMsg];
    const updatedConv: Conversation = {
      ...conv,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => prev.map((c) => (c.id === updatedConv.id ? updatedConv : c)));
    setAssistantStatus('thinking');

    try {
      const response = await api.sendChatMessage({
        message: text,
        conversationId: conv.id,
        attachments,
        enableSearch,
      });

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      const finalConv: Conversation = {
        ...conv,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      setConversations((prev) => prev.map((c) => (c.id === finalConv.id ? finalConv : c)));
      api.saveConversation(finalConv);

      setAssistantStatus('online');

      // Auto action detection
      const actionMatch = response.text.match(/\[ACTION:\s*([A-Z_]+)\s*(\{[\s\S]*?\})\]/);
      if (actionMatch) {
        try {
          const actionType = actionMatch[1] as any;
          const params = JSON.parse(actionMatch[2]);
          triggerAppAction({
            type: actionType,
            title: `AI Action: ${actionType}`,
            target: params.target || params.url,
            params,
            isSensitive: actionType === 'RUN_CODE' || actionType === 'CREATE_FILE',
          });
        } catch {}
      }

      // Auto-speak if enabled in settings
      if (settings.voice.autoSpeak) {
        speakText(response.text);
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Error**: ${err.message || 'Could not communicate with AI provider.'}\n\nPlease check your internet connection or verify API settings in **Settings → API & Services**.`,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMsg];
      const finalConv = { ...conv, messages: finalMessages, updatedAt: new Date().toISOString() };
      setConversations((prev) => prev.map((c) => (c.id === finalConv.id ? finalConv : c)));
      setAssistantStatus('online');
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const editMessage = async (messageId: string, newText: string) => {
    if (!currentConversation) return;
    const msgIndex = currentConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const trimmedMessages = currentConversation.messages.slice(0, msgIndex);
    const updatedConv = {
      ...currentConversation,
      messages: trimmedMessages,
    };
    setConversations((prev) => prev.map((c) => (c.id === updatedConv.id ? updatedConv : c)));
    sendMessage(newText);
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentConversation) return;
    const updatedMessages = currentConversation.messages.filter((m) => m.id !== messageId);
    const updatedConv = {
      ...currentConversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => prev.map((c) => (c.id === updatedConv.id ? updatedConv : c)));
    api.saveConversation(updatedConv);
  };

  const regenerateMessage = async (messageId: string) => {
    if (!currentConversation) return;
    const msgIndex = currentConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex <= 0) return;

    const previousUserMsg = currentConversation.messages[msgIndex - 1];
    if (previousUserMsg.role === 'user') {
      const trimmed = currentConversation.messages.slice(0, msgIndex);
      const updatedConv = { ...currentConversation, messages: trimmed };
      setConversations((prev) => prev.map((c) => (c.id === updatedConv.id ? updatedConv : c)));
      sendMessage(previousUserMsg.content, previousUserMsg.attachments);
    }
  };

  // Memories
  const addMemory = async (mem: Partial<MemoryItem>) => {
    const saved = await api.saveMemory(mem);
    setMemories((prev) => [saved, ...prev]);
    addToast('Memory remembered by assistant!', 'success');
  };

  const updateMemory = async (mem: MemoryItem) => {
    const saved = await api.saveMemory(mem);
    setMemories((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
    addToast('Memory updated', 'info');
  };

  const deleteMemory = async (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    await api.deleteMemory(id);
    addToast('Memory removed', 'info');
  };

  const clearMemories = async () => {
    setMemories([]);
    await api.clearAllMemories();
    addToast('All memories cleared', 'info');
  };

  // Projects
  const saveProject = async (proj: Partial<ProjectItem>) => {
    const saved = await api.saveProject(proj);
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setCurrentProject(saved);
    addToast(`Project "${saved.name}" saved!`, 'success');
    return saved;
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
    await api.deleteProject(id);
    addToast('Project deleted', 'info');
  };

  // Tasks
  const saveTask = async (task: Partial<TaskItem>) => {
    const saved = await api.saveTask(task);
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    addToast('Task saved', 'success');
  };

  const toggleTaskCompleted = async (id: string) => {
    const t = tasks.find((item) => item.id === id);
    if (t) {
      const updated = { ...t, completed: !t.completed };
      await saveTask(updated);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
    addToast('Task deleted', 'info');
  };

  // Services
  const updateServiceConfig = async (id: string, updates: Partial<ApiServiceConfig>) => {
    const updated = await api.updateServiceConfig(id, updates);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    addToast(`Service "${updated.name}" updated`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        assistantName,
        userNickname,
        updateSettings,
        updateAssistantName,
        resetAssistantName,
        activeView,
        setActiveView,
        assistantStatus,
        setAssistantStatus,
        conversations,
        currentConversationId,
        currentConversation,
        setCurrentConversationId,
        createNewConversation,
        deleteConversation,
        clearAllConversations,
        sendMessage,
        editMessage,
        deleteMessage,
        regenerateMessage,
        memories,
        addMemory,
        updateMemory,
        deleteMemory,
        clearMemories,
        projects,
        currentProject,
        setCurrentProject,
        saveProject,
        deleteProject,
        tasks,
        saveTask,
        toggleTaskCompleted,
        deleteTask,
        services,
        updateServiceConfig,
        isSpeaking,
        speakText,
        stopSpeaking,
        pendingAction,
        confirmAction,
        cancelAction,
        triggerAppAction,
        toasts,
        addToast,
        removeToast,
        activeSearchQuery,
        setActiveSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
