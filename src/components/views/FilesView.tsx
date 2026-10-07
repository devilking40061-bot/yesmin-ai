import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import * as api from '../../services/api.ts';
import {
  FileText,
  UploadCloud,
  Image as ImageIcon,
  FileCode,
  Sparkles,
  Bot,
  Copy,
  Check,
  Trash2,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  previewText?: string;
  analysis?: string;
}

export const FilesView: React.FC = () => {
  const { assistantName, sendMessage, setActiveView, addToast } = useApp();

  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDoc | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('Analyze this file thoroughly, extract key data, structure, and provide insights.');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        const newDoc: UploadedDoc = {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          dataUrl: reader.result as string,
        };

        setDocs((prev) => [newDoc, ...prev]);
        if (!selectedDoc) setSelectedDoc(newDoc);
        addToast(`Uploaded ${file.name}`, 'success');
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        // Text / code / other
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAnalyzeSelected = async () => {
    if (!selectedDoc) return;
    setIsAnalyzing(true);

    try {
      if (selectedDoc.type.startsWith('image/')) {
        const res = await api.analyzeImageFile(selectedDoc.dataUrl, customPrompt, selectedDoc.type);
        setSelectedDoc((prev) => (prev ? { ...prev, analysis: res.analysis } : null));
        setDocs((prev) =>
          prev.map((d) => (d.id === selectedDoc.id ? { ...d, analysis: res.analysis } : d))
        );
        addToast('Multimodal image analysis completed!', 'success');
      } else {
        // Document / text analysis via chat endpoint
        const res = await api.sendChatMessage({
          message: `${customPrompt}\n\nDocument Name: ${selectedDoc.name}`,
          attachments: [{ name: selectedDoc.name, type: selectedDoc.type, dataUrl: selectedDoc.dataUrl }],
        });
        setSelectedDoc((prev) => (prev ? { ...prev, analysis: res.text } : null));
        setDocs((prev) =>
          prev.map((d) => (d.id === selectedDoc.id ? { ...d, analysis: res.text } : d))
        );
        addToast('Document analyzed!', 'success');
      }
    } catch (err: any) {
      addToast(`Analysis error: ${err.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendToChat = () => {
    if (!selectedDoc) return;
    sendMessage(
      `Let's analyze this document in detail: "${selectedDoc.name}". ${selectedDoc.analysis ? `Here is what was found:\n${selectedDoc.analysis}` : ''}`,
      [{ name: selectedDoc.name, type: selectedDoc.type, dataUrl: selectedDoc.dataUrl }]
    );
    setActiveView('chat');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full pb-24 md:pb-12">
      {/* Header & Upload Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Files & Multimodal Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep OCR, code screenshot inspection, document summaries & insights
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-white text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Uploads List & Viewer / Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document List */}
        <div className="glass-panel rounded-2xl p-4 border border-purple-500/20 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Uploaded Files ({docs.length})
          </span>

          {docs.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-2xl text-center cursor-pointer space-y-2 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">Click to upload images, PDFs or code files</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {docs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoc(d)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedDoc?.id === d.id
                      ? 'bg-purple-600/20 border-purple-500/50 text-white'
                      : 'glass-card border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {d.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate">{d.name}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocs((prev) => prev.filter((item) => item.id !== d.id));
                      if (selectedDoc?.id === d.id) setSelectedDoc(null);
                    }}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Preview & AI Analysis */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-purple-500/20 space-y-4">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedDoc.name}</h3>
                  <span className="text-[11px] text-slate-400">{(selectedDoc.size / 1024).toFixed(1)} KB • {selectedDoc.type}</span>
                </div>

                <button
                  onClick={handleSendToChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-purple-200 hover:text-white text-xs font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss in Chat</span>
                </button>
              </div>

              {/* Preview image if image */}
              {selectedDoc.type.startsWith('image/') && (
                <div className="max-h-60 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-2">
                  <img src={selectedDoc.dataUrl} alt={selectedDoc.name} className="max-h-56 object-contain rounded" />
                </div>
              )}

              {/* Action input prompt */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Prompt / Task for {assistantName}:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAnalyzeSelected}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-pink-500/20 flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                  </button>
                </div>
              </div>

              {/* Analysis Result */}
              {selectedDoc.analysis ? (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                  <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Insights & Extraction:</span>
                  </span>
                  <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                    {selectedDoc.analysis}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-white/5 text-center text-xs text-slate-400">
                  Click "Analyze" to extract information, explain code screenshots, or summarize.
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 opacity-40" />
              <p className="text-xs">Select a file on the left or upload a new document to analyze.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
