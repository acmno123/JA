const Storage = {
    load() {
        return {
            xp: parseInt(localStorage.getItem("duo_xp") || "0"),
            streak: parseInt(localStorage.getItem("duo_streak") || "0")
        };
    },
    save(xp, streak) {
        localStorage.setItem("duo_xp", xp);
        localStorage.setItem("duo_streak", streak);
    }
};
