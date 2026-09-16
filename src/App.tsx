import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ListingCard } from './components/ListingCard.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { SavedTripsModal } from './components/SavedTripsModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { MapView } from './components/MapView.tsx';
import { Breadcrumbs } from './components/Breadcrumbs.tsx';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts.ts';
import { Listing, FilterState, ThemeMode } from './types.ts';
import { DEFAULT_LISTINGS } from './data/defaultData.ts';
import {
  Compass,
  Sparkles,
  MapPin,
  SearchX,
  ShieldCheck,
  Heart,
  Plane,
  ArrowRight,
  Map as MapIcon,
  LayoutGrid,
  Columns
} from 'lucide-react';

function MainLayout() {
  const { styles, theme, setTheme } = useTheme();
  const { user, token, showLoginModal, setShowLoginModal, showBypassModal, setShowBypassModal } = useAuth();

  const [currentView, setCurrentView] = useState<'dashboard' | 'admin'>('dashboard');
  const [feedLayout, setFeedLayout] = useState<'split' | 'grid' | 'map'>('split');
  const [listings, setListings] = useState<Listing[]>(DEFAULT_LISTINGS);
  const [loading, setLoading] = useState(false);
  const [savedListings, setSavedListings] = useState<Listing[]>(() => {
    try {
      const stored = localStorage.getItem('voyage_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [adminTab, setAdminTab] = useState<'analytics' | 'create' | 'inventory' | 'queue' | 'users' | 'logs' | 'cloud' | 'logins' | null>(null);

  // Search and filters
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    search: '',
    priceRange: 'ALL',
    minRating: 0,
    country: 'All Countries',
  });

  // Cycle through available themes
  const handleCycleTheme = useCallback(() => {
    const themeModes: ThemeMode[] = [
      'cyan-light',
      'dark-slate',
      'crimson-black',
      'emerald-warm',
      'royal-gold',
      'violet-glass',
      'emerald-black',
      'rose-gold',
      'nordic-frost',
    ];
    const currentIndex = themeModes.indexOf(theme);
    const nextTheme = themeModes[(currentIndex + 1) % themeModes.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  // Focus search input
  const handleFocusSearch = useCallback(() => {
    // If in admin view, return to explore dashboard first or focus search
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
    // Small timeout to allow render if switching view
    setTimeout(() => {
      const heroInput = document.getElementById('hero-search-input') as HTMLInputElement | null;
      const headerInput = document.getElementById('header-search-input') as HTMLInputElement | null;
      if (heroInput) {
        heroInput.focus();
        heroInput.select();
        heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (headerInput) {
        headerInput.focus();
        headerInput.select();
      }
    }, 50);
  }, [currentView]);

  // Close any open modal on Escape
  const handleCloseAllModals = useCallback(() => {
    setSelectedListing(null);
    setShowSavedModal(false);
    setShowShortcutsModal(false);
    if (showLoginModal) setShowLoginModal(false);
    if (showBypassModal) setShowBypassModal(false);
  }, [showLoginModal, setShowLoginModal, showBypassModal, setShowBypassModal]);

  // Register global shortcuts
  useGlobalShortcuts({
    onFocusSearch: handleFocusSearch,
    onCloseModals: handleCloseAllModals,
    onToggleSavedTrips: () => setShowSavedModal(prev => !prev),
    onToggleHelp: () => setShowShortcutsModal(prev => !prev),
    onToggleTheme: handleCycleTheme,
    onSwitchView: () => setCurrentView(prev => (prev === 'dashboard' ? 'admin' : 'dashboard')),
    extraShortcuts: [
      {
        key: '1',
        description: 'Switch to Split Layout',
        action: () => setFeedLayout('split'),
        ignoreInputs: true,
      },
      {
        key: '2',
        description: 'Switch to Grid Layout',
        action: () => setFeedLayout('grid'),
        ignoreInputs: true,
      },
      {
        key: '3',
        description: 'Switch to Map Layout',
        action: () => setFeedLayout('map'),
        ignoreInputs: true,
      },
    ],
  });

  // Fetch listings (with fallback to default listings on static GitHub Pages)
  const loadListings = async () => {
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setListings(data);
        }
      }
    } catch (err) {
      console.warn('API listings not available, using built-in curated destinations:', err);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  // Fetch server-saved trips when user logs in
  useEffect(() => {
    let isMounted = true;
    if (token) {
      fetch('/api/saved-trips', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted) return;
          const list = data?.savedListings || (Array.isArray(data) ? data : []);
          if (Array.isArray(list) && list.length > 0) {
            setSavedListings(list);
            try {
              localStorage.setItem('voyage_saved_trips', JSON.stringify(list));
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {
          if (!isMounted) return;
          try {
            const stored = localStorage.getItem('voyage_saved_trips');
            if (stored) {
              setSavedListings(JSON.parse(stored));
            }
          } catch {
            // ignore
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Save/Unsave bookmark with server synchronization when authenticated
  const toggleSaveListing = async (item: Listing) => {
    const isCurrentlySaved = savedListings.some(l => l.id === item.id);
    const updated = isCurrentlySaved
      ? savedListings.filter(l => l.id !== item.id)
      : [...savedListings, item];

    setSavedListings(updated);
    try {
      localStorage.setItem('voyage_saved_trips', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (token) {
      try {
        if (isCurrentlySaved) {
          await fetch(`/api/saved-trips/${item.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await fetch('/api/saved-trips', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ listingId: item.id })
          });
        }
      } catch {
        // Fallback already saved in localStorage
      }
    }
  };

  const removeSavedListing = async (id: string) => {
    const updated = savedListings.filter(l => l.id !== id);
    setSavedListings(updated);
    try {
      localStorage.setItem('voyage_saved_trips', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (token) {
      try {
        await fetch(`/api/saved-trips/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // Fallback already removed from localStorage
      }
    }
  };

  // Filter and sort listings based on criteria
  const filteredListings = useMemo(() => {
    const filtered = listings.filter(item => {
      // In explore feed, only show published items (or public)
      if (item.status && item.status !== 'PUBLISHED') {
        return false;
      }

      // Category filter
      if (filters.category !== 'ALL' && item.category !== filters.category) {
        return false;
      }

      // Country filter
      if (filters.country !== 'All Countries' && item.country.toLowerCase() !== filters.country.toLowerCase()) {
        return false;
      }

      // Search filter (title, location, country, tags)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesCountry = item.country.toLowerCase().includes(query);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesLocation && !matchesCountry && !matchesTags) {
          return false;
        }
      }

      // Price filter
      if (filters.priceRange === 'UNDER_200' && item.price >= 200) return false;
      if (filters.priceRange === '200_400' && (item.price < 200 || item.price > 400)) return false;
      if (filters.priceRange === 'ABOVE_400' && item.price <= 400) return false;

      // Min Rating
      if (filters.minRating > 0 && item.rating < filters.minRating) return false;

      return true;
    });

    // Sort: Newest created listings first
    return filtered.sort((a, b) => {
      const timeA = new Date(a.timestamps.createdAt).getTime();
      const timeB = new Date(b.timestamps.createdAt).getTime();
      return timeB - timeA;
    });
  }, [listings, filters]);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.textPrimary} transition-colors duration-300 flex flex-col font-sans selection:bg-cyan-500/20`}>
      
      {/* Universal Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        savedTripsCount={savedListings.length}
        onOpenSavedTrips={() => setShowSavedModal(true)}
        onOpenShortcutsHelp={() => setShowShortcutsModal(true)}
        searchQuery={filters.search}
        setSearchQuery={(q) => setFilters(prev => ({ ...prev, search: q }))}
      />

      {/* Dynamic Breadcrumbs Navigation */}
      <Breadcrumbs
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedListing={selectedListing}
        setSelectedListing={setSelectedListing}
        filters={filters}
        setFilters={setFilters}
        adminTab={adminTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <div className="space-y-8">
            
            {/* Hero Search & Filter Matrix */}
            <HeroSection
              filters={filters}
              setFilters={setFilters}
              totalCount={filteredListings.length}
            />

            {/* Explore Feed & Interactive Map Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
              
              {/* Feed Header & Layout Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <h2 className={`text-xl font-extrabold tracking-tight ${styles.textPrimary} flex items-center gap-2`}>
                    <Sparkles className="w-5 h-5 text-sky-500" />
                    <span>Featured Travel Collections</span>
                  </h2>
                  <p className={`text-xs ${styles.textMuted} mt-0.5`}>
                    Showing {filteredListings.length} hand-vetted destinations, five-star accommodations, and culinary experiences
                  </p>
                </div>

                {/* View Mode Switcher & Filter Pill */}
                <div className="flex items-center flex-wrap gap-2.5">
                  <div className={`p-1 rounded-2xl border ${styles.border} ${styles.cardBg} flex items-center gap-1 shadow-sm`}>
                    <button
                      id="view-mode-split"
                      onClick={() => setFeedLayout('split')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        feedLayout === 'split'
                          ? `${styles.accent} text-white shadow-sm`
                          : `${styles.textSecondary} hover:text-slate-900 dark:hover:text-white`
                      }`}
                      title="Side-by-side / Stacked Map & Feed"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Split View</span>
                    </button>

                    <button
                      id="view-mode-grid"
                      onClick={() => setFeedLayout('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        feedLayout === 'grid'
                          ? `${styles.accent} text-white shadow-sm`
                          : `${styles.textSecondary} hover:text-slate-900 dark:hover:text-white`
                      }`}
                      title="Grid Feed Only"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid View</span>
                    </button>

                    <button
                      id="view-mode-map"
                      onClick={() => setFeedLayout('map')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        feedLayout === 'map'
                          ? `${styles.accent} text-white shadow-sm`
                          : `${styles.textSecondary} hover:text-slate-900 dark:hover:text-white`
                      }`}
                      title="Full Interactive Map"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Map View</span>
                    </button>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border ${styles.accentBadge}`}>
                    {filters.country === 'All Countries' ? 'Worldwide Explorer' : filters.country}
                  </span>
                </div>
              </div>

              {/* View Rendering based on feedLayout */}
              {feedLayout === 'map' ? (
                /* Full Map View */
                <div className="h-[650px] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800">
                  <MapView
                    listings={filteredListings}
                    activeListingId={hoveredListingId || selectedListing?.id}
                    savedListingIds={savedListings.map(l => l.id)}
                    onSelectListing={(item) => setSelectedListing(item)}
                    onToggleSave={toggleSaveListing}
                    className="h-full w-full"
                    isCompact={false}
                  />
                </div>
              ) : feedLayout === 'split' ? (
                /* Split View: Map Banner on top + Listings below */
                <div className="space-y-6">
                  <div className="h-[380px] rounded-3xl overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800">
                    <MapView
                      listings={filteredListings}
                      activeListingId={hoveredListingId || selectedListing?.id}
                      savedListingIds={savedListings.map(l => l.id)}
                      onSelectListing={(item) => setSelectedListing(item)}
                      onToggleSave={toggleSaveListing}
                      className="h-full w-full"
                      isCompact={true}
                    />
                  </div>

                  {/* Listings Grid */}
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                          key={i}
                          className={`h-96 rounded-2xl border ${styles.border} ${styles.cardBg} animate-pulse p-4 flex flex-col justify-between`}
                        >
                          <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-xl" />
                          <div className="space-y-2 mt-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                          </div>
                          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
                        </div>
                      ))}
                    </div>
                  ) : filteredListings.length === 0 ? (
                    <div className={`p-12 rounded-3xl border ${styles.border} ${styles.cardBg} text-center space-y-4 max-w-lg mx-auto my-8`}>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <SearchX className="w-8 h-8" />
                      </div>
                      <h3 className={`text-lg font-bold ${styles.textPrimary}`}>No Matching Destinations Found</h3>
                      <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                        We couldn't find any travel experiences matching "{filters.search || filters.country}". Try broadening your search or resetting filters.
                      </p>
                      <button
                        onClick={() => setFilters({
                          category: 'ALL',
                          search: '',
                          priceRange: 'ALL',
                          minRating: 0,
                          country: 'All Countries',
                        })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} shadow-md`}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                      {filteredListings.map(listing => (
                        <div
                          key={listing.id}
                          onMouseEnter={() => setHoveredListingId(listing.id)}
                          onMouseLeave={() => setHoveredListingId(null)}
                        >
                          <ListingCard
                            listing={listing}
                            isSaved={savedListings.some(l => l.id === listing.id)}
                            onToggleSave={toggleSaveListing}
                            onSelect={(item) => setSelectedListing(item)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Grid Only View */
                <div>
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                          key={i}
                          className={`h-96 rounded-2xl border ${styles.border} ${styles.cardBg} animate-pulse p-4 flex flex-col justify-between`}
                        >
                          <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-xl" />
                          <div className="space-y-2 mt-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                          </div>
                          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
                        </div>
                      ))}
                    </div>
                  ) : filteredListings.length === 0 ? (
                    <div className={`p-12 rounded-3xl border ${styles.border} ${styles.cardBg} text-center space-y-4 max-w-lg mx-auto my-8`}>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <SearchX className="w-8 h-8" />
                      </div>
                      <h3 className={`text-lg font-bold ${styles.textPrimary}`}>No Matching Destinations Found</h3>
                      <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                        We couldn't find any travel experiences matching "{filters.search || filters.country}". Try broadening your search or resetting filters.
                      </p>
                      <button
                        onClick={() => setFilters({
                          category: 'ALL',
                          search: '',
                          priceRange: 'ALL',
                          minRating: 0,
                          country: 'All Countries',
                        })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} shadow-md`}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                      {filteredListings.map(listing => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          isSaved={savedListings.some(l => l.id === listing.id)}
                          onToggleSave={toggleSaveListing}
                          onSelect={(item) => setSelectedListing(item)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Technical & Standard Admin Portal View */
          <AdminPortal
            onListingUpdated={loadListings}
            onNavigateExplore={() => setCurrentView('dashboard')}
            onTabChange={(tab) => setAdminTab(tab as 'analytics' | 'create' | 'inventory' | 'queue' | 'users' | 'logs' | 'cloud' | 'logins')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t ${styles.border} ${styles.cardBg} py-8 text-xs ${styles.textMuted} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${styles.accent} text-white`}>
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className={`font-bold ${styles.textPrimary}`}>Voyage Global Experience Platform</span>
              <span className="mx-2">•</span>
              <span>Direct Pricing & Verified Curations</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Factor Security & Audit Guard</span>
            </span>
            <span>•</span>
            <span>Theme: <strong className="capitalize">{theme}</strong></span>
            <span>•</span>
            <button
              onClick={() => setCurrentView(currentView === 'dashboard' ? 'admin' : 'dashboard')}
              className="text-sky-500 hover:underline font-semibold"
            >
              {currentView === 'dashboard' ? 'Admin Gateway' : 'Return to Explorer'}
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <DetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        isSaved={selectedListing ? savedListings.some(l => l.id === selectedListing.id) : false}
        onToggleSave={toggleSaveListing}
      />

      {/* Saved Trips & Bookings Modal */}
      <SavedTripsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedListings={savedListings}
        onRemoveSavedTrip={removeSavedListing}
        onSelectListing={(item) => {
          setSelectedListing(item);
          setShowSavedModal(false);
        }}
        onBookListing={(item) => {
          setSelectedListing(item);
          setShowSavedModal(false);
        }}
      />

      {/* Global Authentication Modal (OAuth, Phone OTP, 2FA, Bypass) */}
      <LoginModal />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsHelpModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}
