/* 答對／答錯與成就音效（Web Audio，不需要外部檔案） */
const SoundFX = {
  ctx: null,
  muted: false,
  _ctx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  },
  _tone(steps, type, dur) {
    if (this.muted) return;
    try {
      const c = this._ctx(), t = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = type;
      osc.connect(gain); gain.connect(c.destination);
      steps.forEach(([f, at]) => osc.frequency.setValueAtTime(f, t + at));
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      osc.start(t); osc.stop(t + dur);
    } catch (e) { /* 忽略不支援的環境 */ }
  },
  playCorrect() { this._tone([[523.25, 0], [659.25, 0.1]], "sine", 0.3); },
  playWrong() { this._tone([[220, 0], [164.81, 0.15]], "sawtooth", 0.4); },
  playAchievement() { this._tone([[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.36]], "sine", 0.68); }
};
