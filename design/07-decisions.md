# Decisions (append-only)

## 2026-10-02 · About section
- Rejected: the one-grid version with the staircase ending in a framed portrait (branch commit 079ba2b). The author found it unprofessional. Cause: it arranged four elements, but it had no focal point, no scale contrast and no depth.
- The career is now built from real HTML text, not SVG, so the labels stay crisp and fit any grid cell at every width.
- The portrait always sits to the right, because the author looks to the left in the shot and his gaze should lead into the words. Mirroring the photo was ruled out because it would misrepresent him.
- Three directions were built (A editorial split, B bento, C cinematic). The author chooses.

## 2026-10-02 · B revised
- The author ranked the photo second, not first. The photo dropped from 5 columns over two rows to 3 columns over one row. The career card now spans all 12 columns, with a 58px rise and titles at 17–21px.
- Resume and links moved into the space the photo gave up, next to the photo.
- The career card's empty corner carries "8+ years across product and engineering". [EVIDENCE] This wording is already on the approved About page and comes from the resume summary.
- Unexplained edits (act-row styles, a square-photo rule) appeared in the lab files mid-session. I kept the act rows and removed the square-photo rule.

## 2026-10-02 · Self-review of B (build.md checklist), run late
- Squint test failed: the solid white "Download resume" was the brightest element, and the gradient "8+" was a third channel competing for attention. Both were toned down, so the intro now leads.
- 320px: no horizontal overflow (measured: 0px). Keyboard: all three action rows reachable, each with a 2px focus ring.
- Contrast: body, org and label text use --mist (#A6ADB7) on a near-black tile, about 8:1. [INFERENCE] Not measured with a tool.
- State matrix for a static section: Empty, Loading, Error and Role states are not applicable (no data). Overflow: titles wrap to 2–3 lines at 1100px and to 2 lines on phones. Missing image: the alt text and the tile background show. Reveal: the career card is blank until it scrolls into view, which is acceptable because the observer fires on view.
- No analytics on the site, so no metric can be measured yet. [ASSUMPTION] Success = resume downloads and clicks to LinkedIn. This needs Cloudflare Web Analytics or a Buttondown link to verify.
