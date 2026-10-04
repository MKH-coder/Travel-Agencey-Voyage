import React, { useState, useEffect } from 'react';
import {
  Trophy,
  CheckCircle2,
  Sparkles,
  Clock,
  Gift,
  Compass,
  Star,
  ShieldCheck,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { AuthAudit } from '../services/authAudit.ts';
import { PromoService } from '../services/promoService.ts';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  category: 'VIEW' | 'CUSTOM_TRIP' | 'STAMP' | 'COUNTRY';
  completed: boolean;
}

interface WeeklyTravelChallengesProps {
  onAddXp: (amount: number) => void;
}

const DEFAULT_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'challenge_1',
    title: 'Tropical Island Hopper',
    description: 'Explore and view 3 beach or island destinations in the catalog.',
    targetCount: 3,
    currentCount: 1,
    xpReward: 250,
    category: 'VIEW',
    completed: false
  },
  {
    id: 'challenge_2',
    title: 'Custom Trip Architect',
    description: 'Create and save a personalized itinerary in the Custom Trip Studio.',
    targetCount: 1,
    currentCount: 0,
    xpReward: 300,
    category: 'CUSTOM_TRIP',
    completed: false
  },
  {
    id: 'challenge_3',
    title: 'Passport Stamp Collector',
    description: 'Unlock at least 2 Digital Passport stamps from interactive games.',
    targetCount: 2,
    currentCount: 0,
    xpReward: 400,
    category: 'STAMP',
    completed: false
  },
  {
    id: 'challenge_4',
    title: 'Global Multi-Country Navigator',
    description: 'Browse listings across 3 distinct countries (e.g. Japan, Italy, Greece).',
    targetCount: 3,
    currentCount: 2,
    xpReward: 350,
    category: 'COUNTRY',
    completed: false
  }
];

export const WeeklyTravelChallenges: React.FC<WeeklyTravelChallengesProps> = ({ onAddXp }) => {
  const { styles } = useTheme();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('voyage_weekly_challenges');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_CHALLENGES;
  });

  const [claimedReward, setClaimedReward] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('voyage_weekly_challenges', JSON.stringify(challenges));
    } catch {}
  }, [challenges]);

  const handleClaimChallenge = (id: string) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id === id && !c.completed && c.currentCount >= c.targetCount) {
          onAddXp(c.xpReward);
          AuthAudit.showToast({
            title: 'Challenge Completed! 🎉',
            message: `You earned +${c.xpReward} XP bonus points!`,
            type: 'success',
            duration: 4000
          });
          return { ...c, completed: true };
        }
        return c;
      })
    );
  };

  const allCompleted = challenges.every(c => c.completed);
  const totalEarnableXp = challenges.reduce((sum, c) => sum + c.xpReward, 0);
  const completedCount = challenges.filter(c => c.completed).length;

  const handleClaimGrandBonus = () => {
    if (claimedReward || !allCompleted) return;
    setClaimedReward(true);
    // Add bonus 500 XP and unlock exclusive promo voucher
    onAddXp(500);
    PromoService.setActivePromo('WEEKLYCHALLENGE50');
    AuthAudit.showToast({
      title: '🏆 Weekly Grand Reward Unlocked!',
      message: 'Unlocked +500 XP bonus and voucher code WEEKLYCHALLENGE50 ($50 off checkout)!',
      type: 'success',
      duration: 6000
    });
  };

  return (
    <div className={`p-5 sm:p-6 rounded-3xl border ${styles.border} bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 text-white shadow-xl space-y-5`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">Weekly Travel Challenges</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Reset in 4 Days
              </span>
            </div>
            <p className="text-xs text-slate-400">Complete challenges to earn bonus XP points and unlock redemption discount codes.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-indigo-500/30 px-3.5 py-2 rounded-2xl">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progress</div>
            <div className="text-xs font-black text-amber-400">{completedCount} / {challenges.length} Completed</div>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {challenges.map(c => {
          const isReady = c.currentCount >= c.targetCount && !c.completed;
          const progressPercent = Math.min(100, Math.round((c.currentCount / c.targetCount) * 100));

          return (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                c.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : isReady
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{c.title}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-[10px] font-black border border-amber-500/30">
                    +{c.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={c.completed ? 'text-emerald-400' : 'text-slate-400'}>
                    {c.completed ? 'Completed' : `Progress: ${c.currentCount} / ${c.targetCount}`}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      c.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="pt-1 flex items-center justify-end">
                  {c.completed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Claimed</span>
                    </div>
                  ) : isReady ? (
                    <button
                      type="button"
                      onClick={() => handleClaimChallenge(c.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +{c.xpReward} XP</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">In progress</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Completion Bonus Banner */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
        allCompleted
          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 border-amber-500/60 shadow-lg shadow-amber-500/20'
          : 'bg-slate-900/40 border-slate-800 opacity-75'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            🎁
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Weekly Master Grand Reward</span>
              <span className="text-amber-400">($50 Voucher + 500 XP)</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {allCompleted
                ? 'All weekly challenges completed! Unlock your exclusive grand reward code.'
                : 'Complete all 4 weekly challenges to unlock the Grand Master Reward.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClaimGrandBonus}
          disabled={!allCompleted || claimedReward}
          className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            allCompleted && !claimedReward
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:scale-105 shadow-amber-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {claimedReward ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Grand Reward Claimed</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>Unlock Grand Voucher</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
