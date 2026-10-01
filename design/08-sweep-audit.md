# Full-site sweep: audit and proposals
Date: 2026-10-02 · Scope: /, /lessons/, /tech/, /builds/, /about/, 404 · 1440px + 390px · dark + light
Evidence: sweep-desktop-evidence.png, sweep-phone-evidence.png (sent in chat); raw captures in the session scratchpad.

## What's working (keep it)
- [EVIDENCE] Lighthouse home: mobile Perf 95 / A11y 100 / Best 100 / SEO 100 (LCP 2.1 s, CLS 0); desktop 100/100/100/100 (LCP 0.5 s).
- [EVIDENCE] Light payload: 32 KB CSS, 23 KB JS, 124 KB fonts, hex colours appear only as #000 in two mask gradients, every image has alt text.
- [EVIDENCE] No horizontal overflow on any page at 390 or 1440, either theme.
- The scene stage (warm → network → grid → close) is a real idea: the background says which side of the work you're in. The phone tab bar and swipe rows are solid.

## Ladder: f → c → d → b → a → e

### f · Flow architecture
F1. **Nothing to read at launch.** [EVIDENCE] entries.ts: all 3 lessons `published: false`, techPosts empty. The hero promises "My notes…" and "Start reading" leads to five placeholders. No layout or motion fixes this. Fix: publish at least 1 lesson + 1 tech note by 10/7. Metric: share of visits that open a post (needs analytics, see Z0).
F2. **Inner pages repeat the home sections, with no h1 and no atmosphere.** [EVIDENCE] /lessons/, /tech/, /builds/ have no h1 and no stage or motion. They feel like a flatter, different site. Fix: an h1 + a one-line purpose + the section's scene backdrop on each. Metric: exits from inner pages.
F3. **Grids don't adapt to how many items they hold.** Tech: 1 card in 3 columns (two-thirds empty). Builds: 2 in 3. Fix: 1 item becomes a wide feature card, 2 items become halves. Metric: none needed; visible defect.

### c · States
C1. Placeholder cards look the same as real ones; only "COMING SOON" in the eyebrow differs. Fix: a distinct, quieter "being written" state.
C2. 404 is bare text. Fix: the flow mark + the four sections as ways back.
C3. Compass.ai has no Outcome line (waiting on the author). Subscribe says "opens soon" (waiting on Buttondown).

### d · System discipline
D1. [EVIDENCE] 13 distinct font sizes in site.css (11–44 px); off-scale spacing: 72, 112, 10, 6 px; 13 distinct durations (60–1600 ms). Fix: map to the type scale, the spacing tokens, and 3 motion tokens (fast 160 / base 280 / slow 520).

### b · Hierarchy and craft
B1. **The hero says nothing for ~2 s.** [EVIDENCE] index.astro fade delays 1300 / 1600 / 1800 ms. The headline is the LCP element. Fix: headline immediately; the flow and subline settle around it. Metric: mobile LCP 2.1 s → < 1.2 s.
B2. Hard seam where the hero field ends (desktop and phone). Fix: fade the hero field into the scene background.
B3. Phone: hero flow labels clipped at both edges (DECISION, DATA).
B4. Phone header shows only a 28px mark; reads as a glitch. Fix: show the name.
B5. "A bit about me" is the only section heading without the side dot. The About cards don't reveal like the rest. [EVIDENCE] motion.ts still targets the removed `.me-lead/.me-body/.me-cta-row`.
B6. Section gaps of about 200 px (desktop) and 150 px (phone) over empty backdrop; the page feels long and sparse. Fix: tighten to a 96/64 px rhythm.
B7. Phone card eyebrows wrap ("ENTRY 001 · FRAME · COMING SOON").

### a · Motion and interaction (existing)
M1. Reveals are slow: 900 ms fade, 1100 ms move, 28 px travel. Mid-scroll, content looks dim or missing (evidence #3). Fix: 480 ms, 12 px. [PATTERN] Emil Kowalski / Rauno: under ~300–500 ms; motion must not delay reading.
M2. Card hover takes 700 ms, with no `(hover:hover)` guard, so hover sticks on touch. Fix: 160 ms, pointer-fine only.
M3. Career line draw bug: a riser starts before the previous tread finishes, so a stray vertical line appears (evidence #4). Fix the sequence.
M4. Anchor-link smooth scroll lasts 1.4 s. Fix: 0.9 s.

### e · Accessibility
Already strong (100). Keep it: no `(hover)` effects on touch, keep reduced-motion parity for anything new.

## Proposals: new interaction (each has a job)
| # | Interaction | What it communicates | Cost | Gimmick risk | Provenance |
|---|---|---|---|---|---|
| P1 | Cursor spotlight on cards: champagne on product cards, blue on tech cards (mouse only) | Which side of the work a card belongs to | S | Low (colour carries meaning) | [PATTERN] brittanychiang.com |
| P2 | Desktop section index (Lessons · Tech · Builds · About) with active state and scroll progress | Where you are on a long page | S | Low | [PATTERN] brittanychiang.com |
| P3 | Theme switch as a circular reveal from the toggle (View Transitions) | The theme changed, and from where | S | Low | [INFERENCE] |
| P4 | Lens filter chips animate the reflow (FLIP) | What the filter removed or kept | S–M | Low | [PATTERN] standard list-filter feedback |
| P5 | Copy email, with inline "Copied" | It worked | S | None | [PATTERN] rauno.me |
| P6 | Card → post page transition (cross-document View Transitions; Firefox falls back to a normal load) | Continuity from list to post | S–M | Low | [PATTERN] joshwcomeau.com, maggieappleton.com |
| P7 | Reading progress on post pages | How much is left | S | Low | [PATTERN] common on long-form sites |
| P8 | Hero flow responds gently to the cursor (strands lean toward it) | The brand mark is alive, not wallpaper | M | Medium | [INFERENCE] |

Deliberately avoided [PATTERN] on the sites researched: custom cursors, magnetic buttons, text scramble, scroll-jacking/snap, staggered fade on every block.

## Z0 · Measurement
There is no analytics, so no metric above can be read. Turn on Cloudflare Web Analytics (free, cookieless): it's one toggle in the Cloudflare dashboard, done by the author.

## Rank (impact ÷ effort)
1 F1 · 2 B1 · 3 M1 · 4 M3 · 5 B2 · 6 F3 · 7 B5 · 8 M2 · 9 B4/B3/B7 · 10 P1 · 11 P2 · 12 B6 · 13 F2 · 14 D1 · 15 P3 · 16 C1/C2 · 17 P4 · 18 P5 · 19 P6/P7 (only once posts exist) · 20 P8
If the time halved: do 1–11; drop P3–P8 and D1.
