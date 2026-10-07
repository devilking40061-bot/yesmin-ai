export type PersonalityMode = 'companion' | 'friendly' | 'professional' | 'coding' | 'study';

export type LanguageMode = 'hinglish' | 'hindi' | 'english';

export type VoiceProvider = 'browser' | 'elevenlabs' | 'gemini';

export type AccentColor = 'pink' | 'purple' | 'cyan' | 'emerald';

export interface UserProfile {
  name: string;
  nickname: string;
  assistantName: string;
  avatar: string;
  personality: PersonalityMode;
  language: LanguageMode;
  greetingStyle: string;
  customInstructions: string;
}

export interface AssistantSettings {
  profile: UserProfile;
  ai: {
    activeProvider: 'gemini' | 'openai' | 'anthropic' | 'custom';
    model: string;
    temperature: number;
    maxOutputTokens: number;
    systemInstructions: string;
  };
  voice: {
    provider: VoiceProvider;
    voiceName: string;
    speed: number;
    pitch: number;
    autoSpeak: boolean;
    elevenlabs: {
      apiKey: string;
      voiceId: string;
      modelId: string;
      stability: number;
      similarity: number;
      style: number;
      speed: number;
      enabled: boolean;
    };
    geminiVoice: {
      voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
    };
  };
  liveVoice: {
    model: string;
    voice: string;
    interruptible: boolean;
    autoReconnect: boolean;
  };
  appearance: {
    theme: 'dark';
    accentColor: AccentColor;
    glowIntensity: 'subtle' | 'medium' | 'high';
    animationIntensity: 'low' | 'normal' | 'high';
  };
  memory: {
    enabled: boolean;
  };
  permissions: {
    microphone: boolean;
    notifications: boolean;
    camera: boolean;
  };
}

export interface MemoryItem {
  id: string;
  key: string;
  content: string;
  category: 'preference' | 'personal' | 'instruction' | 'fact';
  enabled: boolean;
  createdAt: string;
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface SearchCitation {
  title: string;
  uri: string;
  snippet?: string;
}

export interface ToolCallItem {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    type: string;
    size: number;
    dataUrl?: string;
  }[];
  sources?: SearchCitation[];
  toolCalls?: ToolCallItem[];
  audioUrl?: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  projectId?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  reminder?: boolean;
  recurring?: 'none' | 'daily' | 'weekly';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface ProjectFile {
  name: string;
  content: string;
  language: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  category: 'Android App' | 'Website' | 'AI Assistant' | 'Coding Project' | 'Study Project' | 'Custom';
  description: string;
  files: Record<string, string>;
  tasks: TaskItem[];
  notes: string;
  instructions: string;
  updatedAt: string;
}

export type ActionType =
  | 'OPEN_URL'
  | 'OPEN_APP'
  | 'SEARCH_WEB'
  | 'CREATE_FILE'
  | 'READ_FILE'
  | 'RUN_CODE'
  | 'SEND_NOTIFICATION'
  | 'CALCULATE'
  | 'OTHER_SUPPORTED_ACTIONS';

export interface AppActionPayload {
  id: string;
  type: ActionType;
  title: string;
  target?: string;
  params?: Record<string, any>;
  isSensitive: boolean;
  status: 'pending' | 'executed' | 'cancelled';
  executedAt?: string;
}

export interface ApiServiceConfig {
  id: string;
  name: string;
  category: string;
  configured: boolean;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastTested?: string;
  errorMessage?: string;
}
