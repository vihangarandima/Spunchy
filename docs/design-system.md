# Spunchy — Design System & Storyboard

Phase 3. Builds on [brand-brief.md](brand-brief.md) (direction: **Maroon Night**).
Tokens live in one file: [`src/styles/tokens.css`](../src/styles/tokens.css). A live preview is at `/design-preview.html` while `npm run dev` runs.

---

## 1. Principles

1. **The stage is maroon, the light is gold.** The page is a cake cabinet at night: a deep maroon room, products lit from above, gold as the light that draws things.
2. **Spunchy's own words, Spunchy's own pictures.** Headlines are lines from their in-store posters. Products are their real products, at real prices from their labels. Nothing invented.
3. **One bold thing per screen.** Each screen has a single hero (a product or a punch word). Everything else is quiet.
4. **Motion is a brush stroke.** A fast flick that settles, taken from the logo's swash. Nothing bounces for its own sake.
5. **Cut it open.** The brand's signature food shot is the cross-section. Scroll reveals the inside of things.

## 2. Colour

Every colour comes from the logo (maroon, swash gold, icing white) or from the store's oak wall.

| Token | Hex | Role |
|---|---|---|
| `maroon` | `#7A1523` | Logo field. Brand moments, the logo tab, active states |
| `gold` | `#F7B836` | The swash. Light, lines, the cursor, primary buttons, prices |
| `icing` | `#FEF6F5` | Logo white. Text on the stage |
| `night` | `#3A0A12` | **Default page background** (maroon in shadow) |
| `night-deep` | `#22060B` | Vignette edges, footer |
| `velvet` | `#5A101B` | Raised surfaces on the stage (product cases, sheets) |
| `plum` | `#6B2A4A` | The rosette piping colour. Links on paper |
| `paper` | `#F6E7DA` | Light chapters (the Savory poster is white) |
| `ink` | `#2A0A0F` | Text on paper and on gold. Never neutral black |
| `oak` | `#9A6A44` | Decorative only: rules, wood texture |
| `ember` | `#C8401C` | Cake-box print colour. Tiny accents, never text |

Contrast (WCAG): icing on night 16.0, icing on maroon 10.1, gold on night 9.6, gold on velvet 7.8, gold on maroon 6.1, ink on paper 15.1, maroon on paper 8.9, plum on paper 8.4, ink on gold 10.3. Gold is never used as text on paper (1.8:1).

**Not used:** purple-blue gradients, glassmorphism, neutral greys, pure black.

## 3. Typography

| Role | Face | Why |
|---|---|---|
| **Display** | **Bricolage Grotesque** (variable: weight 200–800, width 75–100%) | Heavy and condensed, it matches the "VIRAL CHOCO BRICK" / "TANDOORI CHICKEN BUN" lettering of Spunchy's Instagram promos. Its ink traps and slight quirk keep it warm rather than corporate. Also used for UI (buttons, prices, labels) |
| **Serif** | **Newsreader** (variable, with italic) | The in-store posters pair a light serif lead-in ("Cake is the / Language of") with a bold punch word. Newsreader plays the lead-in, plus all reading text |
| **Sinhala** | **Abhaya Libre** | A Sinhala serif that sits beside Newsreader. Used for bilingual moments (needs native-speaker review) |

The **poster pairing** is the core typographic device: a small serif italic line (`text-lede`) leads into one giant display word (`text-mega`, Bricolage 800 at width 75%), for example *Cake is the language of* **love**. It comes straight from their posters, and it is never used to accent one word inside a sentence.

Scale (fluid): mega 88–304 px, display 48–128, h1 38–76, h2 30–48, h3 22–28, lede 20–26 (serif), body 17 (serif, line-height 1.6), small 15, micro 13. Line length stays under 70 characters.

Never: all-caps tracked eyebrows, monospace labels, middle-dot meta strings, a "→" added to every link.

## 4. Space, shape, light

- **Space:** 4 px base. Gutter is fluid at 16–56 px (16 px on phones). Sections are 96–192 px apart. The layout is a 12-column grid used **asymmetrically**: heroes and products sit off-centre, and copy hangs from the left like the posters.
- **Shape:** a hierarchy borrowed from the logo, rather than one radius for everything:
  - `roundel` (full circle/pill): buttons, cursor, small media
  - `tab` (square top, 32 px rounded bottom): the hanging logo tab from every Instagram post. Used for image masks and the header logo holder
  - `cabinet` (28 px): product cases and media frames
  - `chip` (12 px): tags and small controls
- **Light instead of shadow:** products get a contact shadow and a gold rim glow; the stage gets a soft top-light like the track spots in the store. No default drop shadows.
- **Texture:** a static film grain at 4.5% opacity on dark stages, and the real oak-wall photo behind the outlets section.

## 5. Motion

| Token | Curve | GSAP | Used for |
|---|---|---|---|
| `ease-swash` | `cubic-bezier(.16,1,.3,1)` | `expo.out` | Reveals, entrances: the flick that settles |
| `ease-stroke` | `cubic-bezier(.65,0,.35,1)` | `power3.inOut` | Drawing the swash path, colour wipes |
| `ease-pop` | `cubic-bezier(.34,1.45,.64,1)` | `back.out(1.5)` | Small UI only: buttons, cursor |
| `ease-exit` | `cubic-bezier(.5,0,.75,0)` | `power2.in` | Things leaving (faster than entering) |

Durations: tap 140 ms, UI 260 ms, reveal 750 ms, scene 1200 ms. Scroll-scrubbed scenes use `scrub: 1` (Lenis-smoothed).

Rules:
- Only `transform` and `opacity` are animated (plus `clip-path` for wipes, and SVG `stroke-dashoffset`).
- SplitText only on headlines of 8 words or fewer, and it is reverted on unmount.
- At most **two pinned sections** (The four posters, Walk in).
- Parallax only on decorative layers, never on text people are reading.
- `prefers-reduced-motion`: no intro, no pins, no parallax, no cursor. Every chapter renders in its final, readable state with simple 150 ms fades.

## 6. Signature elements

| Element | Built from | Behaviour |
|---|---|---|
| **The swash line** | An SVG S-curve that echoes the logo swash (drawn fresh, not traced) | Draws itself in the intro, as section wipes, and across the footer |
| **Swash wipe** | The same curve as a `clip-path` edge | Colour transitions between chapters (maroon → ink → paper) sweep along the curve instead of a straight line |
| **Cursor** (desktop, fine pointer only) | A 10 px gold dot with a stretched tail along its direction of travel, like a comet | Grows into a 56 px roundel labelled "Drag" / "Open" over interactive items. The native cursor stays available to assistive tech |
| **Hanging tab** | The logo tab from Instagram posts | Header logo holder; image reveal masks drop down from it |
| **Magnetic buttons** | Roundel pills | Pulled up to 6 px toward the pointer; the fill sweeps in at the script's 12° slant |

---

## 7. Storyboard

### 00 — Intro: "The swash" (≤2.6 s first visit, 0.9 s repeat visits, none with reduced motion)

```
 night field + grain
 1. a gold swash draws left→right, accelerating      (900 ms, ease-stroke)
 2. the logo settles into the curve                  (500 ms, ease-swash)
 3. the swash becomes the wipe edge: night splits along it and
    reveals the hero; the logo Flips into the header tab
```

*Why:* the swash is the most ownable part of the logo. The first second of the site is that swash. A `localStorage` flag shortens repeat visits. Skippable with any key or click.

### 01 — Hero: three Spunchy favourites on a cream stage

Revised again 2026-11-09 at the client's request, following a reference layout they chose
(a café landing page with a stacked serif headline, a floating product shedding particles,
and a numbered side panel). Rebuilt for Spunchy rather than copied:

- **Cream stage, maroon ink.** Icing-white light behind the product, paper at the edges; the
  logo maroon replaces the reference's espresso brown. The header switches to maroon ink
  while it is over this hero.
- **Three slides, each a line from Spunchy's posters:** "Cake is the language of love"
  (rosette cake), "Soft, fluffy & fresh" (triangle buns), "A slice of heaven" (fruit tart).
  The stacked uppercase serif is sized from each slide's longest line so it never wraps.
- **The product floats** (slow bob) over a soft shadow, and **crumbs fall from it** in its own
  colours (a canvas, a few dozen at a time, off with reduced motion, paused offscreen).
- **The numbered panel:** 01/02/03, category, product name, a factual line (label price where
  known) and a maroon "Call to order" pill.
- **Bottom row:** "Explore the cabinet" and a round control with a gold progress ring.
  Autoplay every 6.5 s, paused on hover, focus or offscreen; 01/02/03 buttons jump directly.
- **Transitions:** the line exits up through its masks, the product lifts away, the next rises
  in. The product is centred with flexbox so GSAP owns its transform.

The earlier store-photograph hero can be regenerated with `node scripts/hero-composite.mjs`.

### 02 — "The four posters" (pinned, about 400 vh on desktop)

Spunchy's in-store campaign becomes the story. Each poster is one act, and the scroll directs it like a film.

| Act | Lead-in (serif) → punch (display) | Stage | What moves |
|---|---|---|---|
| A | *Soft, fluffy &* **fresh** | ink (the poster's black) | Triangle buns (cut-out) slide in on the poster's diagonal; the cut-open bun turns to the front to show its filling |
| B | *Savory:* **crispy, crunchy, crave-worthy** | paper (the poster's white) | The Savory poster drops in through a hanging-tab mask; a hard-cut swash wipe |
| C | *A slice of* **heaven** *in every bite* | night | Real gateau slices (Nuga, Blueberry, Coffee, Chocolate) glide past like a cabinet shelf on a conveyor |
| D | *Cake is the language of* **love** | maroon | Closes the loop: back to the cake, now cut-open view = cross-section reveal (needs a cut-cake photo; until then the rosette top-down) |

- Act changes are swash wipes in the next act's colour.
- **Phones:** not pinned. Acts stack as four full-height panels with light reveals.
- *Why:* nobody else has these lines, layouts or colours; it turns their shop walls into a scroll film.

### 03 — "The cabinet" (product showcase)

```
  ╭ glass case glow ────────────────────────────────────────────╮
  │  ◀ drag ▶   [nuga]  [blueberry]  [coffee]  [fruit tart] ... │
  │             Nuga Gateau Slice     Rs. 290                   │
  ╰─────────────────────────────────────────────────────────────╯
```

- A horizontal rail inside a glowing glass-case frame. Drag with inertia (GSAP Draggable + Inertia) on desktop; native scroll-snap on touch.
- Hover: the product lifts 8 px and its rim light turns gold. Tap or click: a **Flip** transition grows the product into a detail sheet (large photo, name, price, Order/Call). Esc or back closes it; the sheet has its own URL hash for sharing.
- Keyboard: Tab into the rail, arrow keys move, Enter opens, Esc closes, focus is trapped in the sheet.
- **Products and prices from Spunchy's price labels (photos 2026-11-08), each still to be confirmed:**
  Nuga Gateau Slice 290 · Mousse 280 · Chocolate Gateau Slice 270 · Blueberry Gateau Slice 260 · Coffee Slice 200 · Fruit Tart 290 · Sandwich Bread 200. From Instagram: Choco Brick 350, Tandoori Chicken Bun 290 (no photo of ours yet). The celebration cake shows "Ask in store" until a price is given.
- Items without a usable photo get a typographic card (name in Bricolage on velvet), never a stock photo.

### 04 — "Walk in" (pinned, the camera moves through the store)

- A scroll-driven dolly through real places, in order: **shopfront → interior (maroon ceiling raft) → cake cabinet with the orange boxes → the "Love" poster wall under the track spots**. Each image is masked by the hanging tab and pushes forward (scale + slight perspective) as the next one appears behind it.
- Copy appears in short beats beside the images, using only their bio: *Premium Pastry & Bakery*, *Freshly baked cakes, savories & more*, and the four outlet names.
- Slots for real numbers (years, outlets, customers) stay hidden until the client supplies them.
- **Phones:** a simple vertical sequence of tab-masked images.

### 05 — "Find us" (outlets and order)

- The four outlets set big in Bricolage: **Kottawa / Boralesgamuwa / Piliyandala / Kotikawatta**. Each row expands (height via a clip/scale technique, not `height`) to show address, hours and a map link. Until supplied it shows "Call us on 077 376 8615".
- The panel is the real oak-wall photo, darkened, so it feels like the store wall.
- One clear order block: **Call 077 376 8615** (works now), **Order on PickMe Food** (link needed), **WhatsApp** (shown once the number is confirmed).

### 06 — "On Instagram"

- Links to recent @spunchy.lk posts (title and date) and a Follow button, beside a mosaic of
  Spunchy's own shop and product photos that links to the profile.
- Revised in Phase 5: Instagram's embed script was dropped. It was blocked by ad blockers and
  privacy settings, added a heavy third-party script, and pushed the page sideways.
- Creator reels (@itsmechamith_) only with permission. No invented reviews or quotes.

### 07 — Footer: the brand signs off

- `night-deep` stage. The swash draws across the full width as the footer scrolls into view, and the logo roundel settles at its end, mirroring the intro.
- Phone, Instagram, outlets, and their bio line *Premium Pastry & Bakery Brand*. A small "back to top" roundel.

### Global

- **Header:** the logo in a hanging maroon tab (top-left), and two actions on the right: **Call** and **Order**. It hides on scroll down and returns on scroll up. Mobile: the same, plus a full-screen menu that wipes in along the swash.
- **Sound:** Phase 0 named an optional ambient sound. I recommend skipping it: there is no real recording from the shop, and a stock loop would be the opposite of "Spunchy's own". It can be added later with a muted-by-default toggle if the client records the bakery.

---

## 8. Review against generic defaults

Checked against the usual "AI-made" defaults before building. What changed and why:

| Risk | Where it showed up | Change |
|---|---|---|
| Near-black stage with one bright accent | First idea: black + gold, the luxury chocolatier look | The stage is **maroon in shadow** (`night`), straight from the logo, with gold as light rather than decoration |
| High-contrast serif display | Fraunces (used on the old site) | The display is a heavy **condensed grotesque** that matches their promo lettering. The serif only plays the poster lead-in |
| Cream page + serif + terracotta | Their icing white and box orange could slide into it | Paper appears in one act only; the box orange (`ember`) is limited to tiny accents |
| Headline left / image right hero | Default hero layout | The product sits **in front of** a giant word, layered for depth, with the copy hanging from the poster lead-in |
| 3-column icon cards, numbered sections | "Why choose us" blocks | None. Products live in a cabinet rail; there are no feature cards. Section numbers exist only in this doc |
| Fade-up on every section | Default scroll reveal | Two orchestrated pinned sequences and the swash wipes carry the motion; everything else is still |
| Glassmorphism | The skill's suggested "Liquid Glass" | Rejected (banned in the brief). The "glass" in the cabinet is a single glow frame, not frosted panels |

## 9. Quality floor

- Mobile first; checked at 375, 768, 1280, 1920.
- WebGL only when: fine pointer, ≥4 CPU cores, no reduced motion, and the hero is visible. Otherwise the image fallback.
- Images from `src/assets/images/manifest.json`: AVIF/WebP `srcset`, explicit width/height, blurred LQIP, lazy below the fold.
- Fonts: 3 variable families, `font-display: swap`, Sinhala subset only where used.
- Focus rings: 2 px gold outline with a 3 px offset on every interactive element.
- Touch targets ≥ 44 px. Contrast ≥ 4.5:1 for text (see table above).
- Targets: Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95.

## 10. What's blocked on the client

| Needed | Blocks |
|---|---|
| Logo SVG / high-res PNG | Intro, header tab, footer, favicon. The upscaled Instagram avatar is a stand-in |
| Cut-cake / cross-section photos | Act D's cross-section reveal |
| Product shoot (Choco Brick, Tandoori Chicken Bun, savoury rolls) | Their cabinet cards (typographic until then) |
| PickMe link(s), WhatsApp number | Order buttons |
| Outlet addresses and hours | Outlet rows |
| Real numbers | "Walk in" stat slots |
| Instagram post / creator permissions | Section 06 |
| Price confirmation | All prices on the site |
