import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeMode } from '../types.ts';
import { UserProfileModal } from './UserProfileModal.tsx';

interface HeaderProps {
  currentView: 'dashboard' | 'admin';
  setCurrentView: (view: 'dashboard' | 'admin') => void;
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  savedTripsCount,
  onOpenSavedTrips,
  searchQuery,
  setSearchQuery,
}) => {
  const { theme, setTheme, styles } = useTheme();
  const { user, logout, setShowLoginModal, setShowBypassModal, sessionRemainingSec } = useAuth();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
  ];

  // Format 15-minute countdown for admins
  const formatTimer = (sec: number | null) => {
    if (sec === null) return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className={`sticky top-0 z-40 w-full ${styles.headerBg} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className={`p-2 rounded-xl ${styles.accent} text-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-105`}>
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-bold tracking-tight ${styles.textPrimary}`}>
                  Voyage
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium tracking-wide uppercase bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">
                  Global
                </span>
              </div>
              <p className={`text-[10px] ${styles.textMuted} -mt-0.5 hidden sm:block`}>
                Curated Destinations & Hotels
              </p>
            </div>
          </button>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200/40 dark:border-slate-800">
            <button
              id="nav-explore-btn"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? `${styles.accent} text-white shadow-sm`
                  : `${styles.textSecondary} hover:${styles.cardBg}`
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </button>

            {(user?.role === 'ADMIN' || user?.role === 'TECH_SUBADMIN' || user?.role === 'TECH_ADMIN') && (
              <button
                id="nav-admin-btn"
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? `${styles.accent} text-white shadow-sm`
                    : `${styles.textSecondary} hover:${styles.cardBg}`
                }`}
              >
                <Shield className="w-4 h-4" />
                {user.role === 'TECH_ADMIN' ? 'Super Admin Portal' : user.role === 'TECH_SUBADMIN' ? 'Tech Sub-Admin' : 'Admin Portal'}
              </button>
            )}
          </nav>
        </div>

        {/* Global Search Bar (Only in Dashboard view) */}
        {currentView === 'dashboard' && (
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Santorini, Kyoto, luxury stays..."
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all ${styles.inputBg}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded ${styles.textMuted} hover:${styles.textPrimary}`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Admin Inactivity Countdown Badge */}
          {user && (user.role === 'ADMIN' || user.role === 'TECH_SUBADMIN' || user.role === 'TECH_ADMIN') && sessionRemainingSec !== null && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                sessionRemainingSec < 120
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
              title="Automatic session security timeout after 15 minutes of inactivity"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(sessionRemainingSec)}</span>
            </div>
          )}

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              id="theme-toggle-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className={`p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:opacity-90 transition-all flex items-center gap-1.5 text-xs font-medium`}
              title="Switch Visual Theme"
            >
              {theme === 'cyan-light' && <Sun className="w-4 h-4 text-cyan-500" />}
              {theme === 'dark-slate' && <Moon className="w-4 h-4 text-sky-400" />}
              {theme === 'crimson-black' && <Flame className="w-4 h-4 text-rose-500" />}
              <span className="hidden md:inline capitalize">
                {theme === 'cyan-light' ? 'Cyan' : theme === 'dark-slate' ? 'Dark' : 'Crimson'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showThemeMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border ${styles.border} ${styles.cardBg} p-1.5 z-50 animate-in fade-in zoom-in-95`}
              >
                <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  Select Theme Mode
                </div>
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      theme === opt.id
                        ? `${styles.accent} text-white`
                        : `${styles.textSecondary} hover:${styles.bg}`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                    {theme === opt.id && <span className="w-2 h-2 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Trips Trigger */}
          <button
            id="saved-trips-btn"
            onClick={onOpenSavedTrips}
            className={`relative p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:opacity-90 transition-all flex items-center gap-1`}
            title="Saved Trips & Reservations"
          >
            <Heart className={`w-4 h-4 ${savedTripsCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {savedTripsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center justify-center">
                {savedTripsCount}
              </span>
            )}
          </button>

          {/* User Profile & Auth */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-1.5 pl-2 rounded-xl border ${styles.border} ${styles.cardBg} hover:opacity-90 transition-all`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-lg ${styles.accent} text-white flex items-center justify-center text-xs font-bold`}>
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs">
                  <div className={`font-semibold leading-tight truncate max-w-[110px] ${styles.textPrimary}`}>
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-medium px-1 rounded uppercase tracking-wider ${
                        user.role === 'TECH_ADMIN'
                          ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 font-bold'
                          : user.role === 'TECH_SUBADMIN'
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold'
                          : user.role === 'ADMIN'
                          ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {user.role === 'TECH_ADMIN'
                        ? 'Super Admin'
                        : user.role === 'TECH_SUBADMIN'
                        ? 'Sub-Admin'
                        : user.role === 'ADMIN'
                        ? 'Admin'
                        : 'Traveler'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>

              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border ${styles.border} ${styles.cardBg} p-2 z-50 animate-in fade-in zoom-in-95`}
                >
                  <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800">
                    <div className={`text-xs font-bold ${styles.textPrimary}`}>{user.name}</div>
                    <div className={`text-[11px] truncate ${styles.textMuted}`}>{user.email}</div>
                    {user.phoneNumber && (
                      <div className={`text-[10px] font-mono ${styles.textMuted}`}>{user.phoneNumber}</div>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className={styles.textMuted}>Privilege:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.role === 'TECH_ADMIN'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : user.role === 'TECH_SUBADMIN'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                            : user.role === 'ADMIN'
                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {user.role === 'TECH_SUBADMIN' ? 'TECH SUBADMIN' : user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {(user.role === 'ADMIN' || user.role === 'TECH_SUBADMIN' || user.role === 'TECH_ADMIN') && (
                      <button
                        onClick={() => {
                          setCurrentView(currentView === 'dashboard' ? 'admin' : 'dashboard');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${styles.textSecondary} hover:${styles.bg}`}
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

                    <button
                      id="user-security-profile-btn"
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${styles.textSecondary} hover:${styles.bg}`}
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
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${styles.textSecondary} hover:${styles.bg}`}
                    >
                      <UserIcon className="w-4 h-4 opacity-70" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="emergency-recovery-quick-btn"
                onClick={() => setShowBypassModal(true)}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors`}
                title="Super Admin Emergency Bypass"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Recovery Bypass</span>
              </button>
              <button
                id="header-signin-btn"
                onClick={() => setShowLoginModal(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold ${styles.buttonPrimary} transition-all`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

        </div>
      </div>

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </header>
  );
};
