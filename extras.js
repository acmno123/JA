/* 每日答題統計與成就：獨立於題庫與核心闖關流程 */
(() => {
  const goal = 10;
  const achievements = [
    { icon: "🌱", title: "踏出第一步", hint: "累積 10 XP", earned: p => p.xp >= 10 },
    { icon: "🔥", title: "連擊達人", hint: "連續答對 5 題", earned: p => p.streak >= 5 },
    { icon: "📘", title: "N5 完美通關", hint: "N5 答對 5 題", earned: p => (p.best?.N5 || 0) >= 5 },
    { icon: "⭐", title: "積分收藏家", hint: "累積 100 XP", earned: p => p.xp >= 100 },
    { icon: "🏆", title: "全級制霸", hint: "N5–N1 都答對 5 題", earned: p => ["N5", "N4", "N3", "N2", "N1"].every(lv => (p.best?.[lv] || 0) >= 5) }
  ];

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const currentEmail = () => Store.get("jaq.session", null);
  const dailyKey = email => `jaq.daily.${email}`;

  function getDaily(email) {
    const saved = Store.get(dailyKey(email), {});
    if (saved.date !== today()) return { date: today(), count: 0 };
    return { date: saved.date, count: Math.max(0, Number(saved.count) || 0) };
  }

  function render() {
    const email = currentEmail();
    if (!email) return;
    const daily = getDaily(email);
    const count = Math.min(daily.count, goal);
    const track = document.querySelector(".daily-track");
    document.getElementById("daily-count").textContent = daily.count;
    document.getElementById("daily-fill").style.width = `${count / goal * 100}%`;
    track.setAttribute("aria-valuenow", String(count));
    document.getElementById("daily-message").textContent = daily.count >= goal
      ? "目標達成！今天的努力值得一個大大的讚 🎉"
      : `再完成 ${goal - daily.count} 題，就達成今天的目標！`;

    const profile = Store.get(`jaq.data.${email}`, {});
    const list = document.getElementById("achievement-list");
    list.innerHTML = achievements.map(a => {
      const unlocked = a.earned(profile);
      return `<div class="achievement${unlocked ? " unlocked" : ""}"${unlocked ? ' title="已解鎖"' : ' title="尚未解鎖"'}>
        <span class="achievement-icon" aria-hidden="true">${a.icon}</span>
        <span><span class="achievement-label">${a.title}</span><span class="achievement-hint">${a.hint}</span></span>
      </div>`;
    }).join("");
  }

  let wasVisible = false;
  const footer = document.getElementById("feedback-footer");
  new MutationObserver(() => {
    const visible = !footer.classList.contains("hidden");
    if (visible && !wasVisible) {
      const email = currentEmail();
      if (email) {
        const daily = getDaily(email);
        daily.count++;
        Store.set(dailyKey(email), daily);
        render();
      }
    }
    wasVisible = visible;
  }).observe(footer, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("auth:ok", () => {
    wasVisible = !footer.classList.contains("hidden");
    render();
  });
  render();
})();
