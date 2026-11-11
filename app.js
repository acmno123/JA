/* ===== 工具 ===== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
}
const STT_ERR = {
  "not-allowed": "請允許瀏覽器使用麥克風",
  "no-speech": "沒有聽到聲音，請再試一次",
  "unsupported": "此瀏覽器不支援語音辨識，請使用 Chrome 或 Edge",
  "busy": "麥克風忙碌中，請稍後再試",
  "network": "語音服務連線失敗"
};

/* ===== 狀態 ===== */
let user = null, data = null;
let level = "N5", lives = 5, streak = 0, xp = 0;
let list = [], idx = 0, answered = false, reviewMode = false, correct = 0;
let rec = null, mJp = null, mZh = null, mDone = 0, tStep = 0;

const defaults = () => ({
  xp: 0, streak: 0, best: {}, wrong: [], tutorialDone: false,
  settings: { rate: 0.9, voice: "", auto: false, muted: false, voiceAnswer: false, theme: "auto" }
});
const key = () => "jaq.data." + user.email;
function save() { data.xp = xp; data.streak = streak; Store.set(key(), data); }

/* ===== 進入遊戲 ===== */
function enter(email) {
  const u = Store.get("jaq.users", {})[email];
  if (!u) return;
  user = { email, name: u.name };
  data = Object.assign(defaults(), Store.get(key(), {}));
  xp = data.xp; streak = data.streak;
  $("user-chip").textContent = "👤 " + user.name;
  $("auth-screen").classList.add("hidden");
  $("app").classList.remove("hidden");
  applySettings();
  startLevel(level);
  if (!data.tutorialDone) openTutorial();
}

function applySettings() {
  const s = data.settings;
  TTS.rate = s.rate; TTS.voiceName = s.voice; TTS.muted = s.muted; SoundFX.muted = s.muted;
  $("set-rate").value = s.rate;
  $("set-rate-v").textContent = s.rate.toFixed(1) + "x";
  $("set-auto").checked = s.auto;
  $("set-mute").checked = s.muted;
  $("set-voiceans").checked = s.voiceAnswer;
  setTheme(s.theme, false);
  populateVoices();
}

function populateVoices() {
  const sel = $("set-voice");
  sel.innerHTML = '<option value="">自動（系統預設日文）</option>' +
    TTS.voices().map(v => `<option value="${esc(v.name)}">${esc(v.name)} · ${esc(v.lang)}</option>`).join("");
  sel.value = data.settings.voice;
}
if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => { if (data) populateVoices(); };

function setTheme(t, persist = true) {
  document.documentElement.dataset.theme = t === "auto" ? "" : t;
  $("btn-theme").textContent = t === "dark" ? "🌙" : t === "light" ? "☀️" : "🌓";
  if (persist) { data.settings.theme = t; save(); }
}

/* ===== HUD ===== */
function updateHUD() {
  $("lives-count").textContent = lives;
  $("streak-count").textContent = streak;
  $("xp-count").textContent = xp;
  $("wrong-count").textContent = data.wrong.length;
}

/* ===== 關卡 ===== */
function startLevel(lv, review = false) {
  if (lv) level = lv;
  reviewMode = review;
  lives = 5; idx = 0; correct = 0; answered = false;
  document.querySelectorAll(".level-btn[data-level]").forEach(b =>
    b.classList.toggle("active", b.dataset.level === level && !review));
  $("btn-review").classList.toggle("active", review);

  list = review
    ? shuffle(data.wrong.map(w => w.item)).slice(0, 10)
    : shuffle(DB[level].pool).slice(0, 5);

  renderKnowledge();
  renderPron();
  updateHUD();

  if (review && !list.length) {
    $("quiz-type-tag").textContent = "錯題本";
    $("quiz-question").textContent = "錯題本是空的，先去闖關吧！";
    $("quiz-options").innerHTML = "";
    $("progress-fill").style.width = "0%";
    $("progress-text").textContent = "";
    $("feedback-footer").classList.add("hidden");
    $("voice-btn").hidden = true;
    return;
  }
  loadQ();
}

function renderKnowledge() {
  $("knowledge-box").innerHTML = DB[level].knowledge.map(k => `
    <div class="mini-item">
      <div class="mi-top"><strong>${esc(k.title)}</strong>
        <button class="icon-btn sm" data-speak="${esc(k.example)}" title="朗讀例句">🔊</button></div>
      <div class="muted small">${esc(k.desc)}</div>
      <div class="ex">💡 ${esc(k.example)}</div>
    </div>`).join("");
}

function renderPron() {
  const targets = [...new Set([
    ...DB[level].knowledge.map(k => k.example),
    ...DB[level].pool.map(q => q.full).filter(Boolean)
  ])];
  $("pron-box").innerHTML = targets.map(t => `
    <div class="pron-row">
      <div class="pt"><b>${esc(t)}</b><div class="pheard muted small"></div></div>
      <button class="icon-btn sm" data-speak="${esc(t)}" title="聽發音">🔊</button>
      <button class="icon-btn sm" data-rec="${esc(t)}" title="跟讀評分">🎤</button>
      <span class="pscore"></span>
    </div>`).join("");
}

function loadQ() {
  answered = false; mJp = mZh = null; mDone = 0;
  $("feedback-footer").classList.add("hidden");
  $("tts-btn").hidden = true;

  if (lives <= 0) return endCard(false);
  if (idx >= list.length) return endCard(true);

  const q = list[idx];
  $("quiz-type-tag").textContent = q.type;
  $("quiz-question").textContent = `第 ${idx + 1} 題：${q.q}`;
  $("progress-text").textContent = `進度 ${idx + 1} / ${list.length}`;
  $("progress-fill").style.width = (idx / list.length * 100) + "%";

  const box = $("quiz-options");
  if (q.pairs) {
    box.className = "match-grid";
    renderMatch(box, q);
  } else {
    box.className = "options-grid";
    box.innerHTML = shuffle(q.options).map(o =>
      `<button class="duo-opt-btn" data-opt="${esc(o)}">${esc(o)}</button>`).join("");
  }

  $("voice-btn").hidden = !!q.pairs;
  if (q.speak) {
    $("tts-btn").hidden = false;
    $("tts-btn").onclick = () => TTS.speak(q.speak);
  }
  if (data.settings.auto && q.speak) TTS.speak(q.speak);
  if (data.settings.voiceAnswer && q.options) setTimeout(listenAnswer, 600);
}

function renderMatch(box, q) {
  const jp = shuffle(q.pairs.map(p => p.jp));
  const zh = shuffle(q.pairs.map(p => p.zh));
  box.innerHTML = `
    <div class="options-grid">${jp.map(j => `<button class="duo-opt-btn jp-btn" data-jp="${esc(j)}">${esc(j)}</button>`).join("")}</div>
    <div class="options-grid">${zh.map(z => `<button class="duo-opt-btn zh-btn" data-zh="${esc(z)}">${esc(z)}</button>`).join("")}</div>`;
}

function feedback(type, msg) {
  $("feedback-msg").innerHTML = `<span class="${type}">${msg}</span>`;
}

function answer(choice) {
  if (answered) return;
  answered = true;
  const q = list[idx];
  const ok = q.pairs ? true : choice === q.ans;

  if (ok) {
    streak++; xp += 10; correct++;
    SoundFX.playCorrect();
    feedback("good", q.pairs ? "✨ 全部配對正確！" : "✨ 太棒了！回答正確！");
    if (reviewMode) data.wrong = data.wrong.filter(w => w.k !== q.q);
    if (streak === 5) toast("🔥 5 連擊！");
  } else {
    streak = 0; lives--;
    SoundFX.playWrong();
    addWrong(q);
    feedback("bad", `❌ 答錯囉！正確答案：${esc(q.ans)}`);
  }

  if (q.options) {
    document.querySelectorAll("[data-opt]").forEach(b => {
      b.disabled = true;
      if (b.dataset.opt === q.ans) b.classList.add("correct");
      else if (b.dataset.opt === choice && !ok) b.classList.add("wrong");
    });
  }

  if (q.full) {
    TTS.speak(q.full);
    $("tts-btn").hidden = false;
    $("tts-btn").onclick = () => TTS.speak(q.full);
  }
  $("feedback-footer").classList.remove("hidden");
  $("next-question-btn").textContent = (lives <= 0 || idx + 1 >= list.length) ? "查看結果" : "繼續";
  save(); updateHUD();
}

function pickMatch(el) {
  if (answered || el.classList.contains("matched")) return;
  const q = list[idx];
  if (el.dataset.jp !== undefined) {
    document.querySelectorAll(".jp-btn").forEach(b => b.classList.remove("selected"));
    el.classList.add("selected");
    mJp = el;
    TTS.speak(el.dataset.jp);
  } else {
    document.querySelectorAll(".zh-btn").forEach(b => b.classList.remove("selected"));
    el.classList.add("selected");
    mZh = el;
  }
  if (mJp && mZh) {
    const pair = q.pairs.find(p => p.jp === mJp.dataset.jp);
    if (pair && pair.zh === mZh.dataset.zh) {
      SoundFX.playCorrect();
      [mJp, mZh].forEach(b => { b.classList.remove("selected"); b.classList.add("matched"); });
      mDone++;
      if (mDone === q.pairs.length) answer("__match__");
    } else {
      SoundFX.playWrong();
      const a = mJp, b = mZh;
      a.classList.add("wrong"); b.classList.add("wrong");
      setTimeout(() => {
        a.classList.remove("wrong", "selected");
        b.classList.remove("wrong", "selected");
      }, 450);
    }
    mJp = mZh = null;
  }
}

function addWrong(q) {
  if (!data.wrong.some(w => w.k === q.q)) data.wrong.push({ k: q.q, item: q });
}

function endCard(win) {
  $("feedback-footer").classList.add("hidden");
  $("voice-btn").hidden = true;
  if (win) {
    $("progress-fill").style.width = "100%";
    $("progress-text").textContent = "完成！";
    $("quiz-question").textContent = `🎉 恭喜通關 ${level} 特訓！（${correct} / ${list.length} 題正確）`;
    if (!reviewMode) data.best[level] = Math.max(data.best[level] || 0, correct);
  } else {
    $("quiz-question").textContent = "💥 愛心耗盡！闖關失敗";
  }
  const box = $("quiz-options");
  box.className = "options-grid";
  box.innerHTML = `<button class="duo-btn full" id="again">${win ? "再玩一次" : "重新挑戰"}</button>`;
  $("again").onclick = () => startLevel(level, reviewMode);
  save(); updateHUD();
}

/* ===== 語音作答 ===== */
function setMic(on) {
  const b = $("voice-btn");
  b.classList.toggle("rec", on);
  b.textContent = on ? "⏺ 聆聽中…（再按停止）" : "🎤 語音作答";
}

function listenAnswer() {
  if (!STT.supported) { toast(STT_ERR.unsupported); return; }
  if (rec) { rec.stop(); return; }
  const q = list[idx];
  if (!q || !q.options || answered) return;
  setMic(true);
  rec = STT.listen({
    onResult: alts => {
      const hit = pickFromSpeech(alts, q.options);
      if (hit && !answered) answer(hit);
      else toast(`聽到「${alts[0]}」，請再說一次`);
    },
    onError: e => toast(STT_ERR[e] || "辨識失敗：" + e),
    onEnd: () => { rec = null; setMic(false); }
  });
}

function pickFromSpeech(alts, opts) {
  for (const a of alts) {
    const n = STT.norm(a);
    const exact = opts.find(o => STT.norm(o) === n);
    if (exact) return exact;
  }
  for (const a of alts) {
    const n = STT.norm(a);
    const inc = opts.find(o => n.includes(STT.norm(o)));
    if (inc) return inc;
  }
  return null;
}

/* ===== 跟讀評分 ===== */
function practiceRec(rb) {
  if (!STT.supported) { toast(STT_ERR.unsupported); return; }
  const row = rb.closest(".pron-row");
  const target = rb.dataset.rec;
  row.classList.add("listening");
  STT.listen({
    onResult: alts => {
      const best = Math.max(...alts.map(a => STT.similarity(a, target)));
      const pct = Math.round(best * 100);
      row.querySelector(".pscore").innerHTML = `<b class="${pct >= 70 ? "good" : "bad"}">${pct}</b>`;
      row.querySelector(".pheard").textContent = "聽到：" + alts[0];
      if (pct >= 70) toast("發音很棒 🎉");
    },
    onError: e => toast(STT_ERR[e] || "辨識失敗：" + e),
    onEnd: () => row.classList.remove("listening")
  });
}

/* ===== 新手教學 ===== */
const TUT = [
  { ico: "🦉", t: "歡迎來到日語無盡特訓", d: "從 N5 到 N1 一路闖關。每關 5 題，一題一題累積 XP。" },
  { ico: "❤️", t: "闖關規則", d: "答對 +10 XP，連續答對會累積連擊。答錯扣一顆愛心，愛心歸零即闖關失敗。" },
  { ico: "🔊", t: "聽發音", d: "題目與例句都有 🔊 按鈕。作答後會自動朗讀完整句子，幫你記住正確語感。" },
  { ico: "🎤", t: "語音作答", d: "按「語音作答」後唸出選項即可作答，也可以在設定開啟自動語音作答。鍵盤 1–4 也能快速選擇。" },
  { ico: "🗣", t: "跟讀練習", d: "下方每一句都可以按 🎤 跟讀，系統會依相似度評分，70 分以上算通過。" },
  { ico: "📕", t: "錯題本", d: "答錯的題目會自動收進錯題本，點「錯題本」集中複習，答對即會移除。" },
  { ico: "⚙️", t: "語音與設定", d: "右上角 ⚙️ 可以調整語速、選擇日文聲音、靜音與自動朗讀。" }
];

function openTutorial() { tStep = 0; drawTut(); $("tutorial").classList.remove("hidden"); }
function drawTut() {
  const s = TUT[tStep], last = tStep === TUT.length - 1;
  $("tut-card").innerHTML = `
    <div class="tdots">${TUT.map((_, i) => `<i class="${i === tStep ? "on" : ""}"></i>`).join("")}</div>
    <div class="tut-ico">${s.ico}</div>
    <h2>${esc(s.t)}</h2>
    <p class="muted">${esc(s.d)}</p>
    <div class="tut-btns">
      <button class="duo-btn ghost" id="tut-skip">${last ? "關閉" : "跳過"}</button>
      <button class="duo-btn" id="tut-next">${last ? "開始闖關 🚀" : "下一步 →"}</button>
    </div>`;
  $("tut-skip").onclick = () => closeTut(true);
  $("tut-next").onclick = () => { if (last) closeTut(true); else { tStep++; drawTut(); } };
}
function closeTut(done) {
  $("tutorial").classList.add("hidden");
  if (done && data && !data.tutorialDone) { data.tutorialDone = true; save(); }
}

/* ===== 設定 ===== */
function openSettings(open) { $("settings").classList.toggle("hidden", !open); }

function logout() {
  Store.del("jaq.session");
  location.reload();
}

/* ===== 事件 ===== */
document.addEventListener("auth:ok", e => enter(e.detail));

$("level-nav").addEventListener("click", e => {
  const lb = e.target.closest(".level-btn[data-level]");
  if (lb) return startLevel(lb.dataset.level);
  if (e.target.closest("#btn-review")) startLevel(level, true);
});

$("next-question-btn").onclick = () => { idx++; loadQ(); };
$("voice-btn").onclick = listenAnswer;
$("btn-tutorial").onclick = openTutorial;
$("btn-settings").onclick = () => openSettings(true);
$("set-close").onclick = () => openSettings(false);
$("btn-logout").onclick = logout;
$("btn-theme").onclick = () => {
  const order = ["auto", "light", "dark"];
  const cur = data.settings.theme || "auto";
  setTheme(order[(order.indexOf(cur) + 1) % order.length]);
};

$("set-rate").addEventListener("input", e => {
  data.settings.rate = parseFloat(e.target.value);
  TTS.rate = data.settings.rate;
  $("set-rate-v").textContent = data.settings.rate.toFixed(1) + "x";
  save();
});
$("set-voice").addEventListener("change", e => { data.settings.voice = e.target.value; TTS.voiceName = e.target.value; save(); });
$("set-auto").addEventListener("change", e => { data.settings.auto = e.target.checked; save(); });
$("set-voiceans").addEventListener("change", e => { data.settings.voiceAnswer = e.target.checked; save(); });
$("set-mute").addEventListener("change", e => {
  data.settings.muted = e.target.checked;
  TTS.muted = SoundFX.muted = data.settings.muted;
  save();
});
$("set-test").onclick = () => TTS.speak("こんにちは、ようこそ");
$("set-reset").onclick = () => {
  if (!confirm("確定要重設所有學習進度嗎？（設定與帳號會保留）")) return;
  const s = data.settings, t = data.tutorialDone;
  data = defaults();
  data.settings = s; data.tutorialDone = t;
  xp = 0; streak = 0;
  save();
  startLevel(level);
  toast("已重設學習進度");
};

/* 點擊委派：朗讀、跟讀、選項、配對 */
document.addEventListener("click", e => {
  const sp = e.target.closest("[data-speak]");
  if (sp) return TTS.speak(sp.dataset.speak);
  const rb = e.target.closest("[data-rec]");
  if (rb) return practiceRec(rb);
  const opt = e.target.closest("#quiz-options [data-opt]");
  if (opt && !opt.disabled) return answer(opt.dataset.opt);
  const m = e.target.closest("#quiz-options [data-jp], #quiz-options [data-zh]");
  if (m) return pickMatch(m);
});

/* 鍵盤：1–4 選擇、Enter 繼續、V 語音作答 */
document.addEventListener("keydown", e => {
  if ($("app").classList.contains("hidden")) return;
  if (document.querySelector(".modal:not(.hidden)")) {
    if (e.key === "Escape") { openSettings(false); }
    return;
  }
  if (/^(input|select|textarea)$/i.test(e.target.tagName)) return;
  if (/^[1-4]$/.test(e.key)) {
    const b = document.querySelectorAll("#quiz-options [data-opt]")[+e.key - 1];
    if (b && !b.disabled) answer(b.dataset.opt);
  } else if (e.key === "Enter" && answered) {
    $("next-question-btn").click();
  } else if (e.key.toLowerCase() === "v") {
    listenAnswer();
  }
});
