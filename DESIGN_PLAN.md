# Spunchy: design plan, 3D choice and performance report

## Direction

The shop already has a voice. Its posters say *"A slice of heaven in every
bite"*, *"Cake is the language of love"*, *"Soft, fluffy & fresh"* and
*"Savory: crispy, crunchy, crave-worthy"*. The site uses those lines word for word.

- **Palette** (from the sign and boxes; see `brand.json`): ember red, swash
  yellow, cocoa (the dark hanging sign and wood panelling) and warm cream.
  Sections alternate light (cream) and dark (cocoa), like the shop's bright
  cabinets against wood walls. The footer is in the signboard red.
- **Type:** Fraunces 600 for display (close to the posters' serif), the system
  sans for body text (no download), and Noto Sans Sinhala, downloaded only when
  Sinhala is on screen.
- **Photography first:** the hero is the real rosette cake from the cabinet,
  and the logo is the real shop sign.

## Site map (as built)

1. **Hero:** logo, the cake photo, tagline, and buttons for "Browse the menu" and "Find us".
2. **Fresh right now:** a live, swipeable strip of what's in stock, most recently updated first. Items glow briefly when they change.
3. **From the counter:** chapters for Pastries, Bakery items, Cakes, Coffee and Tea, using the poster art and lines.
4. **Menu:** search, category chips and an "In stock only" filter, with live prices and stock. "Add" builds an order list (saved on the device) that can be copied or, once a number is confirmed, sent on WhatsApp.
5. **The Space:** a swipeable gallery of the shop with gentle parallax. Keyboard arrows and buttons work too.
6. **Visit & order:** Kottawa, a Maps link, and dine-in/takeaway. Call, WhatsApp and hours appear when confirmed.
7. **Footer:** Facebook (Spunchylk).

Plus: Bakery JSON-LD (verified fields only), Open Graph image in brand colours,
favicon from the box logo, robots.txt, sitemap.xml (once `SITE_URL` is set),
a branded 404 ("This page is all crumbs."), and `/admin` for staff.

## 3D asset decision

§1–6 of the brief (with options A/B/C) weren't supplied, so I chose a default:

**Procedural sugar sprinkles over the real photo.** It's one instanced mesh
(about 110–240 capsules, a single draw call) in the brand colours, drifting
across the cake. It reacts to the pointer and scroll, with optional gyro tilt
after the visitor allows it.

Why this over a modelled cake or photogrammetry:
- It needs no 3D modelling or GLB/Draco/KTX2 pipeline, and has zero texture weight.
- The real cake stays the hero. A low-poly CG cake would look less appetising
  than the photo.
- It's cheap enough for mid-range Android, and the page is complete without it.

If you want a modelled product later (e.g. a slice that rotates on scroll), the
same lazy-load, pause-when-hidden and quality-scaling scaffold
(`src/three/sprinkles.js`) is ready for a Draco/Meshopt-compressed GLB with KTX2 textures.

**Budget rules implemented:** DPR capped (1.75 high, 1 low). No shadows, no
post-processing. Rendering pauses off-screen and in hidden tabs, and stops
entirely after 9 s without input (render-on-demand). Frame time is watched:
the scene drops to the low tier, then removes itself and the static hero
remains. The scene is never loaded on `prefers-reduced-motion`, data-saver/2G,
≤2 CPU cores or ≤1 GB memory. A visible toggle turns it off (remembered).
The 3D chunk is fetched only after page load, on first interaction or after 6 s idle.

## Performance report (measured 2026-11-08)

Production build (`npm run build && npm run preview`), measured with Lighthouse
12 in headless Chrome on a Windows laptop.

| Run | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Mobile #1 | 83 | 100 | 100 | 100 | 2.64 s | 0 | 495 ms |
| Mobile #2 | 95 | 100 | 100 | 100 | 2.63 s | 0 | 120 ms |
| Mobile #3 | 89 | 100 | 100 | 100 | 2.64 s | 0 | 305 ms |
| Desktop | 100 | 100 | 100 | 100 | 0.61 s | 0.009 | 0 ms |

**Bundle** (`npm run budget`): initial JS **56.8 KB gzip** (budget 170 KB),
CSS 4.5 KB. Lazy chunks: three.js 118.7 KB, sprinkles 1.8 KB, admin 1.9 KB.
First-load page weight is about **275 KB**, against the 1.5 MB hero budget.

**Frame time** (dev monitor, `?perf`, sprinkles running, scrolling the whole
page, laptop): hero 17.6 ms avg (56.7 fps), fresh 16.8, chapters 17.2,
menu 17.0, space 16.8, visit 16.7. p95 is about 17 ms in every section.

**Realtime** (demo mode, two windows): an admin price change reached the public
page in **65 ms**, and "Mark sold out" in **66 ms**.

### Gaps, stated plainly

- **Mobile Performance ≥ 90:** met on 1 of 3 runs (scores 83–95). The spread comes from TBT, which
  is hydration of the prerendered page under Lighthouse's simulated 4× CPU slowdown.
- **LCP ≤ 2.5 s:** 2.63 s on simulated mobile, just over. Most of it is
  simulated network (TTFB about 460 ms from the local preview server) plus the
  render-blocking CSS. Expect better behind Vercel's CDN with HTTP/2. If not,
  the next step is inlining the 4.5 KB of CSS.
- **INP:** not measurable in lab runs. TBT is the proxy. Check field data after launch.
- **Real hardware:** not tested yet. Nothing has been run on a real mid-range
  Android phone or with real Supabase latency. Do both before sign-off.
- **Supabase realtime:** code and schema are written but untested without a project.
