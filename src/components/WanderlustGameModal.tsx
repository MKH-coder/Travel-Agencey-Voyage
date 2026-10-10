import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  Plane,
  Luggage,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  Award,
  Gauge
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { SkyExpeditionGame } from './SkyExpeditionGame.tsx';
import { BalkanCoastalRallyGame } from './BalkanCoastalRallyGame.tsx';
import { GeoDetectiveGame } from './GeoDetectiveGame.tsx';
import { PassportRewardsTab } from './PassportRewardsTab.tsx';
import { gameAudio } from '../utils/gameAudio.ts';

interface WanderlustGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePromo?: (code: string) => void;
}

const STORAGE_KEY_PROGRESS = 'voyage_interactive_game_progress_v2';

export const WanderlustGameModal: React.FC<WanderlustGameModalProps> = ({ isOpen, onClose, onUsePromo }) => {
  const { styles } = useTheme();

  const [activeTab, setActiveTab] = useState<'flight' | 'rally' | 'detective' | 'passport'>('flight');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [unlockedStamps, setUnlockedStamps] = useState<string[]>(['stamp_ksamil']);
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.totalScore) setTotalScore(parsed.totalScore);
        if (parsed.highScore) setHighScore(parsed.highScore);
        if (Array.isArray(parsed.unlockedStamps)) setUnlockedStamps(parsed.unlockedStamps);
      }
    } catch (e) {
      console.warn('Failed to load game progress:', e);
    }
  }, []);

  // Save progress
  const saveProgress = (newScore: number, stamps: string[], bestScore: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PROGRESS,
        JSON.stringify({
          totalScore: newScore,
          highScore: bestScore,
          unlockedStamps: stamps,
        })
      );
    } catch (e) {
      console.warn('Failed to save game progress:', e);
    }
  };

  const handleUnlockStamp = (stampId: string) => {
    if (!unlockedStamps.includes(stampId)) {
      const nextStamps = [...unlockedStamps, stampId];
      setUnlockedStamps(nextStamps);
      saveProgress(totalScore, nextStamps, highScore);
    }
  };

  const handleUpdateScore = (additionalOrNewScore: number) => {
    const updatedTotal = Math.max(totalScore, additionalOrNewScore);
    const updatedHigh = Math.max(highScore, additionalOrNewScore);
    setTotalScore(updatedTotal);
    setHighScore(updatedHigh);
    saveProgress(updatedTotal, unlockedStamps, updatedHigh);
  };

  const handleToggleMute = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[780px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Navigation Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight">
                  Voyage Globetrotter
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-wider">
                  Expedition Suite
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Interactive Flight Arcade, Balkan Coastal Rally & Cultural Geo Mystery
              </div>
            </div>
          </div>

          {/* Center Tabs: Flight / Rally / Detective / Passport */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('flight')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'flight'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Sky Expedition</span>
            </button>

            <button
              onClick={() => setActiveTab('rally')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'rally'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Coastal Rally</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black animate-pulse">
                NEW
              </span>
            </button>

            <button
              onClick={() => setActiveTab('detective')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'detective'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Geo Detective</span>
            </button>

            <button
              onClick={() => setActiveTab('passport')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'passport'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Luggage className="w-3.5 h-3.5" />
              <span>Passport & Perks</span>
              {unlockedStamps.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 font-extrabold">
                  {unlockedStamps.length}
                </span>
              )}
            </button>
          </div>

          {/* Action Buttons: Audio Mute & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Game"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'flight' && (
            <SkyExpeditionGame
              onUnlockStamp={handleUnlockStamp}
              onUpdateScore={handleUpdateScore}
              highScore={highScore}
              onUsePromo={(code) => {
                onUsePromo?.(code);
                onClose();
              }}
            />
          )}

          {activeTab === 'rally' && (
            <BalkanCoastalRallyGame
              onUnlockStamp={handleUnlockStamp}
              onUpdateScore={handleUpdateScore}
              highScore={highScore}
              onUsePromo={(code) => {
                onUsePromo?.(code);
                onClose();
              }}
            />
          )}

          {activeTab === 'detective' && (
            <GeoDetectiveGame
              onUnlockStamp={handleUnlockStamp}
              onUpdateScore={handleUpdateScore}
              onUsePromo={(code) => {
                onUsePromo?.(code);
                onClose();
              }}
            />
          )}

          {activeTab === 'passport' && (
            <PassportRewardsTab
              unlockedStamps={unlockedStamps}
              totalScore={totalScore}
              onUsePromo={(code) => {
                onUsePromo?.(code);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
