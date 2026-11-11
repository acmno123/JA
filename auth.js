/* 登入／註冊（本機帳號，適合個人使用與展示） */
(() => {
  const $ = id => document.getElementById(id);
  let mode = "login";

  async function hashPw(s) {
    try {
      const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
      return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      // 非安全環境（無 crypto.subtle）時的備援雜湊
      let h = 0;
      for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
      return "fb" + h;
    }
  }

  function setMode(m) {
    mode = m;
    const reg = m === "register";
    document.querySelectorAll("[data-auth]").forEach(b => b.classList.toggle("active", b.dataset.auth === m));
    $("f-name").classList.toggle("hidden", !reg);
    $("f-pw2").classList.toggle("hidden", !reg);
    $("f-pw").autocomplete = reg ? "new-password" : "current-password";
    $("auth-submit").textContent = reg ? "建立帳號" : "登入";
    $("auth-err").textContent = "";
  }

  document.querySelectorAll("[data-auth]").forEach(b =>
    b.addEventListener("click", () => setMode(b.dataset.auth)));

  $("auth-form").addEventListener("submit", async e => {
    e.preventDefault();
    const err = msg => { $("auth-err").textContent = msg; };
    const email = $("f-email").value.trim().toLowerCase();
    const name = $("f-name").value.trim();
    const pw = $("f-pw").value;
    const pw2 = $("f-pw2").value;

    if (!/^\S+@\S+\.\S+$/.test(email)) return err("請輸入有效的電子郵件");
    if (pw.length < 6) return err("密碼至少需要 6 碼");

    const users = Store.get("jaq.users", {});
    const h = await hashPw(pw);

    if (mode === "register") {
      if (!name) return err("請輸入暱稱");
      if (pw !== pw2) return err("兩次輸入的密碼不一致");
      if (users[email]) return err("此信箱已經註冊過");
      users[email] = { name, hash: h, created: Date.now() };
      Store.set("jaq.users", users);
    } else if (!users[email] || users[email].hash !== h) {
      return err("信箱或密碼不正確");
    }

    Store.set("jaq.session", email);
    $("auth-form").reset();
    document.dispatchEvent(new CustomEvent("auth:ok", { detail: email }));
  });

  /* 啟動：已登入則直接進入遊戲 */
  const cur = Store.get("jaq.session", null);
  const users = Store.get("jaq.users", {});
  setMode("login");
  if (cur && users[cur]) {
    document.dispatchEvent(new CustomEvent("auth:ok", { detail: cur }));
  } else {
    $("auth-screen").classList.remove("hidden");
  }
})();
