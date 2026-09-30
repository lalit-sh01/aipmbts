# aipmbts

Lalit Shewani's site. **Product manager by day. Builder by night.**

Built with [Astro](https://astro.build) on the Intelligent Flow design system. The site ships as static HTML and CSS; the design system's components render to SVG at build time, so visitors download no JavaScript framework.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Where things live

| What | File |
|---|---|
| Name, links, domain, newsletter username, photo | `src/data/site.ts` |
| Every number on the site, with its source | `src/data/stats.ts` |
| Selected work cards | `src/data/work.ts` |
| Lab projects | `src/data/lab.ts` |
| Journal entries | `src/data/entries.ts` |
| Design system tokens and components (copied unchanged) | `src/styles/tokens.css`, `src/styles/ds.css`, `src/ds/bundle.js` |
| Site-level styles | `src/styles/site.css` |

## Rules

- **No made-up numbers.** Every figure comes word for word from the resume or a published post, and `stats.ts` records the source.
- **Ford work stays abstract:** no product names and no figures.
- **Copy follows the author's voice and style bible** (`AI-Product-Playbook/canon/11-author-voice.md` and `01-style-bible.md`).

## Day and night

The theme switch is part of the story. Night (Obsidian, the default) brightens "Builder by night" and the Lab. Day (Paper) brightens "Product manager by day" and the Journal. The choice is stored under the same key the Journal posts use (`if-theme`), so it carries across.

## Adding a Journal entry

1. Build the post with the Playbook pipeline (`publish/build_blog.py`).
2. Copy its `blog/` folder to `public/journal/<slug>/`.
3. Add one line to `src/data/entries.ts`.

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → choose `lalit-sh01/aipmbts`.
2. Framework preset **Astro**, build command `npm run build`, output directory `dist`.
3. Add the environment variable `NODE_VERSION` = `22`.

Every push to `main` then redeploys. When the domain is bought, update `site.url` in `src/data/site.ts`, `site` in `astro.config.mjs` and `public/robots.txt`.
