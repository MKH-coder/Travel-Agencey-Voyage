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
  Gauge,
  Sliders,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { gameAudio, SONG_TRACKS } from '../utils/gameAudio.ts';
import { RALLY_STAGES, RallyStage } from '../data/interactiveGameData.ts';
import { PromoService } from '../services/promoService.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface BalkanCoastalRallyGameProps {
  onUnlockStamp: (stampId: string) => void;
  onUpdateScore: (score: number) => void;
  highScore: number;
  onUsePromo?: (code: string) => void;
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

interface TrafficCar {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lane: number;
  color: string;
  type: 'sedan' | 'bus' | 'van' | 'sheep';
}

interface RallyItem {
  x: number;
  y: number;
  type: 'coin' | 'espresso' | 'fuel' | 'luggage' | 'eagle' | 'shield';
  lane: number;
  collected: boolean;
  angle: number;
}

export const BalkanCoastalRallyGame: React.FC<BalkanCoastalRallyGameProps> = ({
  onUnlockStamp,
  onUpdateScore,
  highScore,
  onUsePromo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stageIndex, setStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [copiedVictoryCode, setCopiedVictoryCode] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);

  // HUD stats
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [distance, setDistance] = useState(0);
  const [driftCombo, setDriftCombo] = useState(1);
  const [hasShield, setHasShield] = useState(false);
  const [hasNitro, setHasNitro] = useState(false);

  // Audio / Song states
  const [isMusicPlaying, setIsMusicPlaying] = useState(gameAudio.isMusicPlaying());
  const [musicTrackIdx, setMusicTrackIdx] = useState(gameAudio.getMusicTrack());
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());

  const currentStage: RallyStage = RALLY_STAGES[stageIndex] || RALLY_STAGES[0];

  const stateRef = useRef({
    playerLane: 1, // 0: left, 1: center, 2: right
    playerX: 200,
    playerY: 380,
    targetX: 200,
    carAngle: 0,
    speed: 8,
    maxSpeed: 16,
    driftTimer: 0,
    driftScore: 0,
    nitroTimer: 0,
    shieldTimer: 0,
    distance: 0,
    score: 0,
    fuel: 100,
    traffic: [] as TrafficCar[],
    items: [] as RallyItem[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    roadOffset: 0,
    keys: {} as Record<string, boolean>,
    isVictory: false,
    isGameOver: false,
  });

  const handleToggleMusic = () => {
    const nextState = gameAudio.toggleMusic();
    setIsMusicPlaying(nextState);
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

  const handleToggleMute = () => {
    const nextMuted = gameAudio.toggleMute();
    setIsMuted(nextMuted);
    setIsMusicPlaying(gameAudio.isMusicPlaying());
  };

  // Start / Restart Rally
  const startRally = useCallback((idx = stageIndex) => {
    setStageIndex(idx);
    setShowStageModal(false);

    const st = stateRef.current;
    st.playerLane = 1;
    st.playerX = 200;
    st.playerY = 380;
    st.targetX = 200;
    st.carAngle = 0;
    st.speed = 9;
    st.driftTimer = 0;
    st.driftScore = 0;
    st.nitroTimer = 0;
    st.shieldTimer = 0;
    st.distance = 0;
    st.score = 0;
    st.fuel = 100;
    st.traffic = [];
    st.items = [];
    st.particles = [];
    st.floatingTexts = [];
    st.isVictory = false;
    st.isGameOver = false;

    setScore(0);
    setFuel(100);
    setDistance(0);
    setDriftCombo(1);
    setSpeedKmh(90);
    setHasShield(false);
    setHasNitro(false);
    setIsGameOver(false);
    setIsVictory(false);
    setCopiedVictoryCode(false);
    setIsPlaying(true);

    // Start background song
    gameAudio.startMusic(musicTrackIdx);
    setIsMusicPlaying(true);
  }, [musicTrackIdx, stageIndex]);

  const handleNextStage = () => {
    const nextIdx = (stageIndex + 1) % RALLY_STAGES.length;
    startRally(nextIdx);
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      // Nitro turbo trigger
      if ((e.code === 'Space' || e.code === 'KeyN') && isPlaying && !stateRef.current.isGameOver && !stateRef.current.isVictory) {
        if (stateRef.current.fuel > 15 && stateRef.current.nitroTimer <= 0) {
          stateRef.current.nitroTimer = 110;
          stateRef.current.fuel = Math.max(0, stateRef.current.fuel - 10);
          gameAudio.playBoost();
          gameAudio.setTempoBoost(true);
        }
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
  }, [isPlaying]);

  // Main 60fps Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let spawnTrafficTimer = 0;
    let spawnItemTimer = 0;

    const loop = () => {
      const st = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      const roadLeft = width * 0.18;
      const roadRight = width * 0.82;
      const roadWidth = roadRight - roadLeft;
      const laneWidth = roadWidth / 3;

      if (isPlaying && !st.isGameOver && !st.isVictory) {
        // Lateral Steering
        const steerSpeed = st.nitroTimer > 0 ? 7.5 : 5.8;
        let steeringDir = 0;

        if (st.keys['ArrowLeft'] || st.keys['KeyA']) steeringDir -= 1;
        if (st.keys['ArrowRight'] || st.keys['KeyD']) steeringDir += 1;

        // Drift check (Down arrow / Shift / S)
        const isDrifting = (st.keys['ArrowDown'] || st.keys['KeyS'] || st.keys['ShiftLeft']) && steeringDir !== 0;
        if (isDrifting) {
          st.driftTimer++;
          if (st.driftTimer % 8 === 0) {
            gameAudio.playTireScreech();
            st.score += 15;
            st.floatingTexts.push({
              x: st.playerX,
              y: st.playerY - 20,
              text: 'DRIFT! +15',
              color: '#38bdf8',
              alpha: 1,
              vy: -1.2,
            });
          }
          const combo = Math.min(4, 1 + Math.floor(st.driftTimer / 25));
          setDriftCombo(combo);
        } else {
          st.driftTimer = Math.max(0, st.driftTimer - 2);
          if (st.driftTimer === 0) setDriftCombo(1);
        }

        // Apply steering
        st.playerX += steeringDir * steerSpeed * (isDrifting ? 1.3 : 1.0);
        st.playerX = Math.max(roadLeft + 25, Math.min(roadRight - 25, st.playerX));

        // Angular tilt for sporty turn feel
        const targetAngle = isDrifting ? steeringDir * 0.38 : steeringDir * 0.16;
        st.carAngle += (targetAngle - st.carAngle) * 0.25;

        // Speed management
        const baseSpeed = st.nitroTimer > 0 ? 17 : (st.keys['ArrowUp'] || st.keys['KeyW']) ? 12.5 : 9.5;
        st.speed += (baseSpeed - st.speed) * 0.1;
        setSpeedKmh(Math.floor(st.speed * 12));

        // Nitro timer decay
        if (st.nitroTimer > 0) {
          st.nitroTimer--;
          setHasNitro(true);
          if (st.nitroTimer === 0) {
            setHasNitro(false);
            gameAudio.setTempoBoost(false);
          }
        }

        // Shield decay
        if (st.shieldTimer > 0) {
          st.shieldTimer--;
          setHasShield(true);
          if (st.shieldTimer === 0) setHasShield(false);
        }

        // Fuel consumption
        st.fuel -= st.nitroTimer > 0 ? 0.045 : 0.018;
        setFuel(Math.max(0, Math.floor(st.fuel)));

        if (st.fuel <= 0) {
          st.isGameOver = true;
          setIsGameOver(true);
          setIsPlaying(false);
          gameAudio.playHit();
          gameAudio.stopMusic();
          setIsMusicPlaying(false);
        }

        // Distance advance
        st.distance += st.speed * 0.55;
        setDistance(Math.floor(st.distance));

        // Check Victory
        if (st.distance >= currentStage.distanceTarget && !st.isVictory) {
          st.isVictory = true;
          setIsVictory(true);
          setIsPlaying(false);
          gameAudio.playVictory();
          gameAudio.stopMusic();
          setIsMusicPlaying(false);

          onUnlockStamp(currentStage.stampId);
          onUpdateScore(st.score + 500);
        }

        // Road offset scrolling
        st.roadOffset = (st.roadOffset + st.speed) % 80;

        // Spawn Traffic Vehicles
        spawnTrafficTimer++;
        if (spawnTrafficTimer > (st.nitroTimer > 0 ? 45 : 68)) {
          spawnTrafficTimer = 0;
          const lane = Math.floor(Math.random() * 3);
          const laneCenterX = roadLeft + laneWidth * lane + laneWidth / 2;
          const trafficTypeRand = Math.random();
          let type: TrafficCar['type'] = 'sedan';
          let width = 36;
          let height = 65;
          let color = '#ef4444';
          let carSpeed = 4 + Math.random() * 3;

          if (trafficTypeRand < 0.25) {
            type = 'bus'; // Red Balkan Tour Bus
            width = 44;
            height = 92;
            color = '#dc2626';
            carSpeed = 3.5;
          } else if (trafficTypeRand < 0.45) {
            type = 'van';
            width = 38;
            height = 72;
            color = '#f59e0b';
            carSpeed = 4.2;
          } else if (trafficTypeRand < 0.58 && currentStage.sceneryType === 'mountain_pass') {
            type = 'sheep'; // Alpine sheep herd
            width = 28;
            height = 24;
            color = '#f8fafc';
            carSpeed = 1.2;
          } else {
            type = 'sedan';
            width = 36;
            height = 65;
            color = ['#3b82f6', '#10b981', '#a855f7', '#06b6d4'][Math.floor(Math.random() * 4)];
          }

          st.traffic.push({
            x: laneCenterX,
            y: -120,
            width,
            height,
            speed: carSpeed,
            lane,
            color,
            type,
          });
        }

        // Spawn Rally Items
        spawnItemTimer++;
        if (spawnItemTimer > 38) {
          spawnItemTimer = 0;
          const lane = Math.floor(Math.random() * 3);
          const laneCenterX = roadLeft + laneWidth * lane + laneWidth / 2;
          const itemRand = Math.random();
          let type: RallyItem['type'] = 'coin';

          if (itemRand < 0.45) {
            type = 'coin'; // Gold coin
          } else if (itemRand < 0.65) {
            type = 'espresso'; // Albanian Espresso Nitro Turbo
          } else if (itemRand < 0.82) {
            type = 'fuel'; // Fuel can
          } else if (itemRand < 0.93) {
            type = 'luggage'; // Souvenir suitcase
          } else {
            type = 'eagle'; // Double-headed golden eagle
          }

          st.items.push({
            x: laneCenterX,
            y: -60,
            type,
            lane,
            collected: false,
            angle: 0,
          });
        }

        // Update Traffic
        st.traffic.forEach(car => {
          car.y += (st.speed - car.speed);

          // Player Car Collision Box
          const pBox = {
            left: st.playerX - 18,
            right: st.playerX + 18,
            top: st.playerY - 32,
            bottom: st.playerY + 32,
          };

          const cBox = {
            left: car.x - car.width / 2 + 4,
            right: car.x + car.width / 2 - 4,
            top: car.y - car.height / 2 + 6,
            bottom: car.y + car.height / 2 - 6,
          };

          // AABB Collision
          if (
            pBox.left < cBox.right &&
            pBox.right > cBox.left &&
            pBox.top < cBox.bottom &&
            pBox.bottom > cBox.top
          ) {
            if (st.shieldTimer > 0) {
              // Shield smash!
              car.y = height + 200;
              st.score += 80;
              gameAudio.playPowerup();
              st.floatingTexts.push({
                x: car.x,
                y: car.y,
                text: 'SHIELD SMASH! +80',
                color: '#38bdf8',
                alpha: 1,
                vy: -1.5,
              });
            } else {
              // Collision Hit!
              st.fuel = Math.max(0, st.fuel - 18);
              st.speed = Math.max(4, st.speed * 0.5);
              car.y += 60; // bounce traffic away
              gameAudio.playHit();

              // Spawn crash sparks
              for (let i = 0; i < 18; i++) {
                st.particles.push({
                  x: st.playerX,
                  y: st.playerY - 20,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  size: 3 + Math.random() * 3,
                  color: '#fbbf24',
                  alpha: 1,
                  life: 0,
                  maxLife: 20,
                });
              }

              st.floatingTexts.push({
                x: st.playerX,
                y: st.playerY - 30,
                text: 'IMPACT! -18% FUEL',
                color: '#ef4444',
                alpha: 1,
                vy: -1.4,
              });
            }
          }
        });

        // Update Items
        st.items.forEach(item => {
          item.y += st.speed;
          item.angle += 0.05;

          const dist = Math.hypot(st.playerX - item.x, st.playerY - item.y);
          if (dist < 38 && !item.collected) {
            item.collected = true;

            if (item.type === 'coin') {
              st.score += 50 * driftCombo;
              gameAudio.playCoin();
              st.floatingTexts.push({
                x: item.x,
                y: item.y,
                text: `+${50 * driftCombo}`,
                color: '#facc15',
                alpha: 1,
                vy: -1.3,
              });
            } else if (item.type === 'espresso') {
              st.nitroTimer = 120;
              st.score += 150;
              gameAudio.playBoost();
              gameAudio.setTempoBoost(true);
              st.floatingTexts.push({
                x: item.x,
                y: item.y,
                text: '⚡ ESPRESSO TURBO!',
                color: '#f97316',
                alpha: 1,
                vy: -1.6,
              });
            } else if (item.type === 'fuel') {
              st.fuel = Math.min(100, st.fuel + 25);
              st.score += 80;
              gameAudio.playFuel();
              st.floatingTexts.push({
                x: item.x,
                y: item.y,
                text: '+25% FUEL CAN',
                color: '#22c55e',
                alpha: 1,
                vy: -1.3,
              });
            } else if (item.type === 'luggage') {
              st.score += 200;
              gameAudio.playSuitcase();
              st.floatingTexts.push({
                x: item.x,
                y: item.y,
                text: '🧳 SOUVENIR VINTAGE +200',
                color: '#a855f7',
                alpha: 1,
                vy: -1.4,
              });
            } else if (item.type === 'eagle') {
              st.shieldTimer = 180;
              st.score += 350;
              gameAudio.playEagle();
              st.floatingTexts.push({
                x: item.x,
                y: item.y,
                text: '🦅 DOUBLE EAGLE SHIELD!',
                color: '#e11d48',
                alpha: 1,
                vy: -1.6,
              });
            }

            setScore(st.score);
            onUpdateScore(st.score);
          }
        });

        // Filter offscreen items & traffic
        st.traffic = st.traffic.filter(c => c.y < height + 100);
        st.items = st.items.filter(i => i.y < height + 80 && !i.collected);

        // Emit exhaust smoke / drift tire particles
        if (st.speed > 5) {
          const isBoosting = st.nitroTimer > 0;
          st.particles.push({
            x: st.playerX - 10 + (Math.random() - 0.5) * 6,
            y: st.playerY + 34,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2 + Math.random() * 3,
            size: isBoosting ? 5.5 : (isDrifting ? 4.5 : 2.8),
            color: isBoosting ? '#38bdf8' : (isDrifting ? '#cbd5e1' : '#94a3b8'),
            alpha: 0.65,
            life: 0,
            maxLife: isBoosting ? 26 : 18,
          });

          st.particles.push({
            x: st.playerX + 10 + (Math.random() - 0.5) * 6,
            y: st.playerY + 34,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2 + Math.random() * 3,
            size: isBoosting ? 5.5 : (isDrifting ? 4.5 : 2.8),
            color: isBoosting ? '#f97316' : (isDrifting ? '#cbd5e1' : '#94a3b8'),
            alpha: 0.65,
            life: 0,
            maxLife: isBoosting ? 26 : 18,
          });
        }
      }

      // ==========================================
      // RENDERING CANVAS PIPELINE
      // ==========================================

      // 1. Scenic Horizon Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
      skyGrad.addColorStop(0, currentStage.skyGradient[0]);
      skyGrad.addColorStop(1, currentStage.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Sea / Horizon Mountains
      if (currentStage.sceneryType === 'coastal') {
        // Deep turquoise sea on the left/right
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(0, 0, roadLeft, height);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(roadRight, 0, width - roadRight, height);

        // Sea waves
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.4;
        const waveStep = (st.roadOffset * 0.6) % 40;
        for (let y = -waveStep; y < height; y += 38) {
          ctx.beginPath();
          ctx.moveTo(15, y);
          ctx.lineTo(roadLeft - 25, y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(roadRight + 25, y);
          ctx.lineTo(width - 15, y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      } else {
        // Alpine Grass / Canyon Stone Shoulder
        ctx.fillStyle = currentStage.sceneryType === 'mountain_pass' ? '#1e3a1e' : '#3f3f46';
        ctx.fillRect(0, 0, roadLeft, height);
        ctx.fillRect(roadRight, 0, width - roadRight, height);

        // Pine trees or rock textures
        ctx.fillStyle = '#14532d';
        const treeStep = (st.roadOffset * 1.2) % 65;
        for (let y = -treeStep; y < height; y += 65) {
          ctx.beginPath();
          ctx.arc(roadLeft * 0.45, y, 16, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(roadRight + (width - roadRight) * 0.55, y + 25, 18, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Asphalt Road Surface
      ctx.fillStyle = currentStage.roadColor;
      ctx.fillRect(roadLeft, 0, roadWidth, height);

      // 3. Striped Road Curbs (Alternating Red/White or Cyan/White)
      const curbWidth = 14;
      const stripeHeight = 32;
      const curbOffset = st.roadOffset % (stripeHeight * 2);

      for (let y = -curbOffset - stripeHeight * 2; y < height + stripeHeight * 2; y += stripeHeight) {
        const isStripe = Math.floor((y + curbOffset) / stripeHeight) % 2 === 0;
        ctx.fillStyle = isStripe ? currentStage.curbColor : '#ffffff';

        // Left curb
        ctx.fillRect(roadLeft - curbWidth, y, curbWidth, stripeHeight);
        // Right curb
        ctx.fillRect(roadRight, y, curbWidth, stripeHeight);
      }

      // 4. White Lane Divider Dashes
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.setLineDash([28, 22]);
      ctx.lineDashOffset = -st.roadOffset;

      // Lane 1 divider
      ctx.beginPath();
      ctx.moveTo(roadLeft + laneWidth, 0);
      ctx.lineTo(roadLeft + laneWidth, height);
      ctx.stroke();

      // Lane 2 divider
      ctx.beginPath();
      ctx.moveTo(roadLeft + laneWidth * 2, 0);
      ctx.lineTo(roadLeft + laneWidth * 2, height);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // 5. Draw Rally Items
      st.items.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === 'coin') {
          // Sparkling Gold Coin
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 0);
        } else if (item.type === 'espresso') {
          // Espresso Nitro Cup
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.roundRect(-13, -13, 26, 26, 7);
          ctx.fill();
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('☕', 0, 0);
        } else if (item.type === 'fuel') {
          // Fuel Canister
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.roundRect(-13, -14, 26, 28, 6);
          ctx.fill();
          ctx.strokeStyle = '#bbf7d0';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⛽', 0, 0);
        } else if (item.type === 'luggage') {
          // Travel Suitcase
          ctx.fillStyle = '#9333ea';
          ctx.beginPath();
          ctx.roundRect(-15, -12, 30, 24, 6);
          ctx.fill();
          ctx.fillStyle = '#f3e8ff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧳', 0, 0);
        } else {
          // Golden Eagle Crest
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, 17, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🦅', 0, 0);
        }

        ctx.restore();
      });

      // 6. Draw Traffic Vehicles
      st.traffic.forEach(car => {
        ctx.save();
        ctx.translate(car.x, car.y);

        if (car.type === 'sheep') {
          // Cute Sheep Herd obstacle
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, car.width / 2, car.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(-8, -4, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Vehicle shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.roundRect(-car.width / 2 + 3, -car.height / 2 + 5, car.width, car.height, 8);
          ctx.fill();

          // Vehicle Body
          ctx.fillStyle = car.color;
          ctx.beginPath();
          ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 8);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Windshield (Front & Rear)
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(-car.width / 2 + 4, car.height / 2 - 18, car.width - 8, 10, 3); // rear window
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(-car.width / 2 + 4, -car.height / 2 + 8, car.width - 8, 12, 3); // front windshield
          ctx.fill();

          // Headlights (facing forward / down)
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(-car.width / 2 + 6, car.height / 2 - 2, 3, 0, Math.PI * 2);
          ctx.arc(car.width / 2 - 6, car.height / 2 - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 7. Draw Exhaust / Nitro Particles
      st.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      st.particles = st.particles.filter(p => p.life < p.maxLife);

      // 8. Draw Player Sports Roadster Convertible
      ctx.save();
      ctx.translate(st.playerX, st.playerY);
      ctx.rotate(st.carAngle);

      // Car Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-20, -32, 40, 70, 10);
      ctx.fill();

      // Shield Aura
      if (st.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Nitro Glow
      if (st.nitroTimer > 0) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(-22, -35, 44, 72, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Sports Car Main Body (Vibrant Red Tourer)
      ctx.fillStyle = '#dc2626'; // Radiant Italian/Balkan racing crimson
      ctx.beginPath();
      ctx.roundRect(-19, -34, 38, 68, 10);
      ctx.fill();

      // Aerodynamic Racing Stripes
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-4, -34, 8, 68);

      // Windshield & Cockpit Interior
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-14, -16, 28, 28, 6);
      ctx.fill();

      // Front Curved Windshield Glass
      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(-13, -16, 26, 7, 3);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Pilot & Co-Pilot Helmets / Seats
      ctx.fillStyle = '#f59e0b'; // Leather seats
      ctx.beginPath();
      ctx.arc(-6, 0, 5, 0, Math.PI * 2); // Driver
      ctx.arc(6, 0, 5, 0, Math.PI * 2);  // Passenger
      ctx.fill();

      // Headlight Beams (Shooting forward up into the night/day road)
      const beamGrad = ctx.createLinearGradient(0, -34, 0, -180);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-16, -34);
      ctx.lineTo(-45, -160);
      ctx.lineTo(45, -160);
      ctx.lineTo(16, -34);
      ctx.fill();

      // Tail Lights (Crimson glow)
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(-14, 33, 3.5, 0, Math.PI * 2);
      ctx.arc(14, 33, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 9. Floating Score & Drift Text
      st.floatingTexts.forEach(ft => {
        ft.y += ft.vy;
        ft.alpha -= 0.025;

        ctx.font = '900 13px system-ui, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1.0;
      st.floatingTexts = st.floatingTexts.filter(ft => ft.alpha > 0);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [currentStage, driftCombo, isPlaying, onUnlockStamp, onUpdateScore]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white select-none relative overflow-hidden">
      {/* Top Rally Header & Music Dashboard */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs shrink-0 gap-2 flex-wrap">
        {/* Stage Selector */}
        <button
          onClick={() => setShowStageModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
        >
          <span className="text-base">{currentStage.flag}</span>
          <span className="truncate max-w-[140px] sm:max-w-none">{currentStage.name}</span>
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
        </button>

        {/* Live Song Player / Music Bar */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
          <button
            onClick={handleToggleMusic}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isMusicPlaying ? 'text-amber-400' : 'text-slate-500'
            }`}
            title={isMusicPlaying ? 'Pause Music Track' : 'Play Music Track'}
          >
            <Music className="w-4 h-4 animate-pulse" />
          </button>

          <button
            onClick={handleChangeTrack}
            className="text-[11px] font-bold text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-1"
            title="Switch Background Song Track"
          >
            <span className="truncate max-w-[110px] sm:max-w-[140px]">
              {SONG_TRACKS[musicTrackIdx]?.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
              {SONG_TRACKS[musicTrackIdx]?.bpm}BPM
            </span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* Stats HUD (Score, Speed, Fuel, Distance) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono font-black text-white text-xs">{speedKmh} km/h</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-black text-xs font-mono">{score} pts</span>
            {driftCombo > 1 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black animate-bounce">
                x{driftCombo} DRIFT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          className="w-full h-full max-w-[640px] max-h-[580px] object-contain shadow-2xl"
        />

        {/* In-Game Overlay Badges (Fuel & Progress) */}
        {isPlaying && (
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
            {/* Fuel Bar */}
            <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tank</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    fuel > 40 ? 'bg-emerald-500' : fuel > 20 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${fuel}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold">{fuel}%</span>
            </div>

            {/* Distance Progress */}
            <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-sky-400" />
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (distance / currentStage.distanceTarget) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-300 font-bold">
                {distance}m / {currentStage.distanceTarget}m
              </span>
            </div>
          </div>
        )}

        {/* Start Game Screen Overlay */}
        {!isPlaying && !isGameOver && !isVictory && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-xl shadow-rose-500/30 mb-3 text-3xl animate-bounce">
              🏎️
            </div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-rose-400 mb-1">
              Balkan Coastal Grand Tour
            </div>
            <h2 className="text-2xl font-black mb-1">{currentStage.name}</h2>
            <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
              Drift along Albania's dramatic seaside hairpin turns and palm strips. Collect espresso boosts, avoid traffic, and reach {currentStage.destination}!
            </p>

            <button
              onClick={() => startRally()}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Ignite Engine & Drift</span>
            </button>

            <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-4">
              <span>⬅️ ➡️ Steer</span>
              <span>•</span>
              <span>⬇️ Drift Slide</span>
              <span>•</span>
              <span>SPACE / Nitro</span>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mb-2">
              💥
            </div>
            <h3 className="text-xl font-black text-white mb-1">Out of Fuel or Collision!</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-4">
              You journeyed <strong className="text-white">{distance} meters</strong> along {currentStage.name} and racked up <strong className="text-amber-400">{score} pts</strong>!
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => startRally()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Rally Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {isVictory && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md overflow-y-auto p-4 sm:p-6 text-center text-white flex flex-col items-center justify-center z-30">
            <div className="w-full max-w-md my-auto flex flex-col items-center justify-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-pulse text-2xl shrink-0">
                {currentStage.flag}
              </div>

              <div>
                <div className="text-[11px] uppercase font-extrabold tracking-wider text-amber-400">
                  Rally Checkpoint Conquered!
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{currentStage.destination}</h2>
                <p className="text-xs text-slate-300 max-w-md mt-0.5">
                  Spectacular coastal driving! You reached <strong className="text-white">{currentStage.landmarkName}</strong> and earned official visa stamps!
                </p>
              </div>

              <div className="flex items-center gap-6 bg-slate-900/90 px-5 py-2 rounded-2xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Rally Score</div>
                  <div className="text-base font-black text-amber-400 font-mono">{score} pts</div>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Visa Stamp Unlocked</div>
                  <div className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-center">
                    <Award className="w-3.5 h-3.5" />
                    <span>{currentStage.country} Stamped!</span>
                  </div>
                </div>
              </div>

              {/* Promo Reward Voucher */}
              <div className="w-full max-w-md bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-3.5 rounded-2xl border-2 border-amber-500/60 shadow-2xl text-left relative overflow-hidden">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rally Victory Voucher Unlocked!</span>
                </div>

                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <div className="font-mono font-black text-base sm:text-lg text-white tracking-wider">
                      {currentStage.redeemCode}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">
                      {currentStage.redeemOfferName}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-sm shrink-0">
                    {currentStage.redeemDiscount}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      PromoService.setActivePromo(currentStage.redeemCode);
                      AuthAudit.showToast({
                        title: '🎉 Offer Activated!',
                        message: `Voucher "${currentStage.redeemCode}" (${currentStage.redeemDiscount}) applied! Discount active at checkout.`,
                        type: 'success',
                        duration: 4000,
                      });
                      if (onUsePromo) onUsePromo(currentStage.redeemCode);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Redeem & Book</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(currentStage.redeemCode);
                        setCopiedVictoryCode(true);
                        AuthAudit.showToast({
                          title: 'Code Copied!',
                          message: `Voucher code "${currentStage.redeemCode}" copied to clipboard!`,
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
                  onClick={() => startRally(stageIndex)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Stage</span>
                </button>
                <button
                  onClick={handleNextStage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Drive Next Stage</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stage Selection Modal */}
      {showStageModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-40 p-4 sm:p-6 overflow-y-auto flex flex-col justify-center">
          <div className="max-w-3xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🇦🇱 Balkan Coastal Rally Circuit</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select a scenic Albanian highway to drive and drift.
                </p>
              </div>
              <button
                onClick={() => setShowStageModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RALLY_STAGES.map((stg, idx) => (
                <div
                  key={stg.id}
                  onClick={() => startRally(idx)}
                  className={`group relative rounded-2xl overflow-hidden border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                    stageIndex === idx
                      ? 'border-rose-500 ring-2 ring-rose-500/40 bg-slate-900 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[10px] text-rose-400 font-bold uppercase">{stg.destination}</div>
                      <div className="text-sm font-black text-white">{stg.name}</div>
                    </div>
                    <span className="text-xl">{stg.flag}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                    {stg.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>Target: {stg.distanceTarget}m</span>
                    <span className="text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Drive Stage <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls / Mobile Touch Strip */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
        {/* Onscreen Steering Controls for Touch & Desktop */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => { stateRef.current.keys['ArrowLeft'] = true; }}
            onPointerUp={() => { stateRef.current.keys['ArrowLeft'] = false; }}
            onPointerLeave={() => { stateRef.current.keys['ArrowLeft'] = false; }}
            className="w-10 h-10 rounded-xl bg-slate-800 active:bg-rose-500 border border-slate-700 flex items-center justify-center font-black text-white cursor-pointer active:scale-95 transition-all"
            title="Steer Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onPointerDown={() => { stateRef.current.keys['ArrowRight'] = true; }}
            onPointerUp={() => { stateRef.current.keys['ArrowRight'] = false; }}
            onPointerLeave={() => { stateRef.current.keys['ArrowRight'] = false; }}
            className="w-10 h-10 rounded-xl bg-slate-800 active:bg-rose-500 border border-slate-700 flex items-center justify-center font-black text-white cursor-pointer active:scale-95 transition-all"
            title="Steer Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onPointerDown={() => {
              stateRef.current.keys['ArrowDown'] = true;
            }}
            onPointerUp={() => {
              stateRef.current.keys['ArrowDown'] = false;
            }}
            onPointerLeave={() => {
              stateRef.current.keys['ArrowDown'] = false;
            }}
            className={`px-3 h-10 rounded-xl border flex items-center gap-1.5 font-black text-xs cursor-pointer active:scale-95 transition-all ${
              driftCombo > 1
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}
            title="Drift / Powerslide"
          >
            <span>DRIFT</span>
          </button>
        </div>

        {/* Boost Button */}
        <button
          onClick={() => {
            if (stateRef.current.fuel > 15 && stateRef.current.nitroTimer <= 0) {
              stateRef.current.nitroTimer = 110;
              stateRef.current.fuel = Math.max(0, stateRef.current.fuel - 10);
              gameAudio.playBoost();
              gameAudio.setTempoBoost(true);
            }
          }}
          disabled={fuel <= 15}
          className="px-4 h-10 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Flame className="w-4 h-4 fill-slate-950" />
          <span>NITRO TURBO</span>
        </button>
      </div>
    </div>
  );
};
