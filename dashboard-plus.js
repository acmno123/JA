/* 補充儀表板：折線圖、月曆熱度圖、成就進度與今日驚喜動畫 */
(() => {
  const $ = id => document.getElementById(id);
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const activityKey = email => `jaq.activity.${email}`;
  const currentEmail = () => Store.get("jaq.session", null);
  const levels = ["N5", "N4", "N3", "N2", "N1"];
  let calendarDate = new Date();

  function activityData() {
    const email = currentEmail();
    if (!email) return {};
    const data = Store.get(activityKey(email), {});
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
    const pts = values.map((v, i) => [x(i), y(v.value)]);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "line-chart-svg");
    svg.setAttribute("role", "presentation");
    svg.innerHTML = `<defs><linearGradient id="line-area-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--g)" stop-opacity=".25"/><stop offset="100%" stop-color="var(--g)" stop-opacity="0"/></linearGradient></defs>`;
    for (let i = 0; i <= 4; i++) {
      const value = max * i / 4, gy = y(value);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", left); line.setAttribute("x2", width - right); line.setAttribute("y1", gy); line.setAttribute("y2", gy); line.setAttribute("class", "line-grid"); svg.appendChild(line);
      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", left - 8); label.setAttribute("y", gy + 4); label.setAttribute("text-anchor", "end"); label.setAttribute("class", "line-axis-label"); label.textContent = Math.round(value); svg.appendChild(label);
    }
    const points = pts.map(p => p.join(",")).join(" ");
    const area = document.createElementNS(ns, "polygon");
    area.setAttribute("points", `${left},${height - bottom} ${points} ${width - right},${height - bottom}`); area.setAttribute("class", "line-area"); svg.appendChild(area);
    const polyline = document.createElementNS(ns, "polyline");
    polyline.setAttribute("points", points); polyline.setAttribute("class", "line-path"); svg.appendChild(polyline);
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

  function renderCalendar() {
    const root = $("study-calendar");
    if (!root) return;
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    const first = new Date(year, month, 1), days = new Date(year, month + 1, 0).getDate();
    const offset = first.getDay();
    const activity = activityData();
    const max = Math.max(1, ...Object.entries(activity).filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-`)).map(([, n]) => Number(n) || 0));
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    root.innerHTML = `<div class="calendar-heading"><div><h3>🗓️ 學習月曆</h3><p class="muted small">每天的練習都算數</p></div><div class="calendar-nav"><button type="button" class="calendar-move" data-move="-1" aria-label="上個月">‹</button><strong>${year} 年 ${month + 1} 月</strong><button type="button" class="calendar-move" data-move="1" aria-label="下個月" ${year === new Date().getFullYear() && month === new Date().getMonth() ? "disabled" : ""}>›</button></div></div>
      <div class="calendar-grid" role="grid" aria-label="${year} 年 ${month + 1} 月學習紀錄">${weekdays.map(day => `<span class="calendar-weekday" role="columnheader">${day}</span>`).join("")}${Array.from({ length: offset }, () => '<span class="calendar-cell empty" aria-hidden="true"></span>').join("")}${Array.from({ length: days }, (_, i) => {
        const day = i + 1, d = new Date(year, month, day), key = dateKey(d), count = Number(activity[key]) || 0;
        const intensity = count ? Math.max(1, Math.ceil(count / max * 4)) : 0;
        const isToday = key === dateKey(new Date());
        return `<span class="calendar-cell${count ? ` heat-${intensity}` : ""}${isToday ? " calendar-today" : ""}" role="gridcell" tabindex="0" title="${month + 1} 月 ${day} 日：${count} 題" aria-label="${month + 1} 月 ${day} 日，完成 ${count} 題">${day}</span>`;
      }).join("")}</div><div class="calendar-legend"><span>較少</span><i class="heat-0"></i><i class="heat-1"></i><i class="heat-2"></i><i class="heat-3"></i><i class="heat-4"></i><span>較多</span><span class="calendar-total">本月 ${Object.entries(activity).filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-`)).reduce((sum, [, count]) => sum + (Number(count) || 0), 0)} 題</span></div>`;
    root.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => {
      calendarDate = new Date(year, month + Number(button.dataset.move), 1);
      renderCalendar();
    }));
  }

  function achievementProgress() {
    const email = currentEmail();
    if (!email) return;
    const p = Store.get(`jaq.data.${email}`, {});
    const specs = {
      "first-step": { value: Math.min(Number(p.xp) || 0, 10), target: 10, text: `${Math.min(Number(p.xp) || 0, 10)} / 10 XP` },
      "streak-five": { value: Math.min(Number(p.streak) || 0, 5), target: 5, text: `${Math.min(Number(p.streak) || 0, 5)} / 5 連擊` },
      "n5-perfect": { value: Math.min(Number(p.best?.N5) || 0, 5), target: 5, text: `${Math.min(Number(p.best?.N5) || 0, 5)} / 5 題` },
      "xp-hundred": { value: Math.min(Number(p.xp) || 0, 100), target: 100, text: `${Math.min(Number(p.xp) || 0, 100)} / 100 XP` },
      "all-levels": (() => { const done = levels.filter(l => (Number(p.best?.[l]) || 0) >= 5).length; return { value: done, target: levels.length, text: `${done} / 5 個級別完美通關` }; })()
    };
    document.querySelectorAll(".achievement[data-achievement]").forEach(card => {
      const spec = specs[card.dataset.achievement];
      if (!spec) return;
      let detail = card.querySelector(".achievement-progress");
      if (!detail) {
        detail = document.createElement("span"); detail.className = "achievement-progress";
        const copy = card.querySelector(".achievement-label")?.parentElement;
        if (copy) copy.appendChild(detail);
      }
      detail.innerHTML = `<span class="achievement-progress-text">${spec.text}</span><span class="achievement-progress-track"><span style="width:${Math.min(100, spec.value / spec.target * 100)}%"></span></span>`;
      card.classList.toggle("just-unlocked", card.classList.contains("unlocked") && !card.dataset.wasUnlocked);
      if (card.classList.contains("unlocked")) card.dataset.wasUnlocked = "true";
    });
  }

  function playSurprise() {
    const modal = $("milestone-modal");
    if (!modal || modal.classList.contains("hidden") || modal.dataset.celebrating === "true") return;
    modal.dataset.celebrating = "true";
    const card = modal.querySelector(".milestone-card");
    if (!card) return;
    card.classList.add("surprise-active");
    const colors = ["#58cc02", "#1cb0f6", "#ffd166", "#ff6b6b", "#b388ff"];
    for (let i = 0; i < 42; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti-bit";
      bit.style.setProperty("--x", `${Math.random() * 100}%`);
      bit.style.setProperty("--delay", `${Math.random() * .55}s`);
      bit.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
      bit.style.setProperty("--color", colors[i % colors.length]);
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
    renderCalendar();
  }

  function refresh() {
    installCalendar();
    enhanceChart();
    achievementProgress();
    renderCalendar();
  }

  const chart = $("activity-chart");
  if (chart) new MutationObserver(() => {
    chart.dataset.lineChart = "false";
    requestAnimationFrame(enhanceChart);
  }).observe(chart, { childList: true });
  const achievements = $("achievement-list");
  if (achievements) new MutationObserver(() => requestAnimationFrame(achievementProgress)).observe(achievements, { childList: true });
  const modal = $("milestone-modal");
  if (modal) new MutationObserver(() => {
    if (!modal.classList.contains("hidden")) playSurprise();
    else {
      modal.dataset.celebrating = "false";
      modal.querySelector(".milestone-card")?.classList.remove("surprise-active");
    }
  }).observe(modal, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("auth:ok", () => setTimeout(refresh, 0));
  $("chart-tabs")?.addEventListener("click", refresh);
  document.querySelectorAll(".chart-tab").forEach(button => button.addEventListener("click", () => setTimeout(refresh, 0)));
  refresh();
})();
