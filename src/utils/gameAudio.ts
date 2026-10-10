// Web Audio API Sound Synthesizer & Music Engine for Voyage Globetrotter Game
// 100% self-contained, lightweight, zero external asset dependencies

export interface SongTrackInfo {
  id: number;
  name: string;
  genre: string;
  bpm: number;
  description: string;
}

export const SONG_TRACKS: SongTrackInfo[] = [
  {
    id: 0,
    name: 'Aero Flight Beat',
    genre: 'Adventure Synth-Pop',
    bpm: 128,
    description: 'Upbeat melodic aviation groove with driving bass and uplifting synth hooks.',
  },
  {
    id: 1,
    name: 'Riviera Horizon',
    genre: 'Ionian Breeze Chiptune',
    bpm: 122,
    description: 'Breezy Mediterranean summer melody with bright plucks and rhythmic pulse.',
  },
  {
    id: 2,
    name: 'Turbo Alpine Cruise',
    genre: 'Electro Rally Wave',
    bpm: 136,
    description: 'High-octane energetic arcade sprint with pulsating bass and fast percussion.',
  },
  {
    id: 3,
    name: 'Balkan Eagle Anthem',
    genre: 'Balkan Cinematic Groove',
    bpm: 130,
    description: 'Heroic flight anthem with soaring Balkan flute melodies, driving folk synths, and epic eagle percussion.',
  },
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private musicVolume: number = 0.35;
  private noiseBuffer: AudioBuffer | null = null;

  // Music sequencer state
  private currentTrackIdx: number = 0;
  private isPlayingMusic: boolean = false;
  private musicTimerId: number | null = null;
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private tempoBoost: boolean = false;
  private musicGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private currentEqualizerLevel: number = 0;

  constructor() {
    try {
      const savedMuted = localStorage.getItem('voyage_game_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      const savedMusic = localStorage.getItem('voyage_game_music_enabled');
      if (savedMusic !== null) {
        this.isMusicEnabled = savedMusic === 'true';
      }
      const savedTrack = localStorage.getItem('voyage_game_music_track');
      if (savedTrack !== null) {
        const parsed = parseInt(savedTrack, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < SONG_TRACKS.length) {
          this.currentTrackIdx = parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGainNode.connect(this.ctx.destination);

        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.setValueAtTime(this.isMusicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
        this.musicGainNode.connect(this.masterGainNode);

        // Pre-create 1-second white noise buffer for percussions
        const bufferSize = this.ctx.sampleRate;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('voyage_game_muted', String(muted));
    } catch {
      // ignore
    }
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // ==========================================
  // Background Music Sequencer & Engine
  // ==========================================

  public isMusicPlaying(): boolean {
    return this.isPlayingMusic && this.isMusicEnabled && !this.isMuted;
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    try {
      localStorage.setItem('voyage_game_music_enabled', String(this.isMusicEnabled));
    } catch {
      // ignore
    }
    if (this.isMusicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicEnabled;
  }

  public getMusicTrack(): number {
    return this.currentTrackIdx;
  }

  public setMusicTrack(idx: number) {
    if (idx < 0 || idx >= SONG_TRACKS.length) return;
    this.currentTrackIdx = idx;
    try {
      localStorage.setItem('voyage_game_music_track', String(idx));
    } catch {
      // ignore
    }
    if (this.isPlayingMusic) {
      // Reset step for seamless track change
      this.currentStep = 0;
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.isMusicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setTempoBoost(boost: boolean) {
    this.tempoBoost = boost;
  }

  public getEqualizerLevel(): number {
    return this.currentEqualizerLevel;
  }

  public startMusic(trackIdx?: number) {
    this.initCtx();
    if (!this.ctx) return;
    if (typeof trackIdx === 'number') {
      this.setMusicTrack(trackIdx);
    }
    if (!this.isMusicEnabled) return;

    if (this.isPlayingMusic) return; // already playing
    this.isPlayingMusic = true;
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    if (this.musicGainNode) {
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }

    this.scheduleMusicLoop();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.currentEqualizerLevel = 0;
  }

  private scheduleMusicLoop = () => {
    if (!this.isPlayingMusic || !this.ctx) return;

    const track = SONG_TRACKS[this.currentTrackIdx] || SONG_TRACKS[0];
    const baseBpm = track.bpm;
    const effectiveBpm = this.tempoBoost ? baseBpm * 1.25 : baseBpm;
    const stepDuration = 60 / effectiveBpm / 4; // 16th note in seconds

    // Schedule up to lookahead window (100ms)
    while (this.nextStepTime < this.ctx.currentTime + 0.15) {
      this.playStep(this.currentStep, this.nextStepTime, this.currentTrackIdx);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 32; // 2 bars of 16 steps
    }

    // Decay equalizer visualization
    this.currentEqualizerLevel = Math.max(0, this.currentEqualizerLevel - 0.08);

    this.musicTimerId = window.setTimeout(this.scheduleMusicLoop, 40);
  };

  private playStep(step: number, time: number, trackId: number) {
    if (!this.ctx || !this.musicGainNode) return;
    const ctx = this.ctx;

    // Track 0: "Aero Flight Beat" (F minor / Ab major upbeat synthpop)
    // Track 1: "Riviera Horizon" (D major / B minor tropical breeze)
    // Track 2: "Turbo Alpine Cruise" (A minor electro wave)

    let kick = false;
    let snare = false;
    let hihat = false;
    let bassFreq = 0;
    let leadFreq = 0;
    let chordFreqs: number[] = [];

    if (trackId === 0) {
      // Kick on beats 0, 4, 8, 12, 16, 20, 24, 28 (four on the floor)
      kick = step % 4 === 0;
      // Snare on 4, 12, 20, 28
      snare = step % 8 === 4;
      // Hi-hat on offbeat eighth notes & 16ths
      hihat = step % 2 === 1 || step % 4 === 2;

      // Bassline in F minor / Ab: F2 (87.3), Ab2 (103.8), Bb2 (116.5), C3 (130.8), Eb2 (77.8)
      const bassPattern = [
        87.3, 87.3, 174.6, 87.3, 103.8, 103.8, 207.6, 103.8,
        116.5, 116.5, 233.1, 116.5, 130.8, 116.5, 103.8, 87.3,
        87.3, 87.3, 174.6, 87.3, 103.8, 103.8, 207.6, 103.8,
        77.8, 77.8, 155.6, 77.8, 130.8, 116.5, 103.8, 87.3,
      ];
      bassFreq = bassPattern[step] || 0;

      // Melodic Lead: F4 (349), Ab4 (415), C5 (523), Eb5 (622), F5 (698), G5 (784)
      const leadPattern = [
        349.2, 0, 415.3, 0, 523.3, 0, 622.3, 523.3,
        0, 349.2, 0, 415.3, 523.3, 0, 0, 415.3,
        698.5, 0, 622.3, 0, 523.3, 0, 415.3, 0,
        523.3, 0, 622.3, 0, 698.5, 784.0, 698.5, 0,
      ];
      leadFreq = leadPattern[step] || 0;

      if (step === 0 || step === 16) {
        chordFreqs = [174.6, 261.6, 349.2]; // F minor
      } else if (step === 8 || step === 24) {
        chordFreqs = [207.6, 261.6, 311.1]; // Ab major
      }
    } else if (trackId === 1) {
      // Riviera Horizon (D major chill tropical melodic house)
      kick = step % 4 === 0;
      snare = step % 8 === 4;
      hihat = step % 2 === 1;

      // Bassline in D: D2 (73.4), G2 (98.0), B2 (123.5), A2 (110.0)
      const bassPattern = [
        73.4, 0, 73.4, 146.8, 0, 73.4, 146.8, 0,
        98.0, 0, 98.0, 196.0, 0, 98.0, 196.0, 0,
        123.5, 0, 123.5, 246.9, 0, 123.5, 246.9, 0,
        110.0, 0, 110.0, 220.0, 0, 110.0, 220.0, 0,
      ];
      bassFreq = bassPattern[step] || 0;

      // Bright Lead: D5 (587), F#5 (740), A5 (880), B5 (987), E5 (659)
      const leadPattern = [
        587.3, 0, 739.9, 0, 880.0, 0, 739.9, 0,
        659.3, 0, 587.3, 0, 493.9, 0, 587.3, 0,
        739.9, 0, 880.0, 0, 987.8, 0, 880.0, 739.9,
        659.3, 0, 739.9, 0, 880.0, 0, 587.3, 0,
      ];
      leadFreq = leadPattern[step] || 0;

      if (step % 8 === 0) {
        chordFreqs = [293.7, 369.9, 440.0];
      }
    } else if (trackId === 2) {
      // Turbo Alpine Cruise (A minor 136 bpm electro sprint)
      kick = step % 4 === 0 || step === 14 || step === 30;
      snare = step % 8 === 4;
      hihat = true; // fast 16th rolling hats

      // Driving rolling bassline: A2 (110.0), C3 (130.8), D3 (146.8), E3 (164.8)
      const bassPattern = [
        110.0, 110.0, 220.0, 110.0, 110.0, 110.0, 220.0, 110.0,
        130.8, 130.8, 261.6, 130.8, 146.8, 146.8, 293.7, 146.8,
        110.0, 110.0, 220.0, 110.0, 110.0, 110.0, 220.0, 110.0,
        164.8, 164.8, 329.6, 164.8, 146.8, 130.8, 110.0, 98.0,
      ];
      bassFreq = bassPattern[step] || 0;

      // Fast arpeggiated lead
      const leadPattern = [
        440.0, 523.3, 659.3, 880.0, 659.3, 523.3, 440.0, 523.3,
        523.3, 659.3, 783.9, 1046.5, 783.9, 659.3, 523.3, 659.3,
        440.0, 523.3, 659.3, 880.0, 659.3, 523.3, 440.0, 523.3,
        659.3, 783.9, 987.8, 1318.5, 987.8, 783.9, 659.3, 440.0,
      ];
      leadFreq = leadPattern[step] || 0;
    } else {
      // Track 3: Balkan Eagle Anthem (E minor / Harmonic Minor 130 bpm)
      // Syncopated Balkan dance kick & snare groove
      kick = step % 4 === 0 || step % 8 === 6;
      snare = step % 8 === 4;
      hihat = step % 2 === 1 || step % 4 === 2;

      // Balkan bassline: E2 (82.4), G2 (98.0), B2 (123.5), C3 (130.8), B2 (123.5), A2 (110.0)
      const bassPattern = [
        82.4, 0, 82.4, 164.8, 98.0, 0, 98.0, 196.0,
        123.5, 0, 123.5, 246.9, 130.8, 123.5, 110.0, 98.0,
        82.4, 0, 82.4, 164.8, 98.0, 0, 98.0, 196.0,
        123.5, 130.8, 123.5, 110.0, 98.0, 110.0, 98.0, 82.4,
      ];
      bassFreq = bassPattern[step] || 0;

      // Soaring Balkan Eagle hook: E4 (329.6), G4 (392.0), B4 (493.9), C5 (523.3), D#5 (622.3), E5 (659.3)
      const leadPattern = [
        329.6, 0, 392.0, 0, 493.9, 523.3, 493.9, 392.0,
        493.9, 0, 622.3, 0, 659.3, 0, 622.3, 493.9,
        523.3, 0, 493.9, 0, 392.0, 0, 369.9, 329.6,
        369.9, 0, 392.0, 493.9, 622.3, 659.3, 622.3, 0,
      ];
      leadFreq = leadPattern[step] || 0;

      if (step === 0 || step === 16) {
        chordFreqs = [164.8, 246.9, 329.6]; // E minor
      } else if (step === 8 || step === 24) {
        chordFreqs = [196.0, 246.9, 293.7]; // G major
      }
    }

    // Trigger Drum Sounds
    if (kick) this.synthKick(time);
    if (snare) this.synthSnare(time);
    if (hihat) this.synthHihat(time, step % 4 === 2 ? 0.08 : 0.04);

    // Trigger Bass
    if (bassFreq > 0) {
      this.synthBass(bassFreq, time, 0.16);
    }

    // Trigger Lead Melody
    if (leadFreq > 0) {
      this.synthLead(leadFreq, time, 0.22);
    }

    // Trigger Chords
    if (chordFreqs.length > 0) {
      this.synthChordPad(chordFreqs, time, 0.6);
    }

    // Equalizer jump for UI feedback
    if (kick || leadFreq > 0) {
      this.currentEqualizerLevel = 1.0;
    }
  }

  private synthKick(time: number) {
    if (!this.ctx || !this.musicGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGainNode);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private synthSnare(time: number) {
    if (!this.ctx || !this.musicGainNode || !this.noiseBuffer) return;

    // Noise component
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.musicGainNode);

    noise.start(time);
    noise.stop(time + 0.16);

    // Tone pop component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);

    oscGain.gain.setValueAtTime(0.25, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.musicGainNode);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private synthHihat(time: number, vol = 0.05) {
    if (!this.ctx || !this.musicGainNode || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGainNode);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  private synthBass(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.musicGainNode) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGainNode);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private synthLead(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.musicGainNode) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.004, time); // warm chorus detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, time);

    gain.gain.setValueAtTime(0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGainNode);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.02);
    osc2.stop(time + duration + 0.02);
  }

  private synthChordPad(freqs: number[], time: number, duration: number) {
    if (!this.ctx || !this.musicGainNode) return;
    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicGainNode!);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  }

  // ==========================================
  // Sound FX (Coins, Hits, Boost, etc.)
  // ==========================================

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playSuitcase() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.setValueAtTime(659.25, now + 0.06);
    osc1.frequency.setValueAtTime(783.99, now + 0.12);
    osc1.frequency.setValueAtTime(1046.50, now + 0.18);

    osc2.frequency.setValueAtTime(1046.50, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGainNode);

    osc1.start(now);
    osc2.start(now + 0.18);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  public playFuel() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playPowerup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.16, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGainNode!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playBoost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const melody = [
      { freq: 523.25, time: 0.0, dur: 0.12 },
      { freq: 659.25, time: 0.12, dur: 0.12 },
      { freq: 783.99, time: 0.24, dur: 0.12 },
      { freq: 1046.50, time: 0.36, dur: 0.45 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.24, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(this.masterGainNode!);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playEagle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const chords = [
      { freq: 440.0, delay: 0 },
      { freq: 554.37, delay: 0.08 },
      { freq: 659.25, delay: 0.16 },
      { freq: 880.0, delay: 0.24 },
      { freq: 1108.73, delay: 0.32 },
    ];

    chords.forEach(({ freq, delay }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.22, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGainNode!);

      osc.start(now + delay);
      osc.stop(now + delay + 0.45);
    });
  }

  // Sonic blast shockwave effect (for flight game cloud buster)
  public playSonicBlast() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Near miss whoosh
  public playNearMiss() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Rally Car: Tire screech / drift
  public playTireScreech() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGainNode);

    noise.start(now);
    noise.stop(now + 0.26);
  }

  // Rally Car: Engine acceleration rev
  public playEngineRev() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGainNode);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const gameAudio = new SoundManager();
