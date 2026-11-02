class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private isMobileController: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = window.localStorage.getItem('mathshow_muted');
      this.muted = savedMute === 'true';
    }
  }

  /**
   * Define se o dispositivo atual é o controle do celular.
   * No celular não reproduzimos áudios, apenas uma leve vibração no início de cada jogada.
   */
  public setControllerMode(isController: boolean) {
    this.isMobileController = isController;
  }

  private getContext(): AudioContext | null {
    if (this.muted || this.isMobileController || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mathshow_muted', String(this.muted));
    }
    if (!this.muted) {
      this.playTick();
    }
    return this.muted;
  }

  /**
   * Vibração Háptica (Vibration API) para o Controle no Celular
   * Leve tremida para identificar o início de cada jogada.
   */
  public vibrate(pattern: 'question_start' | 'tap' | 'powerup' | 'success' | 'encourage') {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
    try {
      switch (pattern) {
        case 'question_start':
          // Leve tremida no início de cada jogada
          navigator.vibrate(55);
          break;
        case 'tap':
          navigator.vibrate(25);
          break;
        case 'powerup':
          navigator.vibrate(35);
          break;
        case 'success':
          navigator.vibrate(45);
          break;
        case 'encourage':
          navigator.vibrate(30);
          break;
      }
    } catch {
      // Ignore on devices without vibration motor
    }
  }

  public playPlayerJoin() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.14, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.24);
    });
  }

  public playBuzzerLock(slotIndex = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreqs = [440, 493.88, 587.33, 659.25];
    const freq = baseFreqs[slotIndex % baseFreqs.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playPowerUp() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.2);
    });
  }

  /**
   * Som característico de Game Show para identificar claramente o início de cada pergunta na TV
   */
  public playNewQuestion() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const sequence = [
      { f: 523.25, t: 0.0, d: 0.12, type: 'triangle' as OscillatorType, g: 0.18 },  // C5
      { f: 659.25, t: 0.1, d: 0.12, type: 'triangle' as OscillatorType, g: 0.18 },  // E5
      { f: 783.99, t: 0.2, d: 0.14, type: 'triangle' as OscillatorType, g: 0.2 },   // G5
      { f: 1046.5, t: 0.32, d: 0.42, type: 'sine' as OscillatorType, g: 0.24 },     // C6 chime
      { f: 1318.5, t: 0.32, d: 0.38, type: 'triangle' as OscillatorType, g: 0.12 }, // E6 harmonic
    ];
    sequence.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(n.g, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.02);
    });
  }

  public playTick(urgent = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = urgent ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(urgent ? 780 : 620, now);

    gain.gain.setValueAtTime(urgent ? 0.1 : 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playRoundReveal(anyCorrect: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (anyCorrect) {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.15, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.47);
      });
    } else {
      const notes = [440, 392];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.15);
        gain.gain.setValueAtTime(0.11, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.28);
      });
    }
  }

  public playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const sequence = [
      { f: 523.25, t: 0, d: 0.14 },
      { f: 523.25, t: 0.15, d: 0.14 },
      { f: 523.25, t: 0.3, d: 0.14 },
      { f: 659.25, t: 0.45, d: 0.3 },
      { f: 587.33, t: 0.78, d: 0.25 },
      { f: 659.25, t: 1.05, d: 0.25 },
      { f: 783.99, t: 1.32, d: 0.65 },
    ];
    sequence.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.18, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.02);
    });
  }

  /**
   * Som comemorativo especial de Medalha 3D e Chuva de Confetes na TV
   */
  public playMedalFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.16, type: 'triangle' as OscillatorType },
      { f: 659.25, t: 0.09, d: 0.16, type: 'triangle' as OscillatorType },
      { f: 783.99, t: 0.18, d: 0.18, type: 'triangle' as OscillatorType },
      { f: 1046.5, t: 0.27, d: 0.45, type: 'triangle' as OscillatorType },
      { f: 1318.5, t: 0.36, d: 0.55, type: 'sine' as OscillatorType },
      { f: 1567.98, t: 0.45, d: 0.65, type: 'sine' as OscillatorType },
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.16, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.03);
    });
  }
}

export const soundEngine = new SoundEngine();
