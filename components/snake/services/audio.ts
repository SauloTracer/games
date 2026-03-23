type AudioSettings = {
  volume: number;
  muted: boolean;
};

export class SnakeAudioController {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private settings: AudioSettings = { volume: 70, muted: false };

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
      this.masterGain.connect(this.context.destination);
      this.applyVolume();
    }

    return this.context;
  }

  private applyVolume() {
    if (!this.masterGain) {
      return;
    }

    const normalized = this.settings.muted ? 0 : this.settings.volume / 100;
    this.masterGain.gain.value = normalized;
  }

  updateSettings(settings: AudioSettings) {
    this.settings = settings;
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

  private playTone(frequency: number, duration: number, type: OscillatorType, gainValue: number) {
    const context = this.ensureContext();
    if (!context || this.settings.muted || this.settings.volume === 0) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue * (this.settings.volume / 100);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
  }

  playEat() {
    this.playTone(520, 0.12, "triangle", 0.08);
    this.playTone(660, 0.08, "sine", 0.05);
  }

  playGameOver() {
    this.playTone(180, 0.3, "sawtooth", 0.09);
    this.playTone(120, 0.45, "triangle", 0.06);
  }

  playCheer() {
    this.playTone(523.25, 0.12, "triangle", 0.06);
    window.setTimeout(() => this.playTone(659.25, 0.12, "triangle", 0.06), 90);
    window.setTimeout(() => this.playTone(783.99, 0.18, "sine", 0.07), 180);
    window.setTimeout(() => this.playTone(1046.5, 0.24, "triangle", 0.08), 300);
  }
}
