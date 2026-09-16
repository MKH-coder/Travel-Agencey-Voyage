import React from 'react';
import { ChevronRight, Compass, FolderOpen, Shield, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Listing, FilterState } from '../types.ts';

interface BreadcrumbsProps {
  currentView: 'dashboard' | 'admin';
  setCurrentView: (view: 'dashboard' | 'admin') => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  adminTab: 'analytics' | 'create' | 'inventory' | 'queue' | 'users' | 'logs' | 'cloud' | 'logins' | null;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentView,
  setCurrentView,
  selectedListing,
  setSelectedListing,
  filters,
  setFilters,
  adminTab,
}) => {
  const { styles } = useTheme();

  // Helper to format category labels beautifully
  const getCategoryLabel = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'ALL': return 'All Destinations';
      case 'BEACH': return 'Beach Getaways';
      case 'MOUNTAIN': return 'Mountain Retreats';
      case 'CITY': return 'Urban Explorations';
      case 'CAMPING': return 'Adventure & Camping';
      case 'CULINARY': return 'Culinary Experiences';
      default: return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    }
  };

  // Helper to format admin tab labels beautifully
  const getAdminTabLabel = (tab: string) => {
    switch (tab) {
      case 'analytics': return 'Analytics & Trends';
      case 'create': return 'Create Listing';
      case 'inventory': return 'Inventory Manager';
      case 'queue': return 'Approvals Queue';
      case 'users': return 'Sub-Admin Matrix';
      case 'logs': return 'Security Audit Trail';
      case 'cloud': return 'Database & Cloud Storage';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  // Click Handlers for Backward Navigation
  const handleGoHome = () => {
    setSelectedListing(null);
    setFilters(prev => ({ ...prev, category: 'ALL', search: '' }));
    setCurrentView('dashboard');
  };

  const handleGoExplorer = () => {
    setSelectedListing(null);
    setFilters(prev => ({ ...prev, category: 'ALL' }));
    setCurrentView('dashboard');
  };

  const handleGoCategory = () => {
    setSelectedListing(null);
  };

  return (
    <nav 
      id="dynamic-breadcrumbs"
      aria-label="Breadcrumb"
      className={`border-b ${styles.border} ${styles.cardBg} py-2.5 px-4 sm:px-6 lg:px-8 transition-all`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
        
        {/* Breadcrumb Path Links */}
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 font-medium">
          
          {/* Level 1: Home / Voyage Root */}
          <li className="flex items-center">
            <button
              onClick={handleGoHome}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${styles.textSecondary} hover:text-sky-500 hover:bg-sky-500/5 font-semibold`}
            >
              <Compass className="w-3.5 h-3.5 text-sky-500" />
              <span>Voyage</span>
            </button>
          </li>

          {/* Level 2: View (Explorer or Admin Panel) */}
          <li className="flex items-center gap-1.5 sm:gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
            {currentView === 'dashboard' ? (
              <button
                onClick={handleGoExplorer}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  !selectedListing && filters.category === 'ALL'
                    ? `${styles.accentText} font-bold cursor-default`
                    : `${styles.textSecondary} hover:text-sky-500 hover:bg-sky-500/5`
                }`}
                disabled={!selectedListing && filters.category === 'ALL'}
              >
                <span>Explorer</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setCurrentView('admin');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  !adminTab 
                    ? `${styles.accentText} font-bold cursor-default`
                    : `${styles.textSecondary} hover:text-sky-500 hover:bg-sky-500/5`
                }`}
                disabled={!adminTab}
              >
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Admin Console</span>
              </button>
            )}
          </li>

          {/* Level 3: Sub-Category / Admin Sub-Tab */}
          {currentView === 'dashboard' && filters.category !== 'ALL' && (
            <li className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
              <button
                onClick={handleGoCategory}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  !selectedListing
                    ? `${styles.accentText} font-bold cursor-default`
                    : `${styles.textSecondary} hover:text-sky-500 hover:bg-sky-500/5`
                }`}
                disabled={!selectedListing}
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{getCategoryLabel(filters.category)}</span>
              </button>
            </li>
          )}

          {currentView === 'admin' && adminTab && (
            <li className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
              <span className={`px-2 py-1 font-bold ${styles.accentText} flex items-center gap-1.5 select-none`}>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{getAdminTabLabel(adminTab)}</span>
              </span>
            </li>
          )}

          {/* Level 4: Active Listing Detail */}
          {currentView === 'dashboard' && selectedListing && (
            <li className="flex items-center gap-1.5 sm:gap-2 max-w-[200px] sm:max-w-xs md:max-w-md">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
              <span className={`px-2 py-1 font-bold ${styles.accentText} flex items-center gap-1.5 truncate select-none`} title={selectedListing.title}>
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{selectedListing.title}</span>
              </span>
            </li>
          )}

        </ol>

        {/* Dynamic Contextual Badge */}
        <div className="flex items-center gap-2">
          {selectedListing ? (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20`}>
              Detailed View
            </span>
          ) : currentView === 'admin' ? (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
              Secure Terminal
            </span>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-500 border border-sky-500/20`}>
              Explorer Active
            </span>
          )}
        </div>

      </div>
    </nav>
  );
};
