// The five hero slides (animation script, S1). Swap a slide here without touching code.
// Headlines are Spunchy's own poster and Instagram lines; prices come from products.ts.

export type ParticleKind = 'rosette-pink' | 'rosette-ivory' | 'rosette-plum' | 'sprinkle' | 'shard' | 'crumb' | 'sesame' | 'chilli' | 'blueberry' | 'kiwi' | 'strawberry' | 'flour' | 'sugar'

export type HeroSlide = {
  id: string
  /** Stage background (CSS). */
  background: string
  /** Text tone: 'light' = icing text (dark slide), 'dark' = ink text. */
  tone: 'light' | 'dark'
  accent: string // eyebrow pill + ghost headline tint
  eyebrow: string
  headline: [string, string]
  copy: string
  productId: string // from products.ts; supplies the image and price
  /** Scale of the product inside its box (photos differ in framing). */
  productScale?: number
  particles: ParticleKind[]
  ambient?: 'spotlight' | 'steam' | 'flour' | 'shine'
  primary: { label: string; action: 'add' | 'link'; to?: string }
  secondary: { label: string; to: string }
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'love',
    background: 'radial-gradient(60% 70% at 62% 45%, #8a1d2c 0%, #5a101b 45%, #3a0a12 100%)',
    tone: 'light',
    accent: '#F7B836',
    eyebrow: 'Cakes for every celebration',
    headline: ['Cake is the', 'language of love'],
    copy: 'Buttercream rosettes in pink, ivory and plum. Order the cake for the day and pick it up at your nearest Spunchy.',
    productId: 'rosette-celebration-cake',
    particles: ['rosette-pink', 'rosette-ivory', 'rosette-plum', 'sprinkle'],
    ambient: 'spotlight',
    primary: { label: 'Order a cake', action: 'link', to: '/product/rosette-celebration-cake' },
    secondary: { label: 'See all cakes', to: '/menu/celebration-cakes' },
  },
  {
    id: 'brick',
    background: 'radial-gradient(60% 70% at 62% 45%, #ffd067 0%, #f7b836 45%, #c98a2e 100%)',
    tone: 'dark',
    accent: '#7A1523',
    eyebrow: 'The viral one',
    headline: ['Viral', 'Choco Brick'],
    copy: 'Dense, fudgy and cut open to show the inside. The one everyone is posting.',
    productId: 'choco-brick',
    productScale: 0.95,
    particles: ['shard', 'shard', 'crumb', 'sprinkle'],
    primary: { label: 'Add', action: 'add' },
    secondary: { label: 'All signatures', to: '/menu/signature' },
  },
  {
    id: 'savory',
    background: 'radial-gradient(60% 70% at 62% 45%, #fffaf3 0%, #f6e7da 50%, #ecd3bd 100%)',
    tone: 'dark',
    accent: '#7A1523',
    eyebrow: 'Savory',
    headline: ['Crispy. Crunchy.', 'Crave-worthy'],
    copy: 'Spicy tandoori chicken in a soft glazed bun, straight from the savory shelf.',
    productId: 'tandoori-chicken-bun',
    particles: ['sesame', 'sesame', 'chilli', 'crumb'],
    ambient: 'steam',
    primary: { label: 'Add', action: 'add' },
    secondary: { label: 'All savory', to: '/menu/savory' },
  },
  {
    id: 'heaven',
    background: 'radial-gradient(60% 70% at 62% 45%, #a24c74 0%, #6b2a4a 50%, #4a1832 100%)',
    tone: 'light',
    accent: '#F7B836',
    eyebrow: 'Slices & pastries',
    headline: ['A slice of', 'heaven'],
    copy: 'Glossy fruit on vanilla custard in a crisp shell. A slice of heaven in every bite.',
    productId: 'fruit-tart',
    productScale: 1.05,
    particles: ['blueberry', 'kiwi', 'strawberry', 'blueberry'],
    ambient: 'shine',
    primary: { label: 'Add', action: 'add' },
    secondary: { label: 'All slices', to: '/menu/slices' },
  },
  {
    id: 'fresh',
    background: 'radial-gradient(60% 70% at 62% 45%, #fffaf5 0%, #f3e2cc 45%, #c9a27c 100%)',
    tone: 'dark',
    accent: '#7A1523',
    eyebrow: 'Fresh every morning',
    headline: ['Soft, fluffy', '& fresh'],
    copy: 'Triangle buns and bread, baked every morning at all four outlets.',
    productId: 'triangle-bun',
    particles: ['flour', 'sugar', 'flour', 'sugar'],
    ambient: 'flour',
    primary: { label: 'Order for pickup', action: 'link', to: '/menu/bakery' },
    secondary: { label: 'Find an outlet', to: '/outlets' },
  },
]
