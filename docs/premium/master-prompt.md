# Spunchy — Master Prompt (premium showcase + ordering site)

> Paste everything below the line into Claude Code (or another coding agent) at the root of the `spunchy` repo. It is self-contained: brand, structure, pages, data, the full animation script, and the definition of done.

---

## ROLE

You are a senior front-end engineer and motion designer. You are rebuilding the website of **Spunchy**, a Sri Lankan premium pastry and bakery café, into a **premium, animated showcase with online ordering**. The current site works but looks too basic. The new one must feel like a high-end product launch, while staying easy to use for someone who just wants to find a cake, see the price and order it.

## THE THREE JOBS OF THE SITE (in priority order)

1. **Showcase Spunchy.** The first 5 seconds must make people hungry: floating cut-out products, colour-morphing slides, particle bursts (see the animation script).
2. **Make every item easy to find.** Categories first, then all products, each with photo, name, size / quantity and price. Two taps from the home page to any product.
3. **Let people order.** Add to cart, choose quantity and options, choose pickup outlet or delivery, check out.

## REFERENCES (study both before writing code)

1. **Look and motion:** Pinterest pin `https://www.pinterest.com/pin/548524429637823353/` (a BridgeWeb coffee-shop site promo). Copy its **hero carousel and motion**: per-slide background colour, giant two-line condensed headline, ghost headline behind the product, floating cut-out product, tilted peek-in neighbours, motion-blur sweep between slides, particle burst, round arrows and dots, product strip peeking under the hero. Everything is described exactly in the animation script below. Use Spunchy's colours, products and words, not the coffee shop's.
2. **Structure and commerce flow:** `https://caravanfresh.lk/` (a Sri Lankan bakery chain). Copy its **information architecture**: announcement bar → header with search, wishlist, cart, language switch → category mega-menu → hero → **Shop by category** rail → featured category row → **Top-selling** row → promo banner → **all products** → value strip → footer with categories, quick links, contact and socials. Copy its product page pattern: weight/size options, flavour options, "message on cake" with a charge, quantity stepper, add-ons (candle, cap), delivery-date note, related products. Do **not** copy its visual style; it is the skeleton, the Pinterest reference is the skin.

## BRAND (non-negotiable, from `docs/brand-brief.md` and `docs/design-system.md`)

- **Name:** Spunchy. Bio lines: "Premium Pastry & Bakery Brand", "Freshly baked cakes, savories & more".
- **Outlets:** Kottawa, Boralesgamuwa, Piliyandala, Kotikawatta.
- **Phone:** 077 376 8615 (`tel:+94773768615`). **Delivery partner:** PickMe Food.
- **Socials:** Instagram `https://www.instagram.com/spunchy.lk/`. Facebook, TikTok, WhatsApp and the PickMe store link: `{{SOCIAL_LINKS — the client will supply}}`. Put them all in `src/content/business.ts`; hide any that are `null`.
- **Colours** (all from the logo):

| Token | Hex | Use |
|---|---|---|
| maroon | `#7A1523` | Brand, logo tab, active states |
| gold | `#F7B836` | The logo swash. Primary buttons, prices, highlights. Never text on light backgrounds |
| icing | `#FEF6F5` | Text on dark, light surfaces |
| night | `#3A0A12` | Dark stages |
| velvet | `#5A101B` | Raised dark surfaces |
| plum | `#6B2A4A` | Rosette colour, slide 4 |
| paper | `#F6E7DA` | **Default page background for the menu and shop sections** |
| ink | `#2A0A0F` | Text on paper and gold. Never pure black |
| oak | `#9A6A44` | Decorative |

- **Type:** Bricolage Grotesque (variable; 800 weight at 75% width for the giant headlines, also all UI), Newsreader (serif, italic lead-ins and reading text), Abhaya Libre (Sinhala). Already installed via `@fontsource`.
- **Shapes:** pill buttons; product discs (circles); cards with 28 px radius; the "hanging tab" (square top, 32 px rounded bottom) for the header logo.
- **Voice:** sensory poster lines ("Soft, Fluffy & Fresh", "A slice of heaven in every bite", "Cake is the language of love", "Savory: crispy, crunchy, crave-worthy") plus light local cheek in micro-copy. Never invent facts (years, customer counts, awards, ratings, reviews).

## TECH STACK

Keep the existing repo stack and add only what is listed:

- React 19 + TypeScript + Vite 8 + Tailwind CSS 4 (tokens in `src/styles/tokens.css`)
- GSAP 3 (ScrollTrigger, Flip, MotionPath, SplitText; all are free now) + Lenis for smooth scroll + `motion` for layout animations
- **Add:** `react-router` (routes below) and `zustand` (cart store, persisted to `localStorage` under `spunchy-cart-v1`, wrapped in try/catch)
- Images: AVIF + WebP through the existing pipeline (`npm run images`); cut-outs with alpha. `loading="lazy"` on everything below the hero; preload slide 1's product.
- Keep the prerender build (`scripts/prerender.mjs`) working for every static route so the menu is indexable.

## SITE MAP AND ROUTES

| Route | Page |
|---|---|
| `/` | Home (showcase) |
| `/menu` | All products, grouped by category, with category filter chips and search |
| `/menu/:category` | One category |
| `/product/:slug` | Product page |
| `/cart` | Cart (also available as a slide-in drawer from any page) |
| `/checkout` | Checkout |
| `/order/:id` | Order confirmation |
| `/outlets` | The four outlets with map links, phone, hours (hours hidden until supplied) |
| `/about` | Short story, store photos (`assets/photos/`), Instagram grid |

## HOME PAGE: COMPONENT ORDER (top to bottom)

1. **`<AnnouncementBar>`** maroon strip: "Order online · Pick up at Kottawa, Boralesgamuwa, Piliyandala or Kotikawatta · Delivery on PickMe". Dismissible.
2. **`<Header>`** transparent over the hero, turns paper with blur after 80 px of scroll. Left: logo in the hanging tab. Centre: Home · Menu (mega-menu with all categories and their thumbnails) · Cakes · Savory · Outlets. Right: search (opens a full-width command-style search over all products), wishlist, cart with count badge, EN / සිං switch. Phone: hamburger opens a full-screen maroon menu with the categories as big tiles.
3. **`<HeroCabinet>`** the five-slide carousel from the animation script (S1). This is the most important component on the site.
4. **`<TodaysFavourites>`** horizontal strip that slides up over the bottom of the hero (the reference's "Quest Coffees" strip): 6–8 product cards with "+ Add".
5. **`<ShopByCategory>`** round category tiles (S2). Click → `/menu/:category`.
6. **`<FeaturedCategory>`** "Celebration cakes": title, one line, a row of cake cards, "View all".
7. **`<TopSelling>`** carousel of best sellers (client to choose; start with Choco Brick, Tandoori Chicken Bun, Fruit Tart, Rosette cake, Blueberry slice).
8. **`<PosterBand>`** the pinned "Cake is the language of LOVE" scene (S6).
9. **`<FullMenuPreview>`** every product, grouped under category headings, with sticky category chips at the top that scroll-spy. This is the "see everything at once" section. "Open full menu" → `/menu`.
10. **`<ValueStrip>`** four short promises with small icons. Only true ones: "Baked fresh daily", "4 outlets", "Pickup or PickMe delivery", "Cakes made to order". No invented ratings.
11. **`<InstagramGrid>`** latest posts from @spunchy.lk (reuse the existing `Instagram.tsx`).
12. **`<Outlets>`** four outlet cards with "Directions" and "Call" (S7).
13. **`<Footer>`** columns: Our products (categories) · Quick links · Outlets · Get in touch (phone, socials). Big Spunchy wordmark at the bottom.
14. **`<CartDrawer>`** global, slides in from the right. **`<FloatingOrderButton>`** on phones: a gold pill "Cart · 3 · Rs. 1,230" fixed at the bottom once the cart has items.

## CATEGORIES AND PRODUCT DATA

Categories, in menu order (rename freely once the client confirms):

| Slug | Name | Sinhala (to review) | Contains |
|---|---|---|---|
| `celebration-cakes` | Celebration Cakes | සැමරුම් කේක් | Rosette cakes, gateaux, rainbow cakes. Sizes 500 g / 1 kg / 2 kg |
| `signature` | Spunchy Signatures | — | Choco Brick and other viral items |
| `slices` | Cake Slices & Pastries | — | Gateau slices, mousse, fruit tart, coffee slice |
| `savory` | Savory | — | Buns, rolls, cutlets, triangle buns |
| `bakery` | Bread & Bakery | — | Loaves, sugar bun packs, cookies |
| `drinks` | Drinks | — | **Only if Spunchy serves drinks. Hide the category while it is empty** |

Product model (`src/content/products.ts`, extend the existing type, keep its "no invented prices" rule):

```ts
type Product = {
  id: string; slug: string; name: string; nameSi?: string
  category: CategorySlug
  description: string | null            // one sensory line, client-approved
  image: string; cutout: boolean         // id in the image manifest
  options?: {                            // sizes / quantities, each with its own price
    label: string                        // "Single", "Box of 6", "500 g", "1 kg"
    price: number | null                 // LKR; null → "Ask in store", cannot be added to cart
  }[]
  price: number | null                   // when there are no options
  flavours?: string[]
  allowsMessage?: boolean; messageCharge?: number
  addOns?: { id: string; name: string; price: number }[]
  tags?: ('bestseller' | 'new' | 'viral' | 'veg' | 'spicy')[]
  available: boolean                     // false → "Sold out today"
  leadTimeHours?: number                 // cakes made to order, e.g. 24
  source: 'label' | 'instagram' | 'client'
}
```

Confirmed prices to start with (from in-store labels and Instagram): Fruit Tart 290, Nuga Gateau Slice 290, Blueberry Gateau Slice 260, Chocolate Gateau Slice 270, Coffee Slice 200, Mousse 280, Choco Brick 350, Tandoori Chicken Bun 290, Cheesy Chicken Roll 200, Sandwich Bread 200. Everything else is `null` until the client sends the price list; the UI shows "Ask in store" and disables "Add".

## PRODUCT CARD (used everywhere)

Cut-out on a coloured disc (disc colour per category) · tag pill (Viral, Bestseller, New) · name · one-line description · option chips if any (picking one updates the price) · price in gold-on-ink pill · round "+ Add" that turns into a `− n +` stepper once added · heart for wishlist. The whole card opens the quick view (S5). Minimum tap target 44 px.

## PRODUCT PAGE / QUICK VIEW

Large floating image (gallery if more photos) · name, tags · price that rolls when options change · size / quantity options · flavour chips · "Message on cake" (with its charge) · lead-time note ("Order by 6 pm for tomorrow" for cakes, only if the client confirms the rule) · quantity stepper · "Make it extra special" add-ons · sticky "Add to cart · Rs. X" · pickup outlets where it is available · related products row.

## CART AND CHECKOUT (phase 1: no payment gateway)

- Cart drawer: line items with image, options, message, stepper, remove, subtotal. Empty state with a small animated whisk and "Browse the menu".
- Checkout, one page, three steps shown as a progress swash:
  1. **How:** Pickup (choose one of the four outlets, date, time slot) or Delivery (address + note; explain it is delivered via PickMe or by the outlet, as the client decides).
  2. **Who:** name, phone (Sri Lankan format check), optional email.
  3. **Confirm:** summary and total.
- **Place order** sends the order as a pre-filled **WhatsApp message** to the chosen outlet's number (`https://wa.me/<number>?text=<encoded order>`), and shows `/order/:id` with the summary and a "Call the outlet" button. The order id is generated on the client (`SP-YYMMDD-XXXX`).
- Also show "Order on PickMe instead" when the PickMe link is set.
- Keep the order-sending code behind one function (`submitOrder(order)`) so a real backend or payment gateway (PayHere, for example) can replace it in phase 2 without touching the UI.

## ANIMATION SCRIPT

Implement this exactly. It is the heart of the brief.

<!-- BEGIN ANIMATION SCRIPT (copied from animation-script.md) -->


### 0. What we are taking from the reference

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

### 1. Motion language (applies everywhere)

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

### 2. Scene list

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

### S0 · Intro (the box opens)

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

### S1 · Hero carousel "The Cabinet" (the reference's main move)

#### Layout of one slide (desktop 1440 × 900)

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

#### The five slides

| # | Background | Eyebrow pill | Headline (2 lines) | Product cut-out | Particles | Ambient loop | CTA 1 / CTA 2 |
|---|---|---|---|---|---|---|---|
| 1 | **Maroon night** `#3A0A12` → radial glow `#7A1523` | Cakes for every celebration | CAKE IS THE / LANGUAGE OF LOVE | Rosette celebration cake | Pink, ivory and plum buttercream rosette petals + gold sprinkles | Soft gold spotlight from the top swings ±4° | Order a cake / See all cakes |
| 2 | **Swash gold → caramel** `#F7B836` → `#C98A2E` | The viral one | VIRAL / CHOCO BRICK | Choco Brick, cut in half to show the inside | Chocolate shards and cocoa crumbs (the coffee-bean burst from the reference) | A thin ribbon of chocolate sauce drips and loops | Add · Rs. 350 / How it's made |
| 3 | **Warm paper** `#F6E7DA` | Savory | CRISPY. CRUNCHY. / CRAVE-WORTHY | Tandoori chicken bun, torn open (cheese/filling pull) | Sesame seeds, chilli flakes, crumbs | Wisp of steam rising (the reference's coffee steam) | Add · Rs. 290 / All savory |
| 4 | **Plum blush** `#6B2A4A` → `#8E3B5F` | Slices & pastries | A SLICE OF / HEAVEN | Fruit tart slice (or Blueberry gateau slice) | Blueberries, kiwi and strawberry cubes, glaze droplets | Glaze shine sweeps across the tart every 3 s | Add · Rs. 290 / All slices |
| 5 | **Oak and cream** `#9A6A44` → `#FEF6F5` | Fresh every morning | SOFT, FLUFFY / & FRESH | Stack of triangle buns / sandwich bread | Flour dust puffs and sugar crystals | Flour dust drifts down slowly | Order for pickup / Find an outlet |

All headlines are lines from Spunchy's own posters and Instagram. Prices are the confirmed ones from the brand brief. Text colour flips per slide to keep contrast: icing white on 1, 4; ink `#2A0A0F` on 2, 3, 5.

#### Slide change timeline (1100 ms, slide N → N+1, direction = next)

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

#### The particle burst (reference move R7)

- 28 particles desktop / 12 phone, drawn from 4–6 sprite images for that slide.
- Spawn at the product's centre, invisible.
- Each flies to a random point on an ellipse 0.55 × 0.4 of the stage, `swash`, 900–1300 ms, with random rotation (±240°) and scale 0.4–1.2.
- Depth: a third of them are "near" (scale 1.2, `blur(3px)`, in front of the product), a third "mid", a third "far" (scale 0.5, `blur(1.5px)`, behind the headline).
- After landing they **keep drifting** slowly (y ±8 px, rotate ±10°, 4–7 s sine) and react to the pointer: they move up to 24 px away from the cursor (parallax with lag).
- On slide exit they are blown off with the product (x -30vw, `exit`, 500 ms).

#### Autoplay and controls

- Autoplay every 5.5 s. The active dot fills like a progress bar. Pauses on hover, on focus inside the hero, and when the tab is hidden.
- Arrows: round 56 px buttons, icing ring, hover fill slides in at the 12° logo lean (`pop`).
- Swipe and drag on touch and mouse (threshold 60 px). While dragging, the product follows the finger at 0.4× with rubber-banding.
- Keyboard: ← / → when the hero has focus. Dots are buttons with `aria-label="Slide 3 of 5: Crispy, crunchy, crave-worthy"`.
- `aria-live="polite"` region announces the new headline. Autoplay stops for good after the user interacts.

#### Pointer parallax (desktop only)

Moving the pointer across the hero shifts layers with lag (`gsap.quickTo`, 0.6 s):
background glow ±10 px · ghost headline ±16 px · product ±24 px and rotate ±3° · near particles ±40 px.

#### Scroll-out

As the hero scrolls away (`ScrollTrigger`, scrub 1): the product scales to 0.85 and rises 80 px, the headline moves up at 1.2× scroll speed, and the "Today's favourites" strip slides up over the hero with a 32 px rounded top edge.

---

### S2 · Category rail ("Shop by category")

**Picture:** a horizontal row of round category tiles (circle cut-outs on soft coloured discs, the reference's "Quest Coffees" strip and Caravan Fresh's category row).

| Time | Action |
|---|---|
| 0.00 | Section title rises in (mask reveal, `swash`) |
| 0.15 | Tiles pop in left to right, 60 ms stagger: scale 0.6 → 1, y 30 → 0 (`pop`) |
| hover | The disc behind the product grows 1 → 1.12, the product lifts 8 px and tilts 6° |
| click | The chosen tile's disc expands to fill its card and the page scrolls to that category in the grid (or routes to `/menu/:category`) |

The rail scrolls sideways with drag and snap on phones.

---

### S3 · Product grid

**Picture:** cards on the paper background. Each card: cut-out product on a coloured disc, name, short line, size or quantity chip, price, round "+ Add" button.

- On enter: cards rise 40 px and fade, 50 ms stagger by row, `swash`, 700 ms (`ScrollTrigger.batch`).
- Filter / category change: outgoing cards fade and scale to 0.96 (200 ms); new cards are laid out with a FLIP so cards that stay **slide** to their new places instead of jumping (Motion `layout` prop or GSAP Flip).
- Hover: the card lifts 6 px, the product turns 8° and scales 1.06, the disc colour deepens.
- Price change when the size changes (500 g → 1 kg): the digits roll vertically like an odometer (each digit is a column that translates y, 400 ms, `swash`).

---

### S4 · Add to cart (the payoff moment)

| Time | Action |
|---|---|
| 0.00 | "+ Add" squashes to 0.92 and springs back (`pop`, 140 ms). It turns into a quantity stepper `− 1 +` (width morph, 260 ms) |
| 0.05 | A copy of the product image lifts off the card and **flies along a curved path** to the cart icon in the header (GSAP MotionPath, arc height 30% of distance, 700 ms, `stroke`), shrinking to 24 px and spinning 180° |
| 0.70 | Cart icon wobbles (rotate -12° → 10° → 0, 300 ms). The badge number rolls up to the new count and pops (scale 1.4 → 1) |
| 0.75 | Three gold sprinkles burst from the cart icon |
| 0.80 | A small toast slides up from the bottom: "Choco Brick added · View cart" (auto-hides after 3 s) |

Reduced motion: no flight. The badge number updates and the toast fades in.

---

### S5 · Product quick view / product page

- Desktop: the card's image **morphs** into the large image of a right-side sheet (shared-element / FLIP, 600 ms, `swash`). The sheet slides in from the right, the page behind dims to `rgba(34,6,11,.6)`.
- Phone: a bottom sheet rises with a spring and can be dragged down to close.
- Inside: product image floats (same 6 s sine as the hero), size chips (e.g. 500 g / 1 kg), flavour chips, "message on cake" field, quantity stepper, add-ons ("Birthday candle", "Cap"), total price that rolls when anything changes, sticky "Add to cart · Rs. X" button.

---

### S6 · Poster band (scroll-scrubbed)

The only pinned section on the home page. Taken from the in-store posters.

| Scroll % | Action |
|---|---|
| 0 | Black-maroon stage. Small serif italic line "Cake is the language of" fades in |
| 20 | The word **LOVE** scales from 0.4 to fill the width (Bricolage 800), letters arrive one by one |
| 45 | The rosette cake cut-out rises through the middle of the word, the letters part around it |
| 70 | The swash draws itself under the word |
| 100 | Unpin; the band slides off as the next section comes up |

---

### S7 · Outlets and footer

- Four outlet cards (Kottawa, Boralesgamuwa, Piliyandala, Kotikawatta) slide in from alternating sides, 80 ms stagger.
- A gold swash line draws between them like a route.
- Footer: the big Spunchy wordmark is masked by the oak-wall photo and moves slowly with the pointer.

---

### 3. Assets needed (what to generate)

You offered to generate images and video. This is the list. Every hero product must be a **clean cut-out on a transparent background** so it can float.

#### Hero product cut-outs (PNG with alpha, 2400 px on the long side, lit from top-left, soft rim light)

| File | Subject | Prompt to generate it |
|---|---|---|
| `hero-cake.png` | Rosette celebration cake | "Studio product photo of a round celebration cake covered in pink, ivory and plum buttercream rosettes, three-quarter view from slightly above, warm top light with soft gold rim light, isolated on a transparent background, no plate, no text, photorealistic, 4k" |
| `hero-chocobrick.png` | Choco Brick cut in half | "A rectangular chocolate brick cake cut cleanly in half, the cut face showing dense fudge layers and molten chocolate centre, one half leaning on the other, glossy ganache top, isolated on a transparent background, warm studio light, photorealistic" |
| `hero-bun.png` | Tandoori chicken bun torn open | "A golden glazed bun torn open to show a spicy tandoori chicken filling with melted cheese stretching between the halves, sesame seeds on top, isolated on a transparent background, warm studio light, photorealistic" |
| `hero-tart.png` | Fruit tart slice | "A slice of fruit tart with glossy kiwi, strawberry and blueberry on vanilla custard in a crisp pastry shell, three-quarter view, isolated on a transparent background, warm studio light, photorealistic" |
| `hero-buns.png` | Triangle buns / bread | "Three soft golden triangle buns stacked in a small pyramid with a sliced white sandwich loaf behind them, isolated on a transparent background, warm morning light, photorealistic" |
| `peek-*.png` | Smaller versions of each for the side peeks | The same files can be reused, scaled down |

Best results: photograph the real products in store on a plain white sheet, then cut them out. Generated food should be checked against the real product so the site does not promise something different.

#### Particle sprites (PNG with alpha, 256 px each, 4–6 per slide)

- Slide 1: buttercream rosette (pink, ivory, plum), gold sprinkle, sugar pearl
- Slide 2: chocolate shard (3 shapes), cocoa crumb
- Slide 3: sesame seed, chilli flake, bread crumb
- Slide 4: blueberry, kiwi cube, strawberry cube, glaze droplet
- Slide 5: flour puff, sugar crystal

Prompt pattern: "Single [chocolate shard], isolated on a transparent background, top light, photorealistic, sharp, no shadow".

#### Short loops (optional, WebM VP9 with alpha + MP4 fallback, 3–4 s, seamless)

- `steam.webm`: a wisp of steam on transparent black, for the bun slide
- `drip.webm`: chocolate sauce drip, for the Choco Brick slide
- `flour.webm`: flour dust drifting, for the bread slide

If loops are not supplied, these effects are drawn in code (canvas or SVG) and still work.

#### Category tile cut-outs (PNG with alpha, 800 px)

One per category in the master prompt's category list (cake, slice, savory bun, bread, choco brick, drinks if served).

<!-- END ANIMATION SCRIPT -->

## IMPLEMENTATION NOTES FOR THE HERO

- Build the hero as one component with a GSAP master timeline per slide change (`gsap.context` inside `useGsap`, reverted on unmount).
- Slides come from data (`src/content/heroSlides.ts`: background stops, eyebrow, headline lines, product image, particle sprite ids, CTAs with product ids), so the client can swap a slide without touching code.
- Particles: absolutely positioned `<img>` sprites (≤ 28) animated with GSAP. Pointer parallax with `gsap.quickTo`. No canvas needed unless profiling says so.
- Motion-blur sweep: an inline SVG filter (`feGaussianBlur stdDeviation="14 0"`) applied to the stage for 300 ms; skip it on phones and when reduced motion is on.
- Pause everything (autoplay, float loops, particles) when the hero is off-screen (`IntersectionObserver`) or the tab is hidden.

## QUALITY BAR (definition of done)

- **Performance:** Lighthouse mobile ≥ 85 performance, ≥ 95 accessibility, best practices and SEO. LCP < 2.5 s on 4G. The hero's first product image is preloaded; GSAP plugins load after first paint.
- **Accessibility:** keyboard reachable everything; visible focus ring (gold, 3 px); carousel is a labelled region with real buttons; contrast checked against the table above; `prefers-reduced-motion` fully respected as described in the script.
- **Responsive:** 360, 390, 768, 1024, 1440, 1920 px. No horizontal scroll. 16 px side gutter on phones. Hero headline never wraps to 3 lines.
- **Content honesty:** no invented prices, ratings, reviews, counts or awards. Unknown values render as "Ask in store" or are hidden.
- **SEO:** each route prerendered with its own title and description; `Product` and `Bakery` JSON-LD (`LocalBusiness` for each outlet); Open Graph image.
- **Code:** typed content files are the single source of truth; no product data hard-coded in components; no new dependencies beyond the ones listed.

## WORK PLAN (do it in this order, commit after each)

1. Routing, layout shell, header, footer, cart store, content model and categories.
2. Menu page and product card, product page / quick view, cart drawer.
3. Checkout and WhatsApp order hand-off, order confirmation.
4. Hero carousel (S1) with placeholder cut-outs, then the intro (S0).
5. Home page sections S2, S3, S6, S7 and the add-to-cart flight (S4).
6. Real assets in, image pipeline run, performance and accessibility pass, prerender check, screenshots at all six widths.

## ASK ME BEFORE GUESSING

- Facebook, TikTok, WhatsApp numbers per outlet, PickMe link
- Full price list and sizes for celebration cakes
- Whether Spunchy serves drinks
- Opening hours and addresses for each outlet
- Cake lead time and cut-off rule
- Which products are the best sellers
