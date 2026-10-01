// Motion for the site, following the Intelligent Flow rule: everything flows, nothing bounces.
// Smooth scrolling (Lenis), sections that flow in as they arrive, a hero that drifts as you scroll,
// and full-screen scene backdrops that cross-fade continuously with scroll. Reduced motion is respected.
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// 1. Reveal on scroll, with a gentle stagger inside grids and lists.
const revealSel = '.sec-h, .chips, .bcard, .ask, .me-lead, .me-body, .me-cta-row, .subscribe, .page-head, .prose > *';
const items = Array.from(document.querySelectorAll<HTMLElement>(revealSel));
items.forEach((el) => {
  const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
  const i = siblings.indexOf(el);
  el.style.setProperty('--i', String(Math.min(Math.max(i, 0), 6)));
  el.classList.add('rv');
});
if (reduce || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}

// 2. Smooth scrolling on desktop pointers. Touch keeps its native feel.
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (t: number) => { lenis!.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const id = a.getAttribute('href')!;
      const target = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!target) return;
      ev.preventDefault();
      lenis!.scrollTo(target, { offset: -24, duration: 1.4 });
    });
  });
}

// 3. Scroll-linked values: hero drift, and the scene stage (see section 5).
const hero = document.querySelector<HTMLElement>('.hero');
let ticking = false;
const update = () => {
  ticking = false;
  const y = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  root.style.setProperty('--scroll', String(Math.min(1, y / max)));
  if (hero) {
    const h = hero.offsetHeight || 1;
    root.style.setProperty('--hero', String(Math.min(1, y / h)));
  }
  updateStage();
};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

// 4. Phone tab bar: highlight the section in view on the home page.
const tabs = Array.from(document.querySelectorAll<HTMLAnchorElement>('.tabbar a[data-section]'));
if (tabs.length && 'IntersectionObserver' in window) {
  const sections = tabs
    .map((t) => document.getElementById(t.dataset.section!))
    .filter((s): s is HTMLElement => !!s);
  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((t) => t.toggleAttribute('data-active', t.dataset.section === e.target.id));
      }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => spy.observe(s));
  }
}

// 5. Scenes. Each home section has a full-screen backdrop on a fixed stage behind the page.
// A backdrop's opacity follows how centred its section is, so neighbours cross-fade smoothly,
// and the page tint blends between the scenes' tints. Nothing switches abruptly.
const layers = Array.from(document.querySelectorAll<HTMLElement>('.stage .layer'));
const sceneEls = layers.map((l) => document.getElementById(l.dataset.scene || ''));
const TINTS: Record<string, { dark: number[]; light: number[] }> = {
  warm: { dark: [13, 10, 8], light: [248, 240, 230] },
  net: { dark: [6, 10, 16], light: [238, 243, 249] },
  grid: { dark: [7, 10, 14], light: [243, 244, 243] },
  core: { dark: [9, 9, 12], light: [245, 243, 239] },
};
const BASE = { dark: [7, 10, 14], light: [246, 243, 238] };
const smooth = (x: number) => x * x * (3 - 2 * x);
const weights: number[] = layers.map(() => 0);

function updateStage() {
  if (!layers.length) return;
  const vh = window.innerHeight, mid = vh * 0.5, win = vh * 0.32;
  const theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  let tint = [0, 0, 0], sum = 0;
  layers.forEach((layer, i) => {
    const el = sceneEls[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    // A backdrop takes over as its section crosses the middle of the screen, and hands over to the
    // next one inside a short window, so at most two ever overlap and only briefly.
    const enter = smooth(Math.max(0, Math.min(1, (mid - r.top) / win + 0.5)));
    const exit = smooth(Math.max(0, Math.min(1, (r.bottom - mid) / win + 0.5)));
    const w = enter * exit;
    weights[i] = w;
    layer.style.opacity = w.toFixed(3);
    const t = TINTS[el.dataset.tint || ''];
    if (t) { const c = t[theme]; tint = tint.map((v, k) => v + c[k] * w); sum += w; }
  });
  const base = BASE[theme];
  const k = Math.min(1, sum);
  const mixed = sum > 0 ? tint.map((v, j) => (v / sum) * k + base[j] * (1 - k)) : base;
  root.style.setProperty('--scene-bg', `rgb(${mixed.map((v) => Math.round(v)).join(',')})`);
}
updateStage();
new MutationObserver(updateStage).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

// The living network behind the tech scene. Drawn only while that scene is visible.
const net = document.querySelector<HTMLCanvasElement>('.layer-net');
if (net) {
  const ctx = net.getContext('2d')!;
  type P = { x: number; y: number; vx: number; vy: number; hub: boolean };
  let pts: P[] = [];
  let colors = { node: '#6bace3', hub: '#a8dcf5', line: '43,129,191' };
  const readColors = () => {
    const cs = getComputedStyle(root);
    const hex = (v: string) => v.trim();
    const toRgb = (h: string) => { const m = h.replace('#', ''); const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
    colors = { node: hex(cs.getPropertyValue('--sky')), hub: hex(cs.getPropertyValue('--ice')), line: toRgb(hex(cs.getPropertyValue('--blue-bokeh'))) };
  };
  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    net.width = net.clientWidth * dpr; net.height = net.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.round((net.clientWidth * net.clientHeight) / 16000));
    let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    pts = Array.from({ length: n }, (_, i) => ({ x: rnd() * net.clientWidth, y: rnd() * net.clientHeight, vx: (rnd() - 0.5) * 0.3, vy: (rnd() - 0.5) * 0.3, hub: i % 9 === 0 }));
    readColors();
  };
  const draw = () => {
    const W = net.clientWidth, H = net.clientHeight;
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
    }
    const maxD = Math.min(160, W / 8);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < maxD) { ctx.strokeStyle = `rgba(${colors.line},${(1 - d / maxD) * 0.4})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
    for (const p of pts) { ctx.fillStyle = p.hub ? colors.hub : colors.node; ctx.beginPath(); ctx.arc(p.x, p.y, p.hub ? 2.2 : 1.1, 0, Math.PI * 2); ctx.fill(); }
  };
  const idx = layers.indexOf(net);
  const loop = () => { if (weights[idx] > 0.01) draw(); requestAnimationFrame(loop); };
  size(); draw();
  window.addEventListener('resize', size, { passive: true });
  new MutationObserver(() => { readColors(); draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if (!reduce) requestAnimationFrame(loop);
}

// 6. The career climb in "A bit about me" draws itself step by step when it comes into view.
// The "now" point is the only element on the page that keeps a gentle pulse.
document.querySelectorAll<HTMLElement>('.climb').forEach((el) => {
  if (reduce || !('IntersectionObserver' in window)) { el.classList.add('drawn'); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { el.classList.add('drawn'); io.disconnect(); }
  }), { threshold: 0.2 });
  io.observe(el);
});
