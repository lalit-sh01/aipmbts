// Motion for the site, following the Intelligent Flow rule: everything flows, nothing bounces.
// Smooth scrolling (Lenis), sections that flow in as they arrive, a hero that drifts as you scroll,
// and a subtle river line down the side margins that draws with scroll. All of it is off under reduced motion.
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// 1. Reveal on scroll, with a gentle stagger inside grids and lists.
const revealSel = '.sec-h, .chips, .bcard, .ask, .me-lead, .me-body, .subscribe, .page-head, .prose > *';
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

// 3. Scroll-linked values: hero drift.
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
};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
if (!reduce) {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

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

// 5. The river, ported from the approved sketch (site-concepts/1-the-river.html) and toned down:
// one bundle of flowing strands that swings across the page between sections, warm by the product
// lessons, cool with a network by the tech sections, converging at "A bit about me".
const NS = 'http://www.w3.org/2000/svg';
const riverSvg = document.createElementNS(NS, 'svg');
riverSvg.setAttribute('class', 'river');
riverSvg.setAttribute('aria-hidden', 'true');
document.body.appendChild(riverSvg);

let strands: SVGPathElement[] = [];
let lead: SVGPathElement | null = null;
let tipEl: SVGCircleElement | null = null;
let coreEl: SVGCircleElement | null = null;
let nodes: { el: SVGCircleElement; y: number }[] = [];
let startY = 0, endY = 1, total = 1;

function buildRiver() {
  riverSvg.innerHTML = '';
  strands = []; nodes = []; lead = null;
  const W = document.documentElement.clientWidth;
  const secs = ['lessons', 'tech', 'builds', 'about']
    .map((id) => document.getElementById(id)).filter((s): s is HTMLElement => !!s);
  const heroEl = document.querySelector<HTMLElement>('.hero');
  if (W < 760 || !secs.length || !heroEl) { riverSvg.style.display = 'none'; return; }
  riverSvg.style.display = '';
  const H = document.documentElement.scrollHeight;
  riverSvg.setAttribute('width', String(W));
  riverSvg.setAttribute('height', String(H));
  riverSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  startY = top(heroEl) + heroEl.offsetHeight * 0.82;
  const pts: [number, number][] = [[W * 0.5, startY]];
  secs.forEach((s, i) => pts.push([i % 2 === 0 ? W * 0.18 : W * 0.82, top(s) + s.offsetHeight * 0.5]));
  const last = pts[pts.length - 1];
  endY = last[1];
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const my = (a[1] + b[1]) / 2;
    d += ` C ${a[0]} ${my}, ${b[0]} ${my}, ${b[0]} ${b[1]}`;
  }

  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `<linearGradient id="riverGrad" gradientUnits="userSpaceOnUse" x1="0" y1="${startY}" x2="0" y2="${endY}">
    <stop offset="0" stop-color="var(--champagne)"/><stop offset="0.35" stop-color="var(--amber)"/>
    <stop offset="0.55" stop-color="var(--converge-soft)"/><stop offset="0.75" stop-color="var(--cyan-hot)"/>
    <stop offset="1" stop-color="var(--converge)"/></linearGradient>
    <filter id="riverGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>`;
  riverSvg.appendChild(defs);

  [-18, -10, -4, 0, 4, 10, 18].forEach((o) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', o === 0 ? 'river-lead' : 'river-strand');
    p.setAttribute('transform', `translate(${o} 0)`);
    p.setAttribute('pathLength', '1');
    riverSvg.appendChild(p);
    strands.push(p);
    if (o === 0) lead = p;
  });

  // A network around the river beside the tech sections, appearing as the river passes.
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  [1, 2].forEach((k) => {
    const s = secs[k]; if (!s) return;
    const cx = k % 2 === 0 ? W * 0.18 : W * 0.82;
    for (let n = 0; n < 26; n++) {
      const c = document.createElementNS(NS, 'circle');
      const y = top(s) + s.offsetHeight * (0.15 + rnd() * 0.7);
      c.setAttribute('cx', String(cx + (rnd() - 0.5) * W * 0.22));
      c.setAttribute('cy', String(y));
      const hub = rnd() < 0.15;
      c.setAttribute('r', hub ? '2' : '1');
      c.setAttribute('class', hub ? 'river-node hub' : 'river-node');
      riverSvg.appendChild(c);
      nodes.push({ el: c, y });
    }
  });

  coreEl = document.createElementNS(NS, 'circle');
  coreEl.setAttribute('cx', String(last[0])); coreEl.setAttribute('cy', String(last[1]));
  coreEl.setAttribute('r', '10'); coreEl.setAttribute('class', 'river-core');
  coreEl.setAttribute('filter', 'url(#riverGlow)');
  riverSvg.appendChild(coreEl);

  tipEl = document.createElementNS(NS, 'circle');
  tipEl.setAttribute('r', '3.5'); tipEl.setAttribute('class', 'river-tip');
  tipEl.setAttribute('filter', 'url(#riverGlow)');
  riverSvg.appendChild(tipEl);

  total = lead ? (lead as SVGPathElement).getTotalLength() : 1;
  drawRiver();
}

function drawRiver() {
  if (!lead || !tipEl || !coreEl) return;
  const prog = reduce ? 1 : Math.min(1, Math.max(0, (window.scrollY + window.innerHeight * 0.65 - startY) / Math.max(1, endY - startY)));
  // Find the point on the river at the reading line, so the tip keeps pace with the reader.
  const targetY = startY + (endY - startY) * prog;
  let lo = 0, hi = total;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lead.getPointAtLength(mid).y < targetY) lo = mid; else hi = mid; }
  strands.forEach((p) => { p.style.strokeDashoffset = String(1 - lo / total); });
  const pt = lead.getPointAtLength(lo);
  tipEl.setAttribute('cx', String(pt.x)); tipEl.setAttribute('cy', String(pt.y));
  tipEl.classList.toggle('on', !reduce && prog > 0.002 && prog < 0.99);
  nodes.forEach((n) => n.el.classList.toggle('on', n.y < pt.y));
  coreEl.classList.toggle('on', prog >= 0.99);
}

let riverTimer = 0;
const rebuild = () => { clearTimeout(riverTimer); riverTimer = window.setTimeout(buildRiver, 120); };
window.addEventListener('load', buildRiver);
window.addEventListener('resize', rebuild, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
window.addEventListener('scroll', () => requestAnimationFrame(drawRiver), { passive: true });
if (document.fonts) document.fonts.ready.then(buildRiver);
