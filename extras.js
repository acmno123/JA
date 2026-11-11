/* 每日答題統計、期間圖表、目標通知與成就解鎖 */
(() => {
  const goal = 10;
  const achievementDefs = [
    { id: "first-step", icon: "🌱", title: "踏出第一步", hint: "累積 10 XP", earned: p => p.xp >= 10 },
    { id: "streak-five", icon: "🔥", title: "連擊達人", hint: "連續答對 5 題", earned: p => p.streak >= 5 },
    { id: "n5-perfect", icon: "📘", title: "N5 完美通關", hint: "N5 答對 5 題", earned: p => (p.best?.N5 || 0) >= 5 },
    { id: "xp-hundred", icon: "⭐", title: "積分收藏家", hint: "累積 100 XP", earned: p => p.xp >= 100 },
    { id: "all-levels", icon: "🏆", title: "全級制霸", hint: "N5–N1 都答對 5 題", earned: p => ["N5", "N4", "N3", "N2", "N1"].every(lv => (p.best?.[lv] || 0) >= 5) }
  ];
  const $ = id => document.getElementById(id);
  const today = () => dateKey(new Date());
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const currentEmail = () => Store.get("jaq.session", null);
  const activityKey = email => `jaq.activity.${email}`;
  const dailyKey = email => `jaq.daily.${email}`;
  const achievementKey = email => `jaq.achievements.${email}`;
  let period = "week";
  let activeEmail = null;
  let queue = [];
  let modalOpen = false;

  function readActivity(email) {
    const saved = Store.get(activityKey(email), {});
    const activity = saved && typeof saved === "object" ? saved : {};
    // Migrate the previous single-day counter without discarding it.
    const legacy = Store.get(dailyKey(email), {});
    if (legacy.date && Number(legacy.count) > 0 && !activity[legacy.date]) activity[legacy.date] = Number(legacy.count);
    return activity;
  }

  function recordAnswer(email) {
    const activity = readActivity(email);
    const key = today();
    activity[key] = (Number(activity[key]) || 0) + 1;
    // Keep about one year of local history.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 370);
    const minKey = dateKey(cutoff);
    Object.keys(activity).forEach(date => { if (date < minKey) delete activity[date]; });
    Store.set(activityKey(email), activity);
    Store.set(dailyKey(email), { date: key, count: activity[key] });
    return activity[key];
  }

  function dailyCount(email, activity = readActivity(email)) {
    return Number(activity[today()]) || 0;
  }

  function makeChartData(activity) {
    const now = new Date();
    if (period === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
        return { label: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()], date: dateKey(d), value: Number(activity[dateKey(d)]) || 0, today: i === 6 };
      });
    }
    const year = now.getFullYear(), month = now.getMonth();
    const weekCount = Math.ceil(new Date(year, month + 1, 0).getDate() / 7);
    const bins = Array.from({ length: weekCount }, (_, i) => ({ label: `${i * 7 + 1}–${Math.min(i * 7 + 7, new Date(year, month + 1, 0).getDate())}`, value: 0, today: false }));
    Object.entries(activity).forEach(([date, value]) => {
      const [y, m, d] = date.split("-").map(Number);
      if (y === year && m === month + 1 && bins[Math.floor((d - 1) / 7)]) bins[Math.floor((d - 1) / 7)].value += Number(value) || 0;
    });
    bins[Math.floor((now.getDate() - 1) / 7)].today = true;
    return bins;
  }

  function renderChart(activity) {
    const chart = $("activity-chart");
    const values = makeChartData(activity);
    const max = Math.max(1, ...values.map(item => item.value));
    chart.style.setProperty("--chart-columns", String(values.length));
    chart.setAttribute("aria-label", period === "week" ? "最近一週每日答題統計" : "本月每週答題統計");
    chart.innerHTML = values.map(item => {
      const height = item.value ? Math.max(8, item.value / max * 100) : 3;
      const title = `${item.date || item.label}：${item.value} 題`;
      return `<div class="chart-column${item.today ? " today" : ""}" title="${title}">
        <span class="chart-value">${item.value || ""}</span>
        <div class="chart-bar-area"><div class="chart-bar" style="height:${height}%" aria-hidden="true"></div></div>
        <span class="chart-label">${item.label}</span>
      </div>`;
    }).join("");
    const total = values.reduce((sum, item) => sum + item.value, 0);
    $("activity-summary").textContent = period === "week"
      ? `近 7 天完成 ${total} 題 · 今日 ${dailyCount(currentEmail(), activity)} 題`
      : `本月累積完成 ${total} 題`;
  }

  function queueNotice(icon, title, message) {
    queue.push({ icon, title, message });
    showNextNotice();
  }

  function showNextNotice() {
    if (modalOpen || !queue.length) return;
    const notice = queue.shift();
    $("milestone-icon").textContent = notice.icon;
    $("milestone-title").textContent = notice.title;
    $("milestone-message").textContent = notice.message;
    $("milestone-modal").classList.remove("hidden");
    modalOpen = true;
    $("milestone-close").focus();
  }

  function closeNotice() {
    if (!modalOpen) return;
    $("milestone-modal").classList.add("hidden");
    modalOpen = false;
    setTimeout(showNextNotice, 120);
  }

  function syncAchievements(profile, { notify = false } = {}) {
    const email = currentEmail();
    if (!email) return;
    const earned = achievementDefs.filter(item => item.earned(profile));
    const unlocked = new Set(Store.get(achievementKey(email), []));
    const isFirstRender = activeEmail !== email;
    if (isFirstRender) {
      earned.forEach(item => unlocked.add(item.id));
      activeEmail = email;
    } else if (notify) {
      earned.filter(item => !unlocked.has(item.id)).forEach(item => {
        document.querySelector(`[data-achievement="${item.id}"]`)?.classList.add("just-unlocked");
        if (typeof SoundFX !== "undefined" && SoundFX.playAchievement) SoundFX.playAchievement();
        queueNotice(item.icon, "成就解鎖！", `「${item.title}」— ${item.hint}`);
        unlocked.add(item.id);
      });
    }
    Store.set(achievementKey(email), [...unlocked]);
    const list = $("achievement-list");
    list.innerHTML = achievementDefs.map(item => {
      const isUnlocked = unlocked.has(item.id) || item.earned(profile);
      return `<div class="achievement${isUnlocked ? " unlocked" : ""}" data-achievement="${item.id}" title="${isUnlocked ? "已解鎖" : "尚未解鎖"}">
        <span class="achievement-icon" aria-hidden="true">${item.icon}</span>
        <span><span class="achievement-label">${item.title}</span><span class="achievement-hint">${item.hint}</span></span>
      </div>`;
    }).join("");
    $("achievement-count").textContent = `${earned.length} / ${achievementDefs.length}`;
  }

  function render() {
    const email = currentEmail();
    if (!email) return;
    const activity = readActivity(email);
    const count = dailyCount(email, activity);
    const fill = Math.min(count, goal);
    $("daily-count").textContent = count;
    $("daily-fill").style.width = `${fill / goal * 100}%`;
    $(".daily-track").setAttribute("aria-valuenow", String(fill));
    $("daily-message").textContent = count >= goal
      ? "目標達成！今天的努力值得一個大大的讚 🎉"
      : `再完成 ${goal - count} 題，就達成今天的目標！`;
    renderChart(activity);
    const profile = Store.get(`jaq.data.${email}`, {});
    syncAchievements(profile);
  }

  function onAnswer() {
    const email = currentEmail();
    if (!email) return;
    const count = recordAnswer(email);
    const profile = Store.get(`jaq.data.${email}`, {});
    render();
    syncAchievements(profile, { notify: true });
    if (count === goal && Store.get(`jaq.goal-notified.${email}`, "") !== today()) {
      Store.set(`jaq.goal-notified.${email}`, today());
      queueNotice("🎉", "今日目標達成！", `你今天已完成 ${count} 題，學習的努力累積成進步！`);
    }
  }

  const footer = $("feedback-footer");
  let wasVisible = !footer.classList.contains("hidden");
  new MutationObserver(() => {
    const visible = !footer.classList.contains("hidden");
    if (visible && !wasVisible) onAnswer();
    wasVisible = visible;
  }).observe(footer, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("auth:ok", () => {
    activeEmail = null;
    wasVisible = !footer.classList.contains("hidden");
    render();
  });

  document.querySelectorAll(".chart-tab").forEach(button => button.addEventListener("click", () => {
    period = button.dataset.period;
    document.querySelectorAll(".chart-tab").forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-pressed", String(selected));
    });
    const email = currentEmail();
    if (email) renderChart(readActivity(email));
  }));

  $("milestone-close").addEventListener("click", closeNotice);
  $("milestone-close-icon").addEventListener("click", closeNotice);
  $("milestone-modal").addEventListener("click", event => {
    if (event.target === $("milestone-modal")) closeNotice();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modalOpen) closeNotice();
  });
  render();
})();
