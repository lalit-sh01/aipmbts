// Import a built post into the site: node tools/import-post.mjs <source blog folder> <slug> [lessons|tech]
// Copies it to public/<section>/<slug>/ (default section: lessons). Post content is never changed; the tool only:
//   points the brand link home, sets canonical/og:url to the real address, adds the site icon and share image,
//   defaults the theme to dark like the site, reuses the site's fonts, and adds the reading progress bar,
//   page transition (post-enhance.css/js) and Cloudflare Web Analytics.
import fs from 'fs'; import path from 'path';
const [src, slug, section = 'lessons'] = process.argv.slice(2);
if (!src || !slug || !['lessons', 'tech'].includes(section)) {
  console.error('usage: node tools/import-post.mjs <blog folder> <slug> [lessons|tech]'); process.exit(1);
}
const site = 'https://aipmbts.lalit-shewani01.workers.dev';
const cfToken = '9e9ecaa39c354e1d87cd2e6ba73bf95c';
const url = `${site}/${section}/${slug}/`;
const out = path.join('public', section, slug);
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
for (const f of ['tokens.css', 'bundle.local.css']) fs.copyFileSync(path.join(src, 'assets', f), path.join(out, 'assets', f));
fs.writeFileSync(path.join(out, 'assets/fonts.css'),
  fs.readFileSync(path.join(src, 'assets/fonts.css'), 'utf8').replace(/url\(fonts\//g, 'url(/fonts/'));

const head = [
  '<link rel="stylesheet" href="/post-enhance.css">',
  '<link rel="icon" href="/marks/icon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" data-icon>',
  '<link rel="icon" href="/marks/icon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" data-icon>',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<meta property="og:site_name" content="Lalit Shewani">',
  `<meta property="og:image" content="${site}/og/og-card.jpg">`,
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  '<meta name="twitter:card" content="summary_large_image">',
].join('\n');
const tail = [
  '<div class="read-progress" aria-hidden="true"><span></span></div>',
  '<script src="/post-enhance.js" defer></script>',
  `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cfToken}"}'></script>`,
].join('\n');

let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html
  .replace(/href="https:\/\/your-portfolio\.example"/g, 'href="/"')
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
  .replace(/t=window\.matchMedia&&matchMedia\('\(prefers-color-scheme: light\)'\)\.matches\?'light':'dark'/, "t='dark'")
  .replace(/<h1 class="bp-title"/, `<h1 class="bp-title" style="view-transition-name:t-${slug}"`)
  .replace('</head>', `${head}\n</head>`)
  .replace('</body>', `${tail}\n</body>`);
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('imported', slug, '→', out);
