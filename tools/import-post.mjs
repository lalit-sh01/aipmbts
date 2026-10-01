// Import a built Playbook post into the site: node tools/import-post.mjs <source blog folder> <slug>
// Copies it to public/lessons/<slug>/, points its brand link home, fixes the canonical URL,
// reuses the site's fonts, and adds the site's reading progress bar and page transition (P6, P7).
import fs from 'fs'; import path from 'path';
const [src, slug] = process.argv.slice(2);
if (!src || !slug) { console.error('usage: node tools/import-post.mjs <blog folder> <slug>'); process.exit(1); }
const site = 'https://aipmbts.lalit-shewani01.workers.dev';
const out = path.join('public/lessons', slug); fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
for (const f of ['tokens.css', 'bundle.local.css']) fs.copyFileSync(path.join(src, 'assets', f), path.join(out, 'assets', f));
fs.writeFileSync(path.join(out, 'assets/fonts.css'), fs.readFileSync(path.join(src, 'assets/fonts.css'), 'utf8').replace(/url\(fonts\//g, 'url(/fonts/'));
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html.replace(/href="https:\/\/your-portfolio\.example"/g, 'href="/"')
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${site}/lessons/${slug}/">`)
  .replace(/<h1 class="bp-title"/, `<h1 class="bp-title" style="view-transition-name:t-${slug}"`)
  .replace('</head>', '<link rel="stylesheet" href="/post-enhance.css">\n</head>')
  .replace('</body>', '<div class="read-progress" aria-hidden="true"><span></span></div>\n<script src="/post-enhance.js" defer></script>\n</body>');
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('imported', slug, '→', out);
