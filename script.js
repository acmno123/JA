const db = {
    N5: {
        grammar: [
            { title: "～は～です", desc: "表達「A 是 B」，最基本的肯定句型。", example: "私は学生です。（我是學生。）" },
            { title: "～も～です", desc: "表達「也是……」，用於前述條件相同時。", example: "彼も台湾人です。（他也是台灣人。）" },
            { title: "～を～ます", desc: "使用助詞「を」來提示動作的受詞。", example: "毎朝コーヒーを飲みます。（每天早上喝咖啡。）" },
            { title: "～へ行きます / 来ます", desc: "使用助詞「へ」提示移動的方向或目的地。", example: "明日、学校へ行きます。（明天要去學校。）" },
            { title: "～で（場所）", desc: "提示動作發生的地點。", example: "図書館で本を読みます。（在圖書館看書。）" }
        ],
        vocab: [
            { word: "私 (わたし)", meaning: "我", example: "私は毎日日本語を勉強します。" },
            { word: "友達 (ともだち)", meaning: "朋友", example: "週末に友達と遊ぶ。" },
            { word: "食べる (たべる)", meaning: "吃", example: "昼ご飯を食べる。" },
            { word: "飲む (のむ)", meaning: "喝", example: "冷たい水を飲む。" },
            { word: "大きい (おおきい)", meaning: "大的", example: "この犬はとても大きい。" }
        ],
        quiz: [
            { q: "「私＿＿学生です。」請填入正確助詞。", options: ["は", "が", "を", "に"], ans: 0 },
            { q: "「水＿＿飲みます。」請選擇受詞助詞。", options: ["で", "へ", "を", "と"], ans: 2 },
            { q: "「図書館＿＿本を読みます。」請選擇動作地點助詞。", options: ["で", "に", "へ", "から"], ans: 0 },
            { q: "「明日、東京＿＿行きます。」請選擇目的地助詞。", options: ["を", "へ", "で", "が"], ans: 1 }
        ]
    },
    N4: {
        grammar: [
            { title: "～て形 + ください", desc: "請求對方做某事（請……）。", example: "ここに名前を書いてください。（請在這裡寫下名字。）" },
            { title: "～てもいいです", desc: "表達許可（可以做某事）。", example: "写真を撮ってもいいですか。（可以拍照嗎？）" },
            { title: "～てはいけません", desc: "表達禁止（不可以做某事）。", example: "ここでタバコを吸ってはいけません。（這裡禁止吸菸。）" },
            { title: "～たことがある", desc: "表達過去的經驗（曾經做過……）。", example: "富士山に登ったことがあります。（我曾經爬過富士山。）" },
            { title: "～つもりです", desc: "表達個人的打算或計畫。", example: "来年日本へ行くつもりです。（打算明年去日本。）" }
        ],
        vocab: [
            { word: "手伝う (てつだう)", meaning: "幫忙", example: "母の仕事を手伝う。" },
            { word: "約束 (やくそく)", meaning: "約定、承諾", example: "友達と約束がある。" },
            { word: "旅行 (りょこう)", meaning: "旅行", example: "家族で温泉旅行に行く。" },
            { word: "準備 (じゅんび)", meaning: "準備", example: "試験の準備をする。" },
            { word: "忘れる (わすれる)", meaning: "忘記", example: "傘を電車に忘れた。" }
        ],
        quiz: [
            { q: "「写真を撮っ＿＿いいですか。」", options: ["ても", "ては", "たら", "てもいい"], ans: 0 },
            { q: "「日本へ行っ＿＿ことがあります。」請選出過去經驗句型。", options: ["て", "た", "ない", "る"], ans: 1 },
            { q: "「ここで泳い＿＿いけません。」請選出禁止句型。", options: ["ても", "ては", "たら", "なら"], ans: 1 },
            { q: "「来年、留学する＿＿です。」請選出打算/計畫句型。", options: ["つもり", "そう", "はず", "まま"], ans: 0 }
        ]
    },
    N3: {
        grammar: [
            { title: "～ようにする", desc: "努力做到、努力養成某個習慣。", example: "毎日野菜を食べるようにしています。（努力每天吃蔬菜。）" },
            { title: "～てたまらない", desc: "……得不得了（難以忍受的感覺或情緒）。", example: "合格して嬉しくてたまらない。（考上了高興得不得了。）" },
            { title: "～によって / による", desc: "根據……；因……而異；由……所做。", example: "人によって考え方が違う。（每個人的想法因人而異。）" },
            { title: "～ことにする", desc: "決定做某事（主觀決定）。", example: "来月からジムに通うことにした。（決定下個月開始去健身房。）" },
            { title: "～最中に (さいちゅうに)", desc: "正當……的時候（突然發生別的事）。", example: "食事の最中に電話がかかってきた。（正在吃飯時電話響了。）" }
        ],
        vocab: [
            { word: "複雑 (ふくざつ)", meaning: "複雜的", example: "この問題は構造が複雑だ。" },
            { word: "期待 (きたい)", meaning: "期待", example: "新商品の発売を期待している。" },
            { word: "解決 (かいけつ)", meaning: "解決", example: "トラブルを速やかに解決する。" },
            { word: "偶然 (ぐうぜん)", meaning: "偶然", example: "街で偶然昔の友人に会った。" },
            { word: "努力 (どりょく)", meaning: "努力", example: "目標に向かって努力を重ねる。" }
        ],
        quiz: [
            { q: "「健康のために、毎日歩く＿＿にしている。」", options: ["こと", "よう", "ため", "もの"], ans: 1 },
            { q: "「人＿＿意見が異なる。」（因人而異）", options: ["によって", "について", "に対して", "に沿って"], ans: 0 },
            { q: "「試験の結果が心配で＿＿。」（擔心得不得了）", options: ["たまらない", "いけない", "しがない", "なさらない"], ans: 0 },
            { q: "「会議の＿＿大地震が起こった。」（正當……之際）", options: ["最中に", "間は", "うちに", "ついでに"], ans: 0 }
        ]
    },
    N2: {
        grammar: [
            { title: "～ざるを得ない", desc: "不得不……（客觀上無可奈何）。", example: "ルールなので従わざるを得ない。（既然是規定也只能遵守了。）" },
            { title: "～にほかならない", desc: "斷定「無非是…… / 正是……」。", example: "彼の成功は努力の結晶にほかならない。（他的成功無非是努力的結晶。）" },
            { title: "～をめぐって", desc: "圍繞著某個議題/爭議點……", example: "新しい環境問題をめぐって議論が続いている。（圍繞著新環境問題討論持續中。）" },
            { title: "～かねない", desc: "有可能引發（不良的結果）。", example: "休まず働くと病気になりかねない。（不休息工作的話有可能會生病。）" },
            { title: "～に違いない", desc: "一定、肯定（強烈的推測）。", example: "あんなに勉強したのだから、合格するに違いない。（那麼努力讀書，肯定會考上的。）" }
        ],
        vocab: [
            { word: "傾向 (けいこう)", meaning: "傾向、趨勢", example: "若者の車離れが進む傾向にある。" },
            { word: "見解 (けんかい)", meaning: "見解、看法", example: "専門家の見解を伺う。" },
            { word: "把握 (はあく)", meaning: "掌握、理解", example: "現状を正確に把握する。" },
            { word: "契約 (けいやく)", meaning: "契約", example: "新しい物件の契約を結ぶ。" },
            { word: "効率 (こうりつ)", meaning: "效率", example: "業務の効率を高める。" }
        ],
        quiz: [
            { q: "「規則だから、指示に従わ＿＿得ない。」", options: ["ず", "る", "せ", "させ"], ans: 0 },
            { q: "「彼の成功は長年の努力の結果に＿＿。」（無非是）", options: ["ほかならない", "すぎない", "かぎらない", "違いない"], ans: 0 },
            { q: "「このままでは事故を起こし＿＿。」（有可能引發壞結果）", options: ["かねない", "がたい", "きれない", "っこない"], ans: 0 },
            { q: "「新政策＿＿活発な討論が行われた。」（圍繞著……）", options: ["をめぐって", "に際して", "を通じて", "に即して"], ans: 0 }
        ]
    },
    N1: {
        grammar: [
            { title: "～を皮切りに（して）", desc: "以……為開端/起點（後續接連發生同類事件）。", example: "東京公演を皮切りに、全国ツアーが始まる。（以東京公演為起點，全國巡演開始。）" },
            { title: "～極まりない / 極まる", desc: "極度、極其（多用於負面描述）。", example: "危険極まりない行為だ。（這是極其危險的行為。）" },
            { title: "～を余儀なくされる", desc: "迫使、不得不（因外部因素無奈改變）。", example: "台風のため、計画の変更を余儀なくされた。（因為颱風，被迫變更計畫。）" },
            { title: "～たる者", desc: "身為……者（帶有責任或身分期許）。", example: "医者たる者、患者の命を最優先に考えるべきだ。（身為醫生者，應將患者生命視為最優先。）" },
            { title: "～んがために", desc: "為了要做……（帶有強烈決心）。", example: "夢を叶えんがために、昼夜を問わず努力した。（為了實現夢想，不分晝夜地努力。）" }
        ],
        vocab: [
            { word: "敷居が高い (しきいはたかい)", meaning: "門檻高、不好意思登門", example: "高級料亭は敷居が高いと感じる。" },
            { word: "喧伝 (けんでん)", meaning: "大肆宣傳", example: "その製品の性能が盛んに喧伝された。" },
            { word: "齟齬 (そご)", meaning: "矛盾、不一致", example: "両者の認識に齟齬が生じている。" },
            { word: "希薄 (きはく)", meaning: "稀薄、淡薄", example: "人間関係の希薄化が懸念される。" },
            { word: "変遷 (へんせん)", meaning: "變遷、演變", example: "時代の変遷とともに言葉も変わる。" }
        ],
        quiz: [
            { q: "「彼の態度は失礼＿＿＿ない。」", options: ["極まり", "わけ", "ぬく", "っこ"], ans: 0 },
            { q: "「資金難により、プロジェクトの中止を＿＿＿された。」", options: ["余儀なく", "余儀なし", "余儀なさ", "余儀なくし"], ans: 0 },
            { q: "「指導者＿＿＿者、常に冷静でなければならない。」", options: ["たる", "なる", "ある", "いる"], ans: 0 },
            { q: "「新作の発表を＿＿＿、全国でイベントが展開された。」", options: ["皮切りに", "もって", "限りに", "契機に"], ans: 0 }
        ]
    }
};

let currentLevel = "N5";
let currentQuizIdx = 0;

function loadLevelData(level) {
    currentLevel = level;
    currentQuizIdx = 0;

    // 渲染文法卡片
    const grammarBox = document.getElementById("grammar-box");
    grammarBox.innerHTML = db[level].grammar.map(g => `
        <div class="item-card">
            <strong>${g.title}</strong>
            <p>${g.desc}</p>
            <small style="color: #64748b; display: block; margin-top: 4px;">💡 例句：${g.example}</small>
        </div>
    `).join("");

    // 渲染單字卡片
    const vocabBox = document.getElementById("vocab-box");
    vocabBox.innerHTML = db[level].vocab.map(v => `
        <div class="item-card">
            <strong>${v.word}</strong>: ${v.meaning}
            <small style="color: #64748b; display: block; margin-top: 4px;">💬 例句：${v.example}</small>
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
        qBox.innerText = `問題 ${currentQuizIdx + 1} / ${quizList.length}: ${currentQ.q}`;
        oBox.innerHTML = currentQ.options.map((opt, idx) => `
            <button onclick="checkAnswer(${idx})">${opt}</button>
        `).join("");
        nextBtn.style.display = "none";
    } else {
        qBox.innerText = `🎉 恭喜完成 ${currentLevel} 所有測驗題目！`;
        oBox.innerHTML = "";
        nextBtn.style.display = "none";
    }
}

window.checkAnswer = function(selectedIdx) {
    const currentQ = db[currentLevel].quiz[currentQuizIdx];
    const resultBox = document.getElementById("quiz-result");
    if (selectedIdx === currentQ.ans) {
        resultBox.innerHTML = "<span style='color: #16a34a; font-weight: bold;'>✅ 答對了！</span>";
    } else {
        resultBox.innerHTML = `<span style='color: #dc2626; font-weight: bold;'>❌ 答錯囉！正確答案是：${currentQ.options[currentQ.ans]}</span>`;
    }
    currentQuizIdx++;
    setTimeout(loadQuiz, 1600);
}

// 綁定等級按鈕事件
document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        loadLevelData(e.target.dataset.level);
    });
});

// 預設載入 N5
loadLevelData("N5");
