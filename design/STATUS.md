# Mission: Redesign the "A bit about me" section
Status: ACTIVE · Track: EXPRESS · Updated: 2026-10-02

## Stage
B3 (question-ordered bento) built: intro+face, climb, actions under "now". Awaiting approval.

## Done
- [x] Diagnosis of the live section (no grid, avatar-style photo, dead zones, staircase pointing at nothing)
- [x] Portrait cut out of its background (public/img/lalit-cut-*.webp)
- [x] Three structurally different directions, built on the real stack: /ux-lab/about-a, -b, -c
- [x] Author picked B, with a smaller photo and a bigger career line
- [ ] Author approves revised B  ← current
- [x] Promoted B3 into AboutMe.astro + Climb.astro; About page uses Climb; old Trajectory SVG and lab routes removed
- [x] Checked at 320/390/1000/1100/1279/1280/1440/1884, both themes: no overflow, photo aligned to 'now', no overlaps
- [ ] Author says push → merge to main  ← current

## Next action
Get approval on revised B, then promote it into AboutMe.astro.

## Open gates
Direction choice. Nothing goes to main until the author says "push".

## Open questions
- [ASSUMPTION] Community and education facts are welcome on the home page (B only). They are on the resume, word for word.
- [ASSUMPTION] The cutout is acceptable as a treatment of the author's photo (C only).

## Detours
2026-10-02: the theme switcher was hidden by a stacking-order bug. Fixed and live (2a71ada).
