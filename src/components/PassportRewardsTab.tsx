import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Copy,
  Check,
  MapPin,
  Sparkles,
  Plane,
  ShieldCheck,
  Compass,
  Star,
  Luggage,
  Calendar,
  Lock
} from 'lucide-react';
import { ALL_PASSPORT_STAMPS, REWARD_PROMOS, PassportStamp, PromoCouponReward } from '../data/interactiveGameData.ts';
import { AuthAudit } from '../services/authAudit.ts';
import { PromoService } from '../services/promoService.ts';
import { WeeklyTravelChallenges } from './WeeklyTravelChallenges.tsx';

interface PassportRewardsTabProps {
  unlockedStamps: string[];
  totalScore: number;
  onUsePromo?: (code: string) => void;
  onAddXp?: (amount: number) => void;
}

export const PassportRewardsTab: React.FC<PassportRewardsTabProps> = ({
  unlockedStamps,
  totalScore,
  onUsePromo,
  onAddXp,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(() => {
    return PromoService.getActivePromo()?.code || null;
  });

  const getRank = (score: number) => {
    if (score >= 3000) return { title: 'Legendary Sky Admiral', badge: '⭐⭐⭐⭐⭐', color: 'text-amber-400', nextAt: 5000 };
    if (score >= 1800) return { title: 'Expedition Aviator', badge: '⭐⭐⭐⭐', color: 'text-sky-400', nextAt: 3000 };
    if (score >= 900) return { title: 'Senior Globetrotter', badge: '⭐⭐⭐', color: 'text-emerald-400', nextAt: 1800 };
    if (score >= 400) return { title: 'Junior Explorer', badge: '⭐⭐', color: 'text-indigo-400', nextAt: 900 };
    return { title: 'Novice Traveler', badge: '⭐', color: 'text-slate-400', nextAt: 400 };
  };

  const rank = getRank(totalScore);

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      AuthAudit.showToast({
        title: 'Voucher Copied!',
        message: `Promo code "${code}" copied to clipboard. Apply at booking checkout!`,
        type: 'success',
        duration: 3500,
      });
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  const handleUseVoucher = (code: string) => {
    PromoService.setActivePromo(code);
    setActiveCode(code);
    AuthAudit.showToast({
      title: '🎉 Voucher Activated!',
      message: `Promo code "${code}" has been applied! Discount will appear at checkout.`,
      type: 'success',
      duration: 4000,
    });
    if (onUsePromo) {
      onUsePromo(code);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white select-none overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Traveler Aviator Credential Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
          <Plane className="w-48 h-48 text-indigo-400 rotate-45" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-2xl">
              ✈️
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-400">
                Official Voyage Credentials
              </div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{rank.title}</span>
                <span className="text-xs">{rank.badge}</span>
              </h2>
              <div className="text-xs text-slate-300 mt-0.5">
                Stamps Collected: <span className="font-extrabold text-amber-400">{unlockedStamps.length}</span> / {ALL_PASSPORT_STAMPS.length}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-400 font-bold">Expedition XP</div>
              <div className="text-xl font-black text-amber-400 font-mono">{totalScore}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold">Platform Status</div>
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Pilot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar to next rank */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>Progress to Next Rank</span>
            <span>{totalScore} / {rank.nextAt} XP</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalScore / rank.nextAt) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Travel Challenges Widget */}
      <WeeklyTravelChallenges onAddXp={onAddXp || (() => {})} />

      {/* Digital Passport Visa Stamps Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-200">
            <Luggage className="w-4 h-4 text-sky-400" />
            <span>Digital Passport Book & Visa Stamps</span>
          </div>
          <span className="text-xs text-slate-400">
            Earned from Sky Flight & Geo Detective
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_PASSPORT_STAMPS.map(stamp => {
            const isUnlocked = unlockedStamps.includes(stamp.id);

            return (
              <div
                key={stamp.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-slate-700 shadow-md hover:scale-[1.02]'
                    : 'bg-slate-950/40 border-slate-900 opacity-40'
                }`}
              >
                {/* Stamp Outer Border Circle */}
                <div
                  className={`w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center mb-2.5 transition-transform ${
                    isUnlocked ? 'rotate-[-8deg]' : ''
                  }`}
                  style={{ borderColor: isUnlocked ? stamp.color : '#475569' }}
                >
                  <span className="text-xl leading-none">{isUnlocked ? stamp.flag : '🔒'}</span>
                  <span
                    className="text-[8px] font-black uppercase tracking-tighter mt-1"
                    style={{ color: isUnlocked ? stamp.color : '#64748b' }}
                  >
                    {isUnlocked ? stamp.city : 'LOCKED'}
                  </span>
                </div>

                <div className="font-extrabold text-xs text-white line-clamp-1">{stamp.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {stamp.city}, {stamp.country}
                </div>

                {isUnlocked && (
                  <div className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold">
                    STAMPED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret Unlockable Travel Promo Vouchers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Unlockable Travel Vouchers & Promo Perks</span>
          </div>
          <span className="text-xs text-slate-400">
            Real booking discounts earned by playing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {REWARD_PROMOS.map(promo => {
            const isUnlocked = totalScore >= promo.minScore || unlockedStamps.length >= 2;

            return (
              <div
                key={promo.code}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs">
                      {promo.discount}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {promo.requirement}
                      </span>
                    )}
                  </div>

                  <div className="font-mono font-black text-lg text-white tracking-wider mb-1">
                    {promo.code}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                    {promo.description}
                  </p>
                </div>

                <div className="space-y-2 mt-2">
                  {isUnlocked ? (
                    <>
                      <button
                        onClick={() => handleUseVoucher(promo.code)}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          activeCode === promo.code
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{activeCode === promo.code ? 'Active! Click to Book Now' : `Apply & Book (${promo.discount})`}</span>
                      </button>

                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
                      >
                        {copiedCode === promo.code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Code Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Code ({promo.code})</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-800"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{promo.requirement}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
