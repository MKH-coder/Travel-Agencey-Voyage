import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  Sparkles,
  ChevronRight,
  Eye,
  RotateCcw,
  MapPin,
  HelpCircle,
  Lightbulb,
  Copy
} from 'lucide-react';
import { GEO_TRIVIA_QUESTIONS, GeoTriviaQuestion } from '../data/interactiveGameData.ts';
import { gameAudio } from '../utils/gameAudio.ts';
import { PromoService } from '../services/promoService.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface GeoDetectiveGameProps {
  onUnlockStamp: (stampId: string) => void;
  onUpdateScore: (score: number) => void;
  onUsePromo?: (code: string) => void;
}

export const GeoDetectiveGame: React.FC<GeoDetectiveGameProps> = ({
  onUnlockStamp,
  onUpdateScore,
  onUsePromo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentQ: GeoTriviaQuestion = GEO_TRIVIA_QUESTIONS[currentIndex] || GEO_TRIVIA_QUESTIONS[0];

  const handleRevealClue = () => {
    if (revealedClues < 3) {
      setRevealedClues(prev => prev + 1);
      gameAudio.playSuitcase();
    }
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      // Calculate points: 300 pts if 1 clue used, 200 pts if 2 clues, 100 pts if 3 clues, plus streak bonus!
      const clueMultiplier = revealedClues === 1 ? 300 : revealedClues === 2 ? 200 : 100;
      const pointsEarned = clueMultiplier + streak * 50;

      const newScore = score + pointsEarned;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      onUpdateScore(newScore);
      onUnlockStamp(currentQ.stampId);
      gameAudio.playCorrect();
    } else {
      setStreak(0);
      gameAudio.playHit();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < GEO_TRIVIA_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setRevealedClues(1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setGameCompleted(true);
      gameAudio.playVictory();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setRevealedClues(1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setStreak(0);
    setScore(0);
    setGameCompleted(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white select-none overflow-y-auto">
      {/* Top Detective Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <span>Geo Detective</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {currentIndex + 1} of {GEO_TRIVIA_QUESTIONS.length}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Inspect clues and identify the secret world location
            </div>
          </div>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">Streak</div>
            <div className="font-extrabold text-sm text-amber-400 flex items-center justify-end gap-1">
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          </div>
          <div className="text-right min-w-[70px]">
            <div className="text-[10px] text-slate-400 font-medium">Detective Score</div>
            <div className="font-extrabold text-base text-sky-400 font-mono">
              {score}
            </div>
          </div>
        </div>
      </div>

      {!gameCompleted ? (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Left Column: Photograph Inspection */}
          <div className="space-y-3">
            <div className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src={currentQ.image}
                alt={currentQ.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Mystery Landmark #{currentIndex + 1}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xs font-bold text-slate-300">Case Title:</div>
                <div className="text-lg font-black text-white">{currentQ.title}</div>
              </div>
            </div>

            {/* Clue Inspector */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  <span>Field Intelligence & Clues</span>
                </div>
                {revealedClues < 3 && !isAnswered && (
                  <button
                    onClick={handleRevealClue}
                    className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                  >
                    Reveal Next Clue ({revealedClues}/3)
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {currentQ.clues.map((clue, idx) => {
                  const isUnlocked = idx < revealedClues;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                        isUnlocked
                          ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 blur-[3px] select-none'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-[10px] text-amber-500 mt-0.5">
                          #{idx + 1}
                        </span>
                        <span>{isUnlocked ? clue : 'Secret clue classified until requested...'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Destination Options */}
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">
                Pinpoint the Location
              </div>
              <h3 className="text-xl font-black text-white">
                Where in the world was this captured?
              </h3>
            </div>

            {/* Option Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQ.correctAnswer;

                let cardStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-sky-500 hover:bg-slate-850';

                if (isAnswered) {
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    cardStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono text-slate-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fun Fact & Resolution Card */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-700 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  {selectedAnswer === currentQ.correctAnswer ? (
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>Bullseye! +{revealedClues === 1 ? 300 : revealedClues === 2 ? 200 : 100} pts</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold text-xs flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect! The answer is {currentQ.correctAnswer}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 ml-auto font-medium">
                    Visa Stamp Unlocked!
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="font-bold text-amber-400">Voyage Insider Lore: </span>
                  {currentQ.funFact}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                >
                  <span>{currentIndex + 1 < GEO_TRIVIA_QUESTIONS.length ? 'Next Mystery Case' : 'View Final Expedition Debrief'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Final Debrief / Completion Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-4 animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-amber-400 mb-1">
            Expedition Debrief Complete
          </div>
          <h2 className="text-2xl font-black mb-2">Master Albania Detective!</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            You solved Albania's iconic landmarks across the Ionian Riviera, UNESCO Ottoman Citadels, and the Accursed Alps. Your passport is stamped with official Albanian honors!
          </p>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full mb-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Final Score</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{score} pts</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Cases Solved</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {GEO_TRIVIA_QUESTIONS.length} / {GEO_TRIVIA_QUESTIONS.length}
              </div>
            </div>
          </div>

          {/* Detective Offer Card */}
          <div className="w-full bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 p-4 rounded-2xl border-2 border-amber-500/50 shadow-xl mb-5 text-left relative overflow-hidden">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detective Mastery Offer Unlocked!</span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <div className="font-mono font-black text-lg text-white tracking-wider">
                  GEODETECTIVE-PERK
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  15% OFF Any Cultural Mystery Experience
                </div>
              </div>
              <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-base shrink-0">
                15% OFF
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800">
              <button
                onClick={() => {
                  PromoService.setActivePromo('GEODETECTIVE-PERK');
                  AuthAudit.showToast({
                    title: '🎉 Offer Activated!',
                    message: 'Detective voucher GEODETECTIVE-PERK (15% OFF) applied! Discount active at checkout.',
                    type: 'success',
                    duration: 4000,
                  });
                  if (onUsePromo) onUsePromo('GEODETECTIVE-PERK');
                }}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Redeem & Book Now</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText('GEODETECTIVE-PERK');
                    setCopiedCode(true);
                    AuthAudit.showToast({
                      title: 'Code Copied!',
                      message: 'Promo code "GEODETECTIVE-PERK" copied to clipboard!',
                      type: 'success',
                    });
                    setTimeout(() => setCopiedCode(false), 3000);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Offer Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Cases Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
