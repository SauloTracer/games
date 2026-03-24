export class SlideAudioController {
  private context: AudioContext | null = null;
  private volume = 0.08;

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
    }

    return this.context;
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

  private playTone(frequency: number, duration: number, type: OscillatorType) {
    const context = this.ensureContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = this.volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
  }

  playMove() {
    this.playTone(420, 0.08, "triangle");
  }

  playVictory() {
    this.playTone(523.25, 0.12, "triangle");
    window.setTimeout(() => this.playTone(659.25, 0.12, "triangle"), 90);
    window.setTimeout(() => this.playTone(783.99, 0.18, "sine"), 180);
  }
}
