import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  Shield,
  Compass,
  Trophy,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Luggage,
  MapPin,
  Flame,
  CheckCircle2,
  X,
  Copy,
  Mountain,
  Snowflake,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { gameAudio, SONG_TRACKS } from '../utils/gameAudio.ts';

interface AlpineClimberGameProps {
  onUnlockStamp: (stampId: string) => void;
  onUpdateScore: (score: number) => void;
  highScore: number;
  onUsePromo?: (code: string) => void;
}

interface ClimbLevel {
  id: number;
  name: string;
  mountain: string;
  targetHeight: number;
  promoCode: string;
  discount: string;
  description: string;
  bgColor: string;
  badge: string;
}

const CLIMB_LEVELS: ClimbLevel[] = [
  {
    id: 1,
    name: 'Level 1: Foothills Expedition',
    mountain: 'Julian Alps Ridge',
    targetHeight: 1500,
    promoCode: 'ALPINE10',
    discount: '10% OFF',
    description: 'Ascend the lush pine slopes of the lower Julian Alps. Avoid rolling boulders and collect crystal shards.',
    bgColor: 'from-emerald-900 to-slate-950',
    badge: 'stamp_alps_1',
  },
  {
    id: 2,
    name: 'Level 2: Glacier Ridge Climb',
    mountain: 'Dinaric Ice Peak',
    targetHeight: 3000,
    promoCode: 'ALPINE20',
    discount: '20% OFF',
    description: 'Navigate treacherous ice crevasses, howling winds, and floating crystal pods at high altitude.',
    bgColor: 'from-sky-950 to-indigo-950',
    badge: 'stamp_alps_2',
  },
  {
    id: 3,
    name: 'Level 3: Summit Peak Assault',
    mountain: 'Mount Triglav Summit',
    targetHeight: 5000,
    promoCode: 'ALPINE30',
    discount: '30% OFF + VIP Upgrade',
    description: 'The ultimate summit challenge! Dodge falling icicles, collect golden eagle feathers, and plant the Voyage flag.',
    bgColor: 'from-violet-950 to-slate-950',
    badge: 'stamp_alps_3',
  },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'boulder' | 'icicle' | 'crevasse' | 'wind';
  speed: number;
}

interface Item {
  x: number;
  y: number;
  type: 'crystal' | 'feather' | 'oxygen' | 'shield';
  collected: boolean;
  angle: number;
}

export const AlpineClimberGame: React.FC<AlpineClimberGameProps> = ({
  onUnlockStamp,
  onUpdateScore,
  highScore,
  onUsePromo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [levelIndex, setLevelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // HUD stats
  const [score, setScore] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [heightMeters, setHeightMeters] = useState(0);
  const [hasShield, setHasShield] = useState(false);

  // Audio states
  const [isMusicPlaying, setIsMusicPlaying] = useState(gameAudio.isMusicPlaying());
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());

  const currentLevel: ClimbLevel = CLIMB_LEVELS[levelIndex] || CLIMB_LEVELS[0];

  const stateRef = useRef({
    climberX: 300,
    climberY: 420,
    vx: 0,
    vy: 0,
    height: 0,
    score: 0,
    stamina: 100,
    obstacles: [] as Obstacle[],
    items: [] as Item[],
    particles: [] as Particle[],
    keys: {} as Record<string, boolean>,
    hasShield: false,
    isVictory: false,
    isGameOver: false,
  });

  const handleToggleMusic = () => {
    const nextState = gameAudio.toggleMusic();
    setIsMusicPlaying(nextState);
  };

  const handleToggleMute = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  const startGame = (idx = levelIndex) => {
    setLevelIndex(idx);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsVictory(false);
    setCopiedCode(false);
    setScore(0);
    setStamina(100);
    setHeightMeters(0);
    setHasShield(false);

    stateRef.current = {
      climberX: 300,
      climberY: 420,
      vx: 0,
      vy: 0,
      height: 0,
      score: 0,
      stamina: 100,
      obstacles: [],
      items: [],
      particles: [],
      keys: {},
      hasShield: false,
      isVictory: false,
      isGameOver: false,
    };
    gameAudio.playEngineRev();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastSpawnTime = Date.now();

    const loop = () => {
      const state = stateRef.current;
      const now = Date.now();

      // Controls
      let moveX = 0;
      let climbing = true;

      if (state.keys['ArrowLeft'] || state.keys['KeyA']) moveX = -6;
      if (state.keys['ArrowRight'] || state.keys['KeyD']) moveX = 6;
      if (state.keys['ArrowUp'] || state.keys['KeyW'] || state.keys['Space']) {
        state.height += 2.5;
        setHeightMeters(Math.floor(state.height));
      }

      state.climberX += moveX;
      state.climberX = Math.max(50, Math.min(canvas.width - 50, state.climberX));

      // Continuous slow ascent
      state.height += 0.8;
      setHeightMeters(Math.floor(state.height));

      // Stamina drain & recovery
      state.stamina = Math.max(0, state.stamina - 0.02);
      setStamina(Math.floor(state.stamina));
      if (state.stamina <= 0) {
        state.isGameOver = true;
        setIsGameOver(true);
        gameAudio.playHit();
        return;
      }

      // Check Victory
      if (state.height >= currentLevel.targetHeight) {
        state.isVictory = true;
        setIsVictory(true);
        gameAudio.playVictory();
        onUnlockStamp(currentLevel.badge);
        const finalScore = Math.floor(state.score + state.height * 2);
        setScore(finalScore);
        onUpdateScore(finalScore);
        return;
      }

      // Spawn obstacles & items
      if (now - lastSpawnTime > 1200 - levelIndex * 200) {
        lastSpawnTime = now;
        const obstacleTypes: ('boulder' | 'icicle' | 'crevasse')[] = ['boulder', 'icicle', 'crevasse'];
        const chosenType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        state.obstacles.push({
          x: Math.random() * (canvas.width - 100) + 50,
          y: -40,
          width: 35,
          height: 35,
          type: chosenType,
          speed: 3 + levelIndex * 1.5,
        });

        // Spawn item
        if (Math.random() > 0.4) {
          const itemTypes: ('crystal' | 'feather' | 'oxygen' | 'shield')[] = ['crystal', 'feather', 'oxygen', 'shield'];
          state.items.push({
            x: Math.random() * (canvas.width - 80) + 40,
            y: -30,
            type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
            collected: false,
            angle: 0,
          });
        }
      }

      // Update obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.y += obs.speed;

        // Collision with climber
        const dx = obs.x - state.climberX;
        const dy = obs.y - state.climberY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 32) {
          if (state.hasShield) {
            state.hasShield = false;
            setHasShield(false);
            state.obstacles.splice(i, 1);
            gameAudio.playCoin();
          } else {
            state.stamina -= 25;
            setStamina(Math.floor(state.stamina));
            state.obstacles.splice(i, 1);
            gameAudio.playHit();
            if (state.stamina <= 0) {
              state.isGameOver = true;
              setIsGameOver(true);
              return;
            }
          }
        }

        if (obs.y > canvas.height + 50) {
          state.obstacles.splice(i, 1);
        }
      }

      // Update items
      for (let i = state.items.length - 1; i >= 0; i--) {
        const item = state.items[i];
        item.y += 2.5;
        item.angle += 0.05;

        const dx = item.x - state.climberX;
        const dy = item.y - state.climberY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 35 && !item.collected) {
          item.collected = true;
          state.items.splice(i, 1);
          gameAudio.playCoin();

          if (item.type === 'crystal') {
            state.score += 150;
            setScore(state.score);
          } else if (item.type === 'feather') {
            state.score += 300;
            setScore(state.score);
          } else if (item.type === 'oxygen') {
            state.stamina = Math.min(100, state.stamina + 30);
            setStamina(Math.floor(state.stamina));
          } else if (item.type === 'shield') {
            state.hasShield = true;
            setHasShield(true);
          }
        }

        if (item.y > canvas.height + 50) {
          state.items.splice(i, 1);
        }
      }

      // Render Scene
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mountain Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, levelIndex === 0 ? '#064e3b' : levelIndex === 1 ? '#0c4a6e' : '#2e1065');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mountain Ridge Lines (Parallax Effect)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.3);
      ctx.lineTo(canvas.width * 0.3, canvas.height * 0.15);
      ctx.lineTo(canvas.width * 0.7, canvas.height * 0.25);
      ctx.lineTo(canvas.width, canvas.height * 0.1);
      ctx.stroke();

      // Draw Climber
      ctx.save();
      ctx.translate(state.climberX, state.climberY);
      // Body (Alpine mountaineer)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -10, 14, 0, Math.PI * 2);
      ctx.fill();

      // Backpack / Gear
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-12, -4, 8, 16);

      // Ice axe
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, -15);
      ctx.lineTo(18, -25);
      ctx.stroke();

      if (state.hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Obstacles
      state.obstacles.forEach(obs => {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        if (obs.type === 'boulder') {
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (obs.type === 'icicle') {
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.lineTo(-10, 15);
          ctx.lineTo(10, 15);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-16, -16, 32, 32);
        }
        ctx.restore();
      });

      // Draw Items
      state.items.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.angle);
        if (item.type === 'crystal') {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.lineTo(10, 0);
          ctx.lineTo(0, 12);
          ctx.lineTo(-10, 0);
          ctx.closePath();
          ctx.fill();
        } else if (item.type === 'feather') {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.ellipse(0, 0, 12, 6, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'oxygen') {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-10, -10, 20, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('O2', -7, 4);
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isGameOver, isVictory, levelIndex, currentLevel]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 overflow-y-auto">
      {/* Top Banner / Level Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white tracking-tight">Alpine Peak Climber</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              {currentLevel.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{currentLevel.description}</p>
        </div>

        {/* Level Switcher Buttons */}
        <div className="flex items-center gap-2">
          {CLIMB_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              onClick={() => startGame(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                levelIndex === idx
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Lvl {lvl.id} ({lvl.discount})
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & HUD Container */}
      <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-cover"
        />

        {/* HUD overlay */}
        {isPlaying && !isGameOver && !isVictory && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold">
              <span className="text-emerald-400">Height: {heightMeters}m / {currentLevel.targetHeight}m</span>
              <span className="text-sky-400">Score: {score}</span>
              {hasShield && <span className="text-amber-400 font-black">🛡️ SHIELD ACTIVE</span>}
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold">
              <span>Stamina:</span>
              <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${stamina > 30 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}
                  style={{ width: `${Math.max(0, stamina)}%` }}
                />
              </div>
              <span className={stamina > 30 ? 'text-emerald-400' : 'text-rose-500'}>{stamina}%</span>
            </div>
          </div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !isGameOver && !isVictory && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-600 flex items-center justify-center shadow-2xl mb-4 text-white">
              <Mountain className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{currentLevel.name}</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6">{currentLevel.description}</p>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6">
              Reward for summit: <span className="text-white font-black underline">{currentLevel.promoCode}</span> ({currentLevel.discount})
            </div>
            <button
              onClick={() => startGame(levelIndex)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 text-white font-black text-sm hover:opacity-95 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Climb</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 mb-4">
              <Snowflake className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Stamina Depleted!</h3>
            <p className="text-sm text-slate-300 mb-6">You reached {heightMeters}m before tiring out on the peak.</p>
            <button
              onClick={() => startGame(levelIndex)}
              className="px-6 py-3 rounded-2xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {isVictory && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 mb-4 shadow-2xl shadow-amber-500/30">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black text-white mb-1">Summit Conquered!</h3>
            <p className="text-sm text-slate-300 mb-4">You successfully conquered {currentLevel.mountain} ({currentLevel.targetHeight}m)!</p>

            {/* Promo Code Reward Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 max-w-sm w-full mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Unlocked Level Reward</div>
              <div className="text-2xl font-black text-white font-mono tracking-wider mb-2">{currentLevel.promoCode}</div>
              <div className="text-xs text-slate-300 mb-4">Enjoy <span className="font-bold text-emerald-400">{currentLevel.discount}</span> on your next tour booking!</div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentLevel.promoCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy Promo Code'}</span>
                </button>
                {onUsePromo && (
                  <button
                    onClick={() => onUsePromo(currentLevel.promoCode)}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Apply to Booking
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => startGame(levelIndex)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
              {levelIndex < CLIMB_LEVELS.length - 1 && (
                <button
                  onClick={() => startGame(levelIndex + 1)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <span>Next Level ({CLIMB_LEVELS[levelIndex + 1].name})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions / Controls Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <span>Controls: <strong className="text-white">← / →</strong> or <strong className="text-white">A / D</strong> to Move</span>
          <span>Ascend: <strong className="text-white">↑ / W / Space</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMusic}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${isMusicPlaying ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400'}`}
          >
            {isMusicPlaying ? '🎵 BGM On' : '🔇 BGM Off'}
          </button>
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
