import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Orb } from '../Orb.tsx';
import {
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Globe,
  Settings as SettingsIcon,
  MessageSquare,
} from 'lucide-react';

export const LiveVoiceView: React.FC = () => {
  const {
    assistantName,
    userNickname,
    settings,
    setActiveView,
    addToast,
    sendMessage,
    speakText,
    stopSpeaking,
    isSpeaking,
  } = useApp();

  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<{ user: string; assistant: string }>({
    user: '',
    assistant: '',
  });
  const [callDuration, setCallDuration] = useState(0);
  const [liveLanguage, setLiveLanguage] = useState<'hinglish' | 'hindi' | 'english'>(
    settings.profile.language || 'hinglish'
  );

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioInputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const timerRef = useRef<any>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Web Speech Fallback listener
  const speechRecognitionRef = useRef<any>(null);

  // Timer for active call duration
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Waveform visualization canvas
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let waveTick = 0;

    const draw = () => {
      waveTick += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let dataArray = new Uint8Array(64);
      if (analyserRef.current && callState === 'connected') {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        for (let i = 0; i < 64; i++) {
          dataArray[i] = Math.sin(i * 0.2 + waveTick) * 30 + 35;
        }
      }

      const barWidth = (width / 64) * 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

        const grad = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.fillRect(x, height / 2 - barHeight / 2, barWidth - 2, barHeight);

        x += barWidth;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [callState]);

  // Convert raw Float32 mic array to base64 PCM 16kHz
  function pcmToBase64(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Play incoming raw 24kHz PCM chunks
  function playPCMChunk(base64Data: string) {
    try {
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (err) {
      console.error('Error playing raw PCM chunk:', err);
    }
  }

  const startLiveCall = async () => {
    setCallState('connecting');
    setErrorMessage(null);

    try {
      // 1. Microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Setup audio analyzer
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioInputContextRef.current = inputCtx;
      const source = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);

      // 2. Establish WebSocket to backend /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[Live Client] WebSocket connected');
        setCallState('connected');
        addToast(`Connected to ${assistantName} Live Voice!`, 'success');

        // Setup microphone processor
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMuted || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const base64Pcm = pcmToBase64(inputData);
          ws.send(JSON.stringify({ type: 'audio', audio: base64Pcm }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            playPCMChunk(data.audio);
          } else if (data.type === 'transcript') {
            if (data.role === 'assistant') {
              setCurrentTranscript((prev) => ({ ...prev, assistant: data.text }));
            } else {
              setCurrentTranscript((prev) => ({ ...prev, user: data.text }));
            }
          } else if (data.type === 'interrupted') {
            // Stop any playing audio immediately
            if (audioContextRef.current) {
              audioContextRef.current.close().then(() => {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
              });
            }
            stopSpeaking();
          } else if (data.type === 'error') {
            setErrorMessage(data.message);
            setCallState('error');
            addToast(data.message, 'error');
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[Live Client] WS Error:', err);
        // Start intelligent conversational voice fallback using Web Speech + Gemini API
        startFallbackVoiceLoop(stream);
      };

      ws.onclose = () => {
        if (callState === 'connected') {
          endLiveCall();
        }
      };
    } catch (err: any) {
      console.error('Microphone or Live session error:', err);
      setErrorMessage(err.message || 'Microphone permission denied or connection failed.');
      setCallState('error');
      addToast(err.message || 'Could not access microphone', 'error');
    }
  };

  // Fallback Voice Loop (Web Speech recognition + Gemini fast conversational response + TTS)
  const startFallbackVoiceLoop = (stream: MediaStream) => {
    setCallState('connected');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = liveLanguage === 'hindi' ? 'hi-IN' : 'en-US';

      recognition.onresult = async (event: any) => {
        let finalPhrase = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalPhrase = event.results[i][0].transcript;
          }
        }

        if (finalPhrase.trim()) {
          setCurrentTranscript((prev) => ({ ...prev, user: finalPhrase }));
          // Interruption: stop assistant voice
          stopSpeaking();

          // Get fast response
          try {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: finalPhrase,
                language: liveLanguage,
              }),
            });
            const data = await res.json();
            if (data.text) {
              setCurrentTranscript((prev) => ({ ...prev, assistant: data.text }));
              await speakText(data.text);
            }
          } catch (e) {
            console.error('Fallback voice error:', e);
          }
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    }
  };

  const endLiveCall = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioInputContextRef.current) {
      audioInputContextRef.current.close();
      audioInputContextRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    stopSpeaking();
    setCallState('idle');
    addToast('Call ended.', 'info');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto w-full min-h-[calc(100vh-65px)]">
      {/* Top Cockpit Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-purple-500/20 glass-panel px-5 py-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className={`w-3.5 h-3.5 rounded-full block ${
                callState === 'connected'
                  ? 'bg-emerald-400 animate-ping'
                  : callState === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{assistantName} Live Voice</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                REALTIME
              </span>
            </h2>
            <div className="text-xs text-slate-400">
              {callState === 'connected'
                ? `Active Call • ${formatDuration(callDuration)}`
                : callState === 'connecting'
                ? 'Connecting to Gemini Live...'
                : 'Ready to connect'}
            </div>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setLiveLanguage('hinglish')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                liveLanguage === 'hinglish'
                  ? 'bg-pink-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
            <button
              onClick={() => setLiveLanguage('hindi')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                liveLanguage === 'hindi'
                  ? 'bg-pink-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hindi
            </button>
            <button
              onClick={() => setLiveLanguage('english')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                liveLanguage === 'english'
                  ? 'bg-pink-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Main Center Area: Large Orb & Waveform */}
      <div className="my-auto flex flex-col items-center justify-center space-y-6 w-full py-6">
        <div className="relative">
          <Orb
            status={
              callState === 'connected'
                ? isSpeaking
                  ? 'speaking'
                  : 'listening'
                : callState === 'connecting'
                ? 'thinking'
                : 'online'
            }
            size="xl"
            interactive
            onClick={callState === 'idle' ? startLiveCall : undefined}
          />
        </div>

        {/* Dynamic Status Indicator */}
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {callState === 'connected'
              ? isSpeaking
                ? `${assistantName} is speaking...`
                : `${assistantName} is listening to you...`
              : callState === 'connecting'
              ? 'Establishing secure audio stream...'
              : `Tap to speak with ${assistantName}`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            {callState === 'connected'
              ? 'Real-time bidirectional conversation. Interrupt anytime — the assistant stops speaking when you speak.'
              : `Natural voice interaction in ${liveLanguage.toUpperCase()}. Zero fake audio.`}
          </p>
        </div>

        {/* Live Audio Waveform Canvas */}
        <div className="w-full max-w-md h-16 glass-card rounded-2xl p-2 flex items-center justify-center border border-purple-500/20 overflow-hidden">
          <canvas ref={waveformCanvasRef} width={400} height={60} className="w-full h-full" />
        </div>

        {/* Real-time speech transcript preview */}
        {(currentTranscript.user || currentTranscript.assistant) && (
          <div className="w-full max-w-lg glass-panel rounded-2xl p-4 border border-purple-500/20 space-y-2 text-xs">
            {currentTranscript.user && (
              <div className="text-slate-300">
                <span className="font-bold text-pink-400">{userNickname}:</span> {currentTranscript.user}
              </div>
            )}
            {currentTranscript.assistant && (
              <div className="text-purple-200">
                <span className="font-bold text-cyan-400">{assistantName}:</span>{' '}
                {currentTranscript.assistant}
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-200 text-center max-w-md">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-4 border border-purple-500/30 flex items-center justify-around shadow-2xl shadow-purple-950/50 mb-6">
        {callState !== 'connected' ? (
          <button
            onClick={startLiveCall}
            disabled={callState === 'connecting'}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 font-extrabold text-white text-base shadow-lg shadow-pink-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Radio className="w-5 h-5 animate-pulse" />
            <span>{callState === 'connecting' ? 'Connecting...' : `Start Call with ${assistantName}`}</span>
          </button>
        ) : (
          <>
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl border transition-all ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'glass-card border-white/10 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call button */}
            <button
              onClick={endLiveCall}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>

            {/* Switch to Chat */}
            <button
              onClick={() => setActiveView('chat')}
              className="p-4 rounded-2xl glass-card border-white/10 text-slate-300 hover:text-white transition-all"
              title="Open text chat"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
