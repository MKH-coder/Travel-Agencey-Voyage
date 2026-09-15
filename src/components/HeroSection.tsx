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
  Compass
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { FilterState, ListingCategory } from '../types.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

interface HeroSectionProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  setFilters,
  totalCount,
}) => {
  const { theme, styles } = useTheme();
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
    'Santorini',
    'Amalfi Coast',
    'Kyoto Kaiseki',
    'Swiss Alps',
    'Bali Ubud',
    'Tokyo Sushi',
    'Lake Como',
    'Banff Canoe'
  ];

  const categories: { id: 'ALL' | ListingCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'All Destinations', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'PLACE', label: 'Iconic Places', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'HOTEL', label: 'Luxury Stays', icon: <Hotel className="w-3.5 h-3.5" /> },
    { id: 'FOOD', label: 'Culinary & Dining', icon: <Utensils className="w-3.5 h-3.5" /> },
  ];

  const popularCountries = ['All Countries', 'Greece', 'Italy', 'Japan', 'Switzerland', 'Indonesia', 'Canada', 'France'];

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
    <section className="relative overflow-hidden py-8 sm:py-12 border-b border-slate-200/50 dark:border-slate-800/80">
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
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Unforgettable Journeys</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${styles.textPrimary} mb-3`}>
            Explore Extraordinary Places, Stays & Gastronomy
          </h1>
          <p className={`text-sm sm:text-base ${styles.textSecondary} leading-relaxed`}>
            Hand-curated global travel collection with interactive map integration, transparent pricing, instant booking, verified culinary secrets, and community verification.
          </p>
        </div>

        {/* Location Finder & Search Container */}
        <div className={`p-4 sm:p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-lg shadow-black/5`}>
          
          {/* Main search bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
              <input
                id="hero-search-input"
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Real-time search: destination, stay, culinary dish, or tag (e.g. Amalfi, Positano, Kyoto, Zermatt)..."
                className={`w-full pl-10 pr-20 py-2.5 text-sm rounded-xl outline-none transition-all ${styles.inputBg}`}
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
            <div className="flex items-center gap-2 min-w-[180px]">
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
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${styles.textMuted} shrink-0`}>
              Popular:
            </span>
            <div className="flex items-center gap-1.5">
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
                  <option value="UNDER_200">Under $200</option>
                  <option value="200_400">$200 - $400</option>
                  <option value="ABOVE_400">$400+</option>
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

      </div>
    </section>
  );
};

