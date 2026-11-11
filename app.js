let currentLevel = "N5";
let lives = 5;
let streak = 0;
let xp = 0;
let currentQIdx = 0;
let questions = [];
let selectedOpt = null;
let currentQData = null;

// 配對題狀態
let matchSelectedJp = null;
let matchSelectedZh = null;
let matchedCount = 0;

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function initLevel(level) {
    currentLevel = level;
    lives = 5;
    currentQIdx = 0;

    const saved = Storage.load();
    xp = saved.xp;
    streak = saved.streak;

    // 渲染知識點
    const kBox = document.getElementById("knowledge-box");
    kBox.innerHTML = db[level].knowledge.map(k => `
        <div class="mini-item" onclick="TTS.speak('${k.example}')">
            <strong>${k.title}</strong>：${k.desc} 🔊
        </div>
    `).join("");

    questions = shuffle(db[level].pool);
    updateUI();
    loadQuestion();
}

function updateUI() {
    document.getElementById("lives-count").innerText = lives;
    document.getElementById("streak-count").innerText = streak;
    document.getElementById("xp-count").innerText = xp;
    Storage.save(xp, streak);
}

function loadQuestion() {
    document.getElementById("feedback-footer").classList.add("hidden");
    selectedOpt = null;
    matchSelectedJp = null; matchSelectedZh = null; matchedCount = 0;

    if (lives <= 0) {
        document.getElementById("quiz-question").innerText = "💥 愛心耗盡！關卡失敗";
        document.getElementById("quiz-options").innerHTML = `<button class="duo-btn" onclick="initLevel('${currentLevel}')">重試</button>`;
        return;
    }

    if (currentQIdx >= questions.length) {
        SoundFX.playCorrect();
        document.getElementById("quiz-question").innerText = `🎉 成功完成 ${currentLevel} 挑戰！`;
        document.getElementById("quiz-options").innerHTML = `<button class="duo-btn" onclick="initLevel('${currentLevel}')">繼續刷題</button>`;
        return;
    }

    currentQData = questions[currentQIdx];
    document.getElementById("quiz-type-tag").innerText = currentQData.type;
    document.getElementById("quiz-question").innerText = currentQData.q;
    document.getElementById("progress-fill").style.width = `${(currentQIdx / questions.length) * 100}%`;

    const ttsBtn = document.getElementById("tts-btn");
    if (currentQData.speak) {
        ttsBtn.style.display = "inline-block";
        ttsBtn.onclick = () => TTS.speak(currentQData.speak);
        TTS.speak(currentQData.speak);
    } else {
        ttsBtn.style.display = "none";
    }

    const oBox = document.getElementById("quiz-options");
    if (currentQData.type === "連線配對") {
        renderMatchQuestion(oBox);
    } else {
        oBox.className = "options-grid";
        oBox.innerHTML = shuffle(currentQData.options).map(opt => `
            <button class="duo-opt-btn" onclick="selectSingleOption(this, '${opt}')">${opt}</button>
        `).join("");
    }
}

function selectSingleOption(btn, opt) {
    document.querySelectorAll(".duo-opt-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedOpt = opt;
    checkAnswer();
}

function renderMatchQuestion(container) {
    container.className = "match-grid";
    const jpList = shuffle(currentQData.pairs.map(p => p.jp));
    const zhList = shuffle(currentQData.pairs.map(p => p.zh));

    container.innerHTML = `
        <div class="options-grid">${jpList.map(j => `<button class="duo-opt-btn jp-btn" onclick="selectMatch(this, 'jp', '${j}')">${j}</button>`).join('')}</div>
        <div class="options-grid">${zhList.map(z => `<button class="duo-opt-btn zh-btn" onclick="selectMatch(this, 'zh', '${z}')">${z}</button>`).join('')}</div>
    `;
}

window.selectMatch = function(btn, type, val) {
    TTS.speak(val);
    if (type === 'jp') {
        document.querySelectorAll(".jp-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        matchSelectedJp = { btn, val };
    } else {
        document.querySelectorAll(".zh-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        matchSelectedZh = { btn, val };
    }

    if (matchSelectedJp && matchSelectedZh) {
        const pair = currentQData.pairs.find(p => p.jp === matchSelectedJp.val);
        if (pair && pair.zh === matchSelectedZh.val) {
            SoundFX.playCorrect();
            matchSelectedJp.btn.classList.add("matched");
            matchSelectedZh.btn.classList.add("matched");
            matchedCount++;
            if (matchedCount === currentQData.pairs.length) {
                selectedOpt = "MATCH_WIN";
                checkAnswer();
            }
        } else {
            SoundFX.playWrong();
            matchSelectedJp.btn.classList.remove("selected");
            matchSelectedZh.btn.classList.remove("selected");
        }
        matchSelectedJp = null; matchSelectedZh = null;
    }
}

function checkAnswer() {
    const feedbackFooter = document.getElementById("feedback-footer");
    const feedbackMsg = document.getElementById("feedback-msg");
    feedbackFooter.classList.remove("hidden");

    let isCorrect = (selectedOpt === currentQData.ans || selectedOpt === "MATCH_WIN");

    if (isCorrect) {
        SoundFX.playCorrect();
        streak++; xp += 10;
        feedbackMsg.innerHTML = "<span style='color:#58cc02;'>✨ 正確！</span>";
    } else {
        SoundFX.playWrong();
        streak = 0; lives--;
        feedbackMsg.innerHTML = `<span style='color:#ff4b4b;'>❌ 正確答案：${currentQData.ans}</span>`;
    }
    updateUI();
}

document.getElementById("next-question-btn").addEventListener("click", () => {
    currentQIdx++; loadQuestion();
});

document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        initLevel(e.target.dataset.level);
    });
});

initLevel("N5");
