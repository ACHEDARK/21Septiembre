// Audio sintetizado localmente: no descarga música ni empieza automáticamente.
export class AmbientAudio {
  constructor() {
    this.enabled = false;
  }
  async toggle() {
    if (!this.context) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return false;
      this.context = new Audio();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      [130.81, 196, 261.63, 329.63].forEach((frequency, i) => {
        const oscillator = this.context.createOscillator(),
          gain = this.context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.018 / (i + 1);
        oscillator.connect(gain).connect(this.master);
        oscillator.start();
      });
      const buffer = this.context.createBuffer(
          1,
          this.context.sampleRate * 3,
          this.context.sampleRate,
        ),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * 0.035;
      const wind = this.context.createBufferSource(),
        filter = this.context.createBiquadFilter();
      wind.buffer = buffer;
      wind.loop = true;
      filter.frequency.value = 350;
      wind.connect(filter).connect(this.master);
      wind.start();
    }
    await this.context.resume();
    this.enabled = !this.enabled;
    this.master.gain.setTargetAtTime(
      this.enabled ? 0.7 : 0,
      this.context.currentTime,
      0.6,
    );
    return this.enabled;
  }
  chime() {
    if (!this.enabled) return;
    const t = this.context.currentTime,
      osc = this.context.createOscillator(),
      gain = this.context.createGain();
    osc.frequency.value = [523.25, 659.25, 783.99, 1046.5][
      Math.floor(Math.random() * 4)
    ];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 2.6);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  suspend(paused) {
    if (this.context) {
      if (paused) this.context.suspend();
      else if (this.enabled) this.context.resume();
    }
  }
  mute() {
    if (this.context)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.2);
    this.enabled = false;
  }
}
