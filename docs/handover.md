# Spunchy website — handover

Rebuild completed 2026-11-09. Brand reasoning: [brand-brief.md](brand-brief.md). Design system and
storyboard: [design-system.md](design-system.md). Image pipeline: [image-pipeline.md](image-pipeline.md).
The previous site is preserved on the git branch `archive/v1-live-menu`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5175
npm run build      # type-check, build, prerender to static HTML in dist/
npm run preview    # serve dist/ on http://localhost:4174
```

`dist/` is a static site (HTML, CSS, JS, images) and can be hosted anywhere (Netlify, Vercel,
Cloudflare Pages, any web server).

Asset scripts (only needed when photos change):

| Command | What it does |
|---|---|
| `npm run images` | Crops, upscales (Real-ESRGAN), grades and exports all photos; makes product cut-outs (rembg). Needs Python + `rembg` and the models listed in image-pipeline.md |
| `npm run brand` | Favicon, touch icon, Open Graph image and the boot-frame logo. (`node scripts/hero-composite.mjs` rebuilds the earlier store-photo hero image, now unused.) |
| `node scripts/review.mjs` | Screenshots at 375 / 768 / 1280 / 1920 and a scroll recording, into `review/` (needs `npm run preview` running) |

## What's on the page

1. **Intro.** The logo paints from the HTML instantly, the gold swash draws beneath it, then the
   page lifts away. About 2 s on a first visit on desktop and 1.1 s on phones; under 1 s on
   repeat visits; skipped with reduced motion. Any key or click skips it.
2. **Hero.** Three Spunchy favourites on a cream stage (rosette cake, triangle buns, fruit tart),
   each with a line from Spunchy's posters in a stacked serif, crumbs falling from the floating
   product, a numbered side panel and a progress-ring control. Autoplays; pauses on hover/focus.
3. **The four posters.** Spunchy's in-store campaign (Fresh, Savory, Heaven, Love) as a pinned,
   scroll-driven chapter with swash-shaped colour wipes. Stacked panels on phones.
4. **The cabinet.** Draggable product rail with label prices; each product opens a detail view
   with its own link (for example `/#fruit-tart`). Keyboard: arrows, Enter, Esc.
5. **Our place.** A pinned walk from the shopfront through the store.
6. **Find us.** The four outlets on the store's oak wall, Google Maps links and Call.
7. **Instagram.** Links to recent posts beside a mosaic of shop photos (no third-party embeds).
8. **Footer.** The swash draws across the page and the logo settles at its end.

## Quality

| Check | Result |
|---|---|
| Lighthouse desktop | Performance 97, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse mobile (simulated slow 4G) | Performance 85, Accessibility 100, Best Practices 100, SEO 100 |
| Real first paint / largest paint (unthrottled) | about 0.3 s |
| Layout shift | 0 |
| Widths checked | 375, 768, 1280, 1920: no errors, no horizontal overflow |
| SEO | Prerendered HTML, meta + Open Graph, `Bakery` structured data for the four outlets, robots.txt |
| Accessibility | Skip link, keyboard-operable cabinet and menus, visible focus, alt text, WCAG AA contrast |
| Reduced motion | No intro, no pinned scenes, no parallax; chapters stack in their final state. Verified in code only (the test browser can't emulate the OS setting) |

Mobile reached the 85 target after three changes: a shorter intro on phones, painting the hero
copy behind the intro from the first frame (its entrance is built paused and played on hand-over,
so nothing flashes), and preloading the display font from the HTML.

## Placeholders and things only Spunchy can supply

| Needed | Where it goes | Until then |
|---|---|---|
| **Logo as SVG** (or large transparent PNG) | `public/logo-roundel.webp`, `src/components/Logo.tsx` | An upscaled copy of the 150 px Instagram avatar |
| **PickMe Food link** | `src/content/business.ts` → `pickme` | Hero shows "See the cabinet" instead of "Order" |
| **WhatsApp number** | `business.whatsapp` | WhatsApp button hidden |
| **Outlet addresses and opening hours** | `business.outlets` | "Call 077 376 8615 for directions and today's opening hours" + a Maps search |
| **Real numbers** (year founded, customers, cakes…) | `business.stats` | Nothing shown; never invented |
| **Price confirmation** | `src/content/products.ts` | Prices read from the shop's labels on 2026-11-08 and two Instagram promos |
| **Product photos**: Choco Brick, Tandoori Chicken Bun, Cheesy Chicken Roll, a cut cake | `assets/raw/` then `npm run images` | Typographic cards in the cabinet |
| **Domain** | `index.html` canonical/OG URLs, sitemap | Relative URLs |
| **TikTok handle** | Instagram section | Not linked |
| **Copy approval** | These lines were written for the site: "Come in, the cabinet's lit", "Celebration cakes, boxed to take home", "Want a cake for the weekend? Call us.", "Fresh from the feed", "From our cabinet. Call ahead to check it's in at your nearest outlet" | Live as drafts |
| **Permission** for interior photos and Instagram links | — | Faces, number plates and a neighbour's sign are cropped or blurred |

## Recommended next steps

1. **A short professional photo shoot** (evening, lights on): the cake cabinet and counter for the
   hero, plus 6–8 hero products on a plain board, top-down and 3/4. This lifts the whole site more
   than any code change, and the pipeline re-processes new photos with one command.
2. **The logo SVG**, for crisp edges everywhere and a swash traced from the real logo.
3. **PickMe and WhatsApp links**, so the primary button becomes "Order".
4. **Outlet details**, then a proper map per outlet.
5. **A live menu** (stock and prices editable by staff) if the shops want it: the archived v1 site
   has a Supabase-backed version that can be ported.
