import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck, Globe, CreditCard, Gamepad2, Gift } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface FaqItem {
  question: string;
  answer: string;
  category: 'booking' | 'pricing' | 'games' | 'security';
}

export const FAQSection: React.FC = () => {
  const { styles } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'booking' | 'pricing' | 'games' | 'security'>('all');

  const faqs: FaqItem[] = [
    {
      category: 'booking',
      question: 'How do I book a bespoke tour or European expedition?',
      answer: 'You can browse our curated catalog of destinations (such as Albania, Greece, Italy, and the Balkans), select any listing to view detailed itineraries, and click "Book Now" or "Customize Trip". Our expert travel concierges will coordinate your dates, accommodations, and private transfers.'
    },
    {
      category: 'booking',
      question: 'Can I customize my itinerary or request private group tours?',
      answer: 'Yes! Click on "Custom Trip Builder" in the header or any destination page to specify your preferred activities, dates, accommodation tiers (Basic, Midrange, Luxury), and guest counts. Our team will generate a fully tailored proposal within 24 hours.'
    },
    {
      category: 'pricing',
      question: 'How does multi-currency support work?',
      answer: 'Our platform supports real-time currency conversion across USD ($), EUR (€), GBP (£), INR (₹), and JPY (¥). You can select your preferred currency instantly from the top header currency switcher, and all catalog prices, custom trip estimates, and invoices will automatically update.'
    },
    {
      category: 'pricing',
      question: 'How do I use promo codes won from expedition games?',
      answer: 'By playing our interactive Voyage Globetrotter games (Sky Expedition, Coastal Rally, Geo Detective, and Alpine Climber) and clearing different difficulty levels (Level 1, Level 2, Level 3), you unlock exclusive promo codes (such as SKY10, RALLY20, ALPINE30). Copy the code and apply it during checkout or custom trip booking for instant discounts up to 30%!'
    },
    {
      category: 'games',
      question: 'What are the rules and rewards of the Voyage Globetrotter games?',
      answer: 'Voyage Globetrotter features 4 engaging mini-games: Sky Expedition flight arcade, Balkan Coastal Rally driving challenge, Geo Detective map mystery quiz, and Alpine Peak Climber puzzle challenge. Each game has 3 progressive levels. Clearing each level rewards you with score points, passport stamps, and unique discount promo codes.'
    },
    {
      category: 'security',
      question: 'Are my payment details and personal data secure?',
      answer: 'Absolutely. All transactions use bank-grade SSL encryption and adhere to strict international data protection standards. We never store raw credit card credentials on our client servers, and you can review our security adoption metrics in the admin portal.'
    },
    {
      category: 'booking',
      question: 'What is the cancellation and refund policy?',
      answer: 'Most standard packages offer free cancellation up to 14 days before departure. Bespoke and luxury expeditions have custom terms outlined during the itinerary confirmation phase. Travel insurance protection options can also be added at checkout.'
    },
    {
      category: 'pricing',
      question: 'Are taxes and tourist fees included in the listed price?',
      answer: 'All local VAT, municipal lodging taxes, and standard guide services listed in the itinerary breakdown are fully inclusive unless specified otherwise as optional excursions.'
    }
  ];

  const filteredFaqs = activeTab === 'all' ? faqs : faqs.filter(f => f.category === activeTab);

  return (
    <section id="faq-section" className={`py-20 border-t ${styles.border} ${styles.cardBg} transition-colors duration-300 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-500 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight mb-4`}>
            Frequently Asked Questions
          </h2>
          <p className={`text-sm sm:text-base ${styles.textMuted} leading-relaxed`}>
            Find clear answers about our bespoke travel bookings, multi-currency pricing, game promo codes, and expedition safety.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'booking', label: 'Bookings & Tours' },
            { id: 'pricing', label: 'Pricing & Currency' },
            { id: 'games', label: 'Games & Promo Codes' },
            { id: 'security', label: 'Trust & Safety' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-sky-500/50 bg-slate-900/40 shadow-lg shadow-sky-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className={`text-sm sm:text-base font-bold ${styles.textPrimary}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 border-t border-slate-200/50 dark:border-slate-800/50 animate-in fade-in duration-200">
                    <p className={`text-sm leading-relaxed ${styles.textMuted}`}>
                      {faq.answer}
                    </p>
                    {faq.category === 'games' && (
                      <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-3 text-xs text-sky-400 font-semibold">
                        <Gift className="w-4 h-4 shrink-0 text-sky-400" />
                        <span>Tip: Play Voyage Globetrotter games in the footer or menu to unlock promo codes up to 30% off!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
