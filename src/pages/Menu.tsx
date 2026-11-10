// /menu (everything, grouped) and /menu/:category (one category, FLIP-animated filter).
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { MenuByCategory } from '../sections/MenuByCategory'
import { liveCategories, productsIn, products, fromPrice } from '../content/products'
import { categoryBySlug } from '../content/categories'
import { Flip, gsap, prefersReducedMotion } from '../lib/motion'
import { NotFound } from './NotFound'

type Sort = 'menu' | 'price-asc' | 'price-desc'

export function Menu() {
  const { category } = useParams()
  const cat = category ? categoryBySlug(category) : null
  if (category && (!cat || !productsIn(cat.slug).length)) return <NotFound />

  return (
    <div className="pb-24">
      <header className="px-(--space-gutter) pt-12 md:pt-16">
        <nav aria-label="Breadcrumb" className="font-display text-micro text-ink/60">
          <Link to="/" className="hover:text-ink">Home</Link> / {cat ? <Link to="/menu" className="hover:text-ink">Menu</Link> : 'Menu'}
          {cat && <> / {cat.name}</>}
        </nav>
        <h1 className="punch mt-4 text-display uppercase">{cat ? cat.name : 'The menu'}</h1>
        <p className="lede mt-3 max-w-2xl text-ink/70">{cat ? cat.short : 'Every cake, slice, bun and loaf at Spunchy, with today’s prices. Prices marked “Ask in store” are being confirmed.'}</p>
        <ul className="no-scrollbar -mx-(--space-gutter) mt-8 flex gap-2 overflow-x-auto px-(--space-gutter)" data-lenis-prevent-horizontal>
          <li className="shrink-0">
            <Link to="/menu" className="chip" aria-current={!cat ? 'page' : undefined}>
              All
            </Link>
          </li>
          {liveCategories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link to={`/menu/${c.slug}`} className="chip" aria-current={cat?.slug === c.slug ? 'page' : undefined}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </header>
      {cat ? <CategoryGrid slug={cat.slug} /> : <MenuByCategory idPrefix="menu" navBg="bg-paper/95" />}
    </div>
  )
}

function CategoryGrid({ slug }: { slug: (typeof liveCategories)[number]['slug'] }) {
  const [sort, setSort] = useState<Sort>('menu')
  const [onlyPriced, setOnlyPriced] = useState(false)
  const grid = useRef<HTMLDivElement>(null)
  const flip = useRef<Flip.FlipState | null>(null)

  const items = useMemo(() => {
    let list = productsIn(slug)
    if (onlyPriced) list = list.filter((p) => p.price !== null || p.options?.some((o) => o.price !== null))
    // Unknown prices always go last.
    if (sort === 'price-asc') list = [...list].sort((a, b) => (fromPrice(a) ?? Infinity) - (fromPrice(b) ?? Infinity))
    if (sort === 'price-desc') list = [...list].sort((a, b) => (fromPrice(b) ?? -Infinity) - (fromPrice(a) ?? -Infinity))
    return list
  }, [slug, sort, onlyPriced])

  const capture = () => {
    if (grid.current && !prefersReducedMotion()) flip.current = Flip.getState(grid.current.querySelectorAll('.product-card'))
  }
  useLayoutEffect(() => {
    if (!flip.current) return
    Flip.from(flip.current, {
      duration: 0.6,
      ease: 'expo.out',
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.4 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.96, duration: 0.2 }),
    })
    flip.current = null
  }, [items])

  // Category change: rise in like S3.
  useLayoutEffect(() => {
    if (!grid.current || prefersReducedMotion()) return
    const t = gsap.from(grid.current.querySelectorAll('.product-card'), { y: 40, autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: 'expo.out' })
    return () => {
      t.progress(1).kill()
    }
  }, [slug])

  return (
    <section className="px-(--space-gutter) pt-10" aria-label="Products">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
        <p className="font-display text-small text-ink/70">
          {items.length} of {products.filter((p) => p.category === slug).length} items
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="chip" aria-pressed={onlyPriced} onClick={() => (capture(), setOnlyPriced((v) => !v))}>
            Orderable now
          </button>
          <label className="sr-only" htmlFor="sort">
            Sort
          </label>
          <select id="sort" className="field min-h-11 w-auto py-2 pr-8" value={sort} onChange={(e) => (capture(), setSort(e.target.value as Sort))}>
            <option value="menu">Menu order</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
      <div ref={grid} className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
    </section>
  )
}
