import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  ExternalLink, 
  ArrowLeft, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  MessageSquare, 
  BookOpen, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  X,
  CreditCard,
  Plane,
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface FaqPageProps {
  onNavigateBack: () => void;
  onOpenCustomTrip?: () => void;
  onOpenAiConcierge?: () => void;
}

interface FaqItem {
  id: string;
  category: 'albania' | 'booking' | 'visa-flight' | 'customs' | 'safety';
  question: string;
  answer: string;
  tags: string[];
}

export const FaqPage: React.FC<FaqPageProps> = ({
  onNavigateBack,
  onOpenCustomTrip,
  onOpenAiConcierge,
}) => {
  const { styles } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const FAQ_PORTAL_URL = 'https://voyagefaq.netlify.app';

  // Comprehensive Knowledge Base Data mirrored from the official Voyage FAQ
  const masterFaqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'albania',
      question: 'What is the signature Albania 9-Day Grand Tour circuit and what is included?',
      answer: 'Our flagship 9-day circuit (9–19 Oct 2026) covers Tirana, Dajti Ekspres cable car, Berat UNESCO citadel & Onufri museum, Gjirokastër stone city, the turquoise Blue Eye spring, Ksamil 4-islands boat cruise, Butrint UNESCO archaeological site, Porto Palermo, Jalë Beach, Dhërmi Old Village, and the scenic Llogara Pass descent to Vlorë. All tiers include selected return international flights (TRV ⇄ TIA), accommodations, transfers, and guided site permits.',
      tags: ['albania', 'itinerary', 'grand tour', 'inclusions', 'ksamil', 'berat', 'dajti', '9-day']
    },
    {
      id: 'faq-2',
      category: 'albania',
      question: 'What are the 3 package tiers for the Albania 9-Day Expedition?',
      answer: 'We offer 3 hand-curated tiers: 1) Basic Tier ($1,330 / ₹1.11L–₹1.26L per person) featuring high-value private-room local boutique hotels and shared/self-guided logistics. 2) Mid-Range Classic ($1,720 / ₹1.43L–₹1.67L, Recommended) with 4-star boutique stays and dedicated private driver & AC vehicle throughout. 3) Luxury VIP ($4,630 / ₹4.24L–₹4.73L) featuring 5-star seaside suites, private yacht charters in Ksamil, fine dining allocations, and VIP concierge transfers.',
      tags: ['pricing', 'tiers', 'budget', 'mid-range', 'luxury', 'costs', 'rates']
    },
    {
      id: 'faq-3',
      category: 'booking',
      question: 'What currency is used in Albania and how should I pay?',
      answer: 'The official currency is the Albanian Lek (ALL). While Euros are accepted in major hotels and large souvenir shops, you will receive significantly better exchange rates and change in Lek. Albania is largely a cash-friendly economy; carrying cash is essential for taxis, family-run tavernas, and beach clubs. ATMs are plentiful in Tirana, Sarandë, and Vlorë.',
      tags: ['currency', 'money', 'all', 'euro', 'cash', 'atms', 'credit cards', 'payments']
    },
    {
      id: 'faq-4',
      category: 'visa-flight',
      question: 'What are the visa and passport entry requirements for Albania?',
      answer: 'Travelers must hold a passport valid for at least 3 months beyond their planned stay. Citizens of the EU, USA, UK, Canada, Australia, and holders of valid multiple-entry US, UK, or Schengen visas can enter Albania visa-free for up to 90 days. Other travelers can easily obtain an electronic visa (e-Visa) online prior to travel.',
      tags: ['visa', 'passport', 'schengen', 'entry', 'e-visa', 'immigration']
    },
    {
      id: 'faq-5',
      category: 'visa-flight',
      question: 'Which flights are booked for the Albania 9-Day Grand Tour?',
      answer: 'Our packages coordinate premium international flights connecting Trivandrum (TRV) to Tirana (TIA) via Muscat (MCT) and Milan (MXP) on the outbound journey, and returning TIA to TRV via Rome (FCO) and Doha (DOH). Flight timings, airline baggage allowances, and checked luggage coordination are handled end-to-end by Voyage.',
      tags: ['flights', 'airlines', 'trv', 'tia', 'baggage', 'transits', 'tickets']
    },
    {
      id: 'faq-6',
      category: 'booking',
      question: 'What is the booking and cancellation policy for Voyage packages?',
      answer: 'Bookings require an initial deposit upon confirmation. You may cancel or reschedule your reservation up to 14 days prior to departure for a full refund minus unrecoverable airline fare rules. Flexible date changes and credit vouchers are also offered. Details are transparently accessible on voyagefaq.netlify.app.',
      tags: ['cancellation', 'refund', 'booking', 'policy', 'rescheduling', 'deposit']
    },
    {
      id: 'faq-7',
      category: 'customs',
      question: 'What cultural customs and dress codes should tourists know?',
      answer: 'Hospitality (Besa) is deeply rooted in Albanian heritage—hosts treat travelers with heartfelt warmth. When visiting mosques or historic Orthodox monasteries, dress modestly by covering shoulders and knees; shoes must be removed before stepping inside mosques. Traditional head nods can occasionally mean "no" and head shakes "yes", though English-speaking tourist hubs follow standard gestures.',
      tags: ['culture', 'customs', 'dress code', 'besa', 'mosques', 'etiquette']
    },
    {
      id: 'faq-8',
      category: 'customs',
      question: 'What type of electrical plugs and voltages are used?',
      answer: 'Albania uses standard European Type C and Type F two-prong plugs with a 230V supply voltage and 50Hz frequency. If traveling from the UK, USA, or other non-European regions, a standard universal plug adapter is recommended.',
      tags: ['electricity', 'plugs', 'voltage', 'adapters', 'charging', 'type c']
    },
    {
      id: 'faq-9',
      category: 'safety',
      question: 'What emergency numbers should travelers have saved in Albania?',
      answer: '112 is the primary general European emergency helpline (operating 24/7). Direct local emergency lines: 129 for Police, 127 for Medical Emergency & Ambulance, and 128 for Fire Department. The 24/7 Voyage Concierge hotline (+91 9567465134) is also available for all traveling guests.',
      tags: ['emergency', 'safety', 'police', 'ambulance', 'phone numbers', '112']
    },
    {
      id: 'faq-10',
      category: 'safety',
      question: 'How does mobile data connectivity and Wi-Fi work in Albania?',
      answer: 'Because Albania is outside the EU roaming umbrella, standard EU roaming packages may incur high carrier fees. We recommend purchasing an eSIM (Airalo, Holafly, or Maya) prior to landing, or grabbing a local tourist SIM (Vodafone or ONE Albania) at Tirana airport. High-speed Wi-Fi is complimentary at almost all hotels, cafes, and beach venues.',
      tags: ['internet', 'sim card', 'esim', 'wifi', 'data', 'roaming', 'connectivity']
    },
    {
      id: 'faq-11',
      category: 'booking',
      question: 'Can I customize my trip or add private extensions (e.g., Theth Alps)?',
      answer: 'Yes! Through our Custom Trip Studio, you can modify days, add private yacht charters in Ksamil, upgrade to 5-star seaside villas, or append hiking extensions into Theth National Park and the Accursed Mountains. Our AI Concierge and human desk craft bespoke quotes within hours.',
      tags: ['custom trip', 'bespoke', 'theth', 'extensions', 'luxury', 'tailor made']
    },
    {
      id: 'faq-12',
      category: 'albania',
      question: 'When is the best season to explore Albania and the Ionian Riviera?',
      answer: 'May to October offers idyllic Mediterranean weather. June and September to mid-October provide pristine crystal-clear turquoise waters with comfortable 24°C–28°C temperatures, sunny skies, and lower crowd levels—making our early October Grand Tour dates the premier window.',
      tags: ['weather', 'best time', 'seasons', 'summer', 'autumn', 'october', 'beaches']
    }
  ];

  // Filter FAQs by search query and category
  const filteredFaqs = useMemo(() => {
    return masterFaqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inQuestion = faq.question.toLowerCase().includes(q);
      const inAnswer = faq.answer.toLowerCase().includes(q);
      const inTags = faq.tags.some(t => t.toLowerCase().includes(q));

      return inQuestion || inAnswer || inTags;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Topics', count: masterFaqs.length },
    { id: 'albania', label: 'Albania Grand Tour', count: masterFaqs.filter(f => f.category === 'albania').length },
    { id: 'booking', label: 'Bookings & Currency', count: masterFaqs.filter(f => f.category === 'booking').length },
    { id: 'visa-flight', label: 'Visas & Flights', count: masterFaqs.filter(f => f.category === 'visa-flight').length },
    { id: 'customs', label: 'Customs & Packing', count: masterFaqs.filter(f => f.category === 'customs').length },
    { id: 'safety', label: 'Safety & Connectivity', count: masterFaqs.filter(f => f.category === 'safety').length },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Eye-Catching Hero Section with Search Bar */}
      <div className={`p-6 sm:p-10 rounded-[2.5rem] border ${styles.border} ${styles.cardBg} shadow-xl relative overflow-hidden space-y-6`}>
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
        
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Official Knowledge Base</span>
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight flex items-center gap-3`}>
              <HelpCircle className="w-8 h-8 text-sky-500 shrink-0" />
              <span>Voyage FAQs & Help Center</span>
            </h1>

            <p className={`text-xs sm:text-sm ${styles.textSecondary} max-w-2xl leading-relaxed`}>
              Find fast, verified answers regarding travel logistics, flights, cancellation policies, and the Albania 9-Day Grand Tour. Directly connected with our official portal at{' '}
              <a
                href={FAQ_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sky-500 hover:underline inline-flex items-center gap-1"
              >
                voyagefaq.netlify.app <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={FAQ_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Open voyagefaq.netlify.app</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* HIGH-IMPACT KEYWORD SEARCH BAR */}
        <div className="pt-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-sky-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword (e.g. visa, currency, Albania 9-day, flights, cancellation, luggage)..."
              className={`w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl border-2 ${
                searchQuery ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20' : `${styles.border} focus:border-sky-500`
              } ${styles.inputBg} ${styles.textPrimary} text-sm sm:text-base outline-none transition-all placeholder:text-slate-400`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? `${styles.accent} text-white shadow-sm font-black`
                    : `bg-slate-100 dark:bg-slate-900 border ${styles.border} ${styles.textSecondary} hover:border-sky-500/40`
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS & ACCORDION FAQS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className={`text-base sm:text-lg font-bold ${styles.textPrimary}`}>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Frequently Asked Questions'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Topic' : 'Topics'}
            </span>
          </div>

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className={`p-10 rounded-3xl border ${styles.border} ${styles.cardBg} text-center space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${styles.textPrimary}`}>No matching questions found</h3>
              <p className={`text-xs ${styles.textMuted} max-w-md mx-auto`}>
                We couldn't find an exact FAQ matching "{searchQuery}". You can ask our Gemini AI Concierge directly or explore the live portal.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSearchQuery('')}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonSecondary}`}
              >
                Clear Search
              </button>
              <a
                href={FAQ_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Search voyagefaq.netlify.app</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`p-5 rounded-3xl border transition-all duration-200 ${
                    isExpanded 
                      ? `border-sky-500/50 ${styles.cardBg} shadow-md ring-1 ring-sky-500/20` 
                      : `${styles.border} ${styles.cardBg} hover:border-sky-500/30`
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full text-left flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-500">
                        {faq.category.toUpperCase().replace('-', ' & ')}
                      </span>
                      <h3 className={`text-sm sm:text-base font-bold ${styles.textPrimary} group-hover:text-sky-500 transition-colors`}>
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`p-1.5 rounded-xl border ${styles.border} shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180 bg-sky-500/10 text-sky-500' : 'text-slate-400'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="pt-3.5 mt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                      <p className={`text-xs sm:text-sm ${styles.textSecondary} leading-relaxed`}>
                        {faq.answer}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {faq.tags.slice(0, 4).map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery(tag);
                              }}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-sky-500 transition-colors cursor-pointer"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>

                        <a
                          href={FAQ_PORTAL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-sky-500 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Official Portal Dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Embedded FAQ Portal Preview Frame */}
      <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} shadow-lg overflow-hidden flex flex-col`}>
        <div className={`px-4 sm:px-6 py-3 border-b ${styles.border} bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
            </div>
            <div className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {FAQ_PORTAL_URL}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Refresh Frame"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reload</span>
            </button>
            <a
              href={FAQ_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-sky-500 hover:text-sky-400 flex items-center gap-1 hover:underline"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative w-full h-[650px] bg-slate-950 flex flex-col items-center justify-center">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900/60 backdrop-blur-xs z-10">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-bold text-slate-200">Loading Official Voyage FAQ Portal...</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Connecting to voyagefaq.netlify.app. You can also open the official page directly:
              </p>
              <a
                href={FAQ_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Launch voyagefaq.netlify.app</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={FAQ_PORTAL_URL}
            title="Voyage Official FAQ Portal"
            className="w-full h-full border-0 relative z-20"
            onLoad={() => setIframeLoaded(true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        </div>
      </div>

      {/* Helpful Support Footer Card */}
      <div className={`p-6 sm:p-8 rounded-[2rem] border ${styles.border} ${styles.cardBg} flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm`}>
        <div className="space-y-1 text-center sm:text-left">
          <h4 className={`text-base font-bold ${styles.textPrimary} flex items-center justify-center sm:justify-start gap-2`}>
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <span>Have a specific travel question not covered here?</span>
          </h4>
          <p className={`text-xs ${styles.textMuted}`}>
            Our Gemini AI Concierge and human desk are available 24/7 with immediate answers and bespoke advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={onNavigateBack}
            className={`px-4 py-2.5 rounded-xl border ${styles.border} text-xs font-bold ${styles.textPrimary} hover:opacity-80 transition-all cursor-pointer`}
          >
            Back to Explorer
          </button>
          <a
            href={FAQ_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>Visit voyagefaq.netlify.app</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
