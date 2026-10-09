// Import a built post into the site: node tools/import-post.mjs <source blog folder> <slug> [lessons|tech]
// Copies it to public/<section>/<slug>/ (default section: lessons), points its brand link home, fixes the canonical URL,
// reuses the site's fonts, and adds the site's reading progress bar and page transition (P6, P7).
import fs from 'fs'; import path from 'path';
const [src, slug, section = 'lessons'] = process.argv.slice(2);
if (!src || !slug || !['lessons', 'tech'].includes(section)) { console.error('usage: node tools/import-post.mjs <blog folder> <slug> [lessons|tech]'); process.exit(1); }
const site = 'https://aipmbts.lalit-shewani01.workers.dev';
const out = path.join('public', section, slug); fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
for (const f of ['tokens.css', 'bundle.local.css']) fs.copyFileSync(path.join(src, 'assets', f), path.join(out, 'assets', f));
fs.writeFileSync(path.join(out, 'assets/fonts.css'), fs.readFileSync(path.join(src, 'assets/fonts.css'), 'utf8').replace(/url\(fonts\//g, 'url(/fonts/'));
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html.replace(/href="https:\/\/your-portfolio\.example"/g, 'href="/"')
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${site}/lessons/${slug}/">`)
  .replace(/<h1 class="bp-title"/, `<h1 class="bp-title" style="view-transition-name:t-${slug}"`)
  // the site defaults to dark when no theme is saved; posts follow the same rule
  .replace(/t=window\.matchMedia&&matchMedia\('\(prefers-color-scheme: light\)'\)\.matches\?'light':'dark'/, "t='dark'")
  .replace('</head>', '<link rel="stylesheet" href="/post-enhance.css">\n</head>')
  .replace('</body>', '<div class="read-progress" aria-hidden="true"><span></span></div>\n<script src="/post-enhance.js" defer></script>\n<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "9e9ecaa39c354e1d87cd2e6ba73bf95c"}'></script><!-- End Cloudflare Web Analytics -->\n</body>');
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('imported', slug, '→', out);
