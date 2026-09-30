import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change `site` to the real domain once it is bought (also in src/data/site.ts).
export default defineConfig({
  site: 'https://aipmbts.lalit-shewani01.workers.dev',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
