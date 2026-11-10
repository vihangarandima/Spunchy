# Stock photos and videos

Spunchy's own photos (assets/raw, from the store visit) are used wherever they exist. Where
there is no photo of a product yet, a licensed stock photo stands in. Every product that
uses one has `stock: true` in `src/content/products.ts`, and its product page says
"Photo for illustration". Replace them with Spunchy's own shots when they arrive (drop the
file in `assets/raw`, point the entry in `scripts/images.config.mjs` at it, run
`npm run images`, then remove `stock: true`).

## Photos: Unsplash

Licence: https://unsplash.com/license (free for commercial use, no attribution required,
may not be sold unaltered or used to build a competing service).

| Image id | Used for | Source |
|---|---|---|
| `stock-choco-brick` (+ `-cut`) | Choco Brick, hero slide 2 | https://images.unsplash.com/photo-1636743715220-d8f8dd900b87 |
| `stock-tandoori-bun` (+ `-cut`) | Tandoori Chicken Bun, hero slide 3 | https://images.unsplash.com/photo-1646544195611-d53d8d334ee4 |
| `stock-sandwich-bread` | Sandwich Bread, Bread & Bakery tile | https://images.unsplash.com/photo-1598373182308-3270495d2f58 |
| `stock-rainbow-cake` | Rainbow Cake | https://images.unsplash.com/photo-1622576890453-8e50b6f7d5b0 |
| `stock-chocolate-gateau` | Chocolate Gateau | https://images.unsplash.com/photo-1606983340126-99ab4feaa64a |
| `stock-cheesy-chicken-roll` | Cheesy Chicken Roll | https://images.unsplash.com/photo-1619445832874-8b153f60ae78 |
| `stock-smoke-chicken-roll` | Smoke Chicken Roll | https://images.unsplash.com/photo-1743012492397-c6680eaa2c5d |
| `stock-cookies` | Cookies | https://images.unsplash.com/photo-1782227149180-2d321c5042ed |

Originals: `assets/raw/stock/`.

## Videos: Mixkit

Licence: https://mixkit.co/license/#videoFree (Mixkit Stock Video Free License: free for
commercial use, no attribution required). Trimmed to 8–9 s, re-encoded at 720p without
audio; the original files are not kept in the repo.

| File | Used for | Source |
|---|---|---|
| `public/media/candles.mp4` | "LOVE" poster band background | https://mixkit.co/free-stock-video/cake-with-burning-candles-in-the-dark-5109/ |
| `public/media/chocolate-fall.mp4` | Hero slide 2 (Choco Brick), blended into the gold | https://mixkit.co/free-stock-video/pile-of-pieces-of-chocolate-bars-falling-down-41117/ |
| `public/media/pastries.mp4` | "Baked fresh, every morning" band | https://mixkit.co/free-stock-video/freshly-baked-pastry-29330/ |
| `public/media/bakery-display.mp4` | Outlets section background | https://mixkit.co/free-stock-video/baked-goods-in-a-bakery-display-21927/ |

Each has a `.webp` poster frame next to it, shown before the video loads and to visitors
with reduced motion or Save-Data on.
