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

// 5. The river: one subtle flow line that runs from the hero down the side margins,
// warm by the product lessons, cool (with a faint network) by the tech sections,
// converging at "A bit about me". It draws in step with scrolling. Hidden on narrow screens.
const NS = 'http://www.w3.org/2000/svg';
const riverSvg = document.createElementNS(NS, 'svg');
riverSvg.setAttribute('class', 'river');
riverSvg.setAttribute('aria-hidden', 'true');
document.body.appendChild(riverSvg);

type Strand = SVGPathElement;
let strands: Strand[] = [];
let lead: Strand | null = null;
let tipEl: SVGCircleElement | null = null;
let coreEl: SVGCircleElement | null = null;
let nodes: { el: SVGCircleElement; y: number }[] = [];
let startY = 0, endY = 1, total = 1;

function buildRiver() {
  riverSvg.innerHTML = '';
  strands = []; nodes = []; lead = null;
  const W = document.documentElement.clientWidth;
  const ids = ['lessons', 'tech', 'builds', 'about'];
  const secs = ids.map((id) => document.getElementById(id)).filter((s): s is HTMLElement => !!s);
  const heroEl = document.querySelector<HTMLElement>('.hero');
  const wrap = document.querySelector<HTMLElement>('main .wrap');
  if (W < 1000 || !secs.length || !heroEl || !wrap) { riverSvg.style.display = 'none'; return; }
  riverSvg.style.display = '';
  const H = document.documentElement.scrollHeight;
  riverSvg.setAttribute('width', String(W));
  riverSvg.setAttribute('height', String(H));
  riverSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const pad = parseFloat(getComputedStyle(wrap).paddingLeft) || 32;
  const wrapLeft = wrap.getBoundingClientRect().left + pad;
  const gL = Math.max(14, wrapLeft / 2);
  const gR = W - gL;
  const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  const heroBottom = top(heroEl) + heroEl.offsetHeight;
  startY = heroBottom - 40;

  const sides = [gL, gR, gL, gR];
  let d = `M ${W / 2} ${startY}`;
  let prevX = W / 2, prevY = startY;
  secs.forEach((s, i) => {
    const x = sides[i % sides.length];
    const y0 = top(s) + 18;
    const y1 = top(s) + s.offsetHeight - 10;
    const my = (prevY + y0) / 2;
    d += ` C ${prevX} ${my}, ${x} ${my}, ${x} ${y0}`;
    const last = i === secs.length - 1;
    const yEnd = last ? top(s) + Math.min(s.offsetHeight * 0.5, 260) : y1;
    d += ` L ${x} ${yEnd}`;
    prevX = x; prevY = yEnd;
  });
  endY = prevY;

  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `<linearGradient id="riverGrad" gradientUnits="userSpaceOnUse" x1="0" y1="${startY}" x2="0" y2="${endY}">
    <stop offset="0" stop-color="var(--champagne)"/><stop offset="0.3" stop-color="var(--amber)"/>
    <stop offset="0.5" stop-color="var(--converge-soft)"/><stop offset="0.72" stop-color="var(--sky)"/>
    <stop offset="1" stop-color="var(--converge)"/></linearGradient>
    <filter id="riverGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>`;
  riverSvg.appendChild(defs);

  [-7, -3, 0, 3, 7].forEach((o) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', o === 0 ? 'river-lead' : 'river-strand');
    p.setAttribute('transform', `translate(${o} 0)`);
    p.setAttribute('pathLength', '1');
    riverSvg.appendChild(p);
    strands.push(p);
    if (o === 0) lead = p;
  });

  // A sparse, faint network beside the tech sections.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  [secs[1], secs[2]].filter(Boolean).forEach((s, k) => {
    const x = sides[(k + 1) % sides.length];
    for (let n = 0; n < 14; n++) {
      const c = document.createElementNS(NS, 'circle');
      const y = top(s) + 40 + rnd() * Math.max(80, s.offsetHeight - 80);
      c.setAttribute('cx', String(x + (rnd() - 0.5) * Math.min(120, gL * 1.4)));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', rnd() < 0.2 ? '1.6' : '0.9');
      c.setAttribute('class', 'river-node');
      riverSvg.appendChild(c);
      nodes.push({ el: c, y });
    }
  });

  coreEl = document.createElementNS(NS, 'circle');
  coreEl.setAttribute('cx', String(prevX)); coreEl.setAttribute('cy', String(endY));
  coreEl.setAttribute('r', '5'); coreEl.setAttribute('class', 'river-core');
  coreEl.setAttribute('filter', 'url(#riverGlow)');
  riverSvg.appendChild(coreEl);

  tipEl = document.createElementNS(NS, 'circle');
  tipEl.setAttribute('r', '2.5'); tipEl.setAttribute('class', 'river-tip');
  tipEl.setAttribute('filter', 'url(#riverGlow)');
  riverSvg.appendChild(tipEl);

  total = lead ? lead.getTotalLength() : 1;
  drawRiver();
}

function drawRiver() {
  if (!lead || !tipEl || !coreEl) return;
  const prog = reduce ? 1 : Math.min(1, Math.max(0, (window.scrollY + window.innerHeight * 0.7 - startY) / Math.max(1, endY - startY)));
  // Map scroll progress to path length by vertical position, so the tip tracks the reading line.
  let lo = 0, hi = total;
  const targetY = startY + (endY - startY) * prog;
  for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (lead.getPointAtLength(mid).y < targetY) lo = mid; else hi = mid; }
  const frac = lo / total;
  strands.forEach((p) => { p.style.strokeDashoffset = String(1 - frac); });
  const pt = lead.getPointAtLength(lo);
  tipEl.setAttribute('cx', String(pt.x)); tipEl.setAttribute('cy', String(pt.y));
  tipEl.style.opacity = prog > 0.002 && prog < 0.995 && !reduce ? '1' : '0';
  nodes.forEach((n) => n.el.classList.toggle('on', n.y < pt.y));
  coreEl.classList.toggle('on', prog >= 0.995);
}

let riverTimer = 0;
const rebuild = () => { clearTimeout(riverTimer); riverTimer = window.setTimeout(buildRiver, 120); };
window.addEventListener('load', buildRiver);
window.addEventListener('resize', rebuild, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
window.addEventListener('scroll', () => requestAnimationFrame(drawRiver), { passive: true });
if (document.fonts) document.fonts.ready.then(buildRiver);
