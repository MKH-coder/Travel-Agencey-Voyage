import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  Hotel,
  Utensils,
  Landmark,
  DollarSign,
  Star,
  SlidersHorizontal,
  X,
  Compass,
  Package
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { FilterState, ListingCategory } from '../types.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

interface HeroSectionProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  onBrowsePackages?: () => void;
  onPlanTrip?: () => void;
  onOpenAlbaniaModal?: (tier?: 'basic' | 'midrange' | 'luxury') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  setFilters,
  totalCount,
  onBrowsePackages,
  onPlanTrip,
  onOpenAlbaniaModal,
}) => {
  const { theme, styles } = useTheme();
  const { formatPrice } = useCurrency();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 250);

  // Sync debounced search with parent filters state
  useEffect(() => {
    setFilters(prev => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch };
    });
  }, [debouncedSearch, setFilters]);

  // Keep local search in sync if external reset occurs
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const quickSearchTags = [
    'Albania 9-Day',
    'Santorini',
    'Amalfi Coast',
    'Kyoto Kaiseki',
    'Swiss Alps',
    'Bali Ubud',
    'Tokyo Sushi',
    'Lake Como',
    'Banff Canoe',
    'Paris'
  ];

  const categories: { id: 'ALL' | ListingCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'All Destinations', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'PLACE', label: 'Iconic Places', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'HOTEL', label: 'Luxury Stays', icon: <Hotel className="w-3.5 h-3.5" /> },
    { id: 'FOOD', label: 'Culinary & Dining', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'PACKAGE', label: 'Luxury Bundles', icon: <Package className="w-3.5 h-3.5" /> },
  ];

  const popularCountries = ['Albania', 'All Countries'];

  const resetFilters = () => {
    setLocalSearch('');
    setFilters({
      category: 'ALL',
      search: '',
      priceRange: 'ALL',
      minRating: 0,
      country: 'All Countries',
    });
  };

  const isFiltered =
    filters.category !== 'ALL' ||
    localSearch !== '' ||
    filters.priceRange !== 'ALL' ||
    filters.minRating > 0 ||
    filters.country !== 'All Countries';

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 border-b border-slate-200/50 dark:border-slate-800/80">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 -z-20">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-[0.05] dark:opacity-[0.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-slate-950/50 dark:to-slate-950"></div>
      </div>

      {/* Decorative gradient overlay */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-40 blur-3xl -z-10 ${
          theme === 'cyan-light'
            ? 'bg-gradient-to-r from-cyan-100 via-sky-50 to-transparent'
            : theme === 'dark-slate'
            ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-transparent'
            : 'bg-gradient-to-r from-rose-950/40 via-black to-transparent'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero title & subtitle */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 shadow-sm animate-in slide-in-from-left-4 duration-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Unforgettable Journeys</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter ${styles.textPrimary} mb-6 leading-[0.95] animate-in slide-in-from-left-4 duration-700 delay-100`}>
            Extraordinary <br />
            <span className="text-sky-500">Places & Stays.</span>
          </h1>
          <p className={`text-base sm:text-lg ${styles.textSecondary} leading-relaxed max-w-2xl animate-in slide-in-from-left-4 duration-700 delay-200 mb-6`}>
            The premier global travel agency for modern explorers. Hand-curated luxury stays, verified culinary secrets, and seamless interactive bookings.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 animate-in slide-in-from-left-4 duration-700 delay-300">
            <button
              id="hero-browse-packages-btn"
              type="button"
              onClick={onBrowsePackages}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Explore Tour Packages</span>
            </button>
            <button
              id="hero-plan-trip-btn"
              type="button"
              onClick={onPlanTrip}
              className={`px-6 py-3 rounded-2xl font-bold text-sm ${styles.buttonSecondary} hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer`}
            >
              <Compass className="w-4 h-4 text-sky-500" />
              <span>Plan Custom Trip</span>
            </button>

            {onOpenAlbaniaModal && (
              <button
                id="hero-albania-pdf-btn"
                type="button"
                onClick={() => onOpenAlbaniaModal('midrange')}
                className="px-6 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-500/30 font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>🇦🇱</span>
                <span>Albania 9-Day (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Location Finder & Search Container */}
        <div className={`p-3.5 sm:p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-lg shadow-black/5 w-full max-w-full overflow-hidden`}>
          
          {/* Main search bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-3 w-full min-w-0">
            <div className="relative flex-1 min-w-0 w-full">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
              <input
                id="hero-search-input"
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search destinations, stays, or cuisines (e.g. Amalfi, Kyoto)..."
                className={`w-full min-w-0 pl-10 pr-20 py-2.5 text-sm rounded-xl outline-none transition-all ${styles.inputBg}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {localSearch ? (
                  <button
                    id="hero-clear-search-btn"
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      setFilters(prev => ({ ...prev, search: '' }));
                    }}
                    className={`text-xs p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 ${styles.textMuted}`}
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700 shadow-xs pointer-events-none" title="Press '/' to search">
                    /
                  </kbd>
                )}
                {localSearch !== debouncedSearch ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" title="Searching..." />
                ) : (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                    Live
                  </span>
                )}
              </div>
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[180px]">
              <select
                id="hero-country-select"
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                className={`w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl outline-none font-medium cursor-pointer ${styles.inputBg}`}
              >
                {popularCountries.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search Suggestions Pills */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs no-scrollbar w-full max-w-full">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${styles.textMuted} shrink-0`}>
              Popular:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setLocalSearch(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                    localSearch.toLowerCase() === tag.toLowerCase()
                      ? `${styles.accent} text-white font-bold shadow-sm`
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  id={`filter-category-${cat.id.toLowerCase()}`}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filters.category === cat.id
                      ? `${styles.accent} text-white shadow-sm`
                      : `${styles.buttonSecondary}`
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Price & Rating Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Price Filter */}
              <div className="flex items-center gap-1">
                <span className={`text-[11px] font-medium ${styles.textMuted} hidden sm:inline`}>Price:</span>
                <select
                  id="filter-price-select"
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value as FilterState['priceRange'] }))}
                  className={`py-1.5 px-2.5 text-xs rounded-xl font-medium outline-none cursor-pointer ${styles.inputBg}`}
                >
                  <option value="ALL">Any Budget</option>
                  <option value="UNDER_200">Under {formatPrice(200)}</option>
                  <option value="200_400">{formatPrice(200)} - {formatPrice(400)}</option>
                  <option value="ABOVE_400">{formatPrice(400)}+</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-1">
                <span className={`text-[11px] font-medium ${styles.textMuted} hidden sm:inline`}>Rating:</span>
                <select
                  id="filter-rating-select"
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                  className={`py-1.5 px-2.5 text-xs rounded-xl font-medium outline-none cursor-pointer ${styles.inputBg}`}
                >
                  <option value="0">All Ratings</option>
                  <option value="4.8">4.8+ Stars</option>
                  <option value="4.9">4.9+ Top Tier</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {isFiltered && (
                <button
                  id="filter-reset-btn"
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset ({totalCount})</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Trusted By / Partners Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-wrap items-center gap-x-8 gap-y-4 max-w-full overflow-hidden">
          <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${styles.textMuted} shrink-0`}>Official Partners</span>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500 max-w-full">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/2560px-Airbnb_Logo_B%C3%A9lo.svg.png" alt="Airbnb" className="h-4 w-auto max-w-[80px] object-contain shrink-0" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png" alt="Booking.com" className="h-3 w-auto max-w-[90px] object-contain shrink-0" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Expedia_Logo_2023.svg/2560px-Expedia_Logo_2023.svg.png" alt="Expedia" className="h-4 w-auto max-w-[80px] object-contain shrink-0" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Tripadvisor_logo.svg/1280px-Tripadvisor_logo.svg.png" alt="TripAdvisor" className="h-5 w-auto max-w-[90px] object-contain shrink-0" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Emirates_logo.svg/1024px-Emirates_logo.svg.png" alt="Emirates" className="h-5 w-auto max-w-[80px] object-contain shrink-0" />
          </div>
        </div>

      </div>
    </section>
  );
};

