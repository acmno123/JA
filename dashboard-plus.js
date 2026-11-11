/* App-like study dashboard: line chart, calendar, comparisons, streaks and expandable achievements. */
(() => {
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, "0");
  const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const currentEmail = () => Store.get("jaq.session", null);
  const levels = ["N5", "N4", "N3", "N2", "N1"];
  let calendarDate = new Date();

  function activityData() {
    const email = currentEmail();
    if (!email) return {};
    const data = Store.get(`jaq.activity.${email}`, {});
    const legacy = Store.get(`jaq.daily.${email}`, {});
    if (legacy.date && Number(legacy.count) && !data[legacy.date]) data[legacy.date] = Number(legacy.count);
    return data;
  }

  function enhanceChart() {
    const chart = $("activity-chart");
    if (!chart || chart.dataset.lineChart === "true") return;
    const columns = [...chart.querySelectorAll(".chart-column")];
    if (!columns.length) return;
    const values = columns.map(column => {
      const match = column.title.match(/：\s*(\d+)\s*題/);
      return { value: match ? Number(match[1]) : 0, label: column.querySelector(".chart-label")?.textContent || "", title: column.title, today: column.classList.contains("today") };
    });
    const width = 720, height = 190, left = 34, right = 18, top = 18, bottom = 34;
    const graphHeight = height - top - bottom, graphWidth = width - left - right;
    const max = Math.max(5, Math.ceil(Math.max(...values.map(v => v.value)) / 5) * 5);
    const x = i => values.length === 1 ? left + graphWidth / 2 : left + i * graphWidth / (values.length - 1);
    const y = value => top + graphHeight - value / max * graphHeight;
    const points = values.map((v, i) => [x(i), y(v.value)]);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "line-chart-svg");
    svg.setAttribute("aria-hidden", "true");
    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML = '<linearGradient id="line-area-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--g)" stop-opacity=".25"/><stop offset="100%" stop-color="var(--g)" stop-opacity="0"/></linearGradient>';
    svg.appendChild(defs);
    for (let i = 0; i <= 4; i++) {
      const gy = y(max * i / 4);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", left); line.setAttribute("x2", width - right); line.setAttribute("y1", gy); line.setAttribute("y2", gy); line.setAttribute("class", "line-grid"); svg.appendChild(line);
      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", left - 8); label.setAttribute("y", gy + 4); label.setAttribute("text-anchor", "end"); label.setAttribute("class", "line-axis-label"); label.textContent = Math.round(max * i / 4); svg.appendChild(label);
    }
    const pointString = points.map(point => point.join(",")).join(" ");
    const area = document.createElementNS(ns, "polygon");
    area.setAttribute("points", `${left},${height - bottom} ${pointString} ${width - right},${height - bottom}`); area.setAttribute("class", "line-area"); svg.appendChild(area);
    const path = document.createElementNS(ns, "polyline");
    path.setAttribute("points", pointString); path.setAttribute("class", "line-path"); svg.appendChild(path);
    values.forEach((item, i) => {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", x(i)); circle.setAttribute("cy", y(item.value)); circle.setAttribute("r", item.today ? "6" : "4.5"); circle.setAttribute("class", `line-point${item.today ? " current" : ""}`);
      const title = document.createElementNS(ns, "title"); title.textContent = item.title; circle.appendChild(title); svg.appendChild(circle);
      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", x(i)); label.setAttribute("y", height - 10); label.setAttribute("text-anchor", "middle"); label.setAttribute("class", "line-x-label"); label.textContent = item.label; svg.appendChild(label);
    });
    chart.replaceChildren(svg);
    chart.dataset.lineChart = "true";
  }

  function streakStats(activity) {
    const activeDates = Object.keys(activity).filter(key => Number(activity[key]) > 0).sort();
    const activeSet = new Set(activeDates);
    const cursor = new Date();
    if (!activeSet.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let current = 0;
    while (activeSet.has(dateKey(cursor))) { current++; cursor.setDate(cursor.getDate() - 1); }
    let best = 0, run = 0, previous = null;
    activeDates.forEach(key => {
      const day = new Date(`${key}T12:00:00`);
      if (previous) {
        const diff = Math.round((day - previous) / 86400000);
        run = diff === 1 ? run + 1 : 1;
      } else run = 1;
      best = Math.max(best, run);
      previous = day;
    });
    return { current, best };
  }

  function monthStats(activity, year, month, dayLimit = new Date(year, month + 1, 0).getDate()) {
    const prefix = `${year}-${pad(month + 1)}-`;
    let total = 0, bestDay = 0, activeDays = 0;
    Object.entries(activity).forEach(([key, raw]) => {
      if (!key.startsWith(prefix)) return;
      const day = Number(key.slice(-2)), count = Number(raw) || 0;
      if (day > dayLimit) return;
      total += count;
      bestDay = Math.max(bestDay, count);
      if (count > 0) activeDays++;
    });
    return { total, bestDay, activeDays };
  }

  function ensureDashboard() {
    const card = document.querySelector(".progress-card");
    if (!card || $("dashboard-stats")) return;
    card.classList.add("app-dashboard");
    const heading = card.querySelector(".progress-card-heading");
    if (heading) {
      const eyebrow = document.createElement("span");
      eyebrow.className = "dashboard-eyebrow";
      eyebrow.textContent = "YOUR DAILY PROGRESS";
      heading.prepend(eyebrow);
      heading.classList.add("dashboard-main-heading");
    }
    const tiles = document.createElement("div");
    tiles.id = "dashboard-stats";
    tiles.className = "dashboard-stats";
    tiles.setAttribute("aria-label", "學習統計摘要");
    tiles.innerHTML = '<article class="dashboard-stat streak-stat"><span class="dashboard-stat-icon">🔥</span><span class="dashboard-stat-label">連續學習</span><strong id="current-streak">0 天</strong><small id="best-streak">最佳紀錄 0 天</small></article><article class="dashboard-stat month-stat"><span class="dashboard-stat-icon">📈</span><span class="dashboard-stat-label">本月答題</span><strong id="month-total">0 題</strong><small id="month-compare">較上月同期 0%</small></article><article class="dashboard-stat best-stat"><span class="dashboard-stat-icon">🏅</span><span class="dashboard-stat-label">本月單日最佳</span><strong id="month-best">0 題</strong><small id="month-active-days">0 個學習日</small></article>';
    if (heading) heading.insertAdjacentElement("afterend", tiles);
    else card.prepend(tiles);
  }

  function renderDashboardStats() {
    const activity = activityData();
    const { current, best } = streakStats(activity);
    const now = new Date();
    const thisMonth = monthStats(activity, now.getFullYear(), now.getMonth(), now.getDate());
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previous = monthStats(activity, previousDate.getFullYear(), previousDate.getMonth(), now.getDate());
    const difference = thisMonth.total - previous.total;
    const percent = previous.total ? Math.round(difference / previous.total * 100) : (thisMonth.total ? 100 : 0);
    if ($("current-streak")) $("current-streak").textContent = `${current} 天`;
    if ($("best-streak")) $("best-streak").textContent = `最佳紀錄 ${best} 天`;
    if ($("month-total")) $("month-total").textContent = `${thisMonth.total} 題`;
    if ($("month-compare")) $("month-compare").textContent = previous.total
      ? `較上月同期 ${difference > 0 ? "+" : ""}${percent}% · 上月 ${previous.total} 題`
      : `上月同期 ${previous.total} 題 · 持續累積！`;
    if ($("month-best")) $("month-best").textContent = `${thisMonth.bestDay} 題`;
    if ($("month-active-days")) $("month-active-days").textContent = `${thisMonth.activeDays} 個學習日`;
    $("dashboard-stats")?.classList.toggle("streak-active", current > 0);
  }

  function renderCalendar() {
    const root = $("study-calendar");
    if (!root) return;
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const offset = new Date(year, month, 1).getDay();
    const activity = activityData();
    const monthPrefix = `${year}-${pad(month + 1)}-`;
    const max = Math.max(1, ...Object.entries(activity).filter(([date]) => date.startsWith(monthPrefix)).map(([, n]) => Number(n) || 0));
    const total = monthStats(activity, year, month).total;
    const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    root.innerHTML = `<div class="calendar-heading"><div><h3>🗓️ 學習月曆</h3><p class="muted small">每天的練習都算數</p></div><div class="calendar-nav"><button type="button" class="calendar-move" data-move="-1" aria-label="上個月">‹</button><strong>${year} 年 ${month + 1} 月</strong><button type="button" class="calendar-move" data-move="1" aria-label="下個月" ${isCurrentMonth ? "disabled" : ""}>›</button></div></div><div class="calendar-grid" role="grid" aria-label="${year} 年 ${month + 1} 月學習紀錄">${weekdays.map(day => `<span class="calendar-weekday" role="columnheader">${day}</span>`).join("")}${Array.from({ length: offset }, () => '<span class="calendar-cell empty" aria-hidden="true"></span>').join("")}${Array.from({ length: days }, (_, i) => {
      const day = i + 1, key = dateKey(new Date(year, month, day)), count = Number(activity[key]) || 0;
      const intensity = count ? Math.max(1, Math.ceil(count / max * 4)) : 0;
      const isToday = key === dateKey(new Date());
      return `<span class="calendar-cell${count ? ` heat-${intensity}` : ""}${isToday ? " calendar-today" : ""}" role="gridcell" tabindex="0" title="${month + 1} 月 ${day} 日：${count} 題" aria-label="${month + 1} 月 ${day} 日，完成 ${count} 題">${day}</span>`;
    }).join("")}</div><div class="calendar-legend"><span>較少</span><i class="heat-0"></i><i class="heat-1"></i><i class="heat-2"></i><i class="heat-3"></i><i class="heat-4"></i><span>較多</span><span class="calendar-total">本月 ${total} 題</span></div>`;
    root.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => {
      calendarDate = new Date(year, month + Number(button.dataset.move), 1);
      renderCalendar();
    }));
  }

  const achievementSpecs = {
    "first-step": { value: p => Math.min(Number(p.xp) || 0, 10), target: 10, unit: "XP", condition: "累積獲得 10 XP。每答對一題可獲得 10 XP。" },
    "streak-five": { value: p => Math.min(Number(p.streak) || 0, 5), target: 5, unit: "連擊", condition: "連續答對 5 題；答錯會重置目前連擊。" },
    "n5-perfect": { value: p => Math.min(Number(p.best?.N5) || 0, 5), target: 5, unit: "題", condition: "在 N5 關卡單次挑戰答對 5 題。" },
    "xp-hundred": { value: p => Math.min(Number(p.xp) || 0, 100), target: 100, unit: "XP", condition: "累積獲得 100 XP。" },
    "all-levels": { value: p => levels.filter(level => (Number(p.best?.[level]) || 0) >= 5).length, target: 5, unit: "級別", condition: "N5、N4、N3、N2、N1 每個級別都至少完美通關一次。" }
  };

  function enhanceAchievements() {
    const email = currentEmail();
    if (!email) return;
    const profile = Store.get(`jaq.data.${email}`, {});
    document.querySelectorAll(".achievement[data-achievement]").forEach((card, index) => {
      const id = card.dataset.achievement;
      const spec = achievementSpecs[id];
      if (!spec) return;
      const percent = Math.min(100, spec.value(profile) / spec.target * 100);
      let toggle = card.querySelector(".achievement-toggle");
      if (!toggle) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "achievement-toggle";
        toggle.setAttribute("aria-expanded", "false");
        toggle.id = `achievement-toggle-${id}`;
        while (card.firstChild) toggle.appendChild(card.firstChild);
        card.appendChild(toggle);
        const details = document.createElement("div");
        details.className = "achievement-details";
        details.id = `achievement-details-${id}`;
        details.hidden = true;
        details.innerHTML = `<p class="achievement-condition"></p><div class="achievement-detail-progress"><span class="achievement-progress-text"></span><span class="achievement-progress-track"><span></span></span></div>`;
        card.appendChild(details);
        toggle.setAttribute("aria-controls", details.id);
        const chevron = document.createElement("span");
        chevron.className = "achievement-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.textContent = "⌄";
        toggle.appendChild(chevron);
      }
      toggle.setAttribute("aria-label", `${card.querySelector(".achievement-label")?.textContent || "成就"}，查看條件與進度`);
      toggle.querySelector(".achievement-progress-text")?.remove();
      toggle.querySelector(".achievement-progress-track")?.remove();
      let inlineProgress = toggle.querySelector(".achievement-inline-progress");
      if (!inlineProgress) {
        inlineProgress = document.createElement("span");
        inlineProgress.className = "achievement-inline-progress";
        const copy = toggle.querySelector(".achievement-label")?.parentElement;
        if (copy) copy.appendChild(inlineProgress);
      }
      inlineProgress.innerHTML = `<span class="achievement-progress-text">${spec.value(profile)} / ${spec.target} ${spec.unit}</span><span class="achievement-progress-track"><span style="width:${percent}%"></span></span>`;
      const details = card.querySelector(".achievement-details");
      details.querySelector(".achievement-condition").textContent = spec.condition;
      details.querySelector(".achievement-detail-progress .achievement-progress-text").textContent = `${spec.value(profile)} / ${spec.target} ${spec.unit}`;
      details.querySelector(".achievement-progress-track > span").style.width = `${percent}%`;
      details.setAttribute("aria-label", `目前進度 ${spec.value(profile)} / ${spec.target} ${spec.unit}`);
      card.style.setProperty("--achievement-delay", `${index * 45}ms`);
    });
  }

  function toggleAchievement(event) {
    const button = event.target.closest(".achievement-toggle");
    if (!button) return;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    const details = document.getElementById(button.getAttribute("aria-controls"));
    if (details) details.hidden = expanded;
  }

  function playSurprise() {
    const modal = $("milestone-modal");
    if (!modal || modal.classList.contains("hidden") || modal.dataset.celebrating === "true") return;
    modal.dataset.celebrating = "true";
    const card = modal.querySelector(".milestone-card");
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    card.classList.add("surprise-active");
    const colors = ["#58cc02", "#1cb0f6", "#ffd166", "#ff6b6b", "#b388ff"];
    for (let i = 0; i < 42; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti-bit";
      bit.style.setProperty("--x", `${Math.random() * 100}%`);
      bit.style.setProperty("--delay", `${Math.random() * .55}s`);
      bit.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
      bit.style.setProperty("--color", colors[i % colors.length]);
      bit.style.setProperty("--fall-x", `${Math.random() * 180 - 90}px`);
      card.appendChild(bit);
      setTimeout(() => bit.remove(), 2300);
    }
  }

  function installCalendar() {
    const panel = document.querySelector(".activity-panel");
    if (!panel || $("study-calendar")) return;
    const calendar = document.createElement("section");
    calendar.id = "study-calendar";
    calendar.className = "study-calendar";
    calendar.setAttribute("aria-label", "月曆式學習紀錄");
    panel.insertAdjacentElement("afterend", calendar);
  }

  function refresh() {
    ensureDashboard();
    installCalendar();
    enhanceChart();
    renderDashboardStats();
    renderCalendar();
    enhanceAchievements();
  }

  const chart = $("activity-chart");
  if (chart) new MutationObserver(() => {
    chart.dataset.lineChart = "false";
    requestAnimationFrame(() => { enhanceChart(); renderDashboardStats(); renderCalendar(); });
  }).observe(chart, { childList: true });
  const achievements = $("achievement-list");
  if (achievements) new MutationObserver(() => requestAnimationFrame(enhanceAchievements)).observe(achievements, { childList: true });
  $("achievement-list")?.addEventListener("click", toggleAchievement);
  const modal = $("milestone-modal");
  if (modal) new MutationObserver(() => {
    if (!modal.classList.contains("hidden")) playSurprise();
    else {
      modal.dataset.celebrating = "false";
      modal.querySelector(".milestone-card")?.classList.remove("surprise-active");
    }
  }).observe(modal, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("auth:ok", () => setTimeout(refresh, 0));
  document.querySelectorAll(".chart-tab").forEach(button => button.addEventListener("click", () => setTimeout(() => { enhanceChart(); renderDashboardStats(); }, 0)));
  refresh();
})();
