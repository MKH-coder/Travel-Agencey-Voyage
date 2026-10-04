import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Building2, 
  Briefcase, 
  Camera, 
  Monitor, 
  Globe, 
  Clock, 
  Wifi, 
  Award,
  Crown,
  BookOpen
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { getClientSessionInfo } from '../utils/clientInfo.ts';
import { TravelerAchievements } from './TravelerAchievements.tsx';
import { TravelerMilestones, TRAVELER_TIERS } from './TravelerMilestones.tsx';
import { Booking } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';
import { TravelJournalSection } from './TravelJournalSection.tsx';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGame?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onOpenGame }) => {
  const { styles } = useTheme();
  const { user, token, toggle2FA, updateProfilePicture, isNetworkOnline } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'JOURNAL' | 'MILESTONES' | 'BADGES'>('PROFILE');
  const [isToggling, setIsToggling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (isOpen && token) {
      fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then((data: Booking[]) => {
          if (Array.isArray(data)) {
            setBookings(data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (bookings.length > 0) {
      const urgent = bookings.filter(b => {
        const checkIn = new Date(b.checkInDate || Date.now());
        const days = Math.ceil((checkIn.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        return days >= 0 && days <= 7;
      });
      if (urgent.length > 0) {
        AuthAudit.showToast({
          title: '✈️ Upcoming Trip Alert!',
          message: `You have ${urgent.length} trip(s) arriving in less than 7 days! Check your profile reminders.`,
          type: 'success',
          duration: 5000
        });
      }
    }
  }, [bookings]);

  if (!isOpen || !user) return null;

  const bookingCount = bookings.length;
  const currentTier = TRAVELER_TIERS.find(t => 
    bookingCount >= t.minBookings && (t.maxBookings === null || bookingCount <= t.maxBookings)
  ) || TRAVELER_TIERS[0];

  const clientInfo = getClientSessionInfo();

  const handleToggle2FA = async () => {
    setIsToggling(true);
    setFeedback(null);
    try {
      const res = await toggle2FA();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.mfaEnabled
            ? 'Two-Factor Authentication (2FA) is now ENABLED for your account!'
            : 'Two-Factor Authentication (2FA) has been disabled for your account.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update 2FA status.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'An unexpected error occurred while updating 2FA settings.',
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setFeedback(null);
    const res = await updateProfilePicture(file);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Profile picture updated successfully!' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to upload profile picture.' });
    }
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden p-6 space-y-5 my-8 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className={`relative w-11 h-11 rounded-2xl ${styles.accent} text-white flex items-center justify-center font-bold text-lg shadow-md cursor-pointer group`}
              onClick={() => fileInputRef.current?.click()}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user.name.charAt(0)
              )}
              <div className={`absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : ''}`}>
                {isUploading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <Camera className="w-5 h-5 text-white" />}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-base ${styles.textPrimary}`}>{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 shadow-xs">
                  <span>{currentTier.icon}</span>
                  <span>{currentTier.name}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">({bookingCount} bookings)</span>
              </div>
              <p className={`text-xs ${styles.textMuted} mt-0.5`}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'PROFILE'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-sky-500'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Profile & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('JOURNAL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'JOURNAL'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black shadow-md shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-sky-500'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>📖 Travel Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'MILESTONES'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-amber-500'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>🌟 Traveler Tiers & Milestones</span>
          </button>

          <button
            onClick={() => setActiveTab('BADGES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'BADGES'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-400'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>🏆 Digital Badges</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'JOURNAL' ? (
            <TravelJournalSection userBookings={bookings} />
          ) : activeTab === 'MILESTONES' ? (
            <TravelerMilestones />
          ) : activeTab === 'BADGES' ? (
            <TravelerAchievements 
              onOpenGame={() => {
                onClose();
                if (onOpenGame) onOpenGame();
              }} 
            />
          ) : (
            <>
              {/* Profile Info Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-sky-500" /> Administrative Role
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      user.role === 'TECH_ADMIN'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : user.role === 'TECH_SUBADMIN'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        : user.role === 'ADMIN'
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-500" /> Assigned Title / Post
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user.customTitle || 'Standard Traveler'}
                  </div>
                </div>
              </div>

              {/* Trip Reminders Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-black ${styles.textPrimary} uppercase tracking-wider`}>Upcoming Trip Reminders</h4>
                      <p className={`text-[11px] ${styles.textMuted}`}>Automated alerts for bookings arriving in less than 7 days.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if ('Notification' in window) {
                        Notification.requestPermission().then(permission => {
                          if (permission === 'granted') {
                            new Notification('Voyage Trip Reminder', {
                              body: 'You have upcoming trip reservations arriving within 7 days. Pack your bags!',
                              icon: '/vite.svg'
                            });
                            AuthAudit.showToast({
                              title: '🔔 Notifications Enabled',
                              message: 'Browser push notifications & trip alerts active!',
                              type: 'success',
                              duration: 3500
                            });
                          } else {
                            AuthAudit.showToast({
                              title: 'Browser Notifications',
                              message: 'Notification permission was denied in browser settings.',
                              type: 'error',
                              duration: 3500
                            });
                          }
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Test Notification</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {bookings.length === 0 ? (
                    <div className="text-center py-3 text-xs text-slate-400">
                      No active bookings found. Explore destinations and book your next escape!
                    </div>
                  ) : (
                    bookings.map(b => {
                      const checkIn = new Date(b.checkInDate || Date.now());
                      const daysUntil = Math.ceil((checkIn.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      const isUrgent = daysUntil >= 0 && daysUntil <= 7;

                      return (
                        <div
                          key={b.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            isUrgent
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="space-y-0.5 truncate">
                            <div className="font-bold truncate">{b.listingTitle || 'Voyage Tour Reservation'}</div>
                            <div className="text-[10px] text-slate-400">Check-in: {b.checkInDate} • Guests: {b.guests}</div>
                          </div>
                          <div className="shrink-0">
                            {daysUntil < 0 ? (
                              <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                                Completed
                              </span>
                            ) : daysUntil === 0 ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase animate-pulse">
                                Arriving Today! ✈️
                              </span>
                            ) : daysUntil <= 7 ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase shadow-xs">
                                ⏳ In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}!
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                                In {daysUntil} days
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Feedback Message */}
              {feedback && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Shield className="w-4 h-4 shrink-0 text-rose-500" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Client-Side Login Session Information Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        Client Login Session Info
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${isNetworkOnline ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                          {isNetworkOnline ? 'Active Online' : 'Offline Mode'}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Real-time browser, device, viewport & client connection telemetry.
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Authenticated
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Login Timestamp
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : clientInfo.loginFormatted}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Monitor className="w-3 h-3 text-sky-500" /> Client Browser & OS
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user.lastLoginBrowser || clientInfo.browser} ({user.lastLoginOs || clientInfo.os})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-500" /> Timezone & Locale
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user.lastLoginTimezone || clientInfo.timeZone} ({clientInfo.language})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-purple-500" /> Viewport & Client IP
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {clientInfo.viewport} • {user.lastLoginIp || '127.0.0.1'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & 2FA Toggle Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${user.mfaEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        Two-Factor Authentication (2FA)
                        {user.mfaEnabled && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-500 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Require an extra SMS / OTP security code during login verification.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch Button */}
                  <button
                    id="toggle-2fa-switch"
                    type="button"
                    disabled={isToggling}
                    onClick={handleToggle2FA}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      user.mfaEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    role="switch"
                    aria-checked={user.mfaEnabled}
                    title={user.mfaEnabled ? 'Click to disable 2FA' : 'Click to enable 2FA'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        user.mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>
                    {user.mfaEnabled
                      ? 'Your account is secured with 2FA. Every login attempt will prompt for SMS / OTP verification.'
                      : '2FA is currently disabled. Enable 2FA to enforce phone OTP verification on login.'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 flex justify-end shrink-0 border-t border-slate-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} cursor-pointer`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
