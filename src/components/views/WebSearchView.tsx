import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import * as api from '../../services/api.ts';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  Clock,
  MessageSquare,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const WebSearchView: React.FC = () => {
  const { assistantName, activeSearchQuery, setActiveSearchQuery, sendMessage, setActiveView, addToast } = useApp();

  const [query, setQuery] = useState(activeSearchQuery || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    answer: string;
    sources: { title: string; uri: string }[];
    query: string;
  } | null>(null);

  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Latest updates on AI agents and Gemini 3',
    'Best practices for React 19 full-stack architecture',
  ]);

  useEffect(() => {
    if (activeSearchQuery && activeSearchQuery !== query) {
      setQuery(activeSearchQuery);
      executeSearch(activeSearchQuery);
    }
  }, [activeSearchQuery]);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSearchResult(null);

    try {
      const data = await api.performWebSearch(searchTerm);
      setSearchResult(data);
      if (!searchHistory.includes(searchTerm)) {
        setSearchHistory((prev) => [searchTerm, ...prev.slice(0, 8)]);
      }
      addToast('Search completed with live sources!', 'success');
    } catch (err: any) {
      addToast(`Search error: ${err.message}`, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAskFollowUp = () => {
    if (!searchResult) return;
    sendMessage(
      `Based on the search results for "${searchResult.query}", can you explain the key takeaways in depth?`
    );
    setActiveView('chat');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full pb-24 md:pb-12">
      {/* Top Search Bar */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <span>Verified Web Search Grounding</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time web intelligence grounded with verified sources & direct citations
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex gap-2"
        >
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web for news, docs, tools, facts..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        {/* Quick History Pills */}
        {searchHistory.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Recent:
            </span>
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item);
                  executeSearch(item);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition-colors truncate max-w-xs"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Container */}
      {searchResult && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Synthesized Answer
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">"{searchResult.query}"</h2>
            </div>
            <button
              onClick={handleAskFollowUp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask {assistantName} in Chat</span>
            </button>
          </div>

          <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
            {searchResult.answer}
          </div>

          {/* Sources Section */}
          {searchResult.sources && searchResult.sources.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Source Links ({searchResult.sources.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResult.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-card border border-white/10 hover:border-cyan-500/40 text-left transition-all hover:bg-white/5 flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                        {src.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{src.uri}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
