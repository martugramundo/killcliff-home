# Kill Cliff — Homepage

Dark-mode-first, responsive, SEO-ready homepage for Kill Cliff. Built on the
[killcliffbranding](../../.claude/skills/killcliffbranding/) brand system — Primary Dark `#161616`,
Yellow `#FFE819` accent, Oswald typography.

No build step. Plain HTML / CSS / JS — drop straight into a GitHub repo and serve as static files.

## Run / preview

Any static server works. From this folder:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`.

## Structure

```
killcliff-home/
├── index.html      # all sections + SEO meta + JSON-LD
├── css/styles.css  # brand tokens (CSS vars), layout, components, responsive, motion
├── js/main.js      # sticky header, mobile drawer, scroll-reveal, parallax hook
└── assets/
    ├── cans/       # can renders (placeholders for now)
    ├── logos/      # KC logo + press logos
    └── icons/      # functional line icons
```

## Hero can spin (each can rotates on its own axis, loop)

The hero lineup is a **crossfade flipbook**: each `.can-spin` cycles through its own
views (front → side → back → side …), fading one into the next so a handful of frames
read as a smooth 360° spin. Cans are phase-offset and run at slightly different speeds so
they don't rotate in sync. `js/main.js` (`initCanSpin`) builds the frames, drives them with
`requestAnimationFrame`, and pauses when the tab is hidden or the hero scrolls off-screen.
`prefers-reduced-motion` → stays on a single static view.

Markup (in the hero):

```html
<div class="can-spin" data-can="spicy-pineapple" data-frames="31" data-ext="webp" style="--i:0"></div>
```

- `data-can` — folder name under `assets/cans/`
- `data-frames` — number of frames in the sequence
- `data-ext` — frame extension (`webp` real turntable / `svg` placeholder)
- `--i` — phase offset (0,1,2,…)
- `.can-spin--lead` on the center can makes it slightly taller

A full revolution always takes `ROTATION_MS` (in `initCanSpin`) regardless of frame count,
so 31-frame real cans and the 8-frame placeholder spin at the same visual pace; the
crossfade duration is derived per-can from the frame gap.

### Current state

The lineup is **4 cans**, all real turntables, equal height (no lead emphasis):
spicy-pineapple, cbd-energy (Elk Blood), lemon-lime, orange-kush — 31 × `.webp` each.
(`assets/cans/berry-lemonade/` still holds 8 placeholder `.svg` but is no longer in the
lineup — add it back as a 5th `.can-spin` if its turntable video arrives.)

### Building frames from a rotation video (preferred)

The real cans came from **ProRes 4444 turntable videos** (1080×1080, alpha, ~4 s / 360°).
`tools/frames-from-video.py` extracts an evenly-spaced, alpha-preserving sequence, computes
one union bbox so the can rotates in place (no jitter), and saves optimized `.webp`:

```bash
python3 tools/frames-from-video.py path/to/spicy-pineapple.mov assets/cans/spicy-pineapple --count 31 --height 760
```

Then set the slot's `data-frames`/`data-ext` to match. Ideal source: one can per video,
centered/steady 360°, transparent (alpha) or a solid contrasting backdrop.

To finish **berry-lemonade**, drop its rotation video and run the same command into
`assets/cans/berry-lemonade`, then update the markup (`data-frames="31" data-ext="webp"`).

### Other ways to get frames

- **Stills with a solid backdrop** → `tools/cutout.py` removes a black/white background via
  border flood-fill (auto-detects polarity, keeps interior tones), trims, and normalizes
  height. Good when only a few orthographic views exist.
- **Placeholder** → `tools/gen-can-frames.js [flavor-id]` generates slim stand-in SVGs sized
  to match the real frames (267×760). Omit the id to regenerate all.

Pull source art from the brand Drive: **can renders** —
https://drive.google.com/drive/folders/1L0MCn4ey8h3TkXv1vLPx4N_LvC6NAIPM

Other can placeholders (product grid, stack, mission, etc.) still use `.can-slot` with a
`data-can="..."` label — swap the inner `<span class="can-slot__label">` for an `<img>`.

## Other assets to pull from Drive

| Asset | Drive folder |
|---|---|
| Logo (already wired: `assets/logos/kill-cliff-logo.svg`, recolored via CSS mask — yellow header / off-white footer / faint watermark in final CTA) | https://drive.google.com/drive/folders/1xlWc8tNX6DxOXmJNuiBHbaB-hj3fW_Yk |
| Press / "As seen in" logos | brand graphic assets |
| Can renders | https://drive.google.com/drive/folders/1L0MCn4ey8h3TkXv1vLPx4N_LvC6NAIPM |

## Sections & interactive pieces

Order: announcement → header → hero (+ kinetic claim ticker) → press marquee →
**"Why most energy drinks suck"** (bold numbered editorial list, no boxes) →
**comparison table** (interactive) → brand band → **the stack** (interactive tabs) →
**stats** (count-up on scroll) → products → **switching pull-quote** → testimonials →
mission → final CTA → newsletter → footer.

- **Comparison table data** lives in `js/main.js` → `COMPETITORS` (which attributes each competitor
  passes). KC always passes. Toggle pills switch the competitor column.
- **The stack tabs** content lives in `js/main.js` → `STACK`.
- **Stats** values are `data-count` / `data-suffix` attributes in `index.html`.

## Yellow usage

Yellow is intentionally surgical: logo, hero accent word ("Bold"), eyebrow tick, primary CTAs,
the comparison "winner" column, and one stat. Everything else leans on off-white / grey + hairlines.
To shift the balance further, edit `--yellow` usage in `css/styles.css` (search for `var(--yellow)`).

## Video (RTM section)

The "Ready to Mix" section uses `assets/video/rtm-h264.mp4` (autoplay/loop/muted/playsinline).
The original export was **ProRes .mov** (1080×1920) which browsers can't decode — it was transcoded to
H.264 with: `ffmpeg -i rtm.mov -vcodec libx264 -profile:v high -pix_fmt yuv420p -crf 22 -movflags +faststart -an rtm-h264.mp4`.
To swap the clip later, transcode the same way (browsers need **H.264 MP4 or WebM**, not ProRes/HEVC).

## Notes

- **Typography:** Oswald via Google Fonts (`display=swap`). Hyperwave THREE (brand display face) is not
  freely available — used nowhere yet; if added later, pull from Drive and keep it to one moment per page.
- **Copy** is adapted from the live site, run through the brand voice rules (clean energy, the stack,
  Navy SEAL Foundation). Placeholder for final review.
- **Accessibility:** semantic landmarks, single `<h1>`, skip link, `prefers-reduced-motion` honored,
  AA contrast (Off-white on dark, `#161616` on yellow).
- Out of scope for this pass: real can renders, internal pages (PDP/Bundles), cart, Shopify backend.
