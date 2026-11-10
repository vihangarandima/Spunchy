// The menu. Names and prices (LKR) come from Spunchy's in-store price labels (photos of
// 2026-11-08) and their Instagram promos. NOTHING here is invented: a price of `null`
// shows "Ask in store" and the item cannot be added to the cart until the client confirms it.
// image: an id from src/assets/images/manifest.json, or null for a typographic disc.
// stock: true marks a licensed stock stand-in (docs/premium/credits.md) until Spunchy's own
// photo is supplied; the product page says "Photo for illustration".

import { categories, type CategorySlug } from './categories'

export type ProductOption = { label: string; price: number | null }

export type Product = {
  id: string
  slug: string
  name: string
  category: CategorySlug
  description: string | null
  image: string | null
  cutout: boolean
  price: number | null // used when there are no options
  options?: ProductOption[]
  flavours?: string[]
  allowsMessage?: boolean
  messageCharge?: number
  addOns?: { id: string; name: string; price: number }[]
  tags?: ('bestseller' | 'new' | 'viral' | 'veg' | 'spicy')[]
  available: boolean
  source: 'label' | 'instagram' | 'store' | 'client'
  /** The photo is a licensed stock stand-in, not Spunchy's own product. Labelled on the page. */
  stock?: boolean
}

const p = (x: Omit<Product, 'slug' | 'available' | 'cutout'> & Partial<Pick<Product, 'available' | 'cutout'>>): Product => ({
  slug: x.id,
  available: true,
  cutout: false,
  ...x,
})

export const products: Product[] = [
  // Celebration cakes: sizes and prices to be supplied by the client.
  p({ id: 'rosette-celebration-cake', name: 'Rosette Celebration Cake', category: 'celebration-cakes', description: 'Buttercream rosettes in pink, ivory and plum. The cake in every Spunchy cabinet.', image: 'cake-rosettes-cut', cutout: true, price: null, options: [{ label: '500 g', price: null }, { label: '1 kg', price: null }, { label: '2 kg', price: null }], allowsMessage: true, tags: ['bestseller'], source: 'store' }),
  p({ id: 'rainbow-cake', name: 'Rainbow Cake', category: 'celebration-cakes', description: 'Layers of colour for birthdays.', image: 'stock-rainbow-cake', stock: true, price: null, allowsMessage: true, source: 'instagram' }),
  p({ id: 'chocolate-gateau', name: 'Chocolate Gateau', category: 'celebration-cakes', description: 'Whole chocolate gateau, made to order.', image: 'stock-chocolate-gateau', stock: true, price: null, allowsMessage: true, source: 'store' }),

  // Signatures
  p({ id: 'choco-brick', name: 'Choco Brick', category: 'signature', description: 'The viral one. Dense, fudgy, cut open to show the inside.', image: 'stock-choco-brick-cut', cutout: true, stock: true, price: 350, tags: ['viral', 'bestseller'], source: 'instagram' }),

  // Slices & pastries (in-store labels)
  p({ id: 'fruit-tart', name: 'Fruit Tart', category: 'slices', description: 'Glossy fruit on vanilla custard in a crisp shell.', image: 'fruit-tart-cut', cutout: true, price: 290, tags: ['bestseller'], source: 'label' }),
  p({ id: 'nuga-gateau-slice', name: 'Nuga Gateau Slice', category: 'slices', description: null, image: 'tray-nuga', price: 290, source: 'label' }),
  p({ id: 'blueberry-gateau-slice', name: 'Blueberry Gateau Slice', category: 'slices', description: null, image: 'tray-blueberry', price: 260, tags: ['bestseller'], source: 'label' }),
  p({ id: 'chocolate-gateau-slice', name: 'Chocolate Gateau Slice', category: 'slices', description: null, image: 'tray-choc-gateau', price: 270, source: 'label' }),
  p({ id: 'coffee-slice', name: 'Coffee Slice', category: 'slices', description: null, image: 'tray-coffee', price: 200, source: 'label' }),
  p({ id: 'mousse', name: 'Mousse', category: 'slices', description: null, image: 'tray-mousse', price: 280, source: 'label' }),

  // Savory
  p({ id: 'tandoori-chicken-bun', name: 'Tandoori Chicken Bun', category: 'savory', description: 'Spicy tandoori chicken in a soft glazed bun.', image: 'stock-tandoori-bun-cut', cutout: true, stock: true, price: 290, tags: ['bestseller', 'spicy'], source: 'instagram' }),
  p({ id: 'cheesy-chicken-roll', name: 'Cheesy Chicken Roll', category: 'savory', description: null, image: 'stock-cheesy-chicken-roll', stock: true, price: 200, source: 'label' }),
  p({ id: 'triangle-bun', name: 'Triangle Bun', category: 'savory', description: 'Soft, fluffy and filled.', image: 'buns-triangle-cut', cutout: true, price: null, source: 'store' }),
  p({ id: 'smoke-chicken-roll', name: 'Smoke Chicken Roll', category: 'savory', description: null, image: 'stock-smoke-chicken-roll', stock: true, price: null, source: 'instagram' }),
  p({ id: 'cutlet', name: 'Cutlet', category: 'savory', description: null, image: null, price: null, source: 'instagram' }),

  // Bread & bakery
  p({ id: 'sandwich-bread', name: 'Sandwich Bread', category: 'bakery', description: 'Soft white loaf, baked every morning.', image: 'stock-sandwich-bread', stock: true, price: 200, source: 'label' }),
  p({ id: 'sugar-bun-pack', name: 'Sugar Bun Pack', category: 'bakery', description: null, image: null, price: null, source: 'store' }),
  p({ id: 'cookies', name: 'Cookies', category: 'bakery', description: null, image: 'stock-cookies', stock: true, price: null, source: 'store' }),
]

export const productBySlug = (slug: string) => products.find((x) => x.slug === slug)
export const productsIn = (cat: CategorySlug) => products.filter((x) => x.category === cat)

/** Categories that have at least one product (empty ones, e.g. drinks, stay hidden). */
export const liveCategories = categories.filter((c) => products.some((x) => x.category === c.slug))

/** Lowest known price, for "from Rs. X" on cards with options. */
export function fromPrice(x: Product): number | null {
  if (!x.options?.length) return x.price
  const known = x.options.map((o) => o.price).filter((v): v is number => v !== null)
  return known.length ? Math.min(...known) : null
}

export const bestSellers = products.filter((x) => x.tags?.includes('bestseller'))

export const formatLKR = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`
export const formatPrice = (n: number | null) => (n === null ? 'Ask in store' : formatLKR(n))
