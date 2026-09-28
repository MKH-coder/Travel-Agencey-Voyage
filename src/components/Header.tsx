import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sun,
  Moon,
  Flame,
  Shield,
  Heart,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Clock,
  LogIn,
  Search,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Leaf,
  Sparkles,
  Palette,
  Snowflake,
  Calendar,
  Command,
  Menu,
  X,
  Layers,
  ArrowRight,
  Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeMode } from '../types.ts';
import { UserProfileModal } from './UserProfileModal.tsx';
import { Clock as ClockComponent } from './Clock.tsx';
import { SupabaseSyncIndicator } from './SupabaseSyncIndicator.tsx';

interface HeaderProps {
  currentView: 'dashboard' | 'admin';
  setCurrentView: (view: 'dashboard' | 'admin') => void;
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  onOpenShortcutsHelp?: () => void;
  onOpenSupabaseConsole?: () => void;
  onOpenCustomTripBuilder?: () => void;
  onOpenCustomTripsTracker?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  savedTripsCount,
  onOpenSavedTrips,
  onOpenShortcutsHelp,
  onOpenSupabaseConsole,
  onOpenCustomTripBuilder,
  onOpenCustomTripsTracker,
  searchQuery,
  setSearchQuery,
}) => {
  const { theme, setTheme, styles } = useTheme();
  const { user, logout, setShowLoginModal, setShowBypassModal, sessionRemainingSec } = useAuth();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on view change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'cyan-light',
      label: 'Cyan Blue & White',
      icon: <Sun className="w-4 h-4 text-cyan-500" />,
      color: 'bg-cyan-500',
    },
    {
      id: 'dark-slate',
      label: 'Dark Mode (Slate)',
      icon: <Moon className="w-4 h-4 text-sky-400" />,
      color: 'bg-slate-800',
    },
    {
      id: 'crimson-black',
      label: 'Crimson Red & Black',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      color: 'bg-rose-600',
    },
    {
      id: 'emerald-warm',
      label: 'Emerald Warm (Light)',
      icon: <Leaf className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-600',
    },
    {
      id: 'royal-gold',
      label: 'Royal Gold (Dark)',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-500',
    },
    {
      id: 'violet-glass',
      label: 'Violet Amethyst (Dark)',
      icon: <Palette className="w-4 h-4 text-fuchsia-400" />,
      color: 'bg-fuchsia-600',
    },
    {
      id: 'emerald-black',
      label: 'Emerald Black (Dark)',
      icon: <Leaf className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-950',
    },
    {
      id: 'rose-gold',
      label: 'Rose Gold (Dark)',
      icon: <Heart className="w-4 h-4 text-rose-300" />,
      color: 'bg-rose-400',
    },
    {
      id: 'nordic-frost',
      label: 'Nordic Frost (Light)',
      icon: <Snowflake className="w-4 h-4 text-sky-400" />,
      color: 'bg-sky-400',
    },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full max-w-full overflow-visible ${styles.headerBg} border-b ${styles.border} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
        
        {/* Left Cluster: Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 focus:outline-none group text-left shrink-0 cursor-pointer"
          >
            <div className={`p-2 rounded-xl ${styles.accent} text-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-105`}>
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-black tracking-tight ${styles.textPrimary}`}>
                  Voyage
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold tracking-wide uppercase bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/20">
                  Global
                </span>
              </div>
              <p className={`text-[9px] ${styles.textMuted} -mt-0.5 hidden xs:block truncate max-w-[140px] sm:max-w-none`}>
                Mannanthala, Trivandrum & Worldwide
              </p>
            </div>
          </button>

          {/* Desktop Navigation links (Only on large screens to prevent right-side overflow) */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-slate-200/40 dark:border-slate-800">
            <button
              id="nav-explore-btn"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard'
                  ? `${styles.accent} text-white shadow-sm`
                  : `${styles.textSecondary} hover:${styles.cardBg}`
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore</span>
            </button>

            {onOpenCustomTripBuilder && (
              <button
                id="nav-custom-trip-btn"
                onClick={onOpenCustomTripBuilder}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500 hover:to-orange-600 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Design Custom Trip & Package"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
                <span>Custom Trip Studio</span>
              </button>
            )}

            <button
              onClick={() => {
                setCurrentView('dashboard');
                setTimeout(() => document.getElementById('marketing-advantage')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${styles.textSecondary} hover:${styles.cardBg}`}
            >
              About
            </button>

            <button
              onClick={() => {
                setCurrentView('dashboard');
                setTimeout(() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${styles.textSecondary} hover:${styles.cardBg}`}
            >
              Contact
            </button>

            {(user?.role === 'ADMIN' || user?.role === 'TECH_SUBADMIN' || user?.role === 'TECH_ADMIN') && (
              <button
                id="nav-admin-btn"
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'admin'
                    ? `${styles.accent} text-white shadow-sm`
                    : `${styles.textSecondary} hover:${styles.cardBg}`
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{user.role === 'TECH_ADMIN' ? 'Super Admin Portal' : user.role === 'TECH_SUBADMIN' ? 'Sub-Admin' : 'Admin Portal'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Global Search Bar (Only on large screens) */}
        {currentView === 'dashboard' && (
          <div className="hidden 2xl:flex flex-1 max-w-sm mx-2">
            <div className="relative w-full">
              <Search className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Mannanthala, Kyoto, stays..."
                className={`w-full pl-9 pr-12 py-1.5 text-xs rounded-xl outline-none transition-all ${styles.inputBg}`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${styles.textMuted} hover:${styles.textPrimary}`}
                  >
                    Clear
                  </button>
                ) : (
                  <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700 pointer-events-none">
                    /
                  </kbd>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Action Cluster (Guaranteed to always fit and never push Sign In out of screen) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Real-Time Clock (Only on extra wide screens) */}
          <div className="hidden 2xl:block">
            <ClockComponent />
          </div>

          {/* Quick Custom Trip Button for Mobile/Tablet */}
          {onOpenCustomTripBuilder && (
            <button
              onClick={onOpenCustomTripBuilder}
              className="xl:hidden p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1 text-xs font-bold shrink-0"
              title="Plan Custom Trip & Package"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Custom Trip</span>
            </button>
          )}

          {/* Theme Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              id="theme-toggle-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className={`p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:opacity-90 transition-all flex items-center gap-1 text-xs font-medium shrink-0 cursor-pointer`}
              title="Switch Visual Theme"
            >
              {theme === 'cyan-light' && <Sun className="w-4 h-4 text-cyan-500" />}
              {theme === 'dark-slate' && <Moon className="w-4 h-4 text-sky-400" />}
              {theme === 'crimson-black' && <Flame className="w-4 h-4 text-rose-500" />}
              {theme === 'emerald-warm' && <Leaf className="w-4 h-4 text-emerald-600" />}
              {theme === 'royal-gold' && <Sparkles className="w-4 h-4 text-amber-400" />}
              {theme === 'violet-glass' && <Palette className="w-4 h-4 text-fuchsia-400" />}
              {theme === 'emerald-black' && <Leaf className="w-4 h-4 text-emerald-400" />}
              {theme === 'rose-gold' && <Heart className="w-4 h-4 text-rose-300" />}
              {theme === 'nordic-frost' && <Snowflake className="w-4 h-4 text-sky-400" />}
              <span className="hidden lg:inline capitalize text-[11px]">
                {theme.replace('-light', '').replace('-black', '').replace('-warm', '').replace('-glass', '')}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 hidden sm:inline" />
            </button>

            {showThemeMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border ${styles.border} ${styles.cardBg} p-1.5 z-50 animate-in fade-in zoom-in-95`}
              >
                <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  Select Visual Theme
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5 py-1">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        theme === opt.id
                          ? `${styles.accent} text-white`
                          : `${styles.textSecondary} hover:${styles.bg}`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                      {theme === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Trips Trigger */}
          <button
            id="saved-trips-btn"
            onClick={onOpenSavedTrips}
            className={`relative p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:opacity-90 transition-all flex items-center gap-1 shrink-0 cursor-pointer`}
            title="Saved Trips & Reservations (B)"
          >
            <Heart className={`w-4 h-4 ${savedTripsCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {savedTripsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center justify-center">
                {savedTripsCount}
              </span>
            )}
          </button>

          {/* Supabase Sync Indicator */}
          <div className="hidden sm:block shrink-0">
            <SupabaseSyncIndicator onOpenSupabaseConsole={onOpenSupabaseConsole} />
          </div>

          {/* User Profile / Prominent Sign In Button (ALWAYS VISIBLE & ACCESSIBLE) */}
          {user ? (
            <div className="relative shrink-0">
              <button
                id="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-2.5 rounded-xl border ${styles.border} ${styles.cardBg} hover:opacity-90 transition-all shrink-0 cursor-pointer`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-lg ${styles.accent} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden md:block text-left text-xs">
                  <div className={`font-semibold leading-tight truncate max-w-[90px] lg:max-w-[120px] ${styles.textPrimary}`}>
                    {user.name}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1 rounded uppercase tracking-wider ${
                      user.role === 'TECH_ADMIN'
                        ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                        : user.role === 'TECH_SUBADMIN'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        : user.role === 'ADMIN'
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {user.role === 'TECH_ADMIN' ? 'Super Admin' : user.role === 'TECH_SUBADMIN' ? 'Sub-Admin' : user.role === 'ADMIN' ? 'Admin' : 'Traveler'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
              </button>

              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border ${styles.border} ${styles.cardBg} p-2 z-50 animate-in fade-in zoom-in-95`}
                >
                  <div className="px-3 py-2.5 border-b border-slate-200/50 dark:border-slate-800 space-y-1">
                    <div className={`text-xs font-bold ${styles.textPrimary}`}>{user.name}</div>
                    <div className={`text-[11px] truncate ${styles.textMuted}`}>{user.email}</div>
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className={styles.textMuted}>Privilege Tier:</span>
                      <span className="px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {(user.role === 'ADMIN' || user.role === 'TECH_SUBADMIN' || user.role === 'TECH_ADMIN') && (
                      <button
                        onClick={() => {
                          setCurrentView(currentView === 'dashboard' ? 'admin' : 'dashboard');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${styles.textSecondary} hover:${styles.bg}`}
                      >
                        {currentView === 'dashboard' ? (
                          <>
                            <Shield className="w-4 h-4 text-sky-500" />
                            <span>Open Admin Portal</span>
                          </>
                        ) : (
                          <>
                            <LayoutDashboard className="w-4 h-4 text-sky-500" />
                            <span>Return to Explorer</span>
                          </>
                        )}
                      </button>
                    )}

                    {onOpenCustomTripsTracker && (
                      <button
                        id="user-custom-trips-btn"
                        onClick={() => {
                          onOpenCustomTripsTracker();
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${styles.textSecondary} hover:${styles.bg}`}
                      >
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-amber-500" />
                          <span>My Custom Trips & Quotes</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          Active
                        </span>
                      </button>
                    )}

                    <button
                      id="user-security-profile-btn"
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${styles.textSecondary} hover:${styles.bg}`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${user.mfaEnabled ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span>Profile & 2FA Security</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${user.mfaEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        {user.mfaEnabled ? '2FA ON' : '2FA OFF'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${styles.textSecondary} hover:${styles.bg}`}
                    >
                      <UserIcon className="w-4 h-4 opacity-70" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="emergency-recovery-quick-btn"
                onClick={() => setShowBypassModal(true)}
                className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                title="Super Admin Emergency Recovery"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Recovery</span>
              </button>

              {/* Prominent Guaranteed Sign In Button */}
              <button
                id="header-signin-btn"
                onClick={() => setShowLoginModal(true)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} shadow-md transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            id="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`xl:hidden p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:opacity-90 transition-all flex items-center justify-center shrink-0 cursor-pointer`}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Slide-Out Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className={`xl:hidden border-t ${styles.border} ${styles.cardBg} px-4 py-5 space-y-4 shadow-2xl animate-in slide-in-from-top-3 duration-200`}>
          
          {/* Mobile User Card / Quick Sign-In CTA */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 to-amber-500/10 border border-sky-500/20 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                ) : (
                  <div className={`w-9 h-9 rounded-xl ${styles.accent} text-white flex items-center justify-center text-sm font-bold`}>
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className={`text-xs font-bold ${styles.textPrimary}`}>{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className={`text-xs font-bold ${styles.textPrimary}`}>Welcome to Voyage</div>
                  <div className="text-[10px] text-slate-400">Sign in to sync your trips & bookings</div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`p-3 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                currentView === 'dashboard' ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-500" />
              <span>Explore Stays</span>
            </button>

            {onOpenCustomTripBuilder && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCustomTripBuilder();
                }}
                className="p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-left text-xs font-bold flex items-center gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Custom Trip</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSavedTrips();
              }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Saved Trips</span>
              </div>
              {savedTripsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {savedTripsCount}
                </span>
              )}
            </button>

            {onOpenCustomTripsTracker && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCustomTripsTracker();
                }}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs font-bold flex items-center gap-2.5"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>My Inquiries</span>
              </button>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'TECH_SUBADMIN' || user?.role === 'TECH_ADMIN') && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="col-span-2 p-3 rounded-2xl bg-amber-500 text-white font-black text-xs flex items-center justify-between shadow-md shadow-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{user.role === 'TECH_ADMIN' ? 'Super Admin Portal' : 'Admin Portal'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Theme Switcher in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Theme</div>
            <div className="grid grid-cols-3 gap-1.5">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
                    theme === opt.id
                      ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300'
                      : 'border-slate-200/60 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency & Logout */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowBypassModal(true);
              }}
              className="text-rose-500 font-semibold flex items-center gap-1 hover:underline text-[11px]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Recovery</span>
            </button>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-slate-400 hover:text-rose-500 font-semibold flex items-center gap-1 text-[11px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

        </div>
      )}

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </header>
  );
};
