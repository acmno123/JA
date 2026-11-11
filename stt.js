/* 語音辨識（Web Speech Recognition）與發音相似度評分 */
const STT = {
  Ctor: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  get supported() { return !!this.Ctor; },

  listen({ onResult, onError, onEnd, lang = "ja-JP" }) {
    if (!this.Ctor) { onError && onError("unsupported"); return null; }
    const r = new this.Ctor();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = e => onResult([...e.results[0]].map(a => a.transcript));
    r.onerror = e => onError && onError(e.error);
    r.onend = () => onEnd && onEnd();
    try { r.start(); } catch (e) { onError && onError("busy"); return null; }
    return r;
  },

  /* 正規化：去除標點與空白，片假名轉平假名，統一小寫 */
  norm(s) {
    return String(s)
      .replace(/[\s。、！？!?.,「」『』・〜~ー（）()]/g, "")
      .replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
      .toLowerCase();
  },

  /* 以雙字元 Dice 係數計算相似度（0～1） */
  similarity(a, b) {
    a = this.norm(a); b = this.norm(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;
    const grams = s => {
      const m = new Map();
      for (let i = 0; i < s.length - 1; i++) {
        const g = s.slice(i, i + 2);
        m.set(g, (m.get(g) || 0) + 1);
      }
      return m;
    };
    const A = grams(a), B = grams(b);
    let inter = 0;
    for (const [g, n] of A) inter += Math.min(n, B.get(g) || 0);
    return 2 * inter / ((a.length - 1) + (b.length - 1));
  }
};
