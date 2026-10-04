import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Gift, 
  Zap, 
  ShieldCheck, 
  Plane, 
  Award,
  TrendingUp,
  Star,
  Compass
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking } from '../types.ts';

export interface TravelerTier {
  id: string;
  level: number;
  name: string;
  minBookings: number;
  maxBookings: number | null;
  icon: string;
  colorName: string;
  perks: string[];
  gradient: string;
  borderGlow: string;
  tagline: string;
}

export const TRAVELER_TIERS: TravelerTier[] = [
  {
    id: 'tier_bronze',
    level: 1,
    name: 'Bronze Explorer',
    minBookings: 0,
    maxBookings: 1,
    icon: '🥉',
    colorName: 'Bronze',
    tagline: 'Your passport journey begins here',
    perks: [
      'Standard member discounted rates',
      'Free curated travel itinerary downloads',
      'Live chat concierge support access'
    ],
    gradient: 'from-amber-800/40 via-amber-900/30 to-slate-900',
    borderGlow: 'border-amber-700/50 shadow-amber-900/20'
  },
  {
    id: 'tier_silver',
    level: 2,
    name: 'Silver Nomad',
    minBookings: 2,
    maxBookings: 4,
    icon: '🥈',
    colorName: 'Silver',
    tagline: 'Active globetrotter with privileged benefits',
    perks: [
      '5% cashback on all flight reservations',
      'Priority live concierge queue routing',
      'Complimentary destination packing checklist PDF'
    ],
    gradient: 'from-slate-400/30 via-slate-600/20 to-slate-900',
    borderGlow: 'border-slate-400/50 shadow-slate-500/20'
  },
  {
    id: 'tier_gold',
    level: 3,
    name: 'Gold Voyager',
    minBookings: 5,
    maxBookings: 9,
    icon: '🥇',
    colorName: 'Gold',
    tagline: 'Prestigious explorer of boutique destinations',
    perks: [
      '10% luxury boutique hotel discount',
      'Guaranteed early check-in & 2:00 PM late checkout',
      'Complimentary welcome cocktail / wine upon arrival'
    ],
    gradient: 'from-amber-400/30 via-yellow-600/20 to-slate-900',
    borderGlow: 'border-amber-400/60 shadow-amber-500/25'
  },
  {
    id: 'tier_platinum',
    level: 4,
    name: 'Platinum Jetsetter',
    minBookings: 10,
    maxBookings: 19,
    icon: '💎',
    colorName: 'Platinum',
    tagline: 'Elite voyager enjoying world-class luxury',
    perks: [
      'Dedicated 24/7 personal VIP Concierge agent',
      'Complimentary room category upgrades when available',
      'Zero cancellation fees on select luxury partners'
    ],
    gradient: 'from-cyan-400/30 via-sky-600/20 to-slate-900',
    borderGlow: 'border-cyan-400/60 shadow-cyan-500/25'
  },
  {
    id: 'tier_diamond',
    level: 5,
    name: 'Diamond Legend',
    minBookings: 20,
    maxBookings: null,
    icon: '👑',
    colorName: 'Diamond',
    tagline: 'Highest echelon of bespoke world travel',
    perks: [
      'Complimentary VIP luxury airport lounge access',
      'Exclusive private yacht & helicopter charter quotes',
      'Invitations to annual Voyage private destination galas'
    ],
    gradient: 'from-fuchsia-500/30 via-purple-700/20 to-amber-400/20',
    borderGlow: 'border-fuchsia-400/70 shadow-fuchsia-500/30'
  }
];

interface TravelerMilestonesProps {
  compact?: boolean;
}

export const TravelerMilestones: React.FC<TravelerMilestonesProps> = ({ compact = false }) => {
  const { styles } = useTheme();
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTier, setSelectedTier] = useState<TravelerTier | null>(null);

  useEffect(() => {
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
  }, [token]);

  const bookingCount = bookings.length;

  // Determine current tier
  let currentTier = TRAVELER_TIERS[0];
  let nextTier: TravelerTier | null = TRAVELER_TIERS[1];

  for (let i = TRAVELER_TIERS.length - 1; i >= 0; i--) {
    if (bookingCount >= TRAVELER_TIERS[i].minBookings) {
      currentTier = TRAVELER_TIERS[i];
      nextTier = TRAVELER_TIERS[i + 1] || null;
      break;
    }
  }

  // Calculate progression to next tier
  let progressPercentage = 100;
  let remainingBookings = 0;

  if (nextTier) {
    const currentTierBase = currentTier.minBookings;
    const nextTierTarget = nextTier.minBookings;
    const progressWithinTier = bookingCount - currentTierBase;
    const totalRequiredWithinTier = nextTierTarget - currentTierBase;
    progressPercentage = Math.min(100, Math.max(0, Math.round((progressWithinTier / totalRequiredWithinTier) * 100)));
    remainingBookings = nextTierTarget - bookingCount;
  }

  return (
    <div className="space-y-4">
      {/* Current Tier Header Hero */}
      <div className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${currentTier.gradient} border ${currentTier.borderGlow} text-white relative overflow-hidden shadow-2xl transition-all duration-500`}>
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-slate-950/80 border border-white/20 flex items-center justify-center text-3xl shadow-xl shadow-black/40 animate-bounce duration-1000">
              {currentTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Level {currentTier.level} Traveler Tier
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase border border-white/20">
                  {currentTier.name}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">{currentTier.tagline}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-white/10 text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Bookings</div>
              <div className="text-base font-black text-amber-300 font-mono">
                {bookingCount} {bookingCount === 1 ? 'Trip' : 'Trips'}
              </div>
            </div>
          </div>
        </div>

        {/* Progression Bar to Next Tier */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              {nextTier ? (
                <span>
                  Next Milestone: <strong className="text-amber-300">{nextTier.name}</strong> ({remainingBookings} more {remainingBookings === 1 ? 'booking' : 'bookings'} needed)
                </span>
              ) : (
                <span className="text-amber-300 font-black">🎉 Pinnacle Tier Reached (Diamond Legend)!</span>
              )}
            </span>
            <span className="font-mono text-amber-300">{progressPercentage}%</span>
          </div>

          <div className="w-full h-3 bg-slate-950/90 rounded-full overflow-hidden p-0.5 border border-white/15">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-400 transition-all duration-700 shadow-md shadow-amber-500/40"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tiers Progression Road Map */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Traveler Tiers & Unlocked Privileges
          </span>
          <span className="text-slate-400 text-[10px] font-medium">Click any tier to view full perks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TRAVELER_TIERS.map((tier) => {
            const isUnlocked = bookingCount >= tier.minBookings;
            const isCurrent = currentTier.id === tier.id;
            const isSelected = selectedTier?.id === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(isSelected ? null : tier)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isCurrent
                    ? `bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-lg`
                    : isUnlocked
                    ? `bg-slate-900/80 border-slate-700 hover:border-slate-500`
                    : `bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-80`
                } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.icon}</span>
                    <div>
                      <h4 className="font-black text-xs text-white leading-tight flex items-center gap-1.5">
                        {tier.name}
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase">
                            Current
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {tier.minBookings === 0 
                          ? 'Starting level' 
                          : `${tier.minBookings}+ bookings required`}
                      </p>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>

                {/* Top Perks Preview */}
                <div className="space-y-1 my-1">
                  {tier.perks.slice(0, 2).map((perk, pIdx) => (
                    <div key={pIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Star className={`w-3 h-3 shrink-0 ${isUnlocked ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      <span className="truncate">{perk}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Status Chip */}
                <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {isUnlocked ? 'Privileges Unlocked' : `${tier.minBookings - bookingCount} bookings to unlock`}
                  </span>
                  <span className="text-sky-400 font-bold">Details →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Tier Detail Modal / Card */}
      {selectedTier && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/50 text-white animate-in zoom-in-95 duration-200 space-y-3 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedTier.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-amber-400">{selectedTier.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15">
                    Level {selectedTier.level}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{selectedTier.tagline}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTier(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Exclusive Member Privileges:
            </div>
            {selectedTier.perks.map((perk, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium text-slate-200">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
