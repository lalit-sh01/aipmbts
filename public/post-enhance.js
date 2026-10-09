// P7: reading progress for imported posts — how much of the article is left.
(function () {
  var bar = document.querySelector('.read-progress'); if (!bar) return;
  var body = document.querySelector('main') || document.body, ticking = false;
  function update() {
    ticking = false;
    var r = body.getBoundingClientRect(), vh = window.innerHeight;
    var total = r.height - vh, read = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    bar.style.setProperty('--read', read.toFixed(4));
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update); update();
})();

// Tab icon follows the post's theme toggle, like the rest of the site.
(function () {
  var r = document.documentElement;
  function sync() {
    var t = r.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    document.querySelectorAll('link[data-icon]').forEach(function (l) { l.media = l.href.indexOf('icon-' + t) > -1 ? 'all' : 'not all'; });
  }
  sync(); new MutationObserver(sync).observe(r, { attributes: true, attributeFilter: ['data-theme'] });
})();
