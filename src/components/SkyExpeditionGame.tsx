import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Compass,
  Trophy,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Award,
  Luggage,
  MapPin,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  X,
  Copy,
  Music
} from 'lucide-react';
import { gameAudio, SONG_TRACKS } from '../utils/gameAudio.ts';
import { FLIGHT_LEVELS, FlightLevel, GAME_DIFFICULTIES, GameDifficulty } from '../data/interactiveGameData.ts';
import { PromoService } from '../services/promoService.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface SkyExpeditionGameProps {
  onUnlockStamp: (stampId: string) => void;
  onUpdateScore: (score: number) => void;
  highScore: number;
  onUsePromo?: (code: string) => void;
}

interface SpeedRing {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulse: number;
}

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

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface CollectibleItem {
  x: number;
  y: number;
  type: 'coin' | 'suitcase' | 'fuel' | 'star' | 'shield' | 'magnet' | 'turbo' | 'eagle' | 'pearl';
  radius: number;
  collected: boolean;
  angle: number;
}

interface ObstacleItem {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'storm' | 'balloon' | 'bird';
  speedX: number;
  speedY: number;
  phase: number;
  nearMissed?: boolean;
}

interface AmbientParticle {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export const SkyExpeditionGame: React.FC<SkyExpeditionGameProps> = ({
  onUnlockStamp,
  onUpdateScore,
  highScore,
  onUsePromo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Level & state
  const [levelIndex, setLevelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [copiedVictoryCode, setCopiedVictoryCode] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [distance, setDistance] = useState(0);
  const [combo, setCombo] = useState(1);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasTurbo, setHasTurbo] = useState(false);
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());
  const [isMusicPlaying, setIsMusicPlaying] = useState(gameAudio.isMusicPlaying());
  const [musicTrackIdx, setMusicTrackIdx] = useState(gameAudio.getMusicTrack());
  const [sonicCharges, setSonicCharges] = useState(3);

  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('easy');
  const [claimedCoupons, setClaimedCoupons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('voyage_flight_claimed_coupons');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentLevel: FlightLevel = FLIGHT_LEVELS[levelIndex] || FLIGHT_LEVELS[0];
  const diffConfig = GAME_DIFFICULTIES[selectedDifficulty] || GAME_DIFFICULTIES.easy;
  const currentReward = currentLevel.difficultyRewards[selectedDifficulty] || currentLevel.difficultyRewards.easy;
  const couponKey = `${currentLevel.id}_${selectedDifficulty}`;
  const isCouponClaimed = !!claimedCoupons[couponKey];

  // Game loop internal mutable references for high performance (60fps)
  const stateRef = useRef({
    score: 0,
    fuel: 100,
    distance: 0,
    combo: 1,
    comboTimer: 0,
    hasShield: false,
    magnetTimer: 0,
    turboTimer: 0,
    sonicCharges: 3,
    shockwave: null as { x: number; y: number; radius: number; maxRadius: number; alpha: number } | null,
    playerX: 120,
    playerY: 200,
    targetY: 200,
    targetX: 120,
    playerVy: 0,
    playerAngle: 0,
    propellerAngle: 0,
    collectibles: [] as CollectibleItem[],
    obstacles: [] as ObstacleItem[],
    speedRings: [] as SpeedRing[],
    particles: [] as Particle[],
    ambientParticles: [] as AmbientParticle[],
    floatingTexts: [] as FloatingText[],
    clouds: [] as { x: number; y: number; speed: number; scale: number; opacity: number }[],
    keys: {} as Record<string, boolean>,
    isVictory: false,
    isGameOver: false,
  });

  // Initialize background clouds & ambient particles for current level
  useEffect(() => {
    const clouds = [];
    for (let i = 0; i < 15; i++) {
      clouds.push({
        x: Math.random() * 900,
        y: Math.random() * 240 + 20,
        speed: 0.3 + Math.random() * 0.7,
        scale: 0.6 + Math.random() * 0.8,
        opacity: 0.25 + Math.random() * 0.45,
      });
    }
    stateRef.current.clouds = clouds;

    // Ambient floating atmospheric particles
    const ambients: AmbientParticle[] = [];
    for (let i = 0; i < 28; i++) {
      let color = 'rgba(255, 255, 255, 0.6)';
      let size = 2 + Math.random() * 3;
      if (currentLevel.ambientEffect === 'sakura') {
        color = 'rgba(251, 207, 232, 0.75)';
        size = 3.5 + Math.random() * 3;
      } else if (currentLevel.ambientEffect === 'sea_spray') {
        color = 'rgba(165, 243, 252, 0.8)';
        size = 2.5 + Math.random() * 3;
      } else if (currentLevel.ambientEffect === 'sand') {
        color = 'rgba(254, 215, 170, 0.7)';
        size = 2 + Math.random() * 2.5;
      }
      ambients.push({
        x: Math.random() * 850,
        y: Math.random() * 380,
        speedX: 1 + Math.random() * 2,
        speedY: (Math.random() - 0.5) * 0.8,
        size,
        color,
        opacity: 0.4 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      });
    }
    stateRef.current.ambientParticles = ambients;
  }, [currentLevel]);

  const handleToggleMute = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
    setIsMusicPlaying(gameAudio.isMusicPlaying());
  };

  const handleToggleMusic = () => {
    const next = gameAudio.toggleMusic();
    setIsMusicPlaying(next);
  };

  const handleChangeTrack = () => {
    const nextTrack = (musicTrackIdx + 1) % SONG_TRACKS.length;
    gameAudio.setMusicTrack(nextTrack);
    setMusicTrackIdx(nextTrack);
    if (!gameAudio.isMusicPlaying()) {
      gameAudio.startMusic(nextTrack);
      setIsMusicPlaying(true);
    }
    AuthAudit.showToast({
      title: `🎵 ${SONG_TRACKS[nextTrack].name}`,
      message: `${SONG_TRACKS[nextTrack].genre} (${SONG_TRACKS[nextTrack].bpm} BPM)`,
      type: 'info',
      duration: 2500,
    });
  };

  // Sonic blast cloud buster trigger
  const triggerSonicBlast = useCallback(() => {
    const st = stateRef.current;
    if (st.sonicCharges <= 0 || !isPlaying || st.isGameOver || st.isVictory) return;
    st.sonicCharges--;
    setSonicCharges(st.sonicCharges);
    gameAudio.playSonicBlast();

    st.shockwave = {
      x: st.playerX,
      y: st.playerY,
      radius: 12,
      maxRadius: 280,
      alpha: 1.0,
    };

    let cleared = 0;
    st.obstacles = st.obstacles.filter(obs => {
      const dist = Math.hypot(obs.x - st.playerX, obs.y - st.playerY);
      if (dist < 260) {
        cleared++;
        for (let p = 0; p < 8; p++) {
          st.particles.push({
            x: obs.x,
            y: obs.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 3 + Math.random() * 3,
            color: '#38bdf8',
            alpha: 1,
            life: 0,
            maxLife: 20,
          });
        }
        return false;
      }
      return true;
    });

    const pts = 100 + cleared * 50;
    st.score += pts;
    setScore(st.score);
    onUpdateScore(st.score);
    st.floatingTexts.push({
      x: st.playerX,
      y: st.playerY - 25,
      text: `⚡ SONIC BLAST! +${pts}`,
      color: '#38bdf8',
      alpha: 1,
      vy: -1.6,
    });
  }, [isPlaying, onUpdateScore]);

  // Start / restart flight
  const startGame = useCallback((lvlIdx = levelIndex) => {
    setLevelIndex(lvlIdx);
    setShowStageModal(false);
    const st = stateRef.current;
    st.score = 0;
    st.fuel = 100;
    st.distance = 0;
    st.combo = 1;
    st.comboTimer = 0;
    st.hasShield = false;
    st.magnetTimer = 0;
    st.turboTimer = 0;
    st.sonicCharges = 3;
    st.shockwave = null;
    st.playerX = 120;
    st.playerY = 180;
    st.targetY = 180;
    st.targetX = 120;
    st.playerVy = 0;
    st.playerAngle = 0;
    st.collectibles = [];
    st.obstacles = [];
    st.speedRings = [];
    st.particles = [];
    st.floatingTexts = [];
    st.isVictory = false;
    st.isGameOver = false;
    setCopiedVictoryCode(false);

    setScore(0);
    setFuel(100);
    setDistance(0);
    setCombo(1);
    setSonicCharges(3);
    setHasShield(false);
    setHasMagnet(false);
    setHasTurbo(false);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPlaying(true);

    // Start background song
    gameAudio.startMusic(musicTrackIdx);
    setIsMusicPlaying(true);
  }, [levelIndex, musicTrackIdx]);

  // Next level
  const handleNextLevel = () => {
    const nextIdx = (levelIndex + 1) % FLIGHT_LEVELS.length;
    startGame(nextIdx);
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyB'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space' && isPlaying && !stateRef.current.isGameOver && !stateRef.current.isVictory) {
        if (stateRef.current.fuel > 15 && stateRef.current.turboTimer <= 0) {
          stateRef.current.turboTimer = 90;
          stateRef.current.fuel = Math.max(0, stateRef.current.fuel - 10);
          gameAudio.playBoost();
          gameAudio.setTempoBoost(true);
        }
      }
      if ((e.code === 'KeyB' || e.code === 'KeyE') && isPlaying) {
        triggerSonicBlast();
      }
      if (e.code === 'KeyM') {
        handleChangeTrack();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying, triggerSonicBlast]);

  // Pointer / Touch tracking on canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isPlaying) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    stateRef.current.targetX = Math.max(80, Math.min(canvasRef.current.width - 100, x));
    stateRef.current.targetY = Math.max(40, Math.min(canvasRef.current.height - 60, y));
  };

  // Main 60fps Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnTimer = { collectible: 0, obstacle: 0, speedRing: 0 };

    const loop = () => {
      const st = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Handle Keyboard input
      const speed = st.turboTimer > 0 ? 8 : 5;
      if (st.keys['ArrowUp'] || st.keys['KeyW']) st.targetY -= speed;
      if (st.keys['ArrowDown'] || st.keys['KeyS']) st.targetY += speed;
      if (st.keys['ArrowLeft'] || st.keys['KeyA']) st.targetX -= speed;
      if (st.keys['ArrowRight'] || st.keys['KeyD']) st.targetX += speed;

      st.targetX = Math.max(70, Math.min(width - 80, st.targetX));
      st.targetY = Math.max(35, Math.min(height - 45, st.targetY));

      // Update Plane Position (Smooth Spring Lerp)
      if (isPlaying && !st.isGameOver) {
        const dy = st.targetY - st.playerY;
        const dx = st.targetX - st.playerX;
        st.playerVy = dy * 0.12;
        st.playerY += st.playerVy;
        st.playerX += dx * 0.08;

        const targetAngle = Math.max(-0.35, Math.min(0.35, st.playerVy * 0.04));
        st.playerAngle += (targetAngle - st.playerAngle) * 0.2;
        st.propellerAngle += 0.45;

        // Progress distance
        const flightSpeed = (st.turboTimer > 0 ? 7 : 3.0) * diffConfig.speedMultiplier;
        st.distance += flightSpeed;
        setDistance(Math.floor(st.distance));

        // Fuel consumption
        const fuelConsumption = (st.turboTimer > 0 ? 0.05 : 0.015) * diffConfig.fuelDrainMultiplier;
        st.fuel = Math.max(0, st.fuel - fuelConsumption);
        setFuel(Math.round(st.fuel));

        // Power-up timers
        if (st.magnetTimer > 0) {
          st.magnetTimer--;
          if (st.magnetTimer === 0) setHasMagnet(false);
        }
        if (st.turboTimer > 0) {
          st.turboTimer--;
          if (st.turboTimer === 0) {
            setHasTurbo(false);
            gameAudio.setTempoBoost(false);
          }
        }

        // Combo decay
        if (st.comboTimer > 0) {
          st.comboTimer--;
          if (st.comboTimer === 0) {
            st.combo = 1;
            setCombo(1);
          }
        }

        // Check Victory
        const diffMultiplier = selectedDifficulty === 'easy' ? 2.5 : selectedDifficulty === 'hard' ? 4.0 : 6.0;
        const targetDist = currentLevel.distanceTarget * diffMultiplier;
        if (st.distance >= targetDist && !st.isVictory) {
          st.isVictory = true;
          setIsVictory(true);
          setIsPlaying(false);
          gameAudio.playVictory();
          gameAudio.stopMusic();
          setIsMusicPlaying(false);

          const stampMap: Record<string, string> = {
            lvl_albania_riviera: 'stamp_ksamil',
            lvl_albania_alps: 'stamp_berat',
            lvl_amalfi: 'stamp_amalfi',
            lvl_tokyo: 'stamp_tokyo',
            lvl_paris: 'stamp_paris',
            lvl_cairo: 'stamp_cairo',
          };
          const stampToUnlock = stampMap[currentLevel.id] || 'stamp_ksamil';
          onUnlockStamp(stampToUnlock);
        }

        // Check Out of Fuel
        if (st.fuel <= 0 && !st.isGameOver) {
          st.isGameOver = true;
          setIsGameOver(true);
          setIsPlaying(false);
          gameAudio.playHit();
          gameAudio.stopMusic();
          setIsMusicPlaying(false);
        }

        // Spawn Collectibles
        spawnTimer.collectible++;
        if (spawnTimer.collectible > (st.turboTimer > 0 ? 25 : 42)) {
          spawnTimer.collectible = 0;
          const rand = Math.random();
          let type: CollectibleItem['type'] = 'coin';
          let radius = 14;

          const isAlbanianStage = currentLevel.country === 'Albania';

          if (isAlbanianStage && rand < 0.22) {
            type = 'eagle'; // Albanian Double-Headed Golden Eagle Crest
            radius = 18;
          } else if (isAlbanianStage && rand < 0.35) {
            type = 'pearl'; // Ksamil Sea Pearl
            radius = 15;
          } else if (rand < 0.55) {
            type = 'coin';
            radius = 12;
          } else if (rand < 0.72) {
            type = 'suitcase';
            radius = 16;
          } else if (rand < 0.85) {
            type = 'fuel';
            radius = 15;
          } else if (rand < 0.92) {
            type = 'star';
            radius = 16;
          } else if (rand < 0.96) {
            type = 'shield';
            radius = 15;
          } else if (rand < 0.985) {
            type = 'magnet';
            radius = 15;
          } else {
            type = 'turbo';
            radius = 15;
          }

          st.collectibles.push({
            x: width + 30,
            y: 50 + Math.random() * (height - 110),
            type,
            radius,
            collected: false,
            angle: 0,
          });
        }

        // Spawn Obstacles
        spawnTimer.obstacle++;
        if (spawnTimer.obstacle > (st.turboTimer > 0 ? 50 : 80)) {
          spawnTimer.obstacle = 0;
          const obsRand = Math.random();
          if (obsRand < 0.65) {
            st.obstacles.push({
              x: width + 50,
              y: 40 + Math.random() * (height - 120),
              width: 60 + Math.random() * 35,
              height: 40 + Math.random() * 25,
              type: 'storm',
              speedX: 2.6 + Math.random() * 1.5,
              speedY: (Math.random() - 0.5) * 0.8,
              phase: Math.random() * Math.PI,
            });
          } else {
            st.obstacles.push({
              x: width + 40,
              y: 60 + Math.random() * (height - 140),
              width: 38,
              height: 48,
              type: 'balloon',
              speedX: 2.0 + Math.random() * 1.0,
              speedY: Math.sin(Math.random() * 5) * 0.5,
              phase: Math.random() * Math.PI,
            });
          }
        }

        // Spawn Aerodynamic Speed Boost Rings
        spawnTimer.speedRing++;
        if (spawnTimer.speedRing > (st.turboTimer > 0 ? 110 : 150)) {
          spawnTimer.speedRing = 0;
          st.speedRings.push({
            x: width + 45,
            y: 60 + Math.random() * (height - 120),
            radius: 28,
            collected: false,
            pulse: 0,
          });
        }

        // Emit aircraft contrail / engine smoke particles
        if (Math.random() < 0.85) {
          st.particles.push({
            x: st.playerX - 25,
            y: st.playerY + 2 + (Math.random() - 0.5) * 6,
            vx: -3 - Math.random() * 2,
            vy: (Math.random() - 0.5) * 0.8,
            size: st.turboTimer > 0 ? 5.5 : 3.5,
            color: st.turboTimer > 0 ? '#38bdf8' : '#ffffff',
            alpha: 0.7,
            life: 0,
            maxLife: st.turboTimer > 0 ? 30 : 22,
          });
        }
      }

      // Update Ambient Atmospheric Particles
      st.ambientParticles.forEach(amb => {
        if (isPlaying) {
          amb.x -= amb.speedX + (st.turboTimer > 0 ? 3 : 1);
          amb.y += amb.speedY;
          amb.rotation += amb.rotationSpeed;
          if (amb.x < -30) {
            amb.x = width + 20;
            amb.y = Math.random() * (height - 50);
          }
        }
      });

      // 1. Sky Gradient & Celestial Glow
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, currentLevel.skyGradient[0]);
      skyGrad.addColorStop(1, currentLevel.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun or Celestial Lens Flare
      const sunX = width - 140;
      const sunY = 70;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 110);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.5)');
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 110, 0, Math.PI * 2);
      ctx.fill();

      // 2. Parallax Mountain Ridge Silhouettes
      ctx.fillStyle = currentLevel.mountainColor;
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      ctx.moveTo(0, height - 30);
      const mOffset = (st.distance * 0.25) % 300;
      for (let x = -mOffset; x < width + 300; x += 150) {
        ctx.lineTo(x + 75, height - 120);
        ctx.lineTo(x + 150, height - 30);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // 3. Iconic Landmark Silhouette in distance (approaches as distance grows)
      const progressRatio = Math.min(1, st.distance / currentLevel.distanceTarget);
      const landmarkX = width - 180 + (1 - progressRatio) * 400;
      if (landmarkX < width + 120) {
        ctx.fillStyle = currentLevel.mountainColor;
        ctx.globalAlpha = 0.6 + progressRatio * 0.4;
        drawLandmark(ctx, currentLevel.landmarkSilhouette, landmarkX, height - 38, 75 + progressRatio * 35, currentLevel.country);
      }

      // 4. Ground/Ocean Horizon
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = currentLevel.groundColor;
      ctx.fillRect(0, height - 32, width, 32);

      // Water waves / shimmering ripples
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.5;
      const waveOffset = (st.distance * 0.85) % 60;
      for (let x = -waveOffset; x < width; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, height - 20);
        ctx.lineTo(x + 28, height - 20);
        ctx.stroke();
      }

      // 5. Drifting Clouds
      st.clouds.forEach(cloud => {
        if (isPlaying) {
          cloud.x -= cloud.speed + (st.turboTimer > 0 ? 3 : 1);
          if (cloud.x < -120) {
            cloud.x = width + 60;
            cloud.y = Math.random() * (height - 120) + 15;
          }
        }
        drawCloud(ctx, cloud.x, cloud.y, cloud.scale, cloud.opacity);
      });

      // 6. Draw Ambient Atmospheric Particles (Sea spray in Ionian Riviera, Mountain sparkles in Accursed Alps)
      st.ambientParticles.forEach(amb => {
        ctx.save();
        ctx.globalAlpha = amb.opacity;
        ctx.fillStyle = amb.color;
        ctx.translate(amb.x, amb.y);
        ctx.rotate(amb.rotation);
        if (currentLevel.ambientEffect === 'sea_spray') {
          // Sakura Petal
          ctx.beginPath();
          ctx.ellipse(0, 0, amb.size * 1.5, amb.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, amb.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Update & Draw Collectibles
      for (let i = st.collectibles.length - 1; i >= 0; i--) {
        const item = st.collectibles[i];
        if (isPlaying) {
          const moveSpeed = st.turboTimer > 0 ? 7 : 4;
          item.x -= moveSpeed;
          item.angle += 0.05;

          if (st.magnetTimer > 0) {
            const dx = st.playerX - item.x;
            const dy = st.playerY - item.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 240) {
              item.x += (dx / dist) * 7.8;
              item.y += (dy / dist) * 7.8;
            }
          }

          const distToPlayer = Math.hypot(st.playerX - item.x, st.playerY - item.y);
          if (distToPlayer < item.radius + 22) {
            item.collected = true;
            st.collectibles.splice(i, 1);

            let points = 10;
            if (item.type === 'eagle') {
              points = 250 * st.combo;
              st.score += points;
              gameAudio.playEagle();
              addFloater(st, item.x, item.y, `🇦🇱 ALBANIAN EAGLE +${points}!`, '#ef4444');
            } else if (item.type === 'pearl') {
              points = 150 * st.combo;
              st.score += points;
              gameAudio.playPowerup();
              addFloater(st, item.x, item.y, `KSAMIL PEARL +${points}!`, '#38bdf8');
            } else if (item.type === 'coin') {
              points = 10 * st.combo;
              st.score += points;
              st.combo = Math.min(5, st.combo + 1);
              st.comboTimer = 180;
              gameAudio.playCoin();
              addFloater(st, item.x, item.y, `+${points}`, '#fbbf24');
            } else if (item.type === 'suitcase') {
              points = 50 * st.combo;
              st.score += points;
              gameAudio.playSuitcase();
              addFloater(st, item.x, item.y, `SOUVENIR +${points}`, '#38bdf8');
            } else if (item.type === 'fuel') {
              st.fuel = Math.min(100, st.fuel + 35);
              setFuel(Math.round(st.fuel));
              gameAudio.playFuel();
              addFloater(st, item.x, item.y, '+35% FUEL', '#4ade80');
            } else if (item.type === 'star') {
              points = 100 * st.combo;
              st.score += points;
              gameAudio.playPowerup();
              addFloater(st, item.x, item.y, `STAR +${points}`, '#f43f5e');
            } else if (item.type === 'shield') {
              st.hasShield = true;
              setHasShield(true);
              gameAudio.playPowerup();
              addFloater(st, item.x, item.y, 'SHIELD ARMED!', '#06b6d4');
            } else if (item.type === 'magnet') {
              st.magnetTimer = 360;
              setHasMagnet(true);
              gameAudio.playPowerup();
              addFloater(st, item.x, item.y, 'MAGNET ACTIVE!', '#eab308');
            } else if (item.type === 'turbo') {
              st.turboTimer = 180;
              setHasTurbo(true);
              gameAudio.playBoost();
              addFloater(st, item.x, item.y, 'SUPER TURBO!', '#ec4899');
            }

            setScore(st.score);
            setCombo(st.combo);
            onUpdateScore(st.score);
            continue;
          }

          if (item.x < -40) {
            st.collectibles.splice(i, 1);
            continue;
          }
        }
        drawCollectible(ctx, item);
      }

      // Update & Draw Obstacles
      for (let i = st.obstacles.length - 1; i >= 0; i--) {
        const obs = st.obstacles[i];
        if (isPlaying) {
          obs.x -= obs.speedX + (st.turboTimer > 0 ? 4 : 0);
          obs.y += obs.speedY;
          obs.phase += 0.04;

          const dx = Math.abs(st.playerX - obs.x);
          const dy = Math.abs(st.playerY - obs.y);
          const hitDistance = (obs.width / 2) + 16;

          if (dx < hitDistance && dy < (obs.height / 2) + 12 && !st.isGameOver) {
            if (st.turboTimer > 0) {
              for (let p = 0; p < 12; p++) {
                st.particles.push({
                  x: obs.x,
                  y: obs.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  size: 4 + Math.random() * 3,
                  color: '#fbbf24',
                  alpha: 1,
                  life: 0,
                  maxLife: 20,
                });
              }
              st.obstacles.splice(i, 1);
              gameAudio.playPowerup();
              addFloater(st, obs.x, obs.y, 'BLASTED!', '#ec4899');
              continue;
            }

            if (st.hasShield) {
              st.hasShield = false;
              setHasShield(false);
              gameAudio.playPowerup();
              st.obstacles.splice(i, 1);
              addFloater(st, st.playerX, st.playerY, 'SHIELD SAVED YOU!', '#38bdf8');
              continue;
            }

            st.fuel = Math.max(0, st.fuel - 25);
            st.combo = 1;
            setCombo(1);
            setFuel(Math.round(st.fuel));
            gameAudio.playHit();
            addFloater(st, st.playerX, st.playerY, '-25% FUEL TURBULENCE!', '#ef4444');

            for (let p = 0; p < 14; p++) {
              st.particles.push({
                x: st.playerX,
                y: st.playerY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: 3 + Math.random() * 4,
                color: '#f87171',
                alpha: 1,
                life: 0,
                maxLife: 25,
              });
            }

            st.obstacles.splice(i, 1);
            if (st.fuel <= 0) {
              st.isGameOver = true;
              setIsGameOver(true);
              setIsPlaying(false);
            }
            continue;
          }

          if (obs.x < -80) {
            st.obstacles.splice(i, 1);
            continue;
          }
        }
        drawObstacle(ctx, obs);
      }

      // Update & Draw Speed Boost Rings
      for (let i = st.speedRings.length - 1; i >= 0; i--) {
        const ring = st.speedRings[i];
        if (isPlaying) {
          const moveSpeed = st.turboTimer > 0 ? 8 : 4.5;
          ring.x -= moveSpeed;
          ring.pulse += 0.08;

          const distToPlayer = Math.hypot(st.playerX - ring.x, st.playerY - ring.y);
          if (distToPlayer < ring.radius + 14 && !ring.collected) {
            ring.collected = true;
            st.speedRings.splice(i, 1);
            st.turboTimer = 110;
            setHasTurbo(true);
            const points = 50 * st.combo;
            st.score += points;
            st.fuel = Math.min(100, st.fuel + 15);
            setScore(st.score);
            setFuel(Math.round(st.fuel));
            gameAudio.playBoost();
            addFloater(st, ring.x, ring.y, `⚡ RING BOOST! +${points}`, '#38bdf8');

            for (let p = 0; p < 14; p++) {
              st.particles.push({
                x: ring.x,
                y: ring.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: 4 + Math.random() * 3,
                color: '#38bdf8',
                alpha: 1,
                life: 0,
                maxLife: 25,
              });
            }
            continue;
          }

          if (ring.x < -60) {
            st.speedRings.splice(i, 1);
            continue;
          }
        }
        drawSpeedRing(ctx, ring);
      }

      // Update & Draw Contrail Particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - (p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          st.particles.splice(i, 1);
        }
      }

      // Update & Draw Floating Score/Event Texts
      for (let i = st.floatingTexts.length - 1; i >= 0; i--) {
        const ft = st.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.025;

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.alpha <= 0) {
          st.floatingTexts.splice(i, 1);
        }
      }

      // Draw Mini Cockpit Radar in Top-Right
      drawMiniRadar(ctx, width - 85, 38, st.collectibles, st.obstacles);

      // Draw Player Aircraft
      drawAircraft(ctx, st.playerX, st.playerY, st.playerAngle, st.propellerAngle, st.hasShield, st.magnetTimer > 0, st.turboTimer > 0);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentLevel, onUnlockStamp, onUpdateScore]);

  const addFloater = (st: typeof stateRef.current, x: number, y: number, text: string, color: string) => {
    st.floatingTexts.push({ x, y, text, color, alpha: 1, vy: -1.2 });
  };

  const drawMiniRadar = (
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    collectibles: CollectibleItem[],
    obstacles: ObstacleItem[]
  ) => {
    ctx.save();
    ctx.translate(rx, ry);

    // Radar screen circular glass
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(24, 0);
    ctx.moveTo(0, -24);
    ctx.lineTo(0, 24);
    ctx.stroke();

    // Radar sweep line
    const sweepAngle = (Date.now() * 0.003) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(sweepAngle) * 24, Math.sin(sweepAngle) * 24);
    ctx.stroke();

    // Blips for collectibles (golden/cyan dots)
    collectibles.slice(0, 5).forEach(c => {
      const bx = ((c.x - stateRef.current.playerX) / 800) * 20;
      const by = ((c.y - stateRef.current.playerY) / 380) * 20;
      if (Math.hypot(bx, by) < 22) {
        ctx.fillStyle = c.type === 'eagle' ? '#ef4444' : '#fbbf24';
        ctx.fillRect(bx - 1, by - 1, 2.5, 2.5);
      }
    });

    // Blips for obstacles (red dots)
    obstacles.slice(0, 4).forEach(o => {
      const bx = ((o.x - stateRef.current.playerX) / 800) * 20;
      const by = ((o.y - stateRef.current.playerY) / 380) * 20;
      if (Math.hypot(bx, by) < 22) {
        ctx.fillStyle = '#f87171';
        ctx.fillRect(bx - 1, by - 1, 3, 3);
      }
    });

    ctx.restore();
  };

  // Canvas Drawing Helpers
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
    ctx.arc(x + 18 * scale, y - 10 * scale, 26 * scale, 0, Math.PI * 2);
    ctx.arc(x + 40 * scale, y, 20 * scale, 0, Math.PI * 2);
    ctx.arc(x + 20 * scale, y + 8 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawLandmark = (
    ctx: CanvasRenderingContext2D,
    silhouette: FlightLevel['landmarkSilhouette'],
    x: number,
    y: number,
    size: number,
    country: string
  ) => {
    ctx.save();
    ctx.translate(x, y);

    if (silhouette === 'castle') {
      // Rozafa Castle / Citadel on Cliff
      ctx.fillRect(-size * 0.6, -size * 0.5, size * 1.2, size * 0.5);
      // Medieval Turrets
      ctx.fillRect(-size * 0.65, -size * 0.8, size * 0.25, size * 0.8);
      ctx.fillRect(size * 0.4, -size * 0.8, size * 0.25, size * 0.8);
      ctx.fillRect(-size * 0.15, -size * 0.95, size * 0.3, size * 0.95);

      // Albanian Red Flag on Central Tower
      if (country === 'Albania') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-size * 0.05, -size * 0.95);
        ctx.lineTo(-size * 0.05, -size * 1.15);
        ctx.lineTo(size * 0.25, -size * 1.05);
        ctx.lineTo(-size * 0.05, -size * 0.95);
        ctx.closePath();
        ctx.fill();
      }
    } else if (silhouette === 'alps') {
      // Rugged Alpine Peaks (Theth / Valbona)
      ctx.beginPath();
      ctx.moveTo(-size * 1.1, 0);
      ctx.lineTo(-size * 0.5, -size * 1.1);
      ctx.lineTo(0, -size * 0.6);
      ctx.lineTo(size * 0.6, -size * 1.25);
      ctx.lineTo(size * 1.2, 0);
      ctx.closePath();
      ctx.fill();

      // Snow Cap Peaks
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(-size * 0.65, -size * 0.85);
      ctx.lineTo(-size * 0.5, -size * 1.1);
      ctx.lineTo(-size * 0.35, -size * 0.85);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(size * 0.4, -size * 0.95);
      ctx.lineTo(size * 0.6, -size * 1.25);
      ctx.lineTo(size * 0.8, -size * 0.95);
      ctx.closePath();
      ctx.fill();
    } else if (silhouette === 'fuji') {
      // Mount Fuji
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(-size * 0.25, -size * 0.9);
      ctx.lineTo(size * 0.25, -size * 0.9);
      ctx.lineTo(size, 0);
      ctx.closePath();
      ctx.fill();

      // Snow Cap
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(-size * 0.35, -size * 0.65);
      ctx.lineTo(-size * 0.25, -size * 0.9);
      ctx.lineTo(size * 0.25, -size * 0.9);
      ctx.lineTo(size * 0.35, -size * 0.65);
      ctx.closePath();
      ctx.fill();
    } else if (silhouette === 'eiffel') {
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, 0);
      ctx.lineTo(-size * 0.1, -size * 0.7);
      ctx.lineTo(0, -size * 1.2);
      ctx.lineTo(size * 0.1, -size * 0.7);
      ctx.lineTo(size * 0.45, 0);
      ctx.lineTo(size * 0.25, 0);
      ctx.arc(0, 0, size * 0.25, Math.PI, 0);
      ctx.lineTo(size * 0.45, 0);
      ctx.fill();
    } else if (silhouette === 'pyramids') {
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, 0);
      ctx.lineTo(0, -size * 0.95);
      ctx.lineTo(size * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(size * 0.3, 0);
      ctx.lineTo(size * 0.9, -size * 0.7);
      ctx.lineTo(size * 1.5, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, 0);
      ctx.lineTo(-size * 0.3, -size * 0.6);
      ctx.lineTo(size * 0.2, -size * 0.85);
      ctx.lineTo(size * 0.6, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const drawCollectible = (ctx: CanvasRenderingContext2D, item: CollectibleItem) => {
    ctx.save();
    ctx.translate(item.x, item.y);

    if (item.type === 'eagle') {
      // 🇦🇱 Albanian Double-Headed Golden Eagle Medallion
      const spinScale = Math.cos(item.angle * 2.5);
      ctx.scale(spinScale, 1);

      // Gold Medallion Rim
      ctx.fillStyle = '#dc2626'; // Albanian Crimson Red
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Double-Headed Eagle Silhouette
      ctx.fillStyle = '#fef08a';
      // Left Head
      ctx.beginPath();
      ctx.arc(-4, -6, 2.5, 0, Math.PI * 2);
      // Right Head
      ctx.arc(4, -6, 2.5, 0, Math.PI * 2);
      // Wings
      ctx.moveTo(-9, -2);
      ctx.lineTo(-2, 3);
      ctx.lineTo(2, 3);
      ctx.lineTo(9, -2);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'pearl') {
      // Ksamil Iridescent Oyster Pearl
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      // Iridescent turquoise/pink halo
      const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, item.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#a5f3fc');
      grad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (item.type === 'coin') {
      const spinScale = Math.cos(item.angle * 2);
      ctx.scale(spinScale, 1);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, item.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -item.radius * 0.5);
      ctx.lineTo(0, item.radius * 0.5);
      ctx.moveTo(-item.radius * 0.5, 0);
      ctx.lineTo(item.radius * 0.5, 0);
      ctx.stroke();
    } else if (item.type === 'suitcase') {
      ctx.fillStyle = '#b45309';
      ctx.roundRect(-14, -10, 28, 20, 3);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-9, -10, 4, 20);
      ctx.fillRect(5, -10, 4, 20);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -10, 4, Math.PI, 0);
      ctx.stroke();
    } else if (item.type === 'fuel') {
      ctx.fillStyle = '#10b981';
      ctx.roundRect(-9, -13, 18, 26, 4);
      ctx.fill();
      ctx.fillStyle = '#059669';
      ctx.fillRect(-9, 0, 18, 3);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(1, -7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(-2, 7);
      ctx.lineTo(4, -1);
      ctx.lineTo(0, -1);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'star') {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 15, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 15);
        ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 7, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 7);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (item.type === 'shield') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, -4);
      ctx.lineTo(6, 2);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 2);
      ctx.lineTo(-6, -4);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'magnet') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -8, 4, 16);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(2, -8, 4, 16);
    } else if (item.type === 'turbo') {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(6, 0);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: ObstacleItem) => {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.type === 'storm') {
      ctx.fillStyle = '#334155';
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(-16, 0, 22, 0, Math.PI * 2);
      ctx.arc(0, -12, 26, 0, Math.PI * 2);
      ctx.arc(20, -2, 20, 0, Math.PI * 2);
      ctx.arc(8, 10, 18, 0, Math.PI * 2);
      ctx.arc(-12, 8, 16, 0, Math.PI * 2);
      ctx.fill();

      if (Math.sin(obs.phase * 4) > 0.4) {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(-4, 14);
        ctx.lineTo(2, 14);
        ctx.lineTo(-2, 26);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(0, -8, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -8, 18, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, 14, 12, 8);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.lineTo(-4, 14);
      ctx.moveTo(6, 8);
      ctx.lineTo(4, 14);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawSpeedRing = (ctx: CanvasRenderingContext2D, ring: SpeedRing) => {
    ctx.save();
    ctx.translate(ring.x, ring.y);

    const pulseScale = 1 + Math.sin(ring.pulse) * 0.12;
    ctx.scale(0.42, 1);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, ring.radius * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, ring.radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  const drawAircraft = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    propAngle: number,
    shield: boolean,
    magnet: boolean,
    turbo: boolean
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (shield) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (magnet) {
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (turbo) {
      ctx.save();
      const flameLen = 22 + Math.random() * 10;
      const grad = ctx.createLinearGradient(-35, 0, -35 - flameLen, 0);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-25, -4);
      ctx.lineTo(-30 - flameLen, 0);
      ctx.lineTo(-25, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Fuselage
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.quadraticCurveTo(20, -10, -25, -7);
    ctx.lineTo(-32, -18);
    ctx.lineTo(-30, -5);
    ctx.lineTo(-32, 0);
    ctx.lineTo(-25, 7);
    ctx.quadraticCurveTo(20, 10, 35, 0);
    ctx.closePath();
    ctx.fill();

    // Gold Trim Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(-25, 0);
    ctx.stroke();

    // Glass Canopy
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(18, -6);
    ctx.quadraticCurveTo(12, -9, 0, -6);
    ctx.lineTo(2, 0);
    ctx.lineTo(16, 0);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(5, -4);
    ctx.lineTo(-12, -30);
    ctx.lineTo(-20, -28);
    ctx.lineTo(-8, -4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(5, 4);
    ctx.lineTo(-12, 30);
    ctx.lineTo(-20, 28);
    ctx.lineTo(-8, 4);
    ctx.closePath();
    ctx.fill();

    // Wingtip Lights
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-13, -29, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-13, 29, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Propeller Hub
    ctx.save();
    ctx.translate(35, 0);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.lineWidth = 2.5;
    const propLen = 14;
    ctx.beginPath();
    ctx.moveTo(0, Math.sin(propAngle) * propLen);
    ctx.lineTo(0, -Math.sin(propAngle) * propLen);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  return (
    <div className="flex flex-col h-full select-none relative">
      {/* Top Level Bar & HUD */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-white text-xs">
        <div className="flex items-center gap-2.5">
          <div className="text-xl shrink-0">{currentLevel.flag}</div>
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>{currentLevel.name}</span>
              {currentLevel.badgeText && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase">
                  {currentLevel.badgeText}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              Destination: {currentLevel.destination}, {currentLevel.country} · Landmark: {currentLevel.landmarkName}
            </div>
          </div>
        </div>

        {/* Score, Fuel, and Stage Select */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Stage Select Button */}
          <button
            onClick={() => setShowStageModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Select Stage</span>
          </button>

          {/* Distance progress */}
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1">
              <span>Distance</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-amber-400 font-bold uppercase">{selectedDifficulty}</span>
            </div>
            <div className="font-mono font-bold text-sky-400">
              {distance} / {Math.round(currentLevel.distanceTarget * (selectedDifficulty === 'easy' ? 2.5 : selectedDifficulty === 'hard' ? 4.0 : 6.0))}m
            </div>
          </div>

          {/* Fuel gauge */}
          <div className="w-20 sm:w-28">
            <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-0.5">
              <span>Fuel</span>
              <span className={fuel < 25 ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400'}>
                {fuel}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  fuel > 50
                    ? 'bg-emerald-500'
                    : fuel > 25
                    ? 'bg-amber-500'
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${fuel}%` }}
              />
            </div>
          </div>

          {/* Score & Combo */}
          <div className="text-right min-w-[65px]">
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1">
              <span>Score</span>
              {combo > 1 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black animate-bounce">
                  x{combo}
                </span>
              )}
            </div>
            <div className="font-extrabold text-base text-amber-400 font-mono">
              {score}
            </div>
          </div>

          {/* Music Song Switcher */}
          <button
            onClick={handleChangeTrack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer group shadow-xs"
            title={`Current Song: ${SONG_TRACKS[musicTrackIdx]?.name || 'Song'} (${SONG_TRACKS[musicTrackIdx]?.genre}) - Click to Switch Track (Key M)`}
          >
            <Music className="w-3.5 h-3.5 text-pink-400 group-hover:rotate-12 transition-transform" />
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-[9px] text-pink-400 font-extrabold uppercase tracking-wide">
                Track {musicTrackIdx + 1}/{SONG_TRACKS.length}
              </span>
              <span className="text-[11px] font-bold text-white max-w-[120px] truncate">
                {SONG_TRACKS[musicTrackIdx]?.name}
              </span>
            </div>
            {/* Pulsing Visualizer Bars */}
            <div className="flex items-end gap-0.5 h-3.5 px-0.5">
              <span className={`w-0.5 bg-pink-400 rounded-full transition-all duration-150 ${isMusicPlaying ? 'animate-pulse h-3' : 'h-1 opacity-40'}`} />
              <span className={`w-0.5 bg-sky-400 rounded-full transition-all duration-200 ${isMusicPlaying ? 'animate-pulse h-2' : 'h-1 opacity-40'}`} style={{ animationDelay: '100ms' }} />
              <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-175 ${isMusicPlaying ? 'animate-pulse h-3.5' : 'h-1 opacity-40'}`} style={{ animationDelay: '200ms' }} />
            </div>
          </button>

          {/* Audio toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Screen */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={840}
          height={400}
          onPointerMove={handlePointerMove}
          className="w-full h-full object-contain cursor-crosshair touch-none"
        />

        {/* Start Overlay */}
        {!isPlaying && !isGameOver && !isVictory && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 mb-2 animate-bounce shrink-0">
              <span className="text-2xl">{currentLevel.flag}</span>
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-0.5">
              {currentLevel.country} Stage
            </div>
            <h2 className="text-xl sm:text-2xl font-black mb-1">{currentLevel.name}</h2>
            <p className="text-xs text-slate-300 max-w-md mb-3">
              {currentLevel.description}
            </p>

            {/* Difficulty Selector */}
            <div className="mb-3 w-full max-w-md">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1">
                <span>Select Difficulty Mode (3 Levels & Vouchers)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(GAME_DIFFICULTIES) as GameDifficulty[]).map((diffKey) => {
                  const diff = GAME_DIFFICULTIES[diffKey];
                  const isSelected = selectedDifficulty === diffKey;
                  const rewardForDiff = currentLevel.difficultyRewards[diffKey];
                  const claimed = !!claimedCoupons[`${currentLevel.id}_${diffKey}`];
                  return (
                    <button
                      key={diffKey}
                      onClick={() => setSelectedDifficulty(diffKey)}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex flex-col gap-0.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-md scale-102 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-extrabold truncate">{diff.name}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-black shrink-0 ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400'}`}>
                          {rewardForDiff.discount}
                        </span>
                      </div>
                      <div className="text-[9px] opacity-80 flex items-center justify-between">
                        <span>{diff.scoreMultiplier}x Pts</span>
                        {claimed && <span className="text-emerald-300 font-bold">✓ Won</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentLevel.country === 'Albania' && (
              <div className="mb-3 px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center gap-2 shadow-xs">
                <span>🇦🇱</span>
                <span className="font-bold">Special Collectible:</span>
                <span>Collect the Double-Headed Golden Eagle Crest for +250 XP!</span>
              </div>
            )}

            {/* Soundtrack & Controls Hint */}
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-pink-300">
                <Music className="w-3 h-3 text-pink-400" />
                <span>Track: {SONG_TRACKS[musicTrackIdx]?.name} (Press M)</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                🎮 Space/Boost · B/Blast · Drag/Fly
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStageModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Change Stage
              </button>
              <button
                onClick={() => startGame()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Take Off ({selectedDifficulty.toUpperCase()} Mode)</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Level Checkpoint Overlay */}
        {isVictory && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6 text-center text-white flex flex-col items-center justify-start sm:justify-center animate-in fade-in zoom-in-95 z-30">
            <div className="w-full max-w-lg my-auto flex flex-col items-center justify-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-pulse text-2xl shrink-0">
                {currentLevel.flag}
              </div>
              <div>
                <div className="text-[11px] uppercase font-extrabold tracking-wider text-amber-400">
                  Destination Reached! ({selectedDifficulty.toUpperCase()} Mode)
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{currentLevel.destination}</h2>
                <p className="text-xs text-slate-300 max-w-md mt-0.5">
                  You arrived at <strong className="text-white">{currentLevel.landmarkName}</strong> and earned official visa stamps!
                </p>
              </div>

              {/* Flight Performance Rating Stars */}
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-lg ${score >= 180 ? 'text-amber-400 drop-shadow-sm' : 'text-slate-600'}`}>⭐</span>
                <span className={`text-xl ${score >= 380 ? 'text-amber-400 drop-shadow-sm' : 'text-slate-600'}`}>⭐</span>
                <span className={`text-lg ${score >= 550 || fuel >= 30 ? 'text-amber-400 drop-shadow-sm' : 'text-slate-600'}`}>⭐</span>
              </div>

              <div className="flex items-center gap-6 bg-slate-900/90 px-5 py-2 rounded-2xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Flight Score</div>
                  <div className="text-base font-black text-amber-400 font-mono">{score} pts</div>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Passport Stamp</div>
                  <div className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-center">
                    <Award className="w-3.5 h-3.5" />
                    <span>{currentLevel.country} Stamped!</span>
                  </div>
                </div>
              </div>

              {/* Exclusive Level Pass Redeem Offer Card */}
              <div className="w-full max-w-md bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-3.5 rounded-2xl border-2 border-amber-500/60 shadow-2xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] uppercase rounded-bl-lg tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>{selectedDifficulty.toUpperCase()} Mode Reward</span>
                </div>

                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1 pt-1">
                  <span>🎉 BOOKING VOUCHER UNLOCKED!</span>
                  {isCouponClaimed && <span className="text-emerald-400 font-extrabold">(Claimed Once)</span>}
                </div>

                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <div className="font-mono font-black text-base sm:text-lg text-white tracking-wider">
                      {currentReward.code}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">
                      {currentReward.description}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-sm shrink-0">
                    {currentReward.discount}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={isCouponClaimed}
                    onClick={() => {
                      const updated = { ...claimedCoupons, [couponKey]: true };
                      setClaimedCoupons(updated);
                      try {
                        localStorage.setItem('voyage_flight_claimed_coupons', JSON.stringify(updated));
                      } catch {}
                      PromoService.setActivePromo(currentReward.code);
                      AuthAudit.showToast({
                        title: '🎉 Coupon Claimed!',
                        message: `Voucher "${currentReward.code}" (${currentReward.discount}) applied! Single-play reward claimed.`,
                        type: 'success',
                        duration: 4000,
                      });
                      if (onUsePromo) onUsePromo(currentReward.code);
                    }}
                    className={`py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCouponClaimed
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isCouponClaimed ? 'Claimed Once' : 'Redeem & Book'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(currentReward.code);
                        setCopiedVictoryCode(true);
                        AuthAudit.showToast({
                          title: 'Voucher Code Copied!',
                          message: `Voucher code "${currentReward.code}" copied to clipboard!`,
                          type: 'success',
                        });
                        setTimeout(() => setCopiedVictoryCode(false), 3000);
                      }
                    }}
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedVictoryCode ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => startGame(levelIndex)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Stage</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextLevel}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Fly Next Destination</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 mb-3">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black mb-1">Emergency Landing!</h2>
            <p className="text-xs text-slate-300 max-w-sm mb-4">
              {fuel <= 0
                ? 'Your aircraft ran out of fuel before reaching the airport. Keep an eye out for green fuel canisters!'
                : 'Severe turbulence forced a precautionary descent.'}
            </p>

            <button
              onClick={() => startGame(levelIndex)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Stage</span>
            </button>
          </div>
        )}

        {/* In-Game Active Buff Badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
          {hasShield && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
              <Shield className="w-3 h-3 fill-cyan-400 text-cyan-400" />
              <span>Aero Shield</span>
            </div>
          )}
          {hasMagnet && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Magnet Active</span>
            </div>
          )}
          {hasTurbo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-400/40 text-pink-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md animate-pulse">
              <Zap className="w-3 h-3 fill-pink-400 text-pink-400" />
              <span>Turbo Boost</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Visual Stage Selection Modal */}
      {showStageModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  <span>Choose Your Flight Expedition Stage</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select a destination to fly. Master the Albanian Riviera & Alps to collect rare eagle crests!
                </p>
              </div>
              <button
                onClick={() => setShowStageModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {FLIGHT_LEVELS.map((lvl, idx) => (
                <div
                  key={lvl.id}
                  onClick={() => startGame(idx)}
                  className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
                    levelIndex === idx
                      ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-xl shadow-sky-500/20 bg-slate-900'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={lvl.image}
                      alt={lvl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-base">{lvl.flag}</span>
                      {lvl.badgeText && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase">
                          {lvl.badgeText}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5">
                      <div className="text-[10px] text-sky-400 font-bold uppercase">{lvl.destination}</div>
                      <div className="text-sm font-black text-white leading-tight">{lvl.name}</div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {lvl.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Target: {lvl.distanceTarget}m</span>
                      <span className="text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Fly Stage <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls / Touch Action Strip */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Quick Stages:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {FLIGHT_LEVELS.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => startGame(idx)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  levelIndex === idx
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{lvl.flag}</span>
                <span>{lvl.destination.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile / Touch Helper Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={() => {
              stateRef.current.targetY -= 35;
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all active:scale-90 cursor-pointer"
            title="Climb Altitude"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onPointerDown={() => {
              stateRef.current.targetY += 35;
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all active:scale-90 cursor-pointer"
            title="Dive Altitude"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (stateRef.current.fuel > 15 && stateRef.current.turboTimer <= 0) {
                stateRef.current.turboTimer = 90;
                stateRef.current.fuel = Math.max(0, stateRef.current.fuel - 10);
                gameAudio.playBoost();
              }
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] transition-all active:scale-95 shadow-xs cursor-pointer"
            title="Turbo Boost (Spacebar)"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Boost</span>
          </button>
          <button
            onClick={triggerSonicBlast}
            disabled={sonicCharges <= 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-[11px] transition-all active:scale-95 shadow-xs cursor-pointer ${
              sonicCharges > 0
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-pink-500/20 shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Sonic Shockwave Cloud Buster: Clear clouds & hazards into stars (Key B)"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Blast</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-black text-amber-300">
              {sonicCharges}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
