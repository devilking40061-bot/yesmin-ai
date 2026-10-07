import fs from 'fs';
import path from 'path';
import { AssistantSettings, Conversation, MemoryItem, ProjectItem, TaskItem, ApiServiceConfig } from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'app_data.json');

export interface AppDatabase {
  settings: AssistantSettings;
  conversations: Conversation[];
  memories: MemoryItem[];
  projects: ProjectItem[];
  tasks: TaskItem[];
  services: ApiServiceConfig[];
  logs: { timestamp: string; level: string; message: string }[];
}

const DEFAULT_SETTINGS: AssistantSettings = {
  profile: {
    name: 'User',
    nickname: 'Jaan',
    assistantName: 'YESMIN AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    personality: 'companion',
    language: 'hinglish',
    greetingStyle: 'caring',
    customInstructions: 'Be deeply caring, affectionate, witty, and always supportive. Respond in sweet Hinglish by default or match user language. You are an ultra-smart AI companion and personal Jarvis assistant.',
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
    voiceName: 'Microsoft Heera - Hindi (India)',
    speed: 1.0,
    pitch: 1.05,
    autoSpeak: false,
    elevenlabs: {
      apiKey: '',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel default
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

const DEFAULT_SERVICES: ApiServiceConfig[] = [
  { id: 'gemini', name: 'Google Gemini', category: 'LLM & Multimodal', configured: true, enabled: true, model: 'gemini-3.8-flash', status: 'connected' },
  { id: 'openai', name: 'OpenAI GPT-4o', category: 'LLM', configured: false, enabled: false, model: 'gpt-4o', status: 'disconnected' },
  { id: 'anthropic', name: 'Anthropic Claude', category: 'LLM', configured: false, enabled: false, model: 'claude-3-5-sonnet', status: 'disconnected' },
  { id: 'custom_ai', name: 'Custom OpenAI-Compatible', category: 'LLM Proxy', configured: false, enabled: false, endpoint: 'http://localhost:11434/v1', status: 'disconnected' },
  { id: 'elevenlabs', name: 'ElevenLabs Voice', category: 'Text-to-Speech', configured: false, enabled: false, status: 'disconnected' },
  { id: 'stt', name: 'Speech-to-Text', category: 'Audio Transcription', configured: true, enabled: true, model: 'gemini-3.5-transcribe / Web Speech', status: 'connected' },
  { id: 'tts', name: 'Gemini Text-to-Speech', category: 'Voice Synthesis', configured: true, enabled: true, model: 'gemini-3.8-flash-lite-tts', status: 'connected' },
  { id: 'search', name: 'Web Search Grounding', category: 'Google Search / Serper', configured: true, enabled: true, status: 'connected' },
  { id: 'image_gen', name: 'Image Generation', category: 'Vision', configured: true, enabled: true, model: 'gemini-3.1-flash-lite-image', status: 'connected' },
  { id: 'maps', name: 'Maps & Geo Navigation', category: 'Navigation', configured: true, enabled: true, status: 'connected' },
  { id: 'firebase', name: 'Firebase Database & Auth', category: 'Database & Auth', configured: false, enabled: false, status: 'disconnected' },
  { id: 'storage', name: 'Persistent Storage', category: 'Data', configured: true, enabled: true, status: 'connected' },
  { id: 'sandbox', name: 'Node / Python Sandbox', category: 'Code Execution', configured: true, enabled: true, status: 'connected' },
  { id: 'analytics', name: 'Session & Health Analytics', category: 'Telemetry', configured: true, enabled: true, status: 'connected' },
];

const DEFAULT_MEMORIES: MemoryItem[] = [
  { id: 'mem-1', key: 'nickname', content: 'User prefers being called "Jaan" or by name affectionately.', category: 'preference', enabled: true, createdAt: new Date().toISOString() },
  { id: 'mem-2', key: 'language', content: 'User enjoys talking in natural, sweet Hinglish and Hindi-English blend.', category: 'preference', enabled: true, createdAt: new Date().toISOString() },
  { id: 'mem-3', key: 'assistant_role', content: 'Act as both a caring loving AI companion and a genius Jarvis-level engineer.', category: 'instruction', enabled: true, createdAt: new Date().toISOString() },
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'Smart Jarvis Dashboard',
    category: 'Website',
    description: 'Autonomous cyber dashboard with voice controls and quick widgets.',
    files: {
      'index.html': '<!DOCTYPE html>\n<html>\n<head><title>Jarvis Mini</title></head>\n<body>\n<h1>Status: Online</h1>\n</body>\n</html>',
      'main.js': '// Jarvis Automation Script\nconsole.log("Jarvis systems online.");\n',
    },
    tasks: [
      { id: 't-1', title: 'Initialize Web Speech listener', completed: true, priority: 'high', createdAt: new Date().toISOString() },
      { id: 't-2', title: 'Connect action triggers', completed: false, priority: 'medium', createdAt: new Date().toISOString() },
    ],
    notes: 'Personal workspace for testing quick Jarvis automation actions.',
    instructions: 'Keep responses concise and modular.',
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  { id: 'task-1', title: 'Greet user and test Live Voice mode', description: 'Try the high-fidelity Gemini live audio orb conversation.', dueDate: 'Today', priority: 'high', completed: false, createdAt: new Date().toISOString() },
  { id: 'task-2', title: 'Configure custom Assistant Name', description: 'Head to Settings → Profile & Assistant to customize Yesmin AI.', dueDate: 'Today', priority: 'medium', completed: false, createdAt: new Date().toISOString() },
  { id: 'task-3', title: 'Test the AI Coding Agent', description: 'Ask the coding agent to build a feature and run code in the sandbox.', dueDate: 'Tomorrow', priority: 'high', completed: false, createdAt: new Date().toISOString() },
];

class StorageManager {
  private data: AppDatabase;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AppDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          conversations: parsed.conversations || [],
          memories: parsed.memories || DEFAULT_MEMORIES,
          projects: parsed.projects || DEFAULT_PROJECTS,
          tasks: parsed.tasks || DEFAULT_TASKS,
          services: parsed.services || DEFAULT_SERVICES,
          logs: parsed.logs || [],
        };
      }
    } catch (err) {
      console.error('Failed reading storage, resetting to defaults:', err);
    }

    const initialData: AppDatabase = {
      settings: DEFAULT_SETTINGS,
      conversations: [
        {
          id: 'conv-welcome',
          title: 'Welcome to Yesmin AI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'm-welcome',
              role: 'assistant',
              content: `Aapka swagat hai! Main hoon **YESMIN AI** — aapki loving companion aur Jarvis assistant. ✨\n\nAap chahe to **Settings → Profile & Assistant** mein jaakar mera naam change karke kuch bhi rakh sakte hain (jaise *Muskan*, *Ayesha*, ya *Jarvis*). Main turant har jagah usi naam se baat karungi!\n\nMain aapki help kar sakti hoon:\n- 💬 Casual chatting, motiuvation & caring baatein\n- 🎙️ **Live Voice Mode** mein continuous real-time audio interaction\n- 💻 **Coding Agent** mein full files generate aur test karna\n- 📱 **Apps & Actions** se direct tools open karna\n\nBataiye Jaan, aaj hum kya karein? 💕`,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      ],
      memories: DEFAULT_MEMORIES,
      projects: DEFAULT_PROJECTS,
      tasks: DEFAULT_TASKS,
      services: DEFAULT_SERVICES,
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Storage initialized' }],
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave: AppDatabase) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to storage:', err);
    }
  }

  public getDatabase(): AppDatabase {
    return this.data;
  }

  public getSettings(): AssistantSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<AssistantSettings>): AssistantSettings {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
      profile: {
        ...this.data.settings.profile,
        ...(partial.profile || {}),
      },
      ai: {
        ...this.data.settings.ai,
        ...(partial.ai || {}),
      },
      voice: {
        ...this.data.settings.voice,
        ...(partial.voice || {}),
        elevenlabs: {
          ...this.data.settings.voice.elevenlabs,
          ...(partial.voice?.elevenlabs || {}),
        },
      },
      liveVoice: {
        ...this.data.settings.liveVoice,
        ...(partial.liveVoice || {}),
      },
      appearance: {
        ...this.data.settings.appearance,
        ...(partial.appearance || {}),
      },
      memory: {
        ...this.data.settings.memory,
        ...(partial.memory || {}),
      },
      permissions: {
        ...this.data.settings.permissions,
        ...(partial.permissions || {}),
      },
    };
    this.saveData(this.data);
    return this.data.settings;
  }

  // Conversations
  public getConversations(): Conversation[] {
    return this.data.conversations;
  }

  public getConversation(id: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  public saveConversation(conv: Conversation): void {
    const idx = this.data.conversations.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      this.data.conversations[idx] = conv;
    } else {
      this.data.conversations.unshift(conv);
    }
    this.saveData(this.data);
  }

  public deleteConversation(id: string): void {
    this.data.conversations = this.data.conversations.filter((c) => c.id !== id);
    this.saveData(this.data);
  }

  public clearAllConversations(): void {
    this.data.conversations = [];
    this.saveData(this.data);
  }

  // Memories
  public getMemories(): MemoryItem[] {
    return this.data.memories;
  }

  public saveMemory(memory: MemoryItem): void {
    const idx = this.data.memories.findIndex((m) => m.id === memory.id);
    if (idx >= 0) {
      this.data.memories[idx] = memory;
    } else {
      this.data.memories.push(memory);
    }
    this.saveData(this.data);
  }

  public deleteMemory(id: string): void {
    this.data.memories = this.data.memories.filter((m) => m.id !== id);
    this.saveData(this.data);
  }

  public clearMemories(): void {
    this.data.memories = [];
    this.saveData(this.data);
  }

  // Projects
  public getProjects(): ProjectItem[] {
    return this.data.projects;
  }

  public saveProject(proj: ProjectItem): void {
    const idx = this.data.projects.findIndex((p) => p.id === proj.id);
    if (idx >= 0) {
      this.data.projects[idx] = proj;
    } else {
      this.data.projects.unshift(proj);
    }
    this.saveData(this.data);
  }

  public deleteProject(id: string): void {
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    this.saveData(this.data);
  }

  // Tasks
  public getTasks(): TaskItem[] {
    return this.data.tasks;
  }

  public saveTask(task: TaskItem): void {
    const idx = this.data.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      this.data.tasks[idx] = task;
    } else {
      this.data.tasks.unshift(task);
    }
    this.saveData(this.data);
  }

  public deleteTask(id: string): void {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    this.saveData(this.data);
  }

  // Services
  public getServices(): ApiServiceConfig[] {
    return this.data.services;
  }

  public updateService(id: string, updates: Partial<ApiServiceConfig>): ApiServiceConfig | null {
    const s = this.data.services.find((item) => item.id === id);
    if (s) {
      Object.assign(s, updates);
      this.saveData(this.data);
      return s;
    }
    return null;
  }

  public log(level: string, message: string): void {
    this.data.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
    });
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(-500);
    }
  }
}

export const db = new StorageManager();
