/* 本機儲存封裝：localStorage 不可用時自動退回記憶體 */
const Store = (() => {
  const mem = {};
  const raw = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  };
  return {
    get(k, fallback) {
      try { const v = raw.get(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(k, v) { raw.set(k, JSON.stringify(v)); },
    del(k) { raw.del(k); }
  };
})();
