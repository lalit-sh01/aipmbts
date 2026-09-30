/* @ds-bundle: {"format":4,"namespace":"IFlow","components":[{"name":"Eyebrow"},{"name":"Display"},{"name":"FlowGlyph"},{"name":"SignatureFlow"},{"name":"Depth"},{"name":"FlowDiagram"},{"name":"GradientField"},{"name":"CaseStudyCard"},{"name":"PostCard"},{"name":"CarouselCover"},{"name":"Hero"}]} */
(function () {
  var R = window.React, h = R.createElement;

  /* ---------- helpers ---------- */
  /* Theme-aware ramp: mixes live tokens, so diagrams follow dark and light themes. */
  /* Label ramp: every stop is text-safe in both themes (champagne → converge-soft → sky). */
  function rampText(t) {
    t = Math.max(0, Math.min(1, t));
    if (t < 0.5) return 'color-mix(in oklab, var(--champagne) ' + Math.round((1 - t * 2) * 100) + '%, var(--converge-soft))';
    return 'color-mix(in oklab, var(--converge-soft) ' + Math.round((1 - (t - 0.5) * 2) * 100) + '%, var(--sky))';
  }
  function ramp(t) {
    t = Math.max(0, Math.min(1, t));
    if (t < 0.5) return 'color-mix(in oklab, var(--gold) ' + Math.round((1 - t * 2) * 100) + '%, var(--converge-soft))';
    return 'color-mix(in oklab, var(--converge-soft) ' + Math.round((1 - (t - 0.5) * 2) * 100) + '%, var(--cyan-hot))';
  }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  var uidN = 0;
  function useUid(p) { var r = R.useRef(null); if (!r.current) { uidN += 1; r.current = p + uidN; } return r.current; }
  function curve(x1, y1, x2, y2) {
    var mx = x1 + (x2 - x1) * 0.5;
    return 'M' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
  }
  function poly(pts) {
    var d = '';
    for (var i = 0; i < pts.length; i++) d += (i ? ' L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    return d;
  }
  function pulse(path, dur, begin, cls, r) {
    return h('circle', { r: r || 2.5, className: cls },
      h('animateMotion', { dur: dur, begin: begin || '0s', repeatCount: 'indefinite', path: path }));
  }
  function stop(offset, token, opacity) {
    return h('stop', { key: offset + token, offset: offset, style: { stopColor: 'var(--' + token + ')', stopOpacity: opacity == null ? 1 : opacity } });
  }
  /* box = [x, y, w, h] in user space: required for glows on straight lines, whose zero-height bounding box would clip the filter */
  function bloomFilter(id, dev, box) {
    var region = box ? { filterUnits: 'userSpaceOnUse', x: box[0], y: box[1], width: box[2], height: box[3] } : { x: '-20%', y: '-50%', width: '140%', height: '200%' };
    return h('filter', Object.assign({ id: id }, region),
      h('feGaussianBlur', { stdDeviation: dev || 3, result: 'b' }),
      h('feMerge', null, h('feMergeNode', { in: 'b' }), h('feMergeNode', { in: 'b' }), h('feMergeNode', { in: 'SourceGraphic' })));
  }

  /* ---------- Eyebrow ---------- */
  function Eyebrow(p) {
    var items = p.items;
    var content = items ? items.reduce(function (acc, it, i) {
      if (i) acc.push(h('span', { key: 's' + i, className: 'if-eyebrow-sep', 'aria-hidden': 'true' }, '·'));
      acc.push(h('span', { key: 'i' + i }, it));
      return acc;
    }, []) : p.children;
    return h('p', { className: cx('if-eyebrow', 'if-tone-' + (p.tone || 'mist'), p.className), style: p.style }, content);
  }

  /* ---------- Display ---------- */
  function Display(p) {
    var size = p.size || 'display';
    var Tag = p.as || (size === 'h2' ? 'h2' : 'h1');
    var lines = p.lines;
    var accentEl = p.accent ? h('span', { className: p.accentTone === 'warm' ? 'if-accent-warm' : 'if-accent' }, p.accent) : null;
    var body;
    if (lines) {
      var inline = p.accentBreak === false;
      body = lines.map(function (l, i) {
        var last = i === lines.length - 1;
        return h(R.Fragment, { key: i }, i ? h('br') : null, l, last && inline && accentEl ? h(R.Fragment, null, ' ', accentEl) : null);
      });
      if (!inline && accentEl) body = body.concat([h('br', { key: 'ab' }), h(R.Fragment, { key: 'ac' }, accentEl)]);
    } else {
      body = [p.children, accentEl ? h(R.Fragment, { key: 'ac' }, p.children ? ' ' : null, accentEl) : null];
    }
    return h(Tag, { className: cx(size, 'if-heading', p.uppercase ? 'if-upper' : null, p.className), style: p.style }, body);
  }

  /* ---------- FlowGlyph v2: converge / diverge / signature, on the brand ramps ---------- */
  function FlowGlyph(p) {
    var gid = useUid('ifg');
    var kind = p.kind || 'converge', w = p.width || 200, ht = p.height || 64, m = ht / 2;
    var spread = Math.min(20, ht / 3);
    var active = !!p.active && !reduced();
    var nx = kind === 'diverge' ? w * 0.42 : kind === 'signature' ? w * 0.5 : w * 0.55;
    var lines = [], ends = [], out = null;
    /* warm enters on the warm ramp and runs a little past the node; cool the same from the other side */
    function warmIn(y, i) { lines.push({ d: curve(0, y, nx, m) + ' L ' + (nx + w * 0.08) + ' ' + m, g: 'w', a: i === 1 ? 0.7 : 1 }); ends.push({ x: 0, y: y, c: 'if-fill-warm' }); }
    function coolOut(y, i) { lines.push({ d: 'M' + (nx - w * 0.08) + ' ' + m + ' L ' + nx + ' ' + m + curve(nx, m, w, y).replace(/^M[^C]+/, ' '), g: 'c', a: i === 1 ? 0.7 : 1 }); ends.push({ x: w, y: y, c: 'if-fill-sky' }); }
    if (kind === 'diverge') {
      lines.push({ d: 'M0 ' + m + ' L ' + nx + ' ' + m, g: 'n', a: 1 }); ends.push({ x: 0, y: m, c: 'if-fill-converge' });
      [-spread, 0, spread].forEach(function (o, i) { coolOut(m + o, i); });
      out = lines[1].d;
    } else if (kind === 'signature') {
      warmIn(m - spread, 0);
      lines.push({ d: curve(0, m + spread, nx, m) + ' L ' + (nx - w * 0.02) + ' ' + m, g: 'ci', a: 1 }); ends.push({ x: 0, y: m + spread, c: 'if-fill-sky' });
      out = 'M' + nx + ' ' + m + ' L ' + w + ' ' + m;
      lines.push({ d: out, g: 'o', a: 1 });
    } else {
      [-spread, 0, spread].forEach(function (o, i) { warmIn(m + o, i); });
      out = 'M' + nx + ' ' + m + ' L ' + w + ' ' + m;
      lines.push({ d: out, g: 'o', a: 1 });
    }
    var stroke = { w: 'url(#' + gid + '-w)', c: 'url(#' + gid + '-c)', ci: 'url(#' + gid + '-ci)', o: 'url(#' + gid + '-o)', n: 'url(#' + gid + '-n)' };
    return h('svg', { className: cx('if-svg', 'if-glyph', active ? 'is-active' : null, p.className), width: w, height: ht, viewBox: '0 0 ' + w + ' ' + ht, role: 'img', 'aria-label': p.label || (kind + ' flow') },
      h('defs', null,
        h('linearGradient', { id: gid + '-w', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: nx + w * 0.08, y2: 0 },
          stop('0', 'amber'), stop('0.55', 'gold'), stop(String(0.85 * nx / (nx + w * 0.08)), 'amber-hot'), stop(String(nx / (nx + w * 0.08)), 'converge'), stop('1', 'ice', 0)),
        h('linearGradient', { id: gid + '-ci', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: nx, y2: 0 },
          stop('0', 'signal-blue'), stop('0.5', 'electric-blue'), stop('0.85', 'cyan-hot'), stop('1', 'converge')),
        h('linearGradient', { id: gid + '-c', gradientUnits: 'userSpaceOnUse', x1: nx - w * 0.08, y1: 0, x2: w, y2: 0 },
          stop('0', 'amber-hot', 0), stop(String(w * 0.08 / (w - nx + w * 0.08)), 'converge'), stop('0.45', 'cyan-hot'), stop('1', 'electric-blue')),
        h('linearGradient', { id: gid + '-o', gradientUnits: 'userSpaceOnUse', x1: nx, y1: 0, x2: w, y2: 0 },
          stop('0', 'converge'), stop('0.5', 'converge-soft', 0.75), stop('1', 'converge-soft', 0.35)),
        h('linearGradient', { id: gid + '-n', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: nx, y2: 0 },
          stop('0', 'converge-soft', 0.4), stop('1', 'converge')),
        h('radialGradient', { id: gid + '-core' }, stop('0', 'converge', 0.95), stop('0.35', 'amber-hot', 0.35), stop('1', 'converge', 0)),
        bloomFilter(gid + '-b', 1.6, [-12, -12, w + 24, ht + 24])),
      h('g', { className: 'if-screen' },
        lines.map(function (l, i) { return h('path', { key: i, d: l.d, fill: 'none', stroke: stroke[l.g], strokeWidth: 1.3, strokeLinecap: 'round', opacity: l.a, className: 'if-line', filter: active ? 'url(#' + gid + '-b)' : null }); })),
      ends.map(function (d, i) { return h('circle', { key: 'd' + i, cx: d.x, cy: d.y, r: 1.8, className: d.c }); }),
      h('ellipse', { cx: nx, cy: m, rx: 14, ry: 9, fill: 'url(#' + gid + '-core)', className: active ? 'if-halo' : null, opacity: active ? null : 0.45 }),
      h('ellipse', { cx: nx, cy: m, rx: 4.5, ry: 2.4, className: 'if-fill-converge', filter: 'url(#' + gid + '-b)' }),
      active && out ? pulse(out, '1.6s', '0s', kind === 'diverge' ? 'if-fill-cyan' : 'if-fill-hot', 2.2) : null,
      active && kind !== 'diverge' ? pulse(lines[0].d, '1.6s', '0.4s', 'if-fill-hot', 1.8) : null
    );
  }

  /* ---------- SignatureFlow v2: organic warm silk × structured cool mesh ---------- */
  var SW = 1200, SH = 450, CXP = SW * 0.5, CYP = SH * 0.64, WAIST = 2.2, OVER = 120;
  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  /* One spine for both sides: each half reaches (CXP, CYP) with zero slope, so the line
     passes through the merge as a single S-curve instead of meeting in a V. */
  function spine(px) {
    if (px <= CXP) {
      var t = Math.max(0, px / CXP);
      return lerp(SH * 0.40, CYP, smooth(Math.pow(t, 1.7))) + Math.sin(t * Math.PI * 3.3 + 0.1) * 48 * Math.pow(1 - t, 1.25);
    }
    var u = Math.max(0, (SW - px) / (SW - CXP));
    return lerp(SH * 0.42, CYP, smooth(Math.pow(u, 1.3))) + Math.sin(u * Math.PI * 1.6) * 24 * Math.pow(1 - u, 1.4);
  }
  /* Warm fibres narrow to a shared waist, then run on past the merge (the braid). */
  function warmY(px, off) {
    var t = Math.max(0, Math.min(1, px / CXP));
    var spread = px <= CXP ? WAIST + Math.pow(1 - t, 1.7) * 118 : WAIST * (1 + (px - CXP) / 50);
    var noise = px < CXP ? Math.sin(px * 0.02 + off * 9) * 4 * Math.pow(1 - t, 1.4) : 0;
    return spine(px) + off * spread + noise;
  }
  function coolY(px, off) {
    var u = Math.max(0, Math.min(1, (SW - px) / (SW - CXP)));
    var spread = px >= CXP ? WAIST + Math.pow(1 - u, 0.85) * 92 * smooth((px - CXP) / 40) : WAIST * (1 + (CXP - px) / 50);
    return spine(px) + off * spread * (off > 0 ? 1.25 : 0.8);
  }
  var LEADS = [
    { off: -0.05, f: 2.4, ph: 2.2, amp: 50, a: 0.95, w: 1.3, bloom: true },
    { off: 0.12, f: 4.2, ph: -0.4, amp: 38, a: 0.8, w: 1.1, bloom: true },
    { off: -0.22, f: 1.6, ph: 3.4, amp: 30, a: 0.6, w: 0.9 }
  ];
  function leadY(L) {
    return function (px) {
      var t = Math.max(0, Math.min(1, px / CXP));
      return warmY(px, L.off) + (px < CXP ? Math.sin(t * Math.PI * L.f + L.ph) * L.amp * Math.pow(1 - t, 1.5) : 0);
    };
  }
  function trace(fn, off, from, to, step) {
    var pts = [], dir = to > from ? 1 : -1;
    for (var px = from; dir > 0 ? px <= to : px >= to; px += step * dir) pts.push([px, fn(px, off)]);
    pts.push([to, fn(to, off)]);
    return pts;
  }

  function SignatureFlow(p) {
    var gid = useUid('ifs');
    var animate = !!p.animate && !reduced();
    var nWarm = p.fibres || 100, nCool = p.strands || 34;
    var model = R.useMemo(function () {
      var r = rng(p.seed || 7), warm = [], cool = [], nodes = [], edges = [];
      for (var i = 0; i < nWarm; i++) {
        var off = (r() * 2 - 1) * (0.3 + r() * 0.7);
        warm.push({ d: poly(trace(warmY, off, -8, CXP + OVER, 6)), a: lerp(0.07, 0.3, 1 - Math.abs(off)), w: lerp(0.4, 1, r()), off: off });
      }
      for (var j = 0; j < nCool; j++) {
        var o2 = (r() * 2 - 1) * 0.8;
        cool.push({ d: poly(trace(coolY, o2, SW + 8, CXP - OVER, 6)), a: lerp(0.1, 0.32, 1 - Math.abs(o2)), w: lerp(0.4, 0.8, r()), off: o2 });
      }
      if (p.mesh !== false) {
        for (var k = 0; k < (p.meshNodes || 140); k++) {
          var t = Math.pow(r(), 0.6), px = lerp(SW * 0.71, SW + 10, t), o3 = (r() * 2 - 1) * 0.95;
          nodes.push({ x: px, y: coolY(px, o3) + (r() - 0.5) * 12, r: r() < 0.12 ? lerp(1.5, 2.4, r()) : lerp(0.5, 1.1, r()) });
        }
        nodes.forEach(function (a, ia) {
          nodes.map(function (b, ib) { return { ib: ib, d: Math.hypot(a.x - b.x, a.y - b.y) }; })
            .filter(function (o) { return o.ib > ia && o.d < 88; }).sort(function (x, y) { return x.d - y.d; }).slice(0, 3)
            .forEach(function (o) { edges.push({ a: a, b: nodes[o.ib], o: lerp(0.28, 0.06, o.d / 88) }); });
        });
      }
      return { warm: warm, cool: cool, nodes: nodes, edges: edges,
        leads: LEADS.map(function (L) { return { d: poly(trace(leadY(L), 0, -8, CXP + OVER, 3)), a: L.a, w: L.w }; }),
        warmHero: poly(trace(warmY, 0, -8, CXP + OVER, 3)), coolHero: poly(trace(coolY, 0, SW + 8, CXP - OVER, 3)) };
    }, [p.seed, nWarm, nCool, p.mesh, p.meshNodes]);

    var leftLabels = p.leftLabels || ['Problem', 'Insight', 'Decision'];
    var rightLabels = p.rightLabels || ['Data', 'Models', 'Agents'];
    function label(px, fn, off, text, side, i) {
      var y = fn(px, off), top = y - 24;
      var fill = side === 'warm' ? 'if-fill-hot' : 'if-fill-ice';
      return h('g', { key: side + i, className: animate ? 'if-fade-in' : null, style: animate ? { animationDelay: (700 + i * 160) + 'ms' } : null },
        h('line', { x1: px, y1: y, x2: px, y2: top, className: side === 'warm' ? 'if-stroke-champagne' : 'if-stroke-sky', strokeWidth: 0.7, opacity: 0.7 }),
        h('circle', { cx: px, cy: top, r: 1.4, className: fill, filter: 'url(#' + gid + '-bs)' }),
        h('circle', { cx: px, cy: y, r: 2, className: fill, filter: 'url(#' + gid + '-bs)' }),
        h('text', { x: px, y: top - 10, textAnchor: 'middle', className: side === 'warm' ? 'if-text-warm' : 'if-text-cool', style: { fontFamily: 'var(--font-display)', fontSize: 9.5, letterSpacing: '0.2em', fontWeight: 400 } }, String(text).toUpperCase()));
    }
    var lx = [0.085, 0.195, 0.305], rx = [0.745, 0.83, 0.912];
    var showLabels = p.showLabels !== false;
    var pulses = p.pulses !== false && !reduced();

    return h('svg', { className: cx('if-svg', p.className), viewBox: '0 0 ' + SW + ' ' + SH, width: '100%', preserveAspectRatio: p.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet', role: 'img', 'aria-label': p.label || 'Warm organic fibres and a cool structured network converging into one bright point', style: p.style },
      h('defs', null,
        h('linearGradient', { id: gid + '-w', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: CXP + OVER, y2: 0 },
          stop('0', 'ember'), stop(String(0.25 * CXP / (CXP + OVER)), 'copper'), stop(String(0.52 * CXP / (CXP + OVER)), 'amber'), stop(String(0.8 * CXP / (CXP + OVER)), 'champagne'),
          stop(String(0.9 * CXP / (CXP + OVER)), 'gold'), stop(String(0.96 * CXP / (CXP + OVER)), 'amber-hot'), stop(String(CXP / (CXP + OVER)), 'converge'),
          stop(String((CXP + 45) / (CXP + OVER)), 'ice', 0.55), stop('1', 'cyan-hot', 0)),
        h('linearGradient', { id: gid + '-wl', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: CXP + OVER, y2: 0 },
          stop('0', 'amber'), stop(String(0.3 * CXP / (CXP + OVER)), 'champagne'), stop(String(0.6 * CXP / (CXP + OVER)), 'gold'), stop(String(0.93 * CXP / (CXP + OVER)), 'amber-hot'),
          stop(String(CXP / (CXP + OVER)), 'converge'), stop(String((CXP + 45) / (CXP + OVER)), 'ice', 0.55), stop('1', 'cyan-hot', 0)),
        h('linearGradient', { id: gid + '-c', gradientUnits: 'userSpaceOnUse', x1: SW, y1: 0, x2: CXP - OVER, y2: 0 },
          stop('0', 'signal-blue'), stop(String(0.55 * (SW - CXP) / (SW - CXP + OVER)), 'electric-blue'),
          stop(String(0.92 * (SW - CXP) / (SW - CXP + OVER)), 'cyan-hot'), stop(String((SW - CXP) / (SW - CXP + OVER)), 'converge'),
          stop(String((SW - CXP + 45) / (SW - CXP + OVER)), 'amber-hot', 0.5), stop('1', 'gold', 0)),
        h('radialGradient', { id: gid + '-core' }, stop('0', 'converge', 0.95), stop('0.3', 'ice', 0.4), stop('0.65', 'electric-blue', 0.08), stop('1', 'converge', 0)),
        bloomFilter(gid + '-b', 3.2), bloomFilter(gid + '-bs', 2)),

      /* warm: organic silk */
      h('g', { className: 'if-screen' },
        model.warm.map(function (f, i) {
          return h('path', { key: 'w' + i, d: f.d, pathLength: 1, fill: 'none', stroke: 'url(#' + gid + '-w)', strokeWidth: f.w, opacity: f.a, strokeLinecap: 'round',
            className: animate ? 'if-draw' : null, style: animate ? { animationDelay: Math.round(Math.abs(f.off) * 260) + 'ms' } : null });
        }),
        model.leads.map(function (L, i) {
          return h('path', { key: 'l' + i, d: L.d, pathLength: 1, fill: 'none', stroke: 'url(#' + gid + '-wl)', strokeWidth: L.w, opacity: L.a, strokeLinecap: 'round',
            filter: LEADS[i].bloom ? 'url(#' + gid + '-bs)' : null, className: animate ? 'if-draw' : null, style: animate ? { animationDelay: (80 + i * 90) + 'ms' } : null });
        }),
        h('path', { d: model.warmHero, pathLength: 1, fill: 'none', stroke: 'url(#' + gid + '-wl)', strokeWidth: 1.5, filter: 'url(#' + gid + '-b)', className: animate ? 'if-draw' : null })),

      /* cool: structured network */
      h('g', { className: 'if-screen' },
        model.cool.map(function (f, i) {
          return h('path', { key: 'c' + i, d: f.d, pathLength: 1, fill: 'none', stroke: 'url(#' + gid + '-c)', strokeWidth: f.w, opacity: f.a, strokeLinecap: 'round',
            className: animate ? 'if-draw' : null, style: animate ? { animationDelay: Math.round(Math.abs(f.off) * 260) + 'ms' } : null });
        }),
        h('path', { d: model.coolHero, pathLength: 1, fill: 'none', stroke: 'url(#' + gid + '-c)', strokeWidth: 1.5, filter: 'url(#' + gid + '-b)', className: animate ? 'if-draw' : null }),
        h('g', { className: animate ? 'if-appear' : null, style: animate ? { animationDelay: '500ms', animationDuration: '900ms' } : null },
          model.edges.map(function (e, i) { return h('line', { key: 'e' + i, x1: e.a.x, y1: e.a.y, x2: e.b.x, y2: e.b.y, className: 'if-stroke-cool', strokeWidth: 0.4, opacity: e.o }); }),
          model.nodes.map(function (n, i) {
            var hub = n.r > 1.4;
            return h('circle', { key: 'n' + i, cx: n.x, cy: n.y, r: n.r, className: hub ? 'if-fill-ice' : 'if-fill-cyan', opacity: hub ? 1 : 0.85, filter: hub ? 'url(#' + gid + '-bs)' : null });
          }))),

      /* convergence: light gathered along the line where the two braids overlap */
      h('g', { className: cx('if-screen', 'if-core', animate ? 'if-appear' : null), style: animate ? { animationDelay: '1100ms', animationDuration: '900ms' } : null },
        h('ellipse', { cx: CXP, cy: CYP, rx: 64, ry: 26, fill: 'url(#' + gid + '-core)', className: 'if-halo', style: { opacity: 0.35 } }),
        h('ellipse', { cx: CXP, cy: CYP, rx: 130, ry: 4, fill: 'url(#' + gid + '-core)', opacity: 0.55 }),
        h('ellipse', { cx: CXP + 6, cy: CYP, rx: 30, ry: 1, className: 'if-fill-converge', filter: 'url(#' + gid + '-bs)', opacity: 0.9 })),

      showLabels ? leftLabels.slice(0, 3).map(function (t, i) { return label(SW * lx[i], warmY, 0, t, 'warm', i); }) : null,
      showLabels ? rightLabels.slice(0, 3).map(function (t, i) { return label(SW * rx[i], coolY, 0, t, 'cool', i); }) : null,
      pulses ? pulse(model.warmHero, '4.2s', animate ? '1.4s' : '0s', 'if-fill-hot', 1.8) : null,
      pulses ? pulse(model.coolHero, '4.2s', animate ? '2.1s' : '0.7s', 'if-fill-ice', 1.8) : null
    );
  }

  /* ---------- Depth: foreground bokeh ---------- */
  function Depth(p) {
    var side = p.side || 'both';
    var discs = R.useMemo(function () {
      var r = rng(p.seed || 11), out = [];
      function cluster(cxp, cyp, sx, sy, n, cls, rMin, rMax, aMax) {
        for (var i = 0; i < n; i++) {
          var size = lerp(rMin, rMax, r());
          out.push({ x: cxp + (r() - 0.5) * sx, y: cyp + (r() - 0.5) * sy, s: size, a: lerp(aMax * 0.25, aMax, r()), blur: Math.round(size * 0.35 + 3), cls: cls, d: Math.round(r() * 6000) });
        }
      }
      if (side !== 'cool') { cluster(9, 62, 18, 24, 12, 'if-bokeh-warm', 1.6, 5, 0.42); cluster(17, 94, 30, 20, 5, 'if-bokeh-warm', 4, 9, 0.12); }
      if (side !== 'warm') { cluster(93, 74, 14, 30, 9, 'if-bokeh-cool', 1.4, 4.4, 0.36); }
      return out;
    }, [p.seed, side]);
    var k = p.intensity == null ? 1 : p.intensity;
    return h('div', { className: cx('if-depth', p.drift ? 'if-depth-drift' : null, p.className), 'aria-hidden': 'true', style: p.style },
      discs.map(function (d, i) {
        return h('span', { key: i, className: cx('if-bokeh', d.cls), style: { left: d.x + '%', top: d.y + '%', width: d.s + '%', aspectRatio: '1', opacity: Math.min(1, d.a * k), filter: 'blur(' + d.blur + 'px)', animationDelay: '-' + d.d + 'ms' } });
      }));
  }

  /* ---------- FlowDiagram: nodes and relationships, warm → cool ---------- */
  function FlowDiagram(p) {
    var steps = p.steps || [];
    var n = steps.length;
    var gid = useUid('ifd');
    var vertical = p.direction === 'vertical';
    var gap = p.gap || (vertical ? 56 : 150);
    var nodes = steps.map(function (s, i) {
      var t = n > 1 ? i / (n - 1) : 0;
      return vertical ? { x: 16, y: 16 + i * gap, t: t, s: s } : { x: 60 + i * gap, y: 64 + (i % 2 ? 10 : -10) * (p.wave === false ? 0 : 1), t: t, s: s };
    });
    var W = vertical ? (p.width || 300) : 120 + (n - 1) * gap;
    var H = vertical ? 32 + (n - 1) * gap : 112;
    var defs = [], links = [];
    for (var i = 0; i < n - 1; i++) {
      var a = nodes[i], b = nodes[i + 1], id = gid + '-' + i;
      defs.push(h('linearGradient', { key: id, id: id, gradientUnits: 'userSpaceOnUse', x1: a.x, y1: a.y, x2: b.x, y2: b.y },
        h('stop', { offset: '0', style: { stopColor: ramp(a.t) } }), h('stop', { offset: '1', style: { stopColor: ramp(b.t) } })));
      links.push(h('path', { key: 'p' + i, d: vertical ? 'M' + a.x + ' ' + a.y + ' L ' + b.x + ' ' + b.y : curve(a.x, a.y, b.x, b.y), fill: 'none', stroke: 'url(#' + id + ')', strokeWidth: 1.4, filter: 'url(#' + gid + '-b)', opacity: 0.9 }));
    }
    var hi = p.highlight;
    return h('svg', { className: cx('if-svg', p.className), viewBox: '0 0 ' + W + ' ' + H, width: p.fluid === false ? W : '100%', style: p.fluid === false ? null : { maxWidth: W }, role: 'img', 'aria-label': p.label || steps.join(' to ') },
      h('defs', null, bloomFilter(gid + '-b', 2.2, [-30, -30, W + 60, H + 60]), defs),
      links,
      nodes.map(function (nd, i) {
        var c = ramp(nd.t);
        var lx = vertical ? nd.x + 22 : nd.x, ly = vertical ? nd.y + 4 : nd.y - 22;
        return h('g', { key: 'n' + i },
          h('circle', { cx: nd.x, cy: nd.y, r: hi === i ? 12 : 7, style: { fill: c }, opacity: hi === i ? 0.24 : 0.14 }),
          h('circle', { cx: nd.x, cy: nd.y, r: hi === i ? 4 : 3.2, style: { fill: c }, filter: 'url(#' + gid + '-b)' }),
          h('text', { x: lx, y: ly, textAnchor: vertical ? 'start' : 'middle', style: { fill: rampText(nd.t), fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.2em', fontWeight: 400 } }, String(nd.s).toUpperCase())
        );
      })
    );
  }

  /* ---------- GradientField: light pooled low in the corners ---------- */
  function GradientField(p) {
    var bal = p.balance || 'both';
    return h(p.as || 'div', {
      className: cx('if-field', bal === 'warm' ? 'if-field-warm' : bal === 'cool' ? 'if-field-cool' : null, p.drift ? 'if-field-drift' : null, p.grid ? 'if-grid' : null, p.className),
      style: p.style
    }, p.children);
  }

  /* ---------- CaseStudyCard ---------- */
  function CaseStudyCard(p) {
    var st = R.useState(false), on = st[0], set = st[1];
    var active = on || !!p.active;
    return h('article', {
      className: cx('if-card', active ? 'is-active' : null, p.className), tabIndex: 0, style: p.style,
      onMouseEnter: function () { set(true); }, onMouseLeave: function () { set(false); },
      onFocus: function () { set(true); }, onBlur: function () { set(false); }
    },
      h(Eyebrow, { items: p.eyebrow || ['Case study'] }),
      h('hr', { className: 'if-card-rule' }),
      h('div', null, h('h3', { className: 'if-card-org' }, p.org), p.domain ? h('p', { className: 'if-card-domain' }, p.domain) : null),
      h(FlowGlyph, { kind: p.glyph || 'converge', width: 220, height: 56, active: active }),
      h('div', null, h('p', { className: 'if-card-metric' }, p.metric), p.metricLabel ? h('p', { className: 'if-card-metric-label' }, p.metricLabel) : null)
    );
  }

  /* ---------- PostCard: THINK / DECODE / BUILD ---------- */
  function PostFoot(p) {
    return h('div', { className: 'if-post-foot' },
      h('span', { className: 'if-post-author' }, p.author || ''),
      h(Eyebrow, { items: p.tags || ['AI', 'Product', 'Systems'], style: { fontSize: 10, letterSpacing: '0.18em' } }));
  }
  function PostCard(p) {
    var fam = p.family || 'think';
    var num = p.number != null ? String(p.number).padStart(2, '0') : null;
    var head = h(Eyebrow, { items: [fam.toUpperCase()].concat(num ? [num] : []), tone: fam === 'decode' ? 'cool' : fam === 'build' ? 'warm' : 'mist' });
    var body;
    if (fam === 'decode') {
      body = h('div', { className: 'if-post-body', style: { justifyContent: 'flex-start', paddingTop: 24 } },
        h('h2', { className: 'if-post-title' }, p.title),
        h(FlowDiagram, { steps: p.steps || ['User', 'Context', 'Model', 'Agent', 'Action', 'Outcome'], direction: 'vertical', gap: p.gap || 44, width: 300 }));
    } else if (fam === 'build') {
      body = h('div', { className: 'if-post-body' },
        h('h2', { className: 'if-post-title' }, p.title),
        p.image
          ? h('div', { className: 'if-post-media', style: { backgroundImage: 'url(' + p.image + ')' }, role: 'img', 'aria-label': p.imageAlt || '' })
          : h(GradientField, { className: 'if-post-media' }, h(Depth, { intensity: 0.6, seed: 5 }), h('div', { style: { position: 'absolute', inset: 0 } }, h(SignatureFlow, { fit: 'cover', showLabels: false, pulses: false, fibres: 60, strands: 24, meshNodes: 70, seed: p.seed || 3, style: { height: '100%' } }))));
    } else {
      body = h('div', { className: 'if-post-body' },
        h('p', { className: 'if-post-statement' }, p.statement, p.accent ? h(R.Fragment, null, ' ', h('span', { className: 'if-accent' }, p.accent)) : null),
        h(FlowGlyph, { kind: 'signature', width: 120, height: 32, active: true }));
    }
    var Wrap = fam === 'build' || fam === 'think' ? GradientField : 'div';
    var wrapProps = { className: cx('if-post', 'if-post-' + fam, p.className), style: p.style };
    if (Wrap === GradientField) wrapProps.balance = fam === 'build' ? 'warm' : 'both';
    return h(Wrap, wrapProps, fam !== 'decode' ? h(Depth, { side: fam === 'build' ? 'warm' : 'both', intensity: 0.45, seed: 17 }) : null, head, body, h(PostFoot, { author: p.author, tags: p.tags }));
  }

  /* ---------- CarouselCover ---------- */
  function CarouselCover(p) {
    var gid = useUid('ifc');
    var lines = p.lines || ['The', 'agentic', 'product', 'stack'];
    var num = p.number != null ? String(p.number).padStart(2, '0') : '01';
    return h(GradientField, { className: cx('if-post', 'if-cover', p.className), style: p.style },
      h(Eyebrow, { items: [p.series || 'AI product note', num] }),
      h('div', null,
        h('h2', { className: 'if-cover-title' }, lines.map(function (l, i) {
          return h('span', { key: i, className: i === lines.length - 1 && p.accentLast !== false ? 'if-cover-last' : null }, l);
        })),
        h('svg', { className: 'if-svg', width: 260, height: 36, viewBox: '0 0 260 36', 'aria-hidden': 'true', style: { marginTop: 28 } },
          h('defs', null,
            h('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 2, x2: 250, y1: 0, y2: 0 },
              stop('0', 'amber'), stop('0.32', 'gold'), stop('0.46', 'amber-hot'), stop('0.52', 'converge'), stop('0.6', 'cyan-hot'), stop('1', 'electric-blue')),
            h('radialGradient', { id: gid + '-core' }, stop('0', 'converge', 0.95), stop('0.4', 'ice', 0.3), stop('1', 'converge', 0)),
            bloomFilter(gid + '-b', 1.8, [-10, -10, 280, 56])),
          h('path', { d: 'M2 10 C 70 10, 90 26, 130 26 S 200 12, 250 12', stroke: 'url(#' + gid + ')', strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', filter: 'url(#' + gid + '-b)' }),
          h('ellipse', { cx: 130, cy: 26, rx: 26, ry: 5, fill: 'url(#' + gid + '-core)' }),
          h('path', { d: 'M243 7 L 251 12 L 243 17', className: 'if-stroke-cool', strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
          h('circle', { cx: 2, cy: 10, r: 2.2, className: 'if-fill-warm' }))),
      h(Eyebrow, { items: p.tags || ['AI', 'Product', 'Systems'] }));
  }

  /* ---------- Hero: the banner, live ---------- */
  function Hero(p) {
    var animate = p.animate !== false;
    var d = animate && !reduced();
    function fade(ms, cls) { return d ? { className: cx(cls, 'if-fade-in'), style: { animationDelay: ms + 'ms' } } : { className: cls }; }
    return h(GradientField, { as: 'section', className: cx('if-hero', p.layout === 'banner' ? 'if-hero-banner' : 'if-hero-center', p.className), style: p.style, drift: true },
      h(Depth, { drift: true, intensity: p.depth == null ? 1 : p.depth }),
      h('div', { className: 'if-hero-flow', 'aria-hidden': 'true' },
        h(SignatureFlow, { animate: animate, fit: 'cover', leftLabels: p.leftLabels, rightLabels: p.rightLabels, seed: p.seed })),
      h('div', { className: 'if-hero-copy' },
        p.kicker === null ? null : h('div', fade(1300), h('p', { className: 'if-kicker' }, p.kicker || 'Building')),
        h('div', fade(1450), h(Display, { lines: p.lines || ['Products', 'that'], accent: p.accent || 'think.', accentBreak: false, uppercase: p.uppercase !== false, size: 'display' })),
        h('div', fade(1650, 'if-hero-tag'), h(Eyebrow, { items: p.tags || ['AI', 'Product', 'Technology'], tone: 'cloud' })),
        p.lead ? h('p', fade(1800, 'if-hero-lead'), p.lead) : null));
  }

  window.IFlow = {
    Eyebrow: Eyebrow, Display: Display, FlowGlyph: FlowGlyph, SignatureFlow: SignatureFlow, Depth: Depth,
    FlowDiagram: FlowDiagram, GradientField: GradientField, CaseStudyCard: CaseStudyCard,
    PostCard: PostCard, CarouselCover: CarouselCover, Hero: Hero, ramp: ramp, rampText: rampText
  };
})();
