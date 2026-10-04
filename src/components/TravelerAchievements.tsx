import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Plane, 
  ShieldCheck, 
  Compass, 
  Bookmark, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Flame, 
  Star, 
  Crown,
  ChevronRight,
  TrendingUp,
  MapPin,
  Tag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking } from '../types.ts';

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'BOOKING' | 'GAME' | 'EXPLORER' | 'SECURITY';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  description: string;
  requirement: string;
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  perk: string;
  gradient: string;
  borderGlow: string;
}

interface TravelerAchievementsProps {
  compact?: boolean;
  onOpenGame?: () => void;
  onOpenExplore?: () => void;
}

const STORAGE_KEY_PROGRESS = 'voyage_interactive_game_progress_v2';
const STORAGE_KEY_SAVED = 'voyage_saved_trips';

export const TravelerAchievements: React.FC<TravelerAchievementsProps> = ({
  compact = false,
  onOpenGame,
  onOpenExplore
}) => {
  const { styles } = useTheme();
  const { user, token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedTripsCount, setSavedTripsCount] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [passportStampsCount, setPassportStampsCount] = useState<number>(1);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNLOCKED' | 'BOOKING' | 'GAME'>('ALL');

  // Fetch user bookings, game progress, and saved trips
  useEffect(() => {
    // 1. Load Bookings
    if (token) {
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

    // 2. Load Saved Trips count
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) setSavedTripsCount(list.length);
      }
    } catch {
      // ignore
    }

    // 3. Load Game Progress
    try {
      const prog = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (prog) {
        const parsed = JSON.parse(prog);
        if (parsed.highScore) setGameScore(parsed.highScore);
        else if (parsed.totalScore) setGameScore(parsed.totalScore);
        if (Array.isArray(parsed.unlockedStamps)) {
          setPassportStampsCount(Math.max(1, parsed.unlockedStamps.length));
        }
      }
    } catch {
      // ignore
    }
  }, [token]);

  const bookingCount = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const hasAlbaniaBooking = bookings.some(b => 
    b.listingTitle.toLowerCase().includes('albania') || 
    b.listingTitle.toLowerCase().includes('ksamil') ||
    b.listingTitle.toLowerCase().includes('saranda')
  );

  // Compute Badges Matrix
  const badges: AchievementBadge[] = [
    {
      id: 'badge_first_journey',
      title: 'First Flight',
      category: 'BOOKING',
      rarity: 'COMMON',
      icon: '🎒',
      description: 'Booked your very first curated trip or hotel accommodation on Voyage.',
      requirement: 'Complete 1 confirmed booking',
      currentProgress: Math.min(1, bookingCount),
      maxProgress: 1,
      isUnlocked: bookingCount >= 1,
      perk: 'Complimentary welcome travel guide PDF',
      gradient: 'from-sky-500/20 to-blue-600/20 text-sky-400',
      borderGlow: 'border-sky-500/40 shadow-sky-500/10'
    },
    {
      id: 'badge_globetrotter_pro',
      title: 'Globetrotter Pro',
      category: 'BOOKING',
      rarity: 'RARE',
      icon: '🗺️',
      description: 'Experienced explorer with multiple confirmed reservations across world destinations.',
      requirement: 'Complete 3 confirmed bookings',
      currentProgress: Math.min(3, bookingCount),
      maxProgress: 3,
      isUnlocked: bookingCount >= 3,
      perk: 'Priority check-in & 5% member flight cashback',
      gradient: 'from-indigo-500/20 to-purple-600/20 text-indigo-400',
      borderGlow: 'border-indigo-500/40 shadow-indigo-500/10'
    },
    {
      id: 'badge_vip_jetsetter',
      title: 'Elite Jetsetter',
      category: 'BOOKING',
      rarity: 'LEGENDARY',
      icon: '👑',
      description: 'Prestigious traveler with 5+ bookings or over $2,000 in luxury expeditions.',
      requirement: 'Complete 5 bookings or spend $2,000+',
      currentProgress: Math.min(5, bookingCount) || (totalSpent >= 2000 ? 5 : 0),
      maxProgress: 5,
      isUnlocked: bookingCount >= 5 || totalSpent >= 2000,
      perk: 'Dedicated 24/7 VIP Concierge & Free room upgrades',
      gradient: 'from-amber-500/30 to-yellow-600/20 text-amber-300',
      borderGlow: 'border-amber-500/60 shadow-amber-500/20'
    },
    {
      id: 'badge_albania_explorer',
      title: 'Ionian Riviera Master',
      category: 'EXPLORER',
      rarity: 'EPIC',
      icon: '🇦🇱',
      description: 'Explored the Albanian Riviera, Ksamil turquoise islands, or Theth alpine peaks.',
      requirement: 'Book or inquire for Albania 9-Day package',
      currentProgress: hasAlbaniaBooking ? 1 : 0,
      maxProgress: 1,
      isUnlocked: hasAlbaniaBooking,
      perk: 'Exclusive 15% partner discount code in Ksamil',
      gradient: 'from-red-500/20 via-slate-900 to-amber-500/20 text-red-400',
      borderGlow: 'border-red-500/50 shadow-red-500/15'
    },
    {
      id: 'badge_supersonic_pilot',
      title: 'Supersonic Aviator',
      category: 'GAME',
      rarity: 'RARE',
      icon: '✈️',
      description: 'Piloted the Sky Expedition aircraft with sonic precision over mountain rings.',
      requirement: 'Achieve 350+ flight score in game',
      currentProgress: Math.min(350, gameScore),
      maxProgress: 350,
      isUnlocked: gameScore >= 350,
      perk: 'Unlocks supersonic plane skin in flight simulator',
      gradient: 'from-cyan-500/20 to-sky-600/20 text-cyan-300',
      borderGlow: 'border-cyan-500/40 shadow-cyan-500/10'
    },
    {
      id: 'badge_sky_legend',
      title: 'Sky Expedition Ace',
      category: 'GAME',
      rarity: 'LEGENDARY',
      icon: '⚡',
      description: 'Reached supersonic heights with a master score of 600+ points and speed rings.',
      requirement: 'Achieve 600+ score in Sky Expedition',
      currentProgress: Math.min(600, gameScore),
      maxProgress: 600,
      isUnlocked: gameScore >= 600,
      perk: 'Permanent 20% flight booking voucher unlock',
      gradient: 'from-amber-400/20 via-orange-500/20 to-purple-600/20 text-amber-400',
      borderGlow: 'border-amber-400/60 shadow-amber-400/20'
    },
    {
      id: 'badge_passport_collector',
      title: 'Stamped Passport',
      category: 'GAME',
      rarity: 'EPIC',
      icon: '🛂',
      description: 'Collected official visa entry stamps across European & Balkan destinations.',
      requirement: 'Earn 3+ stamps in digital passport',
      currentProgress: Math.min(3, passportStampsCount),
      maxProgress: 3,
      isUnlocked: passportStampsCount >= 3,
      perk: 'Traveler badge flair displayed on community reviews',
      gradient: 'from-emerald-500/20 to-teal-600/20 text-emerald-400',
      borderGlow: 'border-emerald-500/40 shadow-emerald-500/10'
    },
    {
      id: 'badge_wanderlust_curator',
      title: 'Wanderlust Curator',
      category: 'EXPLORER',
      rarity: 'COMMON',
      icon: '🔖',
      description: 'Curated your dream bucket list by bookmarking luxury destinations.',
      requirement: 'Save 3+ places to your Saved Trips',
      currentProgress: Math.min(3, savedTripsCount),
      maxProgress: 3,
      isUnlocked: savedTripsCount >= 3,
      perk: 'Real-time price drop notifications for saved hotels',
      gradient: 'from-purple-500/20 to-pink-600/20 text-purple-400',
      borderGlow: 'border-purple-500/40 shadow-purple-500/10'
    },
    {
      id: 'badge_fortress_security',
      title: 'Fortress Sentinel',
      category: 'SECURITY',
      rarity: 'RARE',
      icon: '🛡️',
      description: 'Secured your Voyage traveler account with Two-Factor Authentication (2FA).',
      requirement: 'Enable 2FA on your profile',
      currentProgress: user?.mfaEnabled ? 1 : 0,
      maxProgress: 1,
      isUnlocked: !!user?.mfaEnabled,
      perk: 'Fraud protection guarantee & +150 bonus XP',
      gradient: 'from-emerald-500/20 to-blue-600/20 text-emerald-400',
      borderGlow: 'border-emerald-500/40 shadow-emerald-500/10'
    }
  ];

  // Calculate Total XP & Level
  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const totalXp = (bookingCount * 250) + 
                  (savedTripsCount * 50) + 
                  Math.min(500, Math.floor(gameScore / 2)) + 
                  (passportStampsCount * 100) + 
                  (user?.mfaEnabled ? 150 : 0);

  // Level Tiers:
  // Level 1: 0 - 299 (Novice Explorer)
  // Level 2: 300 - 699 (Horizon Seeker)
  // Level 3: 700 - 1299 (Master Globetrotter)
  // Level 4: 1300 - 2199 (Elite Nomad)
  // Level 5: 2200+ (Voyage Legend)
  let level = 1;
  let levelTitle = 'Novice Explorer';
  let nextLevelXp = 300;
  let prevLevelXp = 0;

  if (totalXp >= 2200) {
    level = 5;
    levelTitle = 'Voyage Legend';
    nextLevelXp = 3500;
    prevLevelXp = 2200;
  } else if (totalXp >= 1300) {
    level = 4;
    levelTitle = 'Elite Nomad';
    nextLevelXp = 2200;
    prevLevelXp = 1300;
  } else if (totalXp >= 700) {
    level = 3;
    levelTitle = 'Master Globetrotter';
    nextLevelXp = 1300;
    prevLevelXp = 700;
  } else if (totalXp >= 300) {
    level = 2;
    levelTitle = 'Horizon Seeker';
    nextLevelXp = 700;
    prevLevelXp = 300;
  }

  const levelProgressPercent = Math.min(
    100,
    Math.round(((totalXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)
  );

  const filteredBadges = badges.filter(b => {
    if (activeFilter === 'UNLOCKED') return b.isUnlocked;
    if (activeFilter === 'BOOKING') return b.category === 'BOOKING';
    if (activeFilter === 'GAME') return b.category === 'GAME';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Traveler Level & XP Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20 text-slate-950 border border-amber-300">
              {level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Traveler Level {level}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase border border-amber-400/30">
                  {levelTitle}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">
                {unlockedBadges.length} of {badges.length} digital badges unlocked
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total XP</div>
              <div className="text-sm font-black text-amber-400 font-mono">{totalXp.toLocaleString()} pts</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex justify-between text-[11px] text-slate-300 font-bold">
            <span>Progress to Level {level + 1}</span>
            <span className="font-mono text-amber-300">{totalXp} / {nextLevelXp} XP ({levelProgressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500 transition-all duration-700 shadow-sm shadow-amber-500/50"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {!compact && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `All Badges (${badges.length})` },
            { id: 'UNLOCKED', label: `Unlocked (${unlockedBadges.length})` },
            { id: 'BOOKING', label: 'Bookings' },
            { id: 'GAME', label: 'Flight & Game' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-sky-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Badges Grid */}
      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3'} gap-2.5 sm:gap-3`}>
        {filteredBadges.map((badge) => {
          const isSelected = selectedBadge?.id === badge.id;
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(isSelected ? null : badge)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
                badge.isUnlocked
                  ? `bg-slate-900/90 ${badge.borderGlow} hover:scale-[1.02] shadow-sm`
                  : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-80'
              } ${isSelected ? 'ring-2 ring-amber-400 shadow-lg' : ''}`}
            >
              {/* Rarity & Status Chip */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  badge.rarity === 'LEGENDARY'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : badge.rarity === 'EPIC'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : badge.rarity === 'RARE'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {badge.rarity}
                </span>

                {badge.isUnlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </div>

              {/* Badge Icon & Title */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-white truncate leading-tight">{badge.title}</h4>
                  <p className="text-[10px] text-slate-400 capitalize truncate">{badge.category.toLowerCase()}</p>
                </div>
              </div>

              {/* Progress Mini Bar */}
              <div className="w-full mt-auto space-y-1">
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span className="truncate">{badge.isUnlocked ? 'Unlocked' : badge.requirement}</span>
                  <span className="font-mono text-slate-300 shrink-0">{badge.currentProgress}/{badge.maxProgress}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      badge.isUnlocked ? 'bg-emerald-400' : 'bg-sky-500'
                    }`}
                    style={{ width: `${(badge.currentProgress / badge.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Badge Detailed Inspect Drawer */}
      {selectedBadge && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-indigo-500/40 text-white animate-in zoom-in-95 duration-200 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-md">
                {selectedBadge.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white">{selectedBadge.title}</h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                    {selectedBadge.rarity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{selectedBadge.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Unlocked Traveler Perk</div>
                <div className="text-[11px] font-bold text-amber-300">{selectedBadge.perk}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Requirement</div>
                <div className="text-[11px] font-bold text-slate-200">{selectedBadge.requirement}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
