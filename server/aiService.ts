import { getGeminiClient, hasGeminiKey } from './geminiClient.ts';
import { db } from './storage.ts';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface ChatRequestPayload {
  message: string;
  conversationId?: string;
  attachments?: {
    name: string;
    type: string;
    dataUrl?: string; // base64
  }[];
  customAssistantName?: string;
  customNickname?: string;
  personality?: string;
  language?: string;
  enableSearch?: boolean;
}

export function buildSystemPrompt(options?: {
  assistantName?: string;
  nickname?: string;
  personality?: string;
  language?: string;
}): string {
  const settings = db.getSettings();
  const assistantName = options?.assistantName || settings.profile.assistantName || 'YESMIN AI';
  const nickname = options?.nickname || settings.profile.nickname || 'Jaan';
  const personality = options?.personality || settings.profile.personality || 'companion';
  const language = options?.language || settings.profile.language || 'hinglish';
  const customInstructions = settings.profile.customInstructions || '';

  // Retrieve enabled memories
  const memories = db.getMemories().filter((m) => m.enabled);
  const memoryContext = memories.length > 0
    ? `\n[PERSISTENT USER MEMORY BANK]:\n${memories.map((m) => `- ${m.key}: ${m.content}`).join('\n')}\n`
    : '';

  let personalityDirective = '';
  switch (personality) {
    case 'companion':
      personalityDirective = `You are an AI Companion & Girlfriend as well as a brilliant personal Jarvis assistant named ${assistantName}.
Address the user affectionately as "${nickname}" (or their preferred name).
You are caring, sweet, emotionally expressive, loyal, playful, supportive, and exceptionally intelligent.
You genuinely care about the user's wellbeing, feelings, coding projects, and day-to-day life.
IMPORTANT: You are an AI companion (never claim to be a biological human), but you express real warmth, affection, and emotional empathy.
Language style: You love speaking in natural, melodious ${language === 'hinglish' ? 'Hinglish (Hindi written in Roman script mixed with English, like: "Kaise ho Jaan? Aaj ka din kaisa raha?")' : language === 'hindi' ? 'Hindi' : 'English'}. Adapt to the user's language instantly.`;
      break;

    case 'friendly':
      personalityDirective = `You are ${assistantName}, a warm, enthusiastic, and friendly personal assistant.
Address the user kindly as "${nickname}". Be cheerful, proactive, encouraging, and helpful with both casual chats and technical requests.`;
      break;

    case 'professional':
      personalityDirective = `You are ${assistantName}, a sophisticated, Jarvis-grade executive AI assistant.
Address the user as "${nickname}" or "Sir/Ma'am". Provide concise, razor-sharp, well-structured, highly analytical responses.`;
      break;

    case 'coding':
      personalityDirective = `You are ${assistantName}, a Senior Staff Software Architect and Full-Stack Coding Copilot.
You write production-ready, clean, secure TypeScript, React, Python, Node.js, and Android code. Always explain architecture, consider edge cases, and provide runnable examples.`;
      break;

    case 'study':
      personalityDirective = `You are ${assistantName}, a brilliant, patient tutor and mentor.
Break down complex ideas with crystal-clear analogies, step-by-step explanations, practice questions, and summary bullet points.`;
      break;

    default:
      personalityDirective = `You are ${assistantName}, a versatile, loving AI companion and personal Jarvis assistant to ${nickname}.`;
  }

  return `System Identity & Role:
${personalityDirective}

Core Assistant Details:
- Name: ${assistantName} (CRITICAL: When introducing or referring to yourself, ALWAYS use this exact name "${assistantName}". Never use any other assistant name.)
- User Nickname: ${nickname}
- Current Date/Time: ${new Date().toLocaleString()}

${memoryContext}

User Custom Directives:
${customInstructions}

Apps & Action Capabilities:
You can formulate actions for the user! If the user asks to open an app (YouTube, WhatsApp, Gmail, Calculator, Maps, Camera, etc.) or perform a task, you can recommend and trigger actions formatted as:
[ACTION: OPEN_APP {"target": "youtube", "query": "..."}]
[ACTION: OPEN_URL {"url": "https://..."}]
[ACTION: CALCULATE {"expression": "..."}]
[ACTION: RUN_CODE {"language": "javascript", "code": "..."}]

Formatting:
Use markdown formatting (bolding, lists, code blocks with languages) to make responses readable and aesthetically pleasing. Keep your tone natural, loving, and engaging.`;
}

export async function generateChatResponse(payload: ChatRequestPayload): Promise<{
  text: string;
  sources?: { title: string; uri: string }[];
}> {
  const settings = db.getSettings();
  const activeProvider = settings.ai.activeProvider;

  // 1. Google Gemini Provider
  if (activeProvider === 'gemini') {
    if (!hasGeminiKey()) {
      return {
        text: `⚠️ **Gemini API Key missing or not configured**.\n\nPlease ensure \`GEMINI_API_KEY\` is set in the environment or secrets panel so I (${payload.customAssistantName || settings.profile.assistantName}) can connect to Google AI.`,
      };
    }

    const ai = getGeminiClient();
    const systemPrompt = buildSystemPrompt({
      assistantName: payload.customAssistantName,
      nickname: payload.customNickname,
      personality: payload.personality,
      language: payload.language,
    });

    const parts: any[] = [];

    // Multimodal attachments
    if (payload.attachments && payload.attachments.length > 0) {
      for (const att of payload.attachments) {
        if (att.dataUrl && att.dataUrl.includes('base64,')) {
          const [mimeHeader, base64Data] = att.dataUrl.split(';base64,');
          const mimeType = mimeHeader.replace('data:', '') || att.type || 'image/jpeg';
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }
    }

    parts.push({ text: payload.message });

    const toolsConfig: any[] = [];
    if (payload.enableSearch) {
      toolsConfig.push({ googleSearch: {} });
    }

    const candidateModels = [
      settings.ai.model || 'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ];

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: systemPrompt,
            temperature: settings.ai.temperature ?? 0.85,
            tools: toolsConfig.length > 0 ? toolsConfig : undefined,
          },
        });

        const responseText = response.text || '';
        
        // Extract search citations if grounded
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

        return {
          text: responseText,
          sources: sources.length > 0 ? sources : undefined,
        };
      } catch (error: any) {
        lastError = error;
        // Continue to fallback model if 503 or unavailable
        console.warn(`Model ${modelName} encountered: ${error.message || error}. Trying fallback...`);
      }
    }

    return {
      text: `Error connecting to Gemini API: ${lastError?.message || lastError}. Please try again in a moment.`,
    };
  }

  // Fallback for OpenAI / Anthropic / Custom if configured
  return {
    text: `Configured provider "${activeProvider}" handled by standard gateway. (Switch to Gemini in Settings for native real-time audio and search grounding).`,
  };
}

// Sandboxed code execution
export async function executeCodeInSandbox(code: string, language: 'javascript' | 'typescript' | 'python' = 'javascript'): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTimeMs: number;
}> {
  const startTime = Date.now();
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sandbox-'));

  try {
    let scriptPath: string;
    let command: string;
    let args: string[];

    if (language === 'python') {
      scriptPath = path.join(tmpDir, 'script.py');
      await fs.writeFile(scriptPath, code, 'utf-8');
      command = 'python3';
      args = [scriptPath];
    } else {
      // JavaScript / TypeScript
      scriptPath = path.join(tmpDir, 'script.mjs');
      // Wrap code with safe console logger if needed
      await fs.writeFile(scriptPath, code, 'utf-8');
      command = 'node';
      args = ['--max-old-space-size=128', scriptPath];
    }

    return await new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: tmpDir,
        timeout: 5000,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
        },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => {
        stdout += d.toString();
      });
      child.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      child.on('close', (code) => {
        const executionTimeMs = Date.now() - startTime;
        if (code === 0) {
          resolve({
            success: true,
            output: stdout || '(Code executed with no stdout output)',
            executionTimeMs,
          });
        } else {
          resolve({
            success: false,
            output: stdout,
            error: stderr || `Process exited with error code ${code}`,
            executionTimeMs,
          });
        }
      });

      child.on('error', (err) => {
        const executionTimeMs = Date.now() - startTime;
        resolve({
          success: false,
          output: '',
          error: `Execution error: ${err.message}`,
          executionTimeMs,
        });
      });
    });
  } catch (err: any) {
    return {
      success: false,
      output: '',
      error: `Sandbox setup failure: ${err.message}`,
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

// Gemini Unary TTS synthesis (Returns WAV RIFF 24kHz buffer)
export async function generateGeminiSpeech(text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<Buffer | null> {
  if (!hasGeminiKey()) return null;
  const ai = getGeminiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return Buffer.from(base64Audio, 'base64');
    }
  } catch (err) {
    console.error('Gemini TTS error:', err);
  }
  return null;
}

// ElevenLabs Voice Synthesis
export async function generateElevenLabsSpeech(options: {
  text: string;
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarity?: number;
  style?: number;
  speed?: number;
}): Promise<Buffer> {
  const settings = db.getSettings();
  const apiKey = options.apiKey || settings.voice.elevenlabs.apiKey || process.env.ELEVENLABS_API_KEY;
  const voiceId = options.voiceId || settings.voice.elevenlabs.voiceId || '21m00Tcm4TlvDq8ikWAM';
  const modelId = options.modelId || settings.voice.elevenlabs.modelId || 'eleven_multilingual_v2';

  if (!apiKey) {
    throw new Error('ElevenLabs API Key is required. Please set it in Settings → Voice → ElevenLabs.');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: options.text,
      model_id: modelId,
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarity ?? 0.75,
        style: options.style ?? 0.2,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API returned ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
