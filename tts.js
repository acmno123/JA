/* 語音朗讀（Web Speech Synthesis） */
const TTS = {
  rate: 0.9,
  voiceName: "",
  muted: false,
  voices() {
    if (!("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang));
  },
  speak(text) {
    if (!("speechSynthesis" in window) || this.muted || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = this.rate;
    const v = this.voices().find(x => x.name === this.voiceName);
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
};
