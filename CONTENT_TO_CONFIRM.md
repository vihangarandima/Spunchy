# Content to confirm

Nothing on the site states a fact we haven't verified. Anything unknown is
`null` in `src/content/business.js` and its section stays hidden until it's filled in.
Each item below has a recommended default.

## Facts about the shop (blocking launch)

| Item | Where it goes | Status / default |
|---|---|---|
| Street address | `business.streetAddress` | Unknown. A "18" is visible on the pillar in the photos, but that isn't assumed. Only "Kottawa" is shown. |
| Phone number | `business.phone` | Unknown. The Call button is hidden. |
| WhatsApp number for orders | `business.whatsapp` | Unknown. "Send on WhatsApp" is hidden; "Copy list" still works. |
| Google Maps pin | `business.mapsUrl` | Currently a *search* for "Spunchy Kottawa". Replace it with the real place link. |
| Opening hours | `business.hours` | Unknown. The hours card is hidden. |
| Delivery? | `business.services.delivery` | Unknown, hidden. Dine-in and takeaway are shown because both are visible in the photos (seating, cake boxes). |
| Other branches | — | Assumed none. |
| Instagram / TikTok | `business.socials` | Not linked. Only Facebook (Spunchylk) is shown, as the brief instructed. |
| Domain | `.env` → `SITE_URL` | Unknown. Canonical URL and sitemap.xml switch on once it's set. |

## Brand

- **Logo:** we only have photos of the shop sign and a cake box (`assets/brand/`). Needed: SVG or high-res PNG with a transparent background, in light and dark variants. The sign photo looks pinkish because of the daylight it was taken in.
- **Colours** in `brand.json` are approximated from photos. Swap in the exact values when the logo file arrives.
- **Contrast:** the swash yellow `#F5B026` fails WCAG AA as text on cream (1.8:1). It's used only on dark backgrounds (8.8:1) or as decoration. For yellow-ish text on light backgrounds, use the proposed variant `#8A5A00` (5.6:1).

## Menu

Prices were read from the price labels in the 2026-11-08 photos. Please check every one.

- **Unreadable prices, shown as "Ask in store":** Sugar Bun Pack.
- **Labels too blurry to include at all:** the whole cakes in the tall cabinet (Strawberry Gateau, Chocolate Gateau Large Cake, Rainbow Mini Cake and others), "Choco Brick", and a second chicken bun item.
- **Spelling:** the label says "Eclar". The site uses "Eclair".
- **Starting stock:** the numbers in demo mode are **samples**, and the page says so. Real stock gets set from the staff page.
- **Coffee and Tea:** no items were visible in the photos. Those chapters say "Ask at the counter for today's selection" until a list arrives.
- **Product photos:** only 6 items have a usable close-up photo (crops were made to exclude the printed price labels, so a photo never contradicts a live price). The rest show a lettered tile. Recommended: a 30-minute product shoot on a plain board.
- **Descriptions:** left empty on purpose. We'd rather use the client's own words than invent them.

## Sinhala (needs native review)

**Every Sinhala string is a draft** written without a native-speaker review:
UI copy in `src/content/strings.js`, product names (`name_si`) in
`src/content/products.js`, and category names. Open the site with `?review`
and switch to සිංහල to see all draft text underlined. Please have the client
(or a translator) correct them before launch. The English chapter lines from
the posters ("Soft, fluffy & fresh"…) have no Sinhala version yet (`line_si: null`).

## Photos and privacy

The source photos showed bystanders, a rider and number plates. The committed
masters in `assets/photos/` are crops without identifiable people. A parked car
is still visible through the shopfront glass. Confirm the client is happy for
interior photos to be published.

## Still open from the brief

- §1–6 of the brief were not supplied. The 3D approach was picked as a default (see `DESIGN_PLAN.md`).
- Custom cake enquiries: not built (default: later).
- Online payments: not built (default: later). The order list is a shareable list, not a checkout.
- Tamil: not included (default: English + Sinhala only).
- Supabase / hosting account ownership: to decide. The site runs in demo mode until keys are added.
