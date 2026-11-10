// Menu categories, in menu order. `disc` is the coloured circle every product of the
// category sits on (cards, category tiles). Names can change once the client confirms.

export type CategorySlug = 'celebration-cakes' | 'signature' | 'slices' | 'savory' | 'bakery' | 'drinks'

export type Category = {
  slug: CategorySlug
  name: string
  short: string // one line under the name
  disc: string // tile / card disc colour
  discInk: 'light' | 'dark' // text colour that reads on the disc
  image: string | null // representative cut-out or photo id
}

export const categories: Category[] = [
  { slug: 'celebration-cakes', name: 'Celebration Cakes', short: 'Rosettes, gateaux and the cake for the day', disc: '#F3C9CF', discInk: 'dark', image: 'cake-rosettes-cut' },
  { slug: 'signature', name: 'Spunchy Signatures', short: 'The viral ones', disc: '#F7B836', discInk: 'dark', image: 'stock-choco-brick-cut' },
  { slug: 'slices', name: 'Slices & Pastries', short: 'A slice of heaven in every bite', disc: '#E7C6D6', discInk: 'dark', image: 'fruit-tart-cut' },
  { slug: 'savory', name: 'Savory', short: 'Crispy, crunchy, crave-worthy', disc: '#F2D2A9', discInk: 'dark', image: 'buns-triangle-cut' },
  { slug: 'bakery', name: 'Bread & Bakery', short: 'Soft, fluffy & fresh every morning', disc: '#EAD7BF', discInk: 'dark', image: 'stock-sandwich-bread' },
  // Hidden while empty: only shown if Spunchy confirms they serve drinks.
  { slug: 'drinks', name: 'Drinks', short: 'Something to go with it', disc: '#D9C2B0', discInk: 'dark', image: null },
]

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug)
