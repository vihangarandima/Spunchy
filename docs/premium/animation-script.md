# Spunchy — Animation Script

The motion script for the premium Spunchy site. Read it like a film script: every scene lists what is on screen, what moves, when, and with which easing. It is written to be pasted into the master prompt ([master-prompt.md](master-prompt.md)) and handed to a developer or an AI coding agent.

---

> **Revision, 2026-11-10 (client feedback: "messy, childish").** The built hero drops three of
> the reference moves: the ghost headline (R4), the tilted peek-in neighbours (R5) and the
> particle burst (R7). Slides now glide in (8% of the width, scale 0.94 → 1, no rotation), the
> product floats ±6 px without tilting, and the motion blur is lighter (8 px). The colour morph,
> headline mask reveal, autoplay dots, swipe and keys stay. Sections below still describe the
> original plan where they mention those three moves.

## 0. What we are taking from the reference

Reference: the Pinterest pin "Great Coffee Deserves a Great Website" (a 13-second BridgeWeb promo, 360×640 video of a laptop showing a coffee-shop site). I stepped through it frame by frame. The laptop and the room are only the promo's framing. **The website on the screen is what we copy.** Its moves are:

| # | What the reference does | Seen at |
|---|---|---|
| R1 | **Full-bleed hero carousel.** One product per slide, centred or right of centre, floating with a soft contact shadow | whole video |
| R2 | **Every slide has its own background colour** (espresso brown → caramel → sand → espresso → cream). The colour change *is* the transition | 0:00 → 0:12 |
| R3 | **Giant two-line headline** in a heavy condensed sans ("ARTISAN / ROAST", "RICH / AROMA", "ORDER / FRESH"), a small pill eyebrow above it, two lines of copy and two pill buttons below it | every slide |
| R4 | **Ghost headline.** The headline repeats on the far side of the product, so the product sits *between* the words ("RICH AROMA ☕ RICH AROMA") | 0:03.8, 0:10.5 |
| R5 | **Peek-in neighbours.** Smaller copies of the previous and next products sit cut off at the left and right edges, slightly tilted | 0:00, 0:04.5, 0:12 |
| R6 | **Motion-blur sweep.** Between slides the whole stage smears horizontally for about 300 ms while the headline slides out | 0:02.3 |
| R7 | **Particle burst.** On the bean-bag slide, dozens of coffee beans explode outward from the product, rotating and blurred by depth | 0:04.5 – 0:06 |
| R8 | **Steam rising** from the cup, looping | 0:03 – 0:04 |
| R9 | Round arrow buttons left and right, a small dot indicator under the stage, and a product strip ("Quest Coffees") peeking up under the hero | whole video |

Spunchy keeps all nine moves but swaps coffee for cake, bean bags for Spunchy boxes, and coffee beans for chocolate shards, sprinkles, sesame seeds and fruit. The colours come from the Spunchy logo, not from the reference.

---

## 1. Motion language (applies everywhere)

| Token | Curve | GSAP name | Use |
|---|---|---|---|
| `swash` | `cubic-bezier(.16,1,.3,1)` | `expo.out` | Everything that **arrives**: products, headlines, cards |
| `stroke` | `cubic-bezier(.65,0,.35,1)` | `power3.inOut` | Background colour morphs, wipes, the gold swash drawing itself |
| `pop` | `cubic-bezier(.34,1.45,.64,1)` | `back.out(1.6)` | Small UI only: buttons, cart badge, quantity stepper |
| `exit` | `cubic-bezier(.5,0,.75,0)` | `power2.in` | Everything that **leaves** (exits run faster than entrances) |

Durations: tap 140 ms · UI 260 ms · reveal 750 ms · slide change 1100 ms · intro 2200 ms.

Rules:
1. Animate only `transform`, `opacity`, `filter: blur()` (used only on the sweep), `clip-path` and SVG `stroke-dashoffset`.
2. Every product image is a **transparent cut-out PNG/WebP/AVIF**. No boxes behind products on the hero.
3. `prefers-reduced-motion: reduce` → no intro, no sweep blur, no particles, no autoplay. Slides cross-fade in 200 ms. Everything else appears in its final state.
4. Phones (< 768 px): particles drop to 12, no motion blur, no ghost headline (it would wrap). Keep the colour morph and product entrances.

---

## 2. Scene list

| Scene | Where | Length | Trigger |
|---|---|---|---|
| S0 | Intro / loader | 2.2 s (1.2 s on phones) | First visit in a session |
| S1 | Hero carousel "The Cabinet" | 5 slides × 5.5 s, loops | Autoplay, arrows, swipe, dots, keyboard |
| S2 | Category rail | 0.9 s | Scrolls into view |
| S3 | Product grid | stagger | Scrolls into view, re-runs on filter change |
| S4 | Add to cart | 0.8 s | "Add" pressed |
| S5 | Product sheet (quick view) | 0.6 s | Card tapped |
| S6 | Poster band "Cake is the language of love" | scrubbed | Scroll |
| S7 | Outlets / footer | 0.9 s | Scrolls into view |

---

## S0 · Intro (the box opens)

**Picture:** a deep maroon screen (`#3A0A12`). Centre: the Spunchy roundel logo.

| Time | Action |
|---|---|
| 0.00 | Screen is `night`. Logo roundel scales 0.6 → 1 and fades in (`swash`, 600 ms) |
| 0.30 | The gold swash under the wordmark **draws itself** left to right (`stroke-dashoffset` 100% → 0, `stroke`, 700 ms) |
| 0.90 | Four tiny particles (sprinkles) flick off the end of the swash and fall out of frame |
| 1.20 | The logo shrinks and flies to its place in the header (FLIP: measure header slot, tween x/y/scale, `swash`, 700 ms) |
| 1.40 | The maroon screen splits into two halves that slide up and down like a cake box lid opening (`clip-path`, `exit`, 600 ms), revealing slide 1 of the hero already in place |
| 2.20 | Hero slide 1 runs its normal entrance (below). Intro ends |

Plays once per session (`sessionStorage`). Skippable by any click or key.

---

## S1 · Hero carousel "The Cabinet" (the reference's main move)

### Layout of one slide (desktop 1440 × 900)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [logo]   Home  Menu  Cakes  Savory  Outlets           🔍  ♡  🛒(2)     │  header (transparent)
│                                                                        │
│ ◖prev   ( pill eyebrow )                                         next◗ │  peek products: 18% scale,
│ product  CAKE IS THE          ╭──────────╮    CAKE IS THE       product│  -12° / +12° tilt, cut off
│ (tilted) LANGUAGE OF LOVE     │ PRODUCT  │    LANGUAGE OF LOVE  (tilt) │  at the screen edges
│          two lines of copy    │ CUT-OUT  │    (ghost, 14% opacity)     │
│  (◀)     [Order now] [Menu]   ╰──────────╯                        (▶)  │  round arrow buttons
│                                 shadow                                 │
│                          ●  ○  ○  ○  ○                                 │  progress dots
│ ─────────────── "Today's favourites" strip peeks up here ───────────── │
└────────────────────────────────────────────────────────────────────────┘
```

- Headline: Bricolage Grotesque 800, width 75%, uppercase, 2 lines, 96–168 px.
- Ghost headline: same text, right of the product, 14% opacity, behind the product (z-index under it).
- Product: cut-out, 46–54% of stage height, floats on a 6 s sine loop (y ±10 px, rotate ±1.5°).
- Contact shadow: blurred ellipse under the product that shrinks when the product rises.

### The five slides

| # | Background | Eyebrow pill | Headline (2 lines) | Product cut-out | Particles | Ambient loop | CTA 1 / CTA 2 |
|---|---|---|---|---|---|---|---|
| 1 | **Maroon night** `#3A0A12` → radial glow `#7A1523` | Cakes for every celebration | CAKE IS THE / LANGUAGE OF LOVE | Rosette celebration cake | Pink, ivory and plum buttercream rosette petals + gold sprinkles | Soft gold spotlight from the top swings ±4° | Order a cake / See all cakes |
| 2 | **Swash gold → caramel** `#F7B836` → `#C98A2E` | The viral one | VIRAL / CHOCO BRICK | Choco Brick, cut in half to show the inside | Chocolate shards and cocoa crumbs (the coffee-bean burst from the reference) | A thin ribbon of chocolate sauce drips and loops | Add · Rs. 350 / How it's made |
| 3 | **Warm paper** `#F6E7DA` | Savory | CRISPY. CRUNCHY. / CRAVE-WORTHY | Tandoori chicken bun, torn open (cheese/filling pull) | Sesame seeds, chilli flakes, crumbs | Wisp of steam rising (the reference's coffee steam) | Add · Rs. 290 / All savory |
| 4 | **Plum blush** `#6B2A4A` → `#8E3B5F` | Slices & pastries | A SLICE OF / HEAVEN | Fruit tart slice (or Blueberry gateau slice) | Blueberries, kiwi and strawberry cubes, glaze droplets | Glaze shine sweeps across the tart every 3 s | Add · Rs. 290 / All slices |
| 5 | **Oak and cream** `#9A6A44` → `#FEF6F5` | Fresh every morning | SOFT, FLUFFY / & FRESH | Stack of triangle buns / sandwich bread | Flour dust puffs and sugar crystals | Flour dust drifts down slowly | Order for pickup / Find an outlet |

All headlines are lines from Spunchy's own posters and Instagram. Prices are the confirmed ones from the brand brief. Text colour flips per slide to keep contrast: icing white on 1, 4; ink `#2A0A0F` on 2, 3, 5.

### Slide change timeline (1100 ms, slide N → N+1, direction = next)

```
t (ms)   0      150     300     450     600     750     900    1100
         │───────│───────│───────│───────│───────│───────│───────│
headline ███████ exit: each line slides -80px left + fades, 60ms stagger
ghost    █████ fades to 0
copy+cta ████ fade + 20px down
product  ███████████ exits: x -40vw, rotate -18°, scale 0.7 (exit)
SWEEP              ██████ stage filter blur(0→14px→0) on x only (an SVG feGaussianBlur stdDeviation="14 0")
bg colour ████████████████████████ morph old → new (stroke, 900ms)
peek L/R          █████████ prev/next thumbs shuffle one place along the arc
new prod                   ████████████████ enters from x +40vw, rotate 18°→0, scale 0.7→1 (swash, 800ms)
burst                                ███████ particles explode out from the product centre (see below)
new head                         ████████████ lines rise from y 100% inside a mask, 70ms stagger (swash)
new ghost                                 ██████ fade to 14%
copy+cta                                      ████████ fade up, 60ms stagger
dots                                     ██ active dot stretches into a pill and fills with the timer
```

Previous direction mirrors every x and rotate value.

### The particle burst (reference move R7)

- 28 particles desktop / 12 phone, drawn from 4–6 sprite images for that slide.
- Spawn at the product's centre, invisible.
- Each flies to a random point on an ellipse 0.55 × 0.4 of the stage, `swash`, 900–1300 ms, with random rotation (±240°) and scale 0.4–1.2.
- Depth: a third of them are "near" (scale 1.2, `blur(3px)`, in front of the product), a third "mid", a third "far" (scale 0.5, `blur(1.5px)`, behind the headline).
- After landing they **keep drifting** slowly (y ±8 px, rotate ±10°, 4–7 s sine) and react to the pointer: they move up to 24 px away from the cursor (parallax with lag).
- On slide exit they are blown off with the product (x -30vw, `exit`, 500 ms).

### Autoplay and controls

- Autoplay every 5.5 s. The active dot fills like a progress bar. Pauses on hover, on focus inside the hero, and when the tab is hidden.
- Arrows: round 56 px buttons, icing ring, hover fill slides in at the 12° logo lean (`pop`).
- Swipe and drag on touch and mouse (threshold 60 px). While dragging, the product follows the finger at 0.4× with rubber-banding.
- Keyboard: ← / → when the hero has focus. Dots are buttons with `aria-label="Slide 3 of 5: Crispy, crunchy, crave-worthy"`.
- `aria-live="polite"` region announces the new headline. Autoplay stops for good after the user interacts.

### Pointer parallax (desktop only)

Moving the pointer across the hero shifts layers with lag (`gsap.quickTo`, 0.6 s):
background glow ±10 px · ghost headline ±16 px · product ±24 px and rotate ±3° · near particles ±40 px.

### Scroll-out

As the hero scrolls away (`ScrollTrigger`, scrub 1): the product scales to 0.85 and rises 80 px, the headline moves up at 1.2× scroll speed, and the "Today's favourites" strip slides up over the hero with a 32 px rounded top edge.

---

## S2 · Category rail ("Shop by category")

**Picture:** a horizontal row of round category tiles (circle cut-outs on soft coloured discs, the reference's "Quest Coffees" strip and Caravan Fresh's category row).

| Time | Action |
|---|---|
| 0.00 | Section title rises in (mask reveal, `swash`) |
| 0.15 | Tiles pop in left to right, 60 ms stagger: scale 0.6 → 1, y 30 → 0 (`pop`) |
| hover | The disc behind the product grows 1 → 1.12, the product lifts 8 px and tilts 6° |
| click | The chosen tile's disc expands to fill its card and the page scrolls to that category in the grid (or routes to `/menu/:category`) |

The rail scrolls sideways with drag and snap on phones.

---

## S3 · Product grid

**Picture:** cards on the paper background. Each card: cut-out product on a coloured disc, name, short line, size or quantity chip, price, round "+ Add" button.

- On enter: cards rise 40 px and fade, 50 ms stagger by row, `swash`, 700 ms (`ScrollTrigger.batch`).
- Filter / category change: outgoing cards fade and scale to 0.96 (200 ms); new cards are laid out with a FLIP so cards that stay **slide** to their new places instead of jumping (Motion `layout` prop or GSAP Flip).
- Hover: the card lifts 6 px, the product turns 8° and scales 1.06, the disc colour deepens.
- Price change when the size changes (500 g → 1 kg): the digits roll vertically like an odometer (each digit is a column that translates y, 400 ms, `swash`).

---

## S4 · Add to cart (the payoff moment)

| Time | Action |
|---|---|
| 0.00 | "+ Add" squashes to 0.92 and springs back (`pop`, 140 ms). It turns into a quantity stepper `− 1 +` (width morph, 260 ms) |
| 0.05 | A copy of the product image lifts off the card and **flies along a curved path** to the cart icon in the header (GSAP MotionPath, arc height 30% of distance, 700 ms, `stroke`), shrinking to 24 px and spinning 180° |
| 0.70 | Cart icon wobbles (rotate -12° → 10° → 0, 300 ms). The badge number rolls up to the new count and pops (scale 1.4 → 1) |
| 0.75 | Three gold sprinkles burst from the cart icon |
| 0.80 | A small toast slides up from the bottom: "Choco Brick added · View cart" (auto-hides after 3 s) |

Reduced motion: no flight. The badge number updates and the toast fades in.

---

## S5 · Product quick view / product page

- Desktop: the card's image **morphs** into the large image of a right-side sheet (shared-element / FLIP, 600 ms, `swash`). The sheet slides in from the right, the page behind dims to `rgba(34,6,11,.6)`.
- Phone: a bottom sheet rises with a spring and can be dragged down to close.
- Inside: product image floats (same 6 s sine as the hero), size chips (e.g. 500 g / 1 kg), flavour chips, "message on cake" field, quantity stepper, add-ons ("Birthday candle", "Cap"), total price that rolls when anything changes, sticky "Add to cart · Rs. X" button.

---

## S6 · Poster band (scroll-scrubbed)

The only pinned section on the home page. Taken from the in-store posters.

| Scroll % | Action |
|---|---|
| 0 | Black-maroon stage. Small serif italic line "Cake is the language of" fades in |
| 20 | The word **LOVE** scales from 0.4 to fill the width (Bricolage 800), letters arrive one by one |
| 45 | The rosette cake cut-out rises through the middle of the word, the letters part around it |
| 70 | The swash draws itself under the word |
| 100 | Unpin; the band slides off as the next section comes up |

---

## S7 · Outlets and footer

- Four outlet cards (Kottawa, Boralesgamuwa, Piliyandala, Kotikawatta) slide in from alternating sides, 80 ms stagger.
- A gold swash line draws between them like a route.
- Footer: the big Spunchy wordmark is masked by the oak-wall photo and moves slowly with the pointer.

---

## 3. Assets needed (what to generate)

You offered to generate images and video. This is the list. Every hero product must be a **clean cut-out on a transparent background** so it can float.

### Hero product cut-outs (PNG with alpha, 2400 px on the long side, lit from top-left, soft rim light)

| File | Subject | Prompt to generate it |
|---|---|---|
| `hero-cake.png` | Rosette celebration cake | "Studio product photo of a round celebration cake covered in pink, ivory and plum buttercream rosettes, three-quarter view from slightly above, warm top light with soft gold rim light, isolated on a transparent background, no plate, no text, photorealistic, 4k" |
| `hero-chocobrick.png` | Choco Brick cut in half | "A rectangular chocolate brick cake cut cleanly in half, the cut face showing dense fudge layers and molten chocolate centre, one half leaning on the other, glossy ganache top, isolated on a transparent background, warm studio light, photorealistic" |
| `hero-bun.png` | Tandoori chicken bun torn open | "A golden glazed bun torn open to show a spicy tandoori chicken filling with melted cheese stretching between the halves, sesame seeds on top, isolated on a transparent background, warm studio light, photorealistic" |
| `hero-tart.png` | Fruit tart slice | "A slice of fruit tart with glossy kiwi, strawberry and blueberry on vanilla custard in a crisp pastry shell, three-quarter view, isolated on a transparent background, warm studio light, photorealistic" |
| `hero-buns.png` | Triangle buns / bread | "Three soft golden triangle buns stacked in a small pyramid with a sliced white sandwich loaf behind them, isolated on a transparent background, warm morning light, photorealistic" |
| `peek-*.png` | Smaller versions of each for the side peeks | The same files can be reused, scaled down |

Best results: photograph the real products in store on a plain white sheet, then cut them out. Generated food should be checked against the real product so the site does not promise something different.

### Particle sprites (PNG with alpha, 256 px each, 4–6 per slide)

- Slide 1: buttercream rosette (pink, ivory, plum), gold sprinkle, sugar pearl
- Slide 2: chocolate shard (3 shapes), cocoa crumb
- Slide 3: sesame seed, chilli flake, bread crumb
- Slide 4: blueberry, kiwi cube, strawberry cube, glaze droplet
- Slide 5: flour puff, sugar crystal

Prompt pattern: "Single [chocolate shard], isolated on a transparent background, top light, photorealistic, sharp, no shadow".

### Short loops (optional, WebM VP9 with alpha + MP4 fallback, 3–4 s, seamless)

- `steam.webm`: a wisp of steam on transparent black, for the bun slide
- `drip.webm`: chocolate sauce drip, for the Choco Brick slide
- `flour.webm`: flour dust drifting, for the bread slide

If loops are not supplied, these effects are drawn in code (canvas or SVG) and still work.

### Category tile cut-outs (PNG with alpha, 800 px)

One per category in the master prompt's category list (cake, slice, savory bun, bread, choco brick, drinks if served).
