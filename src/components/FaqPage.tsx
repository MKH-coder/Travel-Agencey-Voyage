import React, { useState } from 'react';
import { HelpCircle, ExternalLink, ArrowLeft, Globe, ShieldCheck, Sparkles, Compass, MessageSquare, BookOpen, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface FaqPageProps {
  onNavigateBack: () => void;
  onOpenCustomTrip?: () => void;
  onOpenAiConcierge?: () => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({
  onNavigateBack,
  onOpenCustomTrip,
  onOpenAiConcierge,
}) => {
  const { styles } = useTheme();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const FAQ_URL = 'https://voyagefaq.netlify.app';

  const quickTopics = [
    {
      title: 'Booking & Cancellations',
      desc: 'Reservation procedures, payment timelines, and flexible cancellation rules.',
      icon: <BookOpen className="w-4 h-4 text-sky-500" />
    },
    {
      title: 'Albania 9-Day Grand Tour',
      desc: 'Complete overview of Basic, Mid-Range, and Luxury tiers with included logistics.',
      icon: <Compass className="w-4 h-4 text-amber-500" />
    },
    {
      title: 'Visa & Entry Requirements',
      desc: 'Guidelines for international travelers, passports, and entry permits.',
      icon: <Globe className="w-4 h-4 text-emerald-500" />
    },
    {
      title: 'Bespoke Custom Trips',
      desc: 'How our concierge crafts personalized itineraries with verified local guides.',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Action Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm relative overflow-hidden space-y-6`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Explorer</span>
              </button>
              <span className={`text-xs ${styles.textMuted}`}>•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Official Knowledge Base
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black ${styles.textPrimary} tracking-tight flex items-center gap-3`}>
              <HelpCircle className="w-7 h-7 text-sky-500 shrink-0" />
              <span>Frequently Asked Questions</span>
            </h1>

            <p className={`text-xs sm:text-sm ${styles.textSecondary} max-w-2xl leading-relaxed`}>
              Explore our official, comprehensively curated traveler FAQ portal hosted at{' '}
              <a
                href={FAQ_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-500 hover:underline inline-flex items-center gap-1"
              >
                voyagefaq.netlify.app <ExternalLink className="w-3 h-3" />
              </a>
              . Find answers regarding itineraries, accommodations, flights, customs, and payment plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className={`p-2.5 rounded-2xl border ${styles.border} ${styles.cardBg} ${styles.textSecondary} hover:${styles.textPrimary} transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer`}
              title="Reload FAQ Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <a
              href={FAQ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Topic Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800">
          {quickTopics.map((topic, i) => (
            <a
              key={i}
              href={FAQ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3.5 rounded-2xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/50 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all text-left space-y-1 group cursor-pointer block`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {topic.icon}
                  <span className={`text-xs font-bold ${styles.textPrimary}`}>{topic.title}</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className={`text-[11px] ${styles.textMuted} leading-normal`}>{topic.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Embedded Official FAQ Portal Frame */}
      <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} shadow-lg overflow-hidden flex flex-col`}>
        <div className={`px-4 sm:px-6 py-3 border-b ${styles.border} bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
            </div>
            <div className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
              https://voyagefaq.netlify.app
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Official Sub-Page</span>
            </span>
            <a
              href={FAQ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-sky-500 hover:text-sky-400 flex items-center gap-1 hover:underline"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* The Frame Container */}
        <div className="relative w-full h-[750px] bg-slate-950 flex flex-col items-center justify-center">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900/60 backdrop-blur-xs z-10">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-bold text-slate-200">Connecting to Voyage Official FAQ Portal...</div>
              <p className="text-xs text-slate-400 max-w-sm">
                If the preview takes more than a moment, you can also launch the portal directly:
              </p>
              <a
                href={FAQ_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all"
              >
                <span>Launch voyagefaq.netlify.app</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={FAQ_URL}
            title="Voyage Official FAQ Portal"
            className="w-full h-full border-0 relative z-20"
            onLoad={() => setIframeLoaded(true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        </div>
      </div>

      {/* Helpful Support Footer Card */}
      <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left`}>
        <div className="space-y-1">
          <h4 className={`text-sm font-bold ${styles.textPrimary} flex items-center justify-center sm:justify-start gap-2`}>
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <span>Need personalized travel recommendations?</span>
          </h4>
          <p className={`text-xs ${styles.textMuted}`}>
            Our 24/7 concierge desk and Gemini Travel AI are standing by to answer your specific trip inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateBack}
            className={`px-4 py-2 rounded-xl border ${styles.border} text-xs font-bold ${styles.textPrimary} hover:opacity-80 transition-all cursor-pointer`}
          >
            Back to Stays
          </button>
          <a
            href={FAQ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Visit voyagefaq.netlify.app</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
