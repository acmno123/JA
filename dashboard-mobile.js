/* Mobile navigation, daily status and locally computed monthly leaderboard. */
(() => {
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, "0");
  const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const todayKey = () => dateKey(new Date());
  const goal = 10;

  function activityFor(email) {
    const activity = Store.get(`jaq.activity.${email}`, {});
    const legacy = Store.get(`jaq.daily.${email}`, {});
    if (legacy.date && Number(legacy.count) && !activity[legacy.date]) activity[legacy.date] = Number(legacy.count);
    return activity && typeof activity === "object" ? activity : {};
  }

  function currentStreak(activity) {
    const active = new Set(Object.keys(activity).filter(key => Number(activity[key]) > 0));
    const cursor = new Date();
    if (!active.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let days = 0;
    while (active.has(dateKey(cursor))) {
      days++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return days;
  }

  function monthlyTotal(activity, now = new Date()) {
    const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-`;
    return Object.entries(activity).reduce((sum, [key, count]) => sum + (key.startsWith(prefix) ? Number(count) || 0 : 0), 0);
  }

  function renderLeaderboard() {
    const root = $("monthly-leaderboard");
    if (!root) return;
    const users = Store.get("jaq.users", {});
    const session = Store.get("jaq.session", null);
    const now = new Date();
    const entries = Object.entries(users).map(([email, user]) => ({
      email,
      name: user?.name || "學習者",
      total: monthlyTotal(activityFor(email), now),
      isCurrent: email === session
    }));
    entries.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "zh-Hant"));
    const ranked = entries.slice(0, 5);
    if (session && !ranked.some(entry => entry.isCurrent)) {
      const self = entries.find(entry => entry.isCurrent);
      if (self) ranked.push({ ...self, outsideTop: true, rank: entries.indexOf(self) + 1 });
    }
    if (!entries.length) {
      root.innerHTML = '<p class="leaderboard-empty">登入後開始累積本月排行。</p>';
      return;
    }
    const medals = ["🥇", "🥈", "🥉"];
    root.innerHTML = ranked.map((entry, index) => {
      const rank = entry.rank || index + 1;
      return `<article class="leaderboard-row${entry.isCurrent ? " is-me" : ""}${entry.total === 0 ? " no-activity" : ""}">
        <span class="leaderboard-rank">${medals[rank - 1] || `#${rank}`}</span>
        <span class="leaderboard-person"><strong>${escapeHTML(entry.name)}${entry.isCurrent ? '<i>你</i>' : ""}</strong><small>${entry.total ? "本月持續累積" : "尚未開始本月挑戰"}</small></span>
        <strong class="leaderboard-score">${entry.total}<small>題</small></strong>
      </article>`;
    }).join("");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function renderStatus() {
    const email = Store.get("jaq.session", null);
    if (!email) return;
    const activity = activityFor(email);
    const count = Number(activity[todayKey()]) || 0;
    const todayNode = $("mobile-today-count");
    const streakNode = $("mobile-streak-count");
    if (todayNode) todayNode.textContent = `${count}/${goal}`;
    if (streakNode) streakNode.textContent = String(currentStreak(activity));
    const fill = $("mobile-goal-fill");
    if (fill) fill.style.width = `${Math.min(100, count / goal * 100)}%`;
    const label = $("mobile-goal-label");
    if (label) label.textContent = count >= goal ? "今日目標達成！太棒了 🎉" : `再答 ${goal - count} 題完成今日目標`;
  }

  function installBottomBar() {
    if ($("mobile-tabbar")) return;
    const app = $("app");
    if (!app) return;
    const nav = document.createElement("nav");
    nav.id = "mobile-tabbar";
    nav.className = "mobile-tabbar";
    nav.setAttribute("aria-label", "主要導覽");
    nav.innerHTML = `
      <button type="button" class="mobile-tab active" data-target="mobile-home" aria-current="page"><span aria-hidden="true">🎮</span><small>練習</small></button>
      <button type="button" class="mobile-tab" data-target="mobile-progress"><span aria-hidden="true">📈</span><small>進度</small></button>
      <button type="button" class="mobile-tab" data-target="mobile-leaderboard"><span aria-hidden="true">🏆</span><small>排行</small></button>
      <button type="button" class="mobile-tab" data-target="mobile-practice"><span aria-hidden="true">🗣️</span><small>跟讀</small></button>`;
    app.appendChild(nav);
    const sections = [...document.querySelectorAll("#app .duo-main > section")];
    if (sections[0]) sections[0].id = "mobile-home";
    if (sections[1]) sections[1].id = "mobile-quiz";
    if (sections[2]) sections[2].id = "mobile-progress";
    if (sections[3]) sections[3].id = "mobile-practice";
    const board = $("monthly-leaderboard");
    if (board) board.id = "mobile-leaderboard";

    nav.addEventListener("click", event => {
      const button = event.target.closest("[data-target]");
      if (!button) return;
      const target = $(button.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      nav.querySelectorAll(".mobile-tab").forEach(tab => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        if (active) tab.setAttribute("aria-current", "page");
        else tab.removeAttribute("aria-current");
      });
    });
    const targets = nav.querySelectorAll("[data-target]");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const active = nav.querySelector(`[data-target="${visible.target.id}"]`);
        if (!active) return;
        nav.querySelectorAll(".mobile-tab").forEach(tab => {
          const selected = tab === active;
          tab.classList.toggle("active", selected);
          if (selected) tab.setAttribute("aria-current", "page");
          else tab.removeAttribute("aria-current");
        });
      }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, .2, .5] });
      [...targets].forEach(button => { const target = $(button.dataset.target); if (target) observer.observe(target); });
    }
  }

  function installExtras() {
    const card = document.querySelector(".progress-card");
    if (!card || $("monthly-leaderboard")) return;
    const section = document.createElement("section");
    section.id = "monthly-leaderboard";
    section.className = "monthly-leaderboard";
    section.setAttribute("aria-labelledby", "leaderboard-title");
    section.innerHTML = `<div class="leaderboard-heading"><div><span class="leaderboard-kicker">MONTHLY CHAMPIONS</span><h3 id="leaderboard-title">🏆 本月最佳成就榜</h3></div><span class="leaderboard-month"></span></div>
      <p class="leaderboard-caption">依本機帳號本月答題數即時排名 · 僅此瀏覽器可見</p>
      <div class="leaderboard-list" role="list" id="leaderboard-rows"></div>
      <div class="mobile-goal-card"><div><span>今日學習目標</span><strong id="mobile-today-count">0/10</strong></div><div class="mobile-goal-track"><i id="mobile-goal-fill"></i></div><p id="mobile-goal-label">每天一點點，累積大進步</p><div class="mobile-streak"><span>🔥</span> 連續學習 <strong id="mobile-streak-count">0</strong> 天</div></div>`;
    const root = document.createElement("div");
    root.id = "monthly-leaderboard";
    root.className = "monthly-leaderboard";
    root.setAttribute("aria-labelledby", "leaderboard-title");
    root.innerHTML = section.innerHTML;
    const anchor = card.querySelector(".achievement-heading");
    if (anchor) anchor.insertAdjacentElement("beforebegin", root);
    else card.appendChild(root);
    const monthNode = root.querySelector(".leaderboard-month");
    if (monthNode) monthNode.textContent = new Intl.DateTimeFormat("zh-Hant", { month: "long" }).format(new Date());
    // Use the board's nested rows as the render target.
    root.querySelector(".leaderboard-list").id = "monthly-leaderboard-rows";
  }

  function render() {
    installExtras();
    installBottomBar();
    renderLeaderboard();
    renderStatus();
  }

  document.addEventListener("auth:ok", () => requestAnimationFrame(render));
  const chart = $("activity-chart");
  if (chart) new MutationObserver(() => requestAnimationFrame(render)).observe(chart, { childList: true });
  const count = $("daily-count");
  if (count) new MutationObserver(() => requestAnimationFrame(renderStatus)).observe(count, { childList: true, characterData: true, subtree: true });
  window.addEventListener("storage", render);
  render();
})();
