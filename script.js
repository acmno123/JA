const db = {
    N5: {
        grammar: [
            { title: "～は～です", desc: "表達「A 是 B」，最基本的肯定句型。" },
            { title: "～這 / 那 / 哪裡 (こそあど)", desc: "指示代名詞：これ、それ、あれ、どれ。" }
        ],
        vocab: [
            { word: "私 (わたし)", meaning: "我" },
            { word: "学校 (がっこう)", meaning: "學校" },
            { word: "食べる (たべる)", meaning: "吃" }
        ],
        quiz: [
            { q: "「私＿＿学生です。」請填入正確助詞。", options: ["は", "が", "を", "に"], ans: 0 },
            { q: "「りんごを＿＿。」請選出「吃」的正確形狀。", options: ["飲む", "食べる", "行く", "見る"], ans: 1 }
        ]
    },
    N4: {
        grammar: [
            { title: "～て形 + ください", desc: "請求對方做某事（請幫我……）。" },
            { title: "～てもいいです", desc: "許可表達（可以做某事）。" }
        ],
        vocab: [
            { word: "手伝う (てつだう)", meaning: "幫忙" },
            { word: "始まる (はじまる)", meaning: "開始" }
        ],
        quiz: [
            { q: "照片可以拍嗎？「写真を撮っても＿＿＿。」", options: ["いいです", "いけません", "ダメです", "ください"], ans: 0 }
        ]
    },
    N3: {
        grammar: [
            { title: "～ようにする", desc: "努力做到、試著去做到某個習慣。" },
            { title: "～てたまらない", desc: "得不得了、極度……（感情或身體感受）。" }
        ],
        vocab: [
            { word: "複雑 (ふくざつ)", meaning: "複雜" },
            { word: "期待 (きたい)", meaning: "期待" }
        ],
        quiz: [
            { q: "健康のために、野菜を食べる＿＿＿＿にしている。", options: ["こと", "よう", "ため", "もの"], ans: 1 }
        ]
    },
    N2: {
        grammar: [
            { title: "～ざるを得ない", desc: "不得不……（雖然不願意但客觀上必須做）。" },
            { title: "～にほかならない", desc: "毫無疑問就是……、無非是……" }
        ],
        vocab: [
            { word: "傾向 (けいこう)", meaning: "傾向" },
            { word: "見解 (けんかい)", meaning: "見解、看法" }
        ],
        quiz: [
            { q: "ルールだから、従わ＿＿＿得ない。", options: ["ず", "る", "せ", "させ"], ans: 0 }
        ]
    },
    N1: {
        grammar: [
            { title: "～を皮切りに（して）", desc: "以……為開端 / 起點，隨後擴散開來。" },
            { title: "～極まりない / 極まる", desc: "極度、無以復加（多用於負面評價）。" }
        ],
        vocab: [
            { word: "敷居が高い (しきいはたかい)", meaning: "不好意思登門、門檻高" },
            { word: "喧伝 (けんでん)", meaning: "大肆宣傳" }
        ],
        quiz: [
            { q: "彼の態度は失礼＿＿＿＿ない。", options: ["極まり", "わけ", "ぬく", "っこ"], ans: 0 }
        ]
    }
};

let currentLevel = "N5";
let currentQuizIdx = 0;
let score = 0;

function loadLevelData(level) {
    currentLevel = level;
    currentQuizIdx = 0;

    // Render Grammar
    const grammarBox = document.getElementById("grammar-box");
    grammarBox.innerHTML = db[level].grammar.map(g => `
        <div class="item-card">
            <strong>${g.title}</strong>
            <p>${g.desc}</p>
        </div>
    `).join("");

    // Render Vocab
    const vocabBox = document.getElementById("vocab-box");
    vocabBox.innerHTML = db[level].vocab.map(v => `
        <div class="item-card">
            <strong>${v.word}</strong>: ${v.meaning}
        </div>
    `).join("");

    loadQuiz();
}

function loadQuiz() {
    const quizList = db[currentLevel].quiz;
    const qBox = document.getElementById("quiz-question");
    const oBox = document.getElementById("quiz-options");
    const nextBtn = document.getElementById("next-btn");
    const resultBox = document.getElementById("quiz-result");

    resultBox.innerHTML = "";
    if (currentQuizIdx < quizList.length) {
        const currentQ = quizList[currentQuizIdx];
        qBox.innerText = `問題 ${currentQuizIdx + 1}: ${currentQ.q}`;
        oBox.innerHTML = currentQ.options.map((opt, idx) => `
            <button onclick="checkAnswer(${idx})">${opt}</button>
        `).join("");
        nextBtn.style.display = "none";
    } else {
        qBox.innerText = `🎉 恭喜完成 ${currentLevel} 測驗！`;
        oBox.innerHTML = "";
        nextBtn.style.display = "none";
    }
}

window.checkAnswer = function(selectedIdx) {
    const currentQ = db[currentLevel].quiz[currentQuizIdx];
    const resultBox = document.getElementById("quiz-result");
    if (selectedIdx === currentQ.ans) {
        resultBox.innerHTML = "<span style='color: green;'>✅ 答對了！</span>";
    } else {
        resultBox.innerHTML = "<span style='color: red;'>❌ 答錯囉！</span>";
    }
    currentQuizIdx++;
    setTimeout(loadQuiz, 1500);
}

// Event Listeners for buttons
document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        loadLevelData(e.target.dataset.level);
    });
});

// Initial Load
loadLevelData("N5");
