/**
 * Cybernetic Audio Engine for Sovg'a AI
 * Uses Native Web Audio API with zero asset dependencies and automatic GC node cleanup.
 */

class CyberSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sovga_sound_fx");
      this.enabled = saved === "true";
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("sovga_sound_fx", String(this.enabled));
    }
    if (this.enabled) {
      this.initContext();
      this.playHoloChime();
    }
    return this.enabled;
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /** Subtle mechanical micro-click (Hover / Switch) */
  public playClick(freq = 1200, duration = 0.02) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Gracefully ignore audio errors
    }
  }

  /** Affirmative cybernetic chime (Button select / Action trigger) */
  public playConfirm() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.0, now + 0.06); // A5

      osc2.frequency.setValueAtTime(1174.66, now + 0.06); // D6

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.onended = () => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc1.start(now);
      osc1.stop(now + 0.22);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.22);
    } catch {
      // Gracefully ignore audio errors
    }
  }

  /** Holographic crystalline sheen chime (VIP card / Gold unlock) */
  public playHoloChime() {
    this.playChimeInternal();
  }

  public playChime() {
    this.playChimeInternal();
  }

  private playChimeInternal() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.03, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.04 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    } catch {
      // Gracefully ignore audio errors
    }
  }

  /** Radar / Telemetry laser blip */
  public playRadarBlip() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Gracefully ignore audio errors
    }
  }

  public playScan() {
    this.playRadarBlip();
  }

  public playSuccess() {
    this.playConfirm();
  }

  public playVictoryFanfare() {
    this.playHoloChime();
  }

  /** Subtle error / lock rejected buzz */
  public playError() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(130, now + 0.08);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Gracefully ignore audio errors
    }
  }

  /** Unified player for sounds */
  public play(type: "success" | "click" | "chime" | "radar" | "confirm" | "error") {
    switch (type) {
      case "success":
      case "confirm":
        this.playConfirm();
        break;
      case "error":
        this.playError();
        break;
      case "click":
        this.playClick();
        break;
      case "chime":
        this.playChime();
        break;
      case "radar":
        this.playRadarBlip();
        break;
      default:
        this.playConfirm();
    }
  }
}

export const cyberSound = new CyberSoundEngine();
