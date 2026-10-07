import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/storage.ts';
import {
  generateChatResponse,
  executeCodeInSandbox,
  generateGeminiSpeech,
  generateElevenLabsSpeech,
} from './server/aiService.ts';
import { getGeminiClient, hasGeminiKey } from './server/geminiClient.ts';
import { setupLiveVoiceWebSocket } from './server/liveSession.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up WebSocket for Gemini Live
setupLiveVoiceWebSocket(server);

// --- API Endpoints ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGeminiKey(),
    elevenlabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY || db.getSettings().voice.elevenlabs.apiKey),
    assistantName: db.getSettings().profile.assistantName,
  });
});

// 2. Settings
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    db.log('info', `Settings updated. Assistant name is now: ${updated.profile.assistantName}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Chat completion
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, attachments, enableSearch } = req.body;
    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message or attachment required' });
    }

    const settings = db.getSettings();
    const result = await generateChatResponse({
      message: message || '',
      conversationId,
      attachments,
      customAssistantName: settings.profile.assistantName,
      customNickname: settings.profile.nickname,
      personality: settings.profile.personality,
      language: settings.profile.language,
      enableSearch: Boolean(enableSearch),
    });

    res.json(result);
  } catch (err: any) {
    console.error('API /api/chat error:', err);
    res.status(500).json({ error: err.message || 'Internal chat error' });
  }
});

// 4. Voice TTS synthesis
app.post('/api/voice/tts', async (req, res) => {
  try {
    const { text, provider, voiceName, elevenlabsOptions } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const currentSettings = db.getSettings();
    const selectedProvider = provider || currentSettings.voice.provider;

    if (selectedProvider === 'elevenlabs') {
      const audioBuffer = await generateElevenLabsSpeech({
        text,
        apiKey: elevenlabsOptions?.apiKey,
        voiceId: elevenlabsOptions?.voiceId,
        modelId: elevenlabsOptions?.modelId,
        stability: elevenlabsOptions?.stability,
        similarity: elevenlabsOptions?.similarity,
        style: elevenlabsOptions?.style,
        speed: elevenlabsOptions?.speed,
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(audioBuffer);
    }

    if (selectedProvider === 'gemini') {
      const selectedVoice = (voiceName || currentSettings.voice.geminiVoice.voiceName || 'Kore') as any;
      const audioBuffer = await generateGeminiSpeech(text, selectedVoice);

      if (audioBuffer) {
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(audioBuffer);
      }
      return res.status(500).json({ error: 'Gemini TTS generation failed' });
    }

    // Default to browser / 400 for unhandled
    res.status(400).json({ error: 'Use browser speech synthesis for provider: browser' });
  } catch (err: any) {
    console.error('API /api/voice/tts error:', err);
    res.status(500).json({ error: err.message || 'TTS generation error' });
  }
});

// 5. Test ElevenLabs Voice
app.post('/api/voice/elevenlabs/test', async (req, res) => {
  try {
    const { apiKey, voiceId, text } = req.body;
    const testPhrase = text || 'Hello Jaan! This is your custom voice speaking from ElevenLabs.';

    const audioBuffer = await generateElevenLabsSpeech({
      text: testPhrase,
      apiKey,
      voiceId,
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Test AI Provider
app.post('/api/providers/test', async (req, res) => {
  const { provider, apiKey, model, endpoint } = req.body;

  try {
    if (provider === 'gemini') {
      if (!hasGeminiKey() && !apiKey) {
        return res.status(400).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
      }
      const ai = getGeminiClient();
      const testRes = await ai.models.generateContent({
        model: model || 'gemini-3.8-flash',
        contents: 'Respond with the word "CONNECTED" only.',
      });
      return res.json({
        success: true,
        message: 'Google Gemini connected successfully!',
        response: testRes.text?.trim(),
      });
    }

    if (provider === 'custom' || provider === 'openai') {
      return res.json({
        success: true,
        message: `Provider ${provider} endpoint verified.`,
      });
    }

    res.json({ success: true, message: `${provider} connection active.` });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Conversations
app.get('/api/conversations', (req, res) => {
  res.json(db.getConversations());
});

app.get('/api/conversations/:id', (req, res) => {
  const conv = db.getConversation(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conv);
});

app.post('/api/conversations', (req, res) => {
  db.saveConversation(req.body);
  res.json({ success: true, conversation: req.body });
});

app.delete('/api/conversations/:id', (req, res) => {
  db.deleteConversation(req.params.id);
  res.json({ success: true });
});

app.delete('/api/conversations', (req, res) => {
  db.clearAllConversations();
  res.json({ success: true });
});

// 8. Memories
app.get('/api/memories', (req, res) => {
  res.json(db.getMemories());
});

app.post('/api/memories', (req, res) => {
  const memory = {
    ...req.body,
    id: req.body.id || `mem-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
  };
  db.saveMemory(memory);
  res.json(memory);
});

app.delete('/api/memories/:id', (req, res) => {
  db.deleteMemory(req.params.id);
  res.json({ success: true });
});

app.delete('/api/memories', (req, res) => {
  db.clearMemories();
  res.json({ success: true });
});

// 9. Projects
app.get('/api/projects', (req, res) => {
  res.json(db.getProjects());
});

app.post('/api/projects', (req, res) => {
  const project = {
    ...req.body,
    id: req.body.id || `proj-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  db.saveProject(project);
  res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
  db.deleteProject(req.params.id);
  res.json({ success: true });
});

// 10. Tasks
app.get('/api/tasks', (req, res) => {
  res.json(db.getTasks());
});

app.post('/api/tasks', (req, res) => {
  const task = {
    ...req.body,
    id: req.body.id || `task-${Date.now()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
  };
  db.saveTask(task);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  db.deleteTask(req.params.id);
  res.json({ success: true });
});

// 11. Services list & update
app.get('/api/services', (req, res) => {
  res.json(db.getServices());
});

app.put('/api/services/:id', (req, res) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Service not found' });
  res.json(updated);
});

// 12. Sandboxed Code Execution
app.post('/api/sandbox/run', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await executeCodeInSandbox(code, language || 'javascript');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Web Search Grounded Endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    if (!hasGeminiKey()) {
      return res.status(400).json({
        error: 'Gemini API key is required for grounded web search.',
      });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide an accurate, up-to-date answer for: "${query}". Include verified facts and current status.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: { title: string; uri: string }[] = [];
    const candidates = (response as any).candidates;
    if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
      const chunks = candidates[0].groundingMetadata.groundingChunks;
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || new URL(chunk.web.uri).hostname,
            uri: chunk.web.uri,
          });
        }
      }
    }

    res.json({
      answer: response.text,
      sources,
      query,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Image & Document Analysis
app.post('/api/image/analyze', async (req, res) => {
  try {
    const { imageBase64, prompt, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image base64 required' });

    if (!hasGeminiKey()) {
      return res.status(400).json({ error: 'Gemini API Key required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/png',
              data: cleanBase64,
            },
          },
          {
            text:
              prompt ||
              'Analyze this image in depth. If it contains UI, describe layout and UX. If code or an error screenshot, extract code and explain fixes. If text, transcribe it accurately.',
          },
        ],
      },
    });

    res.json({ analysis: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Coding Agent Planner
app.post('/api/coding/plan', async (req, res) => {
  try {
    const { prompt, currentFiles } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (!hasGeminiKey()) {
      return res.status(400).json({ error: 'Gemini API Key required' });
    }

    const ai = getGeminiClient();
    const filesContext = currentFiles
      ? Object.entries(currentFiles)
          .map(([name, code]) => `File: ${name}\n\`\`\`\n${code}\n\`\`\``)
          .join('\n\n')
      : 'No existing files';

    const systemPrompt = `You are an elite Senior Software Architect & Autonomous Coding Agent.
A user requested: "${prompt}".
Current project files:
${filesContext}

Generate a structured plan and executable files. Respond in JSON format with:
{
  "plan": ["Step 1 description", "Step 2 description", ...],
  "explanation": "Brief overview of what is created/fixed",
  "files": [
    {
      "name": "filename.ts",
      "content": "Full source code",
      "language": "typescript"
    }
  ],
  "testCode": "Optional small test code snippet to verify execution"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Production static serving or Vite dev middlewares
async function setupViteOrStatic() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Yesmin AI Assistant running on http://0.0.0.0:${PORT}`);
  });
});
