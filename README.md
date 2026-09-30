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
| Product lessons and tech posts | `src/data/entries.ts` |
| Late-night builds | `src/data/lab.ts` |
| Work history (A bit about me) | `src/data/work.ts` |
| Design system tokens and components (copied unchanged) | `src/styles/tokens.css`, `src/styles/ds.css`, `src/ds/bundle.js` |
| Site-level styles | `src/styles/site.css` |

## Rules

- **No made-up numbers.** Every figure comes word for word from the resume or a published post.
- **Ford work stays abstract:** no product names and no figures.
- **Copy follows the author's voice and style bible** (`AI-Product-Playbook/canon/11-author-voice.md` and `01-style-bible.md`).

## Colour

Warm (champagne) marks the product side, cool (electric blue) the tech side, in both themes. The theme switch is a plain light/dark toggle: Obsidian is the default, Paper the alternative. The choice is stored under `if-theme`, the key the Journal posts use.

## Publishing a product lesson

1. Build the post with the Playbook pipeline (`publish/build_blog.py`).
2. Copy its `blog/` folder to `public/lessons/<slug>/`.
3. In `src/data/entries.ts`, set that lesson's `published` to `true` (and its `date`).

## Deploy (Cloudflare Workers)

The repo is connected to a Cloudflare Worker named `aipmbts`, which serves `dist/` as static assets (`wrangler.jsonc`).

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Variable: `NODE_VERSION` = `22`

Every push to `main` then redeploys. When the domain is bought, update `site.url` in `src/data/site.ts`, `site` in `astro.config.mjs` and `public/robots.txt`.
