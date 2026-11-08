// Seed menu. Names and prices (LKR) were read from the price labels in the
// shop photos of 2026-11-08. price: null = label unreadable -> "Ask in store".
// name_si values are DRAFTS (not reviewed by a native speaker) — see
// CONTENT_TO_CONFIRM.md. Stock numbers are sample values for demo mode only;
// the real numbers come from the admin page once Supabase is connected.

export const CATEGORIES = [
  { id: 'pastries', name_en: 'Pastries', name_si: 'පේස්ට්‍රි', image: 'poster-savory', line_en: 'Crispy, crunchy, crave-worthy.', line_si: null },
  { id: 'bakery', name_en: 'Bakery items', name_si: 'බේකරි නිෂ්පාදන', image: 'poster-fresh', line_en: 'Soft, fluffy & fresh.', line_si: null },
  { id: 'cakes', name_en: 'Cakes', name_si: 'කේක්', image: 'poster-love', line_en: 'Cake is the language of love.', line_si: null },
  { id: 'coffee', name_en: 'Coffee', name_si: 'කෝපි', image: null, line_en: null, line_si: null },
  { id: 'tea', name_en: 'Tea', name_si: 'තේ', image: null, line_en: null, line_si: null },
];

const p = (id, category, name_en, name_si, price, stock, image = null) => ({
  id,
  category,
  name_en,
  name_si,
  description_en: null,
  description_si: null,
  price,
  stock,
  is_available: true,
  image,
  updated_at: new Date(Date.UTC(2026, 10, 8, 4, 0)).toISOString(),
});

export const SEED_PRODUCTS = [
  // Cakes & slices
  p('nuga-gateau-slice', 'cakes', 'Nuga Gateau Slice', 'නූගා ගැටෝ පෙත්ත', 290, 14, 'tray-nuga'),
  p('mousse', 'cakes', 'Mousse', 'මූස්', 280, 9, 'tray-mousse'),
  p('chocolate-gateau-slice', 'cakes', 'Chocolate Gateau Slice', 'චොකලට් ගැටෝ පෙත්ත', 270, 6, 'tray-choc-gateau'),
  p('blueberry-gateau-slice', 'cakes', 'Blueberry Gateau Slice', 'බ්ලූබෙරි ගැටෝ පෙත්ත', 260, 8, 'tray-blueberry'),
  p('pineapple-gateau-slice', 'cakes', 'Pineapple Gateau Slice', 'අන්නාසි ගැටෝ පෙත්ත', 260, 10),
  p('fudge-cake-slice', 'cakes', 'Fudge Cake Slice', 'ෆජ් කේක් පෙත්ත', 280, 5),
  p('chocolate-mini-dessert-cake', 'cakes', 'Chocolate Mini Dessert Cake', 'චොකලට් මිනි ඩෙසට් කේක්', 360, 4),
  p('double-chocolate-brownie-slice', 'cakes', 'Double Chocolate Brownie Slice', 'ඩබල් චොකලට් බ්‍රව්නි පෙත්ත', 460, 6),
  p('chocolate-ganache-slice', 'cakes', 'Chocolate Ganache Slice', 'චොකලට් ගනාෂ් පෙත්ත', 190, 7),
  p('ribbon-slice', 'cakes', 'Ribbon Slice', 'රිබන් පෙත්ත', 180, 12),
  p('chocolate-triangle-slice', 'cakes', 'Chocolate Triangle Slice', 'චොකලට් ත්‍රිකෝණ පෙත්ත', 190, 0),
  p('golden-pineapple-upside-down', 'cakes', 'Golden Pineapple Upside-Down', 'ගෝල්ඩන් පයිනැපල් අප්සයිඩ්-ඩවුන්', 1300, 2),
  p('fruit-tart', 'cakes', 'Fruit Tart', 'ෆෲට් ටාට්', 290, 0),
  p('coffee-slice', 'cakes', 'Coffee Slice', 'කෝපි පෙත්ත', 200, 11, 'tray-coffee'),
  // Bakery items
  p('sandwich-bread', 'bakery', 'Sandwich Bread', 'සැන්ඩ්විච් පාන්', 200, 15, 'bread'),
  p('brownie', 'bakery', 'Brownie', 'බ්‍රව්නි', 180, 10),
  p('crunchies', 'bakery', 'Crunchies', 'ක්‍රන්චීස්', 100, 18),
  p('eclair', 'bakery', 'Eclair', 'එක්ලෙයාර්', 230, 6),
  p('vanilla-cupcake', 'bakery', 'Vanilla Cupcake', 'වැනිලා කප්කේක්', 100, 12),
  p('cream-bun', 'bakery', 'Cream Bun', 'ක්‍රීම් බනිස්', 100, 9),
  p('sugar-bun-pack', 'bakery', 'Sugar Bun Pack', 'සීනි බනිස් පැකට්ටුව', null, 5),
  // Pastries (savoury)
  p('cheesy-chicken-roll', 'pastries', 'Cheesy Chicken Roll', 'චීසි චිකන් රෝල්', 200, 8),
];
