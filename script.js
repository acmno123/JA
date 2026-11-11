// 核心題庫資料
const baseDb = {
    N5: {
        grammar: [
            { title: "～は～です", desc: "表達「A 是 B」，最基本的肯定句型。", example: "私は学生です。" },
            { title: "～も～です", desc: "表達「也是……」，用於前述條件相同時。", example: "彼も台湾人です。" },
            { title: "～を～ます", desc: "使用助詞「を」來提示動作的受詞。", example: "毎朝コーヒーを飲みます。" },
            { title: "～へ行きます", desc: "使用助詞「へ」提示移動的方向或目的地。", example: "明日、学校へ行きます。" },
            { title: "～で（場所）", desc: "提示動作發生的地點。", example: "図書館で本を読みます。" }
        ],
        vocab: [
            { word: "私 (わたし)", meaning: "我", example: "私は毎日日本語を勉強します。" },
            { word: "友達 (ともだち)", meaning: "朋友", example: "週末に友達と遊ぶ。" },
            { word: "食べる (たべる)", meaning: "吃", example: "昼ご飯を食べる。" },
            { word: "飲む (のむ)", meaning: "喝", example: "冷たい水を飲む。" },
            { word: "本 (ほん)", meaning: "書本", example: "本を読む。" }
        ],
        quizPool: [
            { q: "「私＿＿学生です。」請填入正確助詞。", options: ["は", "が", "を", "に"], ans: "は" },
            { q: "「水＿＿飲みます。」請選擇受詞助詞。", options: ["を", "で", "へ", "と"], ans: "を" },
            { q: "「図書館＿＿本を読みます。」請選擇動作地點助詞。", options: ["で", "に", "へ", "から"], ans: "で" },
            { q: "「明日、東京＿＿行きます。」請選擇目的地助詞。", options: ["へ", "を", "で", "が"], ans: "へ" }
        ]
    },
    N4: {
        grammar: [
            { title: "～て形 + ください", desc: "請求對方做某事。", example: "ここに名前を書いてください。" },
            { title: "～てもいいです", desc: "表達許可（可以做某事）。", example: "写真を撮ってもいいですか。" },
            { title: "～てはいけません", desc: "表達禁止（不可以做某事）。", example: "ここでタバコを吸ってはいけません。" },
            { title: "～たことがある", desc: "表達過去的經驗。", example: "富士山に登ったことがあります。" }
        ],
        vocab: [
            { word: "手伝う (てつだう)", meaning: "幫忙", example: "母の仕事を手伝う。" },
            { word: "約束 (やくそく)", meaning: "約定", example: "友達と約束がある。" },
            { word: "旅行 (りょこう)", meaning: "旅行", example: "家族で旅行に行く。" }
        ],
        quizPool: [
            { q: "「写真を撮っ＿＿いいですか。」", options: ["ても", "ては", "たら", "てもいい"], ans: "ても" },
            { q: "「日本へ行っ＿＿ことがあります。」", options: ["た", "て", "ない", "る"], ans: "た" },
            { q: "「ここで泳い＿＿いけません。」", options: ["ては", "ても", "たら", "なら"], ans: "ては" },
            { q: "「来年、留学する＿＿です。」", options: ["つもり", "そう", "はず", "まま"], ans: "つもり" }
        ]
    },
    N3: {
        grammar: [
            { title: "～ようにする", desc: "努力做到、養成習慣。", example: "毎日野菜を食べるようにしています。" },
            { title: "～てたまらない", desc: "……得不得了。", example: "合格して嬉しくてたまらない。" },
            { title: "～によって", desc: "根據……；因……而異。", example: "人によって考え方が違う。" }
        ],
        vocab: [
            { word: "複雑 (ふくざつ)", meaning: "複雜的", example: "この問題は構造が複雑だ。" },
            { word: "期待 (きたい)", meaning: "期待", example: "新商品の発売を期待している。" }
        ],
        quizPool: [
            { q: "「健康のために、毎日歩く＿＿にしている。」", options: ["よう", "こと", "ため", "もの"], ans: "よう" },
            { q: "「人＿＿意見が異なる。」", options: ["によって", "について", "に対して", "に沿って"], ans: "によって" },
            { q: "「試験の結果が心配で＿＿。」", options: ["たまらない", "いけない", "しがない", "なさらない"], ans: "たまらない" }
        ]
    },
    N2: {
        grammar: [
            { title: "～ざるを得ない", desc: "不得不……", example: "ルールなので従わざるを得ない。" },
            { title: "～にほかならない", desc: "無非是……", example: "彼の成功は努力の結晶にほかならない。" }
        ],
        vocab: [
            { word: "傾向 (けいこう)", meaning: "傾向", example: "若者の車離れが進む傾向にある。" },
            { word: "見解 (けんかい)", meaning: "見解", example: "専門家の見解を伺う。" }
        ],
        quizPool: [
            { q: "「規則だから、指示に従わ＿＿得ない。」", options: ["ず", "る", "せ", "させ"], ans: "ず" },
            { q: "「彼の成功は努力の結果に＿＿。」", options: ["ほかならない", "すぎない", "かぎらない", "違いない"], ans: "ほかならない" },
            { q: "「このままでは事故を起こし＿＿。」", options: ["かねない", "がたい", "きれない", "っこない"], ans: "かねない" }
        ]
    },
    N1: {
        grammar: [
            { title: "～を皮切りに", desc: "以……為開端", example: "東京公演を皮切りにツアーが始まる。" },
            { title: "～極まりない", desc: "極度、極其", example: "危険極まりない行為だ。" }
        ],
        vocab: [
            { word: "敷居が高い", meaning: "門檻高", example: "高級料亭は敷居が高い。" },
            { word: "喧伝 (けんでん)", meaning: "大肆宣傳", example: "性能が盛んに喧伝された。" }
        ],
        quizPool: [
            { q: "「彼の態度は失礼＿＿＿ない。」", options: ["極まり", "わけ", "ぬく", "っこ"], ans: "極まり" },
            { q: "「中止を＿＿＿された。」", options: ["余儀なく", "余儀なし", "余儀なさ", "余儀なくし"], ans: "余儀なく" },
            { q: "「指導者＿＿＿者、常に冷静でなければならない。」", options: ["たる", "なる", "ある", "いる"], ans: "たる" }
        ]
    }
};

// 狀態管理
let currentLevel = "N5";
let totalAnswered = 0;
let totalCorrect = 0;
let streak = 0;
let currentQuestionObj = null;

// 洗牌演算法 (Fisher-Yates Shuffle)
function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 無限生成隨機題目邏輯
function generateRandomQuestion(level) {
    const levelData = baseDb[level];
    
    // 50% 機率使用靜態題庫，50% 機率使用單字/文法動態合成題
    const useStatic = Math.random() > 0.4 && levelData.quizPool.length > 0;

    if (useStatic) {
        const rawQ = levelData.quizPool[Math.floor(Math.random() * levelData.quizPool.length)];
        const shuffledOptions = shuffle(rawQ.options);
        return {
            q: rawQ.q,
            options: shuffledOptions,
            ans: rawQ.ans
        };
    } else {
        // 從單字庫隨機生成「意思選擇題」
        const targetVocab = levelData.vocab[Math.floor(Math.random() * levelData.vocab.length)];
        
        // 隨機抽取3個錯誤答案
        let wrongOptions = [];
        const allVocabs = Object.values(baseDb).flatMap(d => d.vocab);
        while (wrongOptions.length < 3) {
            const randomMeaning = allVocabs[Math.floor(Math.random() * allVocabs.length)].meaning;
            if (randomMeaning !== targetVocab.meaning && !wrongOptions.includes(randomMeaning)) {
                wrongOptions.push(randomMeaning);
            }
        }
        
        const options = shuffle([targetVocab.meaning, ...wrongOptions]);
        return {
            q: `請選出「 ${targetVocab.word} 」的正確意思：`,
            options: options,
            ans: targetVocab.meaning
        };
    }
}

// 載入等級資料與重置 UI
function loadLevelData(level) {
    currentLevel = level;

    // 渲染文法卡片
    const grammarBox = document.getElementById("grammar-box");
    grammarBox.innerHTML = baseDb[level].grammar.map(g => `
        <div class="item-card">
            <strong>${g.title}</strong>
            <p>${g.desc}</p>
            <small style="color: #64748b; display: block; margin-top: 4px;">💡 ${g.example}</small>
        </div>
    `).join("");

    // 渲染單字卡片
    const vocabBox = document.getElementById("vocab-box");
    vocabBox.innerHTML = baseDb[level].vocab.map(v => `
        <div class="item-card">
            <strong>${v.word}</strong>: ${v.meaning}
            <small style="color: #64748b; display: block; margin-top: 4px;">💬 ${v.example}</small>
        </div>
    `).join("");

    loadNextInfiniteQuestion();
}

// 載入下一題無限題目
function loadNextInfiniteQuestion() {
    currentQuestionObj = generateRandomQuestion(currentLevel);
    
    const qBox = document.getElementById("quiz-question");
    const oBox = document.getElementById("quiz-options");
    const resultBox = document.getElementById("quiz-result");

    resultBox.innerHTML = "";
    qBox.innerText = `[${currentLevel} 無限挑戰] ${currentQuestionObj.q}`;
    
    oBox.innerHTML = currentQuestionObj.options.map((opt) => `
        <button class="opt-btn" onclick="checkAnswer('${opt.replace(/'/g, "\\'")}')">${opt}</button>
    `).join("");
}

// 檢查答案與更新分數
window.checkAnswer = function(selectedOpt) {
    const resultBox = document.getElementById("quiz-result");
    const btns = document.querySelectorAll(".opt-btn");
    
    // 停用所有按鈕防止重複點擊
    btns.forEach(b => b.disabled = true);

    totalAnswered++;
    const isCorrect = (selectedOpt === currentQuestionObj.ans);

    if (isCorrect) {
        totalCorrect++;
        streak++;
        resultBox.innerHTML = `<span style="color: #16a34a; font-weight: bold;">✅ 答對了！連續答對 ${streak} 題 🔥</span>`;
    } else {
        streak = 0;
        resultBox.innerHTML = `<span style="color: #dc2626; font-weight: bold;">❌ 答錯囉！正確答案是：${currentQuestionObj.ans}</span>`;
    }

    // 顯示即時戰績統計
    const accuracy = Math.round((totalCorrect / totalAnswered) * 100);
    resultBox.innerHTML += `<div style="margin-top: 8px; font-size: 0.9rem; color: #475569;">📊 累計答對：${totalCorrect}/${totalAnswered} (正確率 ${accuracy}%)</div>`;

    // 1.2 秒後自動載入全新題目
    setTimeout(loadNextInfiniteQuestion, 1200);
}

// 綁定等級切換
document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        loadLevelData(e.target.dataset.level);
    });
});

// 初始化
loadLevelData("N5");
