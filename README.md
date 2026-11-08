# Spunchy: Pastry & Bakery, Kottawa

A live menu website for Spunchy. Prices and stock change on the public page
within about a second of a staff edit. It's bilingual (English and Sinhala
drafts), with a lightweight 3D hero that switches itself off on weak devices.

Built with Vite, React 18 and three.js (lazy-loaded). Supabase provides data,
realtime updates and staff login, and is optional: without keys the site runs on
demo data.

```bash
npm install
npm run dev        # http://localhost:5175  (perf monitor logs to the console)
npm run build      # dist/ — prerendered HTML + hashed assets
npm run preview    # http://localhost:4174
npm run budget     # check the JS budget on dist/
npm run images     # regenerate AVIF/WebP/JPEG + favicon + OG image from assets/
npm run seed-sql   # regenerate supabase/seed.sql from src/content/products.js
```

The staff page is at `/admin`. Open it in a second window next to the public
page to see live updates. In demo mode it needs no login and changes are kept
in that browser.

## Read next

- `DESIGN_PLAN.md`: design direction, 3D choice, measured performance and known gaps
- `CONTENT_TO_CONFIRM.md`: every fact still waiting for the client
- `ADMIN_GUIDE.md`: plain-language guide for bakery staff
- `brand.json`: colours (with contrast ratios), type and voice

## Where things live

```
assets/photos/        source photos (cropped, no bystanders) -> npm run images
assets/brand/         logo crops from photos (vector logo still needed)
public/img/           generated responsive images (committed)
src/content/          business facts, products, UI strings (EN + SI drafts)
src/lib/              store (supabase | mock), i18n, device tier, perf monitor, <Img>
src/sections/         Hero, FreshNow, Chapters, Menu, OrderList, Space, Visit/Footer
src/three/            sprinkles.js — the lazy 3D scene
src/admin/            /admin staff page (lazy chunk)
supabase/             schema.sql (tables, RLS, realtime), seed.sql
scripts/              images, prerender, budget, seed-sql
```

## Go live with Supabase

1. Create a Supabase project. Note who owns the account (see CONTENT_TO_CONFIRM).
2. In the SQL editor run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Authentication → Providers → Email: keep it on and **turn off "Allow new users to sign up"**.
   Authentication → URL configuration: add `https://<domain>/admin` as a redirect URL.
4. Add each staff member under Authentication → Users, then run the
   `insert into public.staff …` line at the bottom of `schema.sql` for them.
5. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (Project settings → API). **Never use the
   service_role key in this app.**

Security model: anyone can read `products`. Only users listed in `staff` can
update them, and only `price`, `stock` and `is_available` (a database trigger
rejects other changes). There are no insert/delete policies. The anon key is
public by design, and RLS is what protects the data.

## Deploy (Vercel)

1. New project → import this repo (root directory: the repo root).
   The framework is detected as Vite. Build command: `npm run build`. Output: `dist`.
2. Environment variables: `SITE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. `vercel.json` rewrites only `/admin` to the app, so any other unknown path
   gets the branded `404.html`. It also sets cache and security headers.

## Content rules

- Unknown facts stay `null` in `src/content/business.js`. The UI hides them, never guesses.
- Sinhala strings are drafts until reviewed. Open `/?review` and switch to
  සිංහල to see them underlined.
- Product photos must not show printed price labels (they would contradict live prices).

## Accessibility and motion

Semantic landmarks, a skip link, visible focus, 44 px+ touch targets, a
`<dialog>` order list, and alt text written from the photos. Under
`prefers-reduced-motion` there is no 3D, no parallax and no animation; the
layout and photos stay the same. Lighthouse Accessibility is 100.
