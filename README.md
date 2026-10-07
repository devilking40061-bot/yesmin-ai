# YESMIN AI — Companion & Personal Jarvis Assistant

A production-ready, full-stack AI Companion & Personal Jarvis Assistant with customizable name, bidirectional Gemini Live voice, autonomous multi-file coding agent, grounded web search, and persistent memory.

---

## 🌟 Key Features

1. **Custom Assistant Name & Dynamic Persona**:
   - Default name: **YESMIN AI**
   - User can customize assistant name (e.g. to *Muskan*, *Ayesha*, *Jarvis*) in **Settings → Profile & Assistant → Assistant Name**
   - Updates live across Home, Chat header, Greetings, Voice responses, Live Voice Mode, Notifications, Profile, and Settings
   - Persists automatically to local storage and database across page refreshes and browser restarts
   - Modes: *Girlfriend / Companion*, *Friendly Assistant*, *Professional Jarvis*, *Coding Architect*, *Study Mentor*
   - Supported languages: **Hinglish**, **Hindi**, and **English**

2. **Gemini Live Realtime Voice Mode**:
   - Bidirectional live audio with animated cybernetic Orb
   - Interruption handling: stops speaking immediately when the user interrupts
   - Real audio waveform analysis and PCM audio streaming

3. **Autonomous AI Coding Agent**:
   - Multi-file code editor with project file explorer
   - Interactive sandboxed code execution (Node.js & Python)
   - Multi-step Planner → File Generation → Self-repair loop
   - ZIP bundle export

4. **Apps & Actions Hub**:
   - Direct launchers for YouTube, Gmail, Google, Maps, WhatsApp, Telegram, Instagram, Chrome, Calculator, Calendar, and Camera
   - Extensible Android WebView/Companion Bridge architecture
   - Security confirmation modal for sensitive operations

5. **Verified Web Search Grounding**:
   - Google Search tool grounding with direct source URLs and citations
   - Follow-up Q&A directly in chat

6. **Persistent Memory Bank**:
   - User-controlled long-term memory for preferences, personal facts, and instructions
   - Injected naturally into AI conversation prompts

7. **Voice Synthesis**:
   - ElevenLabs neural TTS integration with custom voice ID and stability tuning
   - Gemini Voice (`gemini-3.8-flash-lite-tts`) unary WAV generation
   - Browser Web Speech API local fallback

8. **API & Services Hub**:
   - Dedicated management cards for all 14 integrations (Gemini, OpenAI, Anthropic, ElevenLabs, Speech-to-Text, Web Search, Image Gen, Firebase, Coding Sandbox, etc.)

---

## 🚀 Requirements

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **bun**
- **Modern Browser**: Chrome, Edge, Safari, or Firefox with Web Audio API & Web Speech API support

---

## 📦 Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd yesmin-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your API keys:
   ```env
   # GEMINI_API_KEY: Required for Gemini AI and Live Voice
   GEMINI_API_KEY="your-gemini-api-key"

   # PORT: Server port (defaults to 3000)
   PORT=3000

   # Optional ElevenLabs Voice
   ELEVENLABS_API_KEY="your-elevenlabs-api-key"

   # Optional Firebase or 3P Keys
   OPENAI_API_KEY=""
   ANTHROPIC_API_KEY=""
   ```

---

## 🎙️ Gemini & Live Voice Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY` in `.env`.
3. In the app, navigate to **Settings → AI & Intelligence** to select your desired model (`gemini-3.8-flash` recommended).
4. For Live Voice, navigate to **Live Voice** in the sidebar or mobile nav, allow microphone permissions, and tap **Start Call**.

---

## 🔊 ElevenLabs Setup

1. Sign up at [ElevenLabs](https://elevenlabs.io/) and get an API key.
2. In the app, go to **Settings → Voice & ElevenLabs**:
   - Enter your **ElevenLabs API Key**
   - Provide your preferred **Voice ID** (default: `21m00Tcm4TlvDq8ikWAM` Rachel)
   - Click **Test ElevenLabs Voice** to verify audio playback
   - Set **Primary Voice Provider** to **ElevenLabs**

---

## 💻 Development & Production Build

### Development Mode
Runs the full-stack server with Vite middleware on port 3000:
```bash
npm run dev
```

### Production Build
Builds the client bundle and starts the production server:
```bash
npm run build
npm start
```

---

## 📱 Android WebView Bridge Architecture

When wrapping this web app in an Android WebView / Companion application, native device actions (e.g. launching native intents, contacts, or camera) communicate through:
```
Web App (window.AndroidBridge.postMessage)
  ↓
Android WebView Interface
  ↓
Android Action Manager
  ↓
Native Android Intent
```

---

## 🛠️ Troubleshooting

- **Microphone not working**:
  Ensure microphone permissions are granted in the browser. On Chrome: Settings → Privacy & Security → Site Settings → Microphone.
- **Gemini Key missing**:
  Ensure `GEMINI_API_KEY` is present in your environment or configured in AI Studio Secrets.
- **Voice not speaking**:
  Check if **Auto-speak** is toggled on in Settings or click the audio icon next to any message.

---

## 📄 License & Safety
YESMIN AI is an artificial intelligence assistant and personal companion. It is not a biological human. Created for helpful, loving, and productive everyday AI companionship.
