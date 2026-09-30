// Renders Intelligent Flow components (src/ds/bundle.js, copied unchanged from the design system)
// to static HTML at build time. The browser receives plain SVG and CSS, with no React runtime.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let IFlow;

function load() {
  if (IFlow) return IFlow;
  const src = fs.readFileSync(path.resolve('src/ds/bundle.js'), 'utf8');
  const win = { React };
  // The bundle reads window.React and writes window.IFlow.
  new Function('window', src)(win);
  IFlow = win.IFlow;
  return IFlow;
}

/** Render one design-system component, e.g. render('FlowDiagram', { steps: [...] }). */
export function render(name, props = {}) {
  const lib = load();
  const C = lib[name];
  if (!C) throw new Error(`Intelligent Flow has no component named ${name}`);
  return renderToStaticMarkup(React.createElement(C, props));
}
