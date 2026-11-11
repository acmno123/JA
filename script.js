const db = {
    N5: {
        knowledge: [
            { title: "～は～です", desc: "A 是 B（肯定句）", example: "私は学生です。" },
            { title: "～を～ます", desc: "動作受詞助詞", example: "水を飲みます。" },
            { title: "私 (わたし)", desc: "我", example: "私は日本人です。" },
            { title: "食べる (たべる)", desc: "吃", example: "りんごを食べる。" }
        ],
        pool: [
            { type: "選擇題", q: "「私＿＿学生です。」請填入正確助詞。", options: ["は", "が", "を", "に"], ans: "は" },
            { type: "單字題", q: "請問「 食べる (たべる) 」的中文意思為何？", options: ["吃", "喝", "看", "跑"], ans: "吃" },
            { type: "選擇題", q: "「水＿＿飲みます。」請選擇受詞助詞。", options: ["を", "で", "へ", "と"], ans: "を" },
            { type: "單字題", q: "請問「 友達 (ともだち) 」的中文意思為何？", options: ["朋友", "學校", "老師", "家人"], ans: "朋友" },
            { type: "選擇題", q: "「図書館＿＿本を読みます。」", options: ["で", "に", "へ", "から"], ans: "で" }
        ]
    },
    N4: {
        knowledge: [
            { title: "～て形 + ください", desc: "請對方做某事", example: "書いてください。" },
            { title: "～てもいいです", desc: "許可表達", example: "写真を撮ってもいいです。" },
            { title: "手伝う (てつだう)", desc: "幫忙", example: "母を手伝う。" }
        ],
        pool: [
            { type: "選擇題", q: "「写真を撮っ＿＿いいですか。」", options: ["ても", "ては", "たら", "てもいい"], ans: "ても" },
            { type: "單字題", q: "請問「 手伝う (てつだう) 」的意思是？", options: ["幫忙", "約定", "旅行", "忘記"], ans: "幫忙" },
            { type: "選擇題", q: "「ここで泳い＿＿いけません。」（禁止）", options: ["ては", "ても", "たら", "なら"], ans: "ては" },
            { type: "選擇題", q: "「来年、日本へ行く＿＿です。」（打算）", options: ["つもり", "そう", "はず", "まま"], ans: "つもり" }
        ]
    },
    N3: {
        knowledge: [
            { title: "～ようにする", desc: "努力做到、養成習慣", example: "野菜を食べるようにする。" },
            { title: "～てたまらない", desc: "……得不得了", example: "嬉しくてたまらない。" }
        ],
        pool: [
            { type: "選擇題", q: "「健康のために、毎日歩く＿＿にしている。」", options: ["よう", "こと", "ため", "もの"], ans: "よう" },
            { type: "選擇題", q: "「人＿＿意見が異なる。」（因人而異）", options: ["によって", "について", "に対して", "に沿って"], ans: "によって" },
            { type: "單字題", q: "請問「 複雑 (ふくざつ) 」的意思是？", options: ["複雜的", "簡單的", "高興的", "悲傷的"], ans: "複雜的" }
        ]
    },
    N2: {
        knowledge: [
            { title: "～ざるを得ない", desc: "不得不……", example: "従わざるを得ない。" },
            { title: "～にほかならない", desc: "無非是……", example: "努力の結晶にほかならない。" }
        ],
        pool: [
            { type: "選擇題", q: "「規則だから、指示に従わ＿＿得ない。」", options: ["ず", "る", "せ", "させ"], ans: "ず" },
            { type: "選擇題", q: "「このままでは事故を起こし＿＿。」（有可能引發）", options: ["かねない", "がたい", "きれない", "っこない"], ans: "かねない" },
            { type: "單字題", q: "請問「 傾向 (けいこう) 」的意思是？", options: ["傾向、趨勢", "見解、看法", "效率", "契約"], ans: "傾向、趨勢" }
        ]
    },
    N1: {
        knowledge: [
            { title: "～を皮切りに", desc: "以……為開端", example: "東京公演を皮切りにツアー開始。" },
            { title: "～極まりない", desc: "極度、極其", example: "危険極まりない。" }
        ],
        pool: [
            { type: "選擇題", q: "「彼の態度は失礼＿＿＿ない。」", options: ["極まり", "わけ", "ぬく", "っこ"], ans: "極まり" },
            { type: "選擇題", q: "「資金難により、中止を＿＿＿された。」（被迫）", options: ["余儀なく", "余儀なし", "余儀なさ", "余儀なくし"], ans: "余儀なく" },
            { type: "單字題", q: "請問「 敷居が高い 」的意思是？", options: ["門檻高、不好意思登門", "大肆宣傳", "矛盾", "稀薄"], ans: "門檻高、不好意思登門" }
        ]
    }
};

let currentLevel = "N5";
let lives = 5;
let streak = 0;
let xp = 0;
let currentQuestionIndex = 0;
let currentQuestionsList = [];
let selectedOptionValue = null;
let answeredCurrent = false;

// 洗牌函數
function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 載入等級
function initLevel(level) {
    currentLevel = level;
    lives = 5;
    currentQuestionIndex = 0;
    
    // 渲染知識點卡片
    const kBox = document.getElementById("knowledge-box");
    kBox.innerHTML = db[level].knowledge.map(k => `
        <div class="mini-item">
            <strong>${k.title}</strong>：${k.desc}
            <div style="font-size: 0.8rem; color: #777; margin-top: 2px;">💡 ${k.example}</div>
        </div>
    `).join("");

    // 隨機抽選 5 題組成這次的闖關關卡
    currentQuestionsList = shuffle(db[level].pool).slice(0, 5);
    updateStatsUI();
    loadQuestion();
}

// 更新頂部數據
function updateStatsUI() {
    document.getElementById("lives-count").innerText = lives;
    document.getElementById("streak-count").innerText = streak;
    document.getElementById("xp-count").innerText = xp;
}

// 載入題目
function loadQuestion() {
    answeredCurrent = false;
    selectedOptionValue = null;
    
    const feedbackFooter = document.getElementById("feedback-footer");
    feedbackFooter.classList.add("hidden");

    if (lives <= 0) {
        document.getElementById("quiz-question").innerText = "💥 愛心耗盡！闖關失敗";
        document.getElementById("quiz-options").innerHTML = `
            <button class="duo-btn primary" onclick="initLevel('${currentLevel}')" style="width: 100%;">重新挑戰此級別</button>
        `;
        return;
    }

    if (currentQuestionIndex >= currentQuestionsList.length) {
        document.getElementById("quiz-question").innerText = `🎉 恭喜通關 ${currentLevel} 級別特訓！`;
        document.getElementById("quiz-options").innerHTML = `
            <button class="duo-btn primary" onclick="initLevel('${currentLevel}')" style="width: 100%;">再玩一次獲得更多 XP</button>
        `;
        document.getElementById("progress-fill").style.width = "100%";
        return;
    }

    const qData = currentQuestionsList[currentQuestionIndex];
    document.getElementById("quiz-type-tag").innerText = qData.type;
    document.getElementById("quiz-question").innerText = `第 ${currentQuestionIndex + 1} 題：${qData.q}`;
    
    // 進度條計算
    const progressPercent = ((currentQuestionIndex) / currentQuestionsList.length) * 100;
    document.getElementById("progress-fill").style.width = `${progressPercent}%`;
    document.getElementById("progress-text").innerText = `進度 ${currentQuestionIndex + 1} / ${currentQuestionsList.length}`;

    // 隨機排列選項按鈕
    const shuffledOpts = shuffle(qData.options);
    const optionsBox = document.getElementById("quiz-options");
    optionsBox.innerHTML = shuffledOpts.map(opt => `
        <button class="duo-opt-btn" onclick="selectOption(this, '${opt.replace(/'/g, "\\'")}')">${opt}</button>
    `).join("");
}

// 選擇選項
window.selectOption = function(btnElement, optVal) {
    if (answeredCurrent) return;
    
    // 移除其他按鈕的選中狀態
    document.querySelectorAll(".duo-opt-btn").forEach(b => b.classList.remove("selected"));
    btnElement.classList.add("selected");
    
    selectedOptionValue = optVal;
    
    // 直接自動點擊檢查或顯示確認按鈕
    checkAnswer();
}

// 檢查答案
function checkAnswer() {
    if (answeredCurrent || selectedOptionValue === null) return;
    answeredCurrent = true;

    const qData = currentQuestionsList[currentQuestionIndex];
    const isCorrect = (selectedOptionValue === qData.ans);
    
    const feedbackFooter = document.getElementById("feedback-footer");
    const feedbackMsg = document.getElementById("feedback-msg");
    feedbackFooter.classList.remove("hidden");

    if (isCorrect) {
        streak++;
        xp += 10;
        feedbackMsg.innerHTML = "<span style='color: #58cc02;'>✨ 太棒了！回答正確！</span>";
    } else {
        streak = 0;
        lives--;
        feedbackMsg.innerHTML = `<span style='color: #ff4b4b;'>❌ 答錯囉！正確答案是：${qData.ans}</span>`;
    }
    
    updateStatsUI();
}

// 點擊「繼續」按鈕進入下一題
document.getElementById("next-question-btn").addEventListener("click", () => {
    currentQuestionIndex++;
    loadQuestion();
});

// 等級切換按鈕事件
document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        initLevel(e.target.dataset.level);
    });
});

// 初始化預設 N5
initLevel("N5");
