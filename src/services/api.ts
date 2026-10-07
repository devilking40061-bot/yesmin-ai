import {
  AssistantSettings,
  Conversation,
  MemoryItem,
  ProjectItem,
  TaskItem,
  ApiServiceConfig,
} from '../types/index.ts';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchSettings(): Promise<AssistantSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function saveSettings(settings: Partial<AssistantSettings>): Promise<AssistantSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export async function sendChatMessage(payload: {
  message: string;
  conversationId?: string;
  attachments?: { name: string; type: string; dataUrl?: string }[];
  enableSearch?: boolean;
}): Promise<{ text: string; sources?: { title: string; uri: string }[] }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Chat request failed');
  }
  return res.json();
}

export async function synthesizeVoiceSpeech(payload: {
  text: string;
  provider?: 'elevenlabs' | 'gemini';
  voiceName?: string;
  elevenlabsOptions?: any;
}): Promise<Blob> {
  const res = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Speech synthesis failed' }));
    throw new Error(err.error || 'Failed to synthesize speech');
  }
  return res.blob();
}

export async function testElevenLabs(apiKey: string, voiceId: string): Promise<Blob> {
  const res = await fetch('/api/voice/elevenlabs/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, voiceId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'ElevenLabs test failed' }));
    throw new Error(err.error || 'ElevenLabs test failed');
  }
  return res.blob();
}

export async function testProviderConnection(provider: string, data: any) {
  const res = await fetch('/api/providers/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ...data }),
  });
  return res.json();
}

// Conversations
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch('/api/conversations');
  return res.json();
}

export async function saveConversation(conv: Conversation): Promise<void> {
  await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conv),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
}

export async function clearAllConversations(): Promise<void> {
  await fetch('/api/conversations', { method: 'DELETE' });
}

// Memories
export async function fetchMemories(): Promise<MemoryItem[]> {
  const res = await fetch('/api/memories');
  return res.json();
}

export async function saveMemory(memory: Partial<MemoryItem>): Promise<MemoryItem> {
  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory),
  });
  return res.json();
}

export async function deleteMemory(id: string): Promise<void> {
  await fetch(`/api/memories/${id}`, { method: 'DELETE' });
}

export async function clearAllMemories(): Promise<void> {
  await fetch('/api/memories', { method: 'DELETE' });
}

// Projects
export async function fetchProjects(): Promise<ProjectItem[]> {
  const res = await fetch('/api/projects');
  return res.json();
}

export async function saveProject(proj: Partial<ProjectItem>): Promise<ProjectItem> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proj),
  });
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`/api/projects/${id}`, { method: 'DELETE' });
}

// Tasks
export async function fetchTasks(): Promise<TaskItem[]> {
  const res = await fetch('/api/tasks');
  return res.json();
}

export async function saveTask(task: Partial<TaskItem>): Promise<TaskItem> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
}

// Services
export async function fetchServices(): Promise<ApiServiceConfig[]> {
  const res = await fetch('/api/services');
  return res.json();
}

export async function updateServiceConfig(id: string, updates: Partial<ApiServiceConfig>): Promise<ApiServiceConfig> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

// Code Sandbox
export async function runCodeInSandbox(code: string, language: 'javascript' | 'typescript' | 'python' = 'javascript'): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTimeMs: number;
}> {
  const res = await fetch('/api/sandbox/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });
  return res.json();
}

// Web Search
export async function performWebSearch(query: string): Promise<{
  answer: string;
  sources: { title: string; uri: string }[];
  query: string;
}> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }));
    throw new Error(err.error || 'Search failed');
  }
  return res.json();
}

// Image Analysis
export async function analyzeImageFile(imageBase64: string, prompt?: string, mimeType?: string): Promise<{ analysis: string }> {
  const res = await fetch('/api/image/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Image analysis failed' }));
    throw new Error(err.error || 'Image analysis failed');
  }
  return res.json();
}

// Coding Agent Plan
export async function generateCodingPlan(prompt: string, currentFiles?: Record<string, string>): Promise<{
  plan: string[];
  explanation: string;
  files: { name: string; content: string; language: string }[];
  testCode?: string;
}> {
  const res = await fetch('/api/coding/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, currentFiles }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Planning failed' }));
    throw new Error(err.error || 'Planning failed');
  }
  return res.json();
}
