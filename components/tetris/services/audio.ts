import type { TetrisSettings } from "@/components/tetris/game/types";

export class TetrisAudioController {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private settings: TetrisSettings | null = null;

  private ensureContext() {
    if (typeof window === "undefined") {
      return null;
    }
    if (!this.context) {
      const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) {
        return null;
      }
      this.context = new AudioCtor();
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.effectsGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.effectsGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  private applyVolume() {
    if (!this.masterGain || !this.musicGain || !this.effectsGain || !this.settings) {
      return;
    }
    this.masterGain.gain.value = this.settings.masterVolume / 100;
    this.musicGain.gain.value = this.settings.muteMusic ? 0 : this.settings.musicVolume / 100;
    this.effectsGain.gain.value = this.settings.muteEffects ? 0 : this.settings.effectsVolume / 100;
  }

  updateSettings(settings: TetrisSettings) {
    this.settings = settings;
    this.ensureContext();
    this.applyVolume();
  }

  async unlock() {
    const context = this.ensureContext();
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      await context.resume();
    }
  }

  private playNote(frequency: number, duration: number, gainValue: number, type: OscillatorType, channel: "music" | "effects") {
    const context = this.ensureContext();
    if (!context || !this.settings) {
      return;
    }
    const targetGain = channel === "music" ? this.musicGain : this.effectsGain;
    if (!targetGain) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(Math.max(0.0001, gainValue), context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(targetGain);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  startMusic() {
    if (this.musicTimer !== null) {
      return;
    }

    const sequence = [
      [261.63, 0.18],
      [329.63, 0.18],
      [392.0, 0.18],
      [523.25, 0.26],
      [392.0, 0.18],
      [329.63, 0.18],
      [293.66, 0.18],
      [349.23, 0.24],
    ] as const;

    let step = 0;
    this.musicTimer = window.setInterval(() => {
      const [frequency, duration] = sequence[step % sequence.length];
      this.playNote(frequency, duration, 0.08, "triangle", "music");
      if (step % 4 === 0) {
        this.playNote(frequency / 2, duration + 0.06, 0.04, "sine", "music");
      }
      step += 1;
    }, 240);
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playRotate() {
    this.playNote(660, 0.08, 0.06, "square", "effects");
  }

  playDrop() {
    this.playNote(220, 0.12, 0.08, "triangle", "effects");
  }

  playLineClear() {
    this.playNote(440, 0.1, 0.08, "triangle", "effects");
    window.setTimeout(() => this.playNote(660, 0.12, 0.08, "triangle", "effects"), 70);
    window.setTimeout(() => this.playNote(880, 0.16, 0.08, "sine", "effects"), 150);
  }

  playGameOver() {
    this.playNote(196, 0.18, 0.08, "sawtooth", "effects");
    window.setTimeout(() => this.playNote(164.81, 0.24, 0.08, "sawtooth", "effects"), 120);
    window.setTimeout(() => this.playNote(130.81, 0.34, 0.08, "triangle", "effects"), 260);
  }
}

