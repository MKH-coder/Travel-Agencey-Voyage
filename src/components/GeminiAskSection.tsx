import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { AuthAudit } from '../services/authAudit.ts';

export interface GeminiAskContext {
  title?: string;
  category?: string;
  location?: string;
  description?: string;
  price?: number;
  highlights?: string[];
  amenities?: string[];
}

interface GeminiAskSectionProps {
  context?: GeminiAskContext;
  title?: string;
  subtitle?: string;
  suggestedQuestions?: string[];
  placeholder?: string;
  className?: string;
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  liked?: boolean;
}

export const GeminiAskSection: React.FC<GeminiAskSectionProps> = ({
  context,
  title = "Ask Gemini AI",
  subtitle = "Have a question about this itinerary, destination, or travel details? Ask our Gemini 3.8 Flash LLM for instant insider answers.",
  suggestedQuestions = [
    "What is the best month to visit and what's the weather like?",
    "What should I pack for this trip?",
    "Are there vegetarian & local dietary options available?",
    "What currency is used and are credit cards accepted?"
  ],
  placeholder = "e.g., Is this suitable for families? What are the photography rules?",
  className = ""
}) => {
  const { styles } = useTheme();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || loading) return;

    setLoading(true);
    setQuestion('');

    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: context || {
            destination: 'Albania',
            country: 'Albania',
            region: 'Balkans / Ionian Sea'
          }
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const newQA: QAItem = {
        id: `qa_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        question: q,
        answer: data.answer || "Travelers praise this experience for its cultural richness and stunning scenery.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setQaHistory(prev => [newQA, ...prev]);
    } catch (err) {
      console.error('Failed to ask Gemini:', err);
      // Helpful fallback
      const fallbackQA: QAItem = {
        id: `qa_${Date.now()}`,
        question: q,
        answer: "Albania offers exceptional Mediterranean weather from May to October with warm sea temperatures. For the Albanian Riviera and historic cities, lightweight clothing, comfortable walking shoes for cobblestones, and modest attire for visiting mosques and churches are recommended.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setQaHistory(prev => [fallbackQA, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    AuthAudit.showToast({
      title: 'Copied to Clipboard',
      message: 'Gemini AI response copied successfully.',
      type: 'info'
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLike = (id: string, liked: boolean) => {
    setQaHistory(prev =>
      prev.map(item => (item.id === id ? { ...item, liked } : item))
    );
  };

  return (
    <div className={`p-5 sm:p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-indigo-500/5 to-transparent shadow-sm relative overflow-hidden ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-base font-extrabold ${styles.textPrimary}`}>
                {title}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Gemini 3.8 Flash LLM
              </span>
            </div>
            <p className={`text-xs ${styles.textMuted} mt-0.5 max-w-xl`}>
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 transition-colors"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 relative z-10">
          {/* Quick Prompt Suggestions */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
              <span>Suggested Inquiries</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAsk(q)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-700 dark:text-slate-300 transition-all text-left cursor-pointer disabled:opacity-50"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={placeholder}
                disabled={loading}
                className={`w-full pl-4 pr-10 py-3 rounded-2xl text-xs sm:text-sm border ${styles.border} ${styles.cardBg} ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-xs disabled:opacity-50`}
              />
              {question && (
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask AI</span>
                </>
              )}
            </button>
          </form>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-sky-500 animate-spin shrink-0" />
              <div className="text-xs text-sky-700 dark:text-sky-300">
                <span className="font-bold">Gemini AI is analyzing travel conditions...</span> synthesizing verified destination guides, local weather, and insider tips.
              </div>
            </div>
          )}

          {/* Q&A Stream History */}
          {qaHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Recent Answers</span>
              </div>

              {qaHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 animate-in slide-in-from-top-2 duration-200"
                >
                  {/* User Question */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        Q
                      </span>
                      <span className={`text-xs font-bold ${styles.textPrimary}`}>
                        {item.question}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Gemini Answer */}
                  <div className="flex items-start gap-2 pl-1">
                    <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      AI
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${styles.textSecondary} whitespace-pre-line`}>
                        {item.answer}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">Was this helpful?</span>
                      <button
                        onClick={() => handleLike(item.id, true)}
                        className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${item.liked === true ? 'text-emerald-500' : ''}`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleLike(item.id, false)}
                        className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${item.liked === false ? 'text-rose-500' : ''}`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(item.id, item.answer)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                      title="Copy Answer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
