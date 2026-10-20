import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Quote, Globe, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { Review } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';

interface TestimonialsProps {
  onOpenAlbaniaModal?: (tier: 'basic' | 'midrange' | 'luxury') => void;
  onBrowsePackages?: () => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  onOpenAlbaniaModal,
  onBrowsePackages,
}) => {
  const { styles } = useTheme();
  const { currency, setCurrency, availableCurrencies, formatPrice, currentCurrency } = useCurrency();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const loaded = ClientStorageManager.getReviews();
    setReviews(loaded);
  }, []);

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => Math.round(r.rating) === filterRating);

  // Master Catalogue Package Pricing options in USD base
  const masterCatalogueTiers = [
    {
      id: 'basic',
      name: 'Essential Explorer Tier',
      usdPrice: 1332, // ~$1,332 / ₹1,11,000 equivalent
      tag: 'Most Popular Value',
      description: 'Hand-vetted 3-star boutique stays, curated heritage transfers, and guided UNESCO entry passes.'
    },
    {
      id: 'midrange',
      name: 'Signature Mid-Range Tier',
      usdPrice: 1716, // ~$1,716 / ₹1,43,000 equivalent
      tag: 'Traveler Choice',
      description: '4-star scenic coastal hotels, private chauffeur transfers, and exclusive culinary tasting sessions.'
    },
    {
      id: 'luxury',
      name: 'Ultra-Luxury VIP Tier',
      usdPrice: 5088, // ~$5,088 / ₹4,24,000 equivalent
      tag: 'Ultimate Experience',
      description: '5-star cliffside resorts, private helicopter/yacht charters, private historian guides, and 24/7 concierge.'
    }
  ];

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 rounded-3xl border ${styles.border} ${styles.cardBg} my-12 shadow-xl relative overflow-hidden`}>
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 dark:border-slate-800 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Social Proof & Reviews</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.textPrimary}`}>
              Loved by Global Travelers & Explorers
            </h2>
            <p className={`text-sm ${styles.textMuted} leading-relaxed`}>
              Read genuine feedback from adventurers who experienced our handcrafted journeys, 5-star stays, and master catalogue itineraries.
            </p>
          </div>

          {/* Currency Switcher for Master Catalogue Pricing */}
          <div className={`flex items-center gap-2.5 p-2 rounded-2xl border ${styles.border} bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm`}>
            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Globe className="w-4 h-4 text-sky-500" />
              <span>Currency:</span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border ${styles.border} ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-sky-500`}
            >
              {availableCurrencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Master Catalogue Quick Pricing Tiers with Live Currency Conversion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${styles.textPrimary} flex items-center gap-2`}>
              <span>Master Catalogue Pricing Tiers</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Converted to {currentCurrency.code} ({currentCurrency.symbol})
              </span>
            </h3>
            <span className={`text-xs ${styles.textMuted}`}>All rates updated real-time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {masterCatalogueTiers.map((tier) => (
              <div 
                key={tier.id}
                className={`p-6 rounded-2xl border ${styles.border} bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-md flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      {tier.tag}
                    </span>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className={`text-base font-bold ${styles.textPrimary}`}>{tier.name}</h4>
                  <p className={`text-xs ${styles.textMuted} leading-relaxed`}>{tier.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-end justify-between">
                  <div>
                    <span className={`text-2xl font-black ${styles.textPrimary}`}>
                      {formatPrice(tier.usdPrice)}
                    </span>
                    <span className={`block text-[10px] ${styles.textMuted}`}>All-inclusive per traveler</span>
                  </div>
                  {onOpenAlbaniaModal && (
                    <button
                      onClick={() => onOpenAlbaniaModal(tier.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} shadow-md flex items-center gap-1.5`}
                    >
                      <span>Explore Tier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${styles.textSecondary}`}>Filter Reviews:</span>
            {[
              { label: 'All Reviews', value: 'all' },
              { label: '5 Stars 🌟', value: 5 },
              { label: '4 Stars ⭐', value: 4 },
            ].map(tab => (
              <button
                key={String(tab.value)}
                onClick={() => setFilterRating(tab.value as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterRating === tab.value
                    ? `${styles.accent} text-white shadow-md`
                    : `border ${styles.border} ${styles.textSecondary} hover:bg-slate-100 dark:hover:bg-slate-800`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={`text-xs font-semibold ${styles.textMuted}`}>
            Showing {filteredReviews.length} verified traveler reviews
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.length === 0 ? (
            <div className={`col-span-full p-12 text-center rounded-2xl border ${styles.border} ${styles.cardBg}`}>
              <p className={`text-sm ${styles.textMuted}`}>No reviews found matching this filter.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`p-6 rounded-2xl border ${styles.border} bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between space-y-4 transition-all hover:shadow-xl`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(review.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Explorer</span>
                    </span>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-sky-500/20 pointer-events-none" />
                    <p className={`text-xs ${styles.textPrimary} leading-relaxed pl-3 italic`}>
                      "{review.comment}"
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-sky-500/30"
                    />
                    <div>
                      <h5 className={`text-xs font-bold ${styles.textPrimary}`}>{review.userName}</h5>
                      <span className={`text-[10px] ${styles.textMuted}`}>
                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        {onBrowsePackages && (
          <div className="text-center pt-4">
            <button
              onClick={onBrowsePackages}
              className={`px-6 py-3 rounded-2xl text-sm font-bold ${styles.buttonPrimary} shadow-lg inline-flex items-center gap-2`}
            >
              <span>Explore All Master Catalogue Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
