import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  Bot,
  User,
  X,
  ChevronDown,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    assistantName,
    userNickname,
    currentConversation,
    conversations,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
    assistantStatus,
    speakText,
    isSpeaking,
    stopSpeaking,
    addToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [enableSearch, setEnableSearch] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string; dataUrl?: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, assistantStatus]);

  // Handle Web Speech API for microphone input
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast('Microphone transcription is not supported in this browser.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Supports Hindi / Hinglish / English
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        addToast(`Mic error: ${event.error}`, 'error');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      addToast(`Could not start microphone: ${err.message}`, 'error');
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'text/plain',
            dataUrl: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const currentText = input;
    const currentAtts = [...attachments];

    setInput('');
    setAttachments([]);

    await sendMessage(currentText, currentAtts, enableSearch);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Copied to clipboard', 'info');
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* History Sidebar */}
      <div
        className={`${
          showHistorySidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static z-30 inset-y-0 left-0 w-72 glass-panel border-r border-purple-500/20 flex flex-col transition-transform duration-300 lg:transition-none bg-[#070a1e] lg:bg-transparent`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              createNewConversation();
              setShowHistorySidebar(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-pink-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setShowHistorySidebar(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Chats */}
        <div className="p-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredConversations.map((conv) => {
            const isActive = currentConversation?.id === conv.id;
            return (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => {
                  setCurrentConversationId(conv.id);
                  setShowHistorySidebar(false);
                }}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-xs font-semibold truncate">{conv.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050713]">
        {/* Chat Top Bar */}
        <div className="p-3 sm:px-6 border-b border-purple-500/20 glass-panel flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistorySidebar(true)}
              className="lg:hidden p-2 rounded-xl glass-card text-purple-300 hover:text-white"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  Chatting with <strong className="text-pink-300">{assistantName}</strong>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {currentConversation?.title || 'Active Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Grounded Web Search toggle */}
            <button
              onClick={() => setEnableSearch(!enableSearch)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                enableSearch
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'glass-card border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Google Search Grounding for live web sources"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web Grounding</span>
            </button>

            <button
              onClick={() => createNewConversation()}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl glass-card border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {(!currentConversation || currentConversation.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Start talking to <span className="text-pink-300">{assistantName}</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Ask anything, chat intimately, brainstorm code, or request tool actions.
              </p>
            </div>
          )}

          {currentConversation?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isEditing = editingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                  <div
                    className={`p-4 rounded-2xl backdrop-blur-md shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white rounded-tr-none'
                        : 'glass-panel border-purple-500/20 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {/* Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="p-1 rounded-lg bg-black/40 border border-white/10 max-w-xs"
                          >
                            {att.type.startsWith('image/') && att.dataUrl ? (
                              <img
                                src={att.dataUrl}
                                alt={att.name}
                                className="max-h-48 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 text-xs text-slate-300">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[140px]">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content or Edit Box */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 rounded-lg bg-black/40 text-xs text-white border border-white/20 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              editMessage(msg.id, editText);
                              setEditingId(null);
                            }}
                            className="px-3 py-1 bg-pink-500 rounded-lg text-xs font-semibold text-white"
                          >
                            Save & Resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>
                    )}

                    {/* Search Grounding Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                        <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />
                          <span>Verified Sources:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 border border-white/10 transition-colors"
                            >
                              <span className="truncate max-w-[160px]">{s.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Action Toolbar */}
                  <div
                    className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-white p-1"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {!isUser && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="hover:text-pink-300 p-1"
                        title="Speak this response"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}

                    {isUser && (
                      <button
                        onClick={() => {
                          setEditingId(msg.id);
                          setEditText(msg.content);
                        }}
                        className="hover:text-white p-1"
                        title="Edit message"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}

                    {!isUser && (
                      <button
                        onClick={() => regenerateMessage(msg.id)}
                        className="hover:text-purple-300 p-1"
                        title="Regenerate response"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="hover:text-red-400 p-1"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-900 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-purple-200" />
                  </div>
                )}
              </div>
            );
          })}

          {assistantStatus === 'thinking' && (
            <div className="flex gap-3 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                <span>{assistantName} is thinking & composing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 glass-panel border-t border-purple-500/20 shrink-0">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-white/10">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200"
                >
                  <Paperclip className="w-3.5 h-3.5 text-pink-400" />
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl glass-card border-white/10 text-slate-300 hover:text-white hover:border-pink-500/40 transition-all shrink-0"
              title="Attach images, documents or code"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Microphone button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isRecording
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                  : 'glass-card border-white/10 text-slate-300 hover:text-white hover:border-purple-500/40'
              }`}
              title={isRecording ? 'Listening... Click to stop' : 'Speak via microphone'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${assistantName}... (Shift+Enter for newline)`}
                rows={1}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-400 focus:outline-none resize-none max-h-32"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() && attachments.length === 0}
              className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-pink-500/25 transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
