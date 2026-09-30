// Motion for the site, following the Intelligent Flow rule: everything flows, nothing bounces.
// Smooth scrolling (Lenis), sections that flow in as they arrive, a hero that drifts as you scroll,
// and a thin warm-to-cool thread that fills with scroll progress. All of it is off under reduced motion.
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

// 3. Scroll-linked values: hero drift and the progress thread.
const hero = document.querySelector<HTMLElement>('.hero');
const thread = document.querySelector<HTMLElement>('.thread');
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
  if (thread) thread.classList.toggle('on', y > 40);
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
