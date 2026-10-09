/**
 * Sovg'a AI Procedural Ambient Music Engine
 * Zero external asset dependencies. Uses native Web Audio API oscillators,
 * custom envelopes and biquad filters to generate soothing musical atmospheres
 * for voice greeting cards and calligraphy recitation.
 */

export type AmbientTrack = "ney" | "piano" | "lofi" | "none";

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrack: AmbientTrack = "none";
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private intervalId: any = null;

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

  public getActiveTrack(): AmbientTrack {
    return this.currentTrack;
  }

  public isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Start procedural ambient accompaniment
   */
  public play(track: AmbientTrack = "ney") {
    this.stop();
    if (track === "none") return;

    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentTrack = track;

    if (track === "ney") {
      this.startNeyDrone();
    } else if (track === "piano") {
      this.startPianoArpeggio();
    } else if (track === "lofi") {
      this.startLofiPad();
    }
  }

  /**
   * Stop all playing ambient music with gentle fade-out
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.ctx && this.activeNodes.length > 0) {
      const now = this.ctx.currentTime;
      this.activeNodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
              gain.disconnect();
            } catch {}
          }, 350);
        } catch {}
      });
      this.activeNodes = [];
    }

    this.isPlaying = false;
    this.currentTrack = "none";
  }

  /**
   * Sharqona Ney: Rich harmonic drone with subtle vibrato in D minor / Bayati mode
   */
  private startNeyDrone() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Frequencies: D3 (146.83), A3 (220.0), D4 (293.66), F4 (349.23)
    const baseFreqs = [146.83, 220.0, 293.66, 349.23];

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm tone
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      // Subtle breath vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.5 + idx * 0.4, now);
      lfoGain.gain.setValueAtTime(2.2, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      // Filter to soften harmonics
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);

      // Soft ambient volume
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035 / (idx + 1), now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      this.activeNodes.push({ osc, gain });
    });
  }

  /**
   * Royal Piano: Gentle cycle of soothing chord arpeggios
   */
  private startPianoArpeggio() {
    if (!this.ctx) return;

    // Chords: C maj9 (C4, E4, G4, B4, D5) -> Am9 (A3, C4, E4, G4, B4) -> Fmaj7 -> Gsus4
    const chordProgressions = [
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
      [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
      [174.61, 261.63, 329.63, 349.23, 440.0], // Fmaj7
      [196.0, 293.66, 392.0, 440.0, 587.33],   // Gsus4
    ];

    let chordIdx = 0;
    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      const chord = chordProgressions[chordIdx];
      const noteFreq = chord[Math.floor(Math.random() * chord.length)];

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(noteFreq, now);

      // Acoustic decay envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);

      if (Math.random() > 0.7) {
        chordIdx = (chordIdx + 1) % chordProgressions.length;
      }
    };

    // Play an arpeggio note every 450ms
    playNextNote();
    this.intervalId = setInterval(playNextNote, 480);
  }

  /**
   * Lofi Space: Slow evolving warm analog pad
   */
  private startLofiPad() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Warm F minor / Ab major chords
    const padFreqs = [174.61, 220.0, 261.63, 349.23];

    padFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450 + idx * 80, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      this.activeNodes.push({ osc, gain });
    });
  }
}

export const ambientMusic = new AmbientMusicEngine();
