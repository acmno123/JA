const TTS = {
    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); // 停止先前的發音
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9; // 語速微調
        window.speechSynthesis.speak(utterance);
    }
};
