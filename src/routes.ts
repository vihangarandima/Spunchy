// Route list for prerendering + per-route <title> and description.
import { liveCategories, products, productBySlug, formatPrice, fromPrice } from './content/products'
import { categoryBySlug } from './content/categories'

const SITE = 'Spunchy'
const DEFAULT_DESC = 'Spunchy, a premium pastry & bakery brand in Sri Lanka. Freshly baked cakes, savories & more at Kottawa, Boralesgamuwa, Piliyandala and Kotikawatta. Order online for pickup.'

/** Every URL written to dist at build time. */
export const staticRoutes = ['/', '/menu', ...liveCategories.map((c) => `/menu/${c.slug}`), ...products.map((p) => `/product/${p.slug}`), '/outlets', '/about', '/checkout']

export function routeMeta(path: string): { title: string; description: string } {
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/') return { title: `${SITE} | Premium Pastry & Bakery · Order cakes, slices & savory online`, description: DEFAULT_DESC }
  if (clean === '/menu') return { title: `Menu & prices | ${SITE}`, description: 'Every cake, slice, bun and loaf at Spunchy with prices in rupees. Order online for pickup.' }
  const cat = clean.match(/^\/menu\/([^/]+)$/)
  if (cat) {
    const c = categoryBySlug(cat[1])
    if (c) return { title: `${c.name} | ${SITE}`, description: `${c.name} at Spunchy: ${c.short}. See prices and order online for pickup.` }
  }
  const prod = clean.match(/^\/product\/([^/]+)$/)
  if (prod) {
    const p = productBySlug(prod[1])
    if (p) return { title: `${p.name} · ${formatPrice(fromPrice(p))} | ${SITE}`, description: p.description ?? `${p.name} from Spunchy. ${formatPrice(fromPrice(p))}. Order online for pickup.` }
  }
  if (clean === '/outlets') return { title: `Outlets | ${SITE}`, description: 'Spunchy in Kottawa, Boralesgamuwa, Piliyandala and Kotikawatta.' }
  if (clean === '/about') return { title: `About | ${SITE}`, description: DEFAULT_DESC }
  if (clean === '/checkout') return { title: `Checkout | ${SITE}`, description: DEFAULT_DESC }
  if (clean.startsWith('/order/')) return { title: `Order placed | ${SITE}`, description: DEFAULT_DESC }
  return { title: `Not found | ${SITE}`, description: DEFAULT_DESC }
}
