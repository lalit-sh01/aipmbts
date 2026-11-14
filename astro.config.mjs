import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, existsSync } from 'node:fs';

// The live domain (also in src/data/site.ts, public/robots.txt and tools/import-post.mjs).
const SITE = 'https://lalitshewani.com';

export default defineConfig({
  site: SITE,
  // Posts live in public/ (imported), so list them for the sitemap too.
  integrations: [sitemap({ customPages: readdirSync('public/lessons', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `${SITE}/lessons/${d.name}/`)
    .concat(existsSync('public/tech') ? readdirSync('public/tech', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `${SITE}/tech/${d.name}/`) : []) })],
  build: { inlineStylesheets: 'auto' },
});
