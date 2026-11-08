// Development performance monitor. Active in `npm run dev`, or in any build
// with ?perf in the URL. Measures frame time with rAF and attributes each
// frame to the section most in view ([data-section]). Every 5 s it logs a
// table (avg / p95 ms, fps, frames > 20 ms) and keeps the totals on
// window.__spunchyPerf for scripted audits.
export function startPerfMonitor() {
  const stats = {};
  let current = 'top';
  const ratios = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) ratios.set(e.target.dataset.section, e.intersectionRatio);
      let best = current, max = 0;
      for (const [k, v] of ratios) if (v > max) { max = v; best = k; }
      current = best;
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  const observe = () => document.querySelectorAll('[data-section]').forEach((el) => io.observe(el));
  observe();
  new MutationObserver(observe).observe(document.body, { childList: true, subtree: true });

  let last = performance.now();
  const loop = (now) => {
    const dt = now - last;
    last = now;
    if (!document.hidden && dt < 250) (stats[current] ||= []).push(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const summary = () => {
    const out = {};
    for (const [k, arr] of Object.entries(stats)) {
      if (arr.length < 10) continue;
      const s = arr.slice().sort((a, b) => a - b);
      const avg = s.reduce((a, b) => a + b, 0) / s.length;
      out[k] = {
        frames: s.length,
        avg_ms: +avg.toFixed(2),
        p95_ms: +s[Math.floor(s.length * 0.95)].toFixed(2),
        fps: +(1000 / avg).toFixed(1),
        janky: s.filter((x) => x > 20).length,
      };
    }
    return out;
  };
  window.__spunchyPerf = { summary, reset: () => Object.keys(stats).forEach((k) => delete stats[k]) };
  setInterval(() => {
    const s = summary();
    if (Object.keys(s).length) console.table(s);
  }, 5000);
}
