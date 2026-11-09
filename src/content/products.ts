// The cabinet. Names and prices (LKR) are from Spunchy's in-store price labels
// (photos of 2026-11-08) and their Instagram promos. price: null shows "Ask in store".
// image: an id from src/assets/images/manifest.json, or null for a typographic card.

export type Product = {
  id: string
  name: string
  price: number | null
  image: string | null
  cutout?: boolean // the image is a transparent cut-out (sits on the stage, no frame)
  kind: 'Cake' | 'Slice' | 'Savory' | 'Bakery'
  source: 'label' | 'instagram'
}

export const products: Product[] = [
  { id: 'celebration-cake', name: 'Rosette celebration cake', price: null, image: 'cake-rosettes-cut', cutout: true, kind: 'Cake', source: 'label' },
  { id: 'fruit-tart', name: 'Fruit Tart', price: 290, image: 'fruit-tart-cut', cutout: true, kind: 'Slice', source: 'label' },
  { id: 'nuga-gateau-slice', name: 'Nuga Gateau Slice', price: 290, image: 'tray-nuga', kind: 'Slice', source: 'label' },
  { id: 'blueberry-gateau-slice', name: 'Blueberry Gateau Slice', price: 260, image: 'tray-blueberry', kind: 'Slice', source: 'label' },
  { id: 'chocolate-gateau-slice', name: 'Chocolate Gateau Slice', price: 270, image: 'tray-choc-gateau', kind: 'Slice', source: 'label' },
  { id: 'coffee-slice', name: 'Coffee Slice', price: 200, image: 'tray-coffee', kind: 'Slice', source: 'label' },
  { id: 'mousse', name: 'Mousse', price: 280, image: 'tray-mousse', kind: 'Slice', source: 'label' },
  { id: 'choco-brick', name: 'Choco Brick', price: 350, image: null, kind: 'Slice', source: 'instagram' },
  { id: 'tandoori-chicken-bun', name: 'Tandoori Chicken Bun', price: 290, image: null, kind: 'Savory', source: 'instagram' },
  { id: 'cheesy-chicken-roll', name: 'Cheesy Chicken Roll', price: 200, image: null, kind: 'Savory', source: 'label' },
  { id: 'sandwich-bread', name: 'Sandwich Bread', price: 200, image: 'bread', kind: 'Bakery', source: 'label' },
]

export const formatPrice = (p: number | null) => (p === null ? 'Ask in store' : `Rs. ${p}`)
