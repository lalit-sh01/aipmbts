// Interactions with a job (see design/08-sweep-audit.md, P1–P8). Mouse-only effects check for a fine pointer;
// everything respects reduced motion.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

// P1. Card spotlight: follows the cursor; champagne on product cards, blue on tech and build cards.
if (fine) {
  document.querySelectorAll<HTMLElement>('.bcard').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// P2. Desktop section index: shows where you are on the home page and how far through you are.
const index = document.querySelector<HTMLElement>('.sec-index');
if (index && 'IntersectionObserver' in window) {
  const links = Array.from(index.querySelectorAll<HTMLAnchorElement>('a[data-for]'));
  const sections = links.map((a) => document.getElementById(a.dataset.for!)).filter(Boolean) as HTMLElement[];
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.toggleAttribute('aria-current', a.dataset.for === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
  const hero = document.querySelector<HTMLElement>('.hero');
  const first = sections[0];
  const onScroll = () => {
    const y = window.scrollY, vh = window.innerHeight;
    const start = first ? first.offsetTop - vh * 0.5 : 0;
    const end = document.documentElement.scrollHeight - vh;
    index.style.setProperty('--progress', String(Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)))));
    index.classList.toggle('on', !hero || y > hero.offsetHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// P3. Theme switch spreads out in a circle from the toggle (View Transitions; instant where unsupported).
document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach((b) => {
  b.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const apply = () => { root.setAttribute('data-theme', next); try { localStorage.setItem('if-theme', next); } catch (e) {} };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (reduce || !doc.startViewTransition) { apply(); return; }
    const r = b.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('vt-theme');
    const t = doc.startViewTransition(apply);
    t.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', pseudoElement: '::view-transition-new(root)' });
    });
    (t as unknown as { finished: Promise<void> }).finished?.then(() => root.classList.remove('vt-theme'));
  });
});

// P4. Lesson filter: cards glide to their new places (FLIP), so you can see what the filter kept.
document.querySelectorAll<HTMLElement>('.chips').forEach((group) => {
  const grid = group.nextElementSibling as HTMLElement | null;
  if (!grid) return;
  group.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.chip'); if (!btn) return;
    e.stopImmediatePropagation();
    const lens = btn.getAttribute('data-lens');
    group.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'));
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-lenses]'));
    const before = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    const wasHidden = new Map(cards.map((c) => [c, c.hidden]));
    cards.forEach((c) => { c.hidden = !(lens === 'All' || c.dataset.lenses!.split(' ').includes(lens!)); });
    if (reduce) return;
    cards.forEach((c) => {
      if (c.hidden) return;
      if (wasHidden.get(c)) { c.animate({ opacity: [0, 1], transform: ['scale(.97)', 'none'] }, { duration: 280, easing: 'ease-out' }); return; }
      const a = before.get(c)!, b = c.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) c.animate({ transform: [`translate(${dx}px,${dy}px)`, 'none'] }, { duration: 320, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' });
    });
  }, { capture: true });
});

// P5. Email copies to the clipboard with an inline "Copied"; a modifier-click still opens the mail app.
document.querySelectorAll<HTMLAnchorElement>('a[data-copy]').forEach((a) => {
  const label = a.textContent;
  a.addEventListener('click', async (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !navigator.clipboard) return;
    e.preventDefault();
    try { await navigator.clipboard.writeText(a.dataset.copy!); } catch { window.location.href = a.href; return; }
    a.textContent = 'Copied'; a.classList.add('copied');
    setTimeout(() => { a.textContent = label; a.classList.remove('copied'); }, 1600);
  });
});

// P8. The hero's flow leans gently toward the cursor; the soft lights drift the other way (depth).
const heroEl = document.querySelector<HTMLElement>('.hero');
if (heroEl && fine && !reduce) {
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const tick = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    heroEl.style.setProperty('--lx', cx.toFixed(4)); heroEl.style.setProperty('--ly', cy.toFixed(4));
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
  };
  heroEl.addEventListener('pointermove', (e) => {
    const r = heroEl.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  heroEl.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
}
