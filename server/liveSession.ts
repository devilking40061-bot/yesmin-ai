import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getGeminiClient, hasGeminiKey } from './geminiClient.ts';
import { buildSystemPrompt } from './aiService.ts';
import { db } from './storage.ts';
import { Modality, LiveServerMessage } from '@google/genai';

export function setupLiveVoiceWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/live' || pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live] Client connected to live voice socket');

    if (!hasGeminiKey()) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: 'GEMINI_API_KEY is not configured on the server. Live voice requires a valid Gemini API key.',
        })
      );
      clientWs.close();
      return;
    }

    const settings = db.getSettings();
    const systemPrompt = buildSystemPrompt({
      assistantName: settings.profile.assistantName,
      nickname: settings.profile.nickname,
      personality: settings.profile.personality,
      language: settings.profile.language,
    });

    let liveSession: any = null;

    try {
      const ai = getGeminiClient();

      liveSession = await ai.live.connect({
        model: settings.liveVoice.model || 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: (settings.liveVoice.voice as any) || 'Kore',
              },
            },
          },
          systemInstruction: systemPrompt + '\nKeep your voice responses concise, conversational, and express warm affection or clarity naturally.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'audio',
                        audio: part.inlineData.data,
                      })
                    );
                  }
                  if (part.text) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'transcript',
                        role: 'assistant',
                        text: part.text,
                      })
                    );
                  }
                }
              }

              if (message.serverContent?.interrupted) {
                clientWs.send(
                  JSON.stringify({
                    type: 'interrupted',
                    interrupted: true,
                  })
                );
              }
            } catch (err: any) {
              console.error('[Live] Error forwarding server message:', err);
            }
          },
          onerror: (err: any) => {
            console.error('[Live] Gemini session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: `Gemini Live connection issue: ${err.message || err}`,
                })
              );
            }
          },
          onclose: () => {
            console.log('[Live] Gemini session closed');
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'closed' }));
            }
          },
        },
      });

      clientWs.send(
        JSON.stringify({
          type: 'ready',
          message: 'Connected to Gemini Live session. Speak now!',
        })
      );
    } catch (err: any) {
      console.error('[Live] Failed to initialize Gemini Live session:', err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: `Could not connect to Gemini Live: ${err.message || err}`,
        })
      );
    }

    clientWs.on('message', (data: Buffer | string) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === 'audio' && payload.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.type === 'text' && payload.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err: any) {
        console.error('[Live] Message parsing error:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live] Client disconnected');
      try {
        if (liveSession && typeof liveSession.close === 'function') {
          liveSession.close();
        }
      } catch {}
    });
  });
}
