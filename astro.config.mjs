import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, existsSync } from 'node:fs';

// Change `site` to the real domain once it is bought (also in src/data/site.ts).
export default defineConfig({
  site: 'https://aipmbts.lalit-shewani01.workers.dev',
  // Posts live in public/ (imported), so list them for the sitemap too.
  integrations: [sitemap({ customPages: readdirSync('public/lessons', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `https://aipmbts.lalit-shewani01.workers.dev/lessons/${d.name}/`)
    .concat(existsSync('public/tech') ? readdirSync('public/tech', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `https://aipmbts.lalit-shewani01.workers.dev/tech/${d.name}/`) : []) })],
  build: { inlineStylesheets: 'auto' },
});
