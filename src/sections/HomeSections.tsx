// Home page sections below the hero, in the master prompt's order:
// Today's favourites strip, Shop by category (S2), Featured category, Top selling,
// Poster band (S6), Full menu preview (S3), Value strip, Outlets (S7).
import { useRef } from 'react'
import { Link } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { ProductArt } from '../components/ProductArt'
import { Swash } from '../components/Swash'
import { BgVideo } from '../components/BgVideo'
import { liveCategories, products, productsIn, bestSellers, productBySlug } from '../content/products'
import { business, mapsSearch } from '../content/business'
import { gsap, ease, mq, ScrollTrigger, SplitText } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'
import { MenuByCategory } from './MenuByCategory'

/** Strip that slides up over the bottom of the hero (the reference's product strip). */
export function TodaysFavourites() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, () => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.product-card', { y: 50, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: ease.swash, scrollTrigger: { trigger: root.current, start: 'top 90%' } })
    })
  })
  const list = [...bestSellers, ...products.filter((p) => p.price !== null && !bestSellers.includes(p))].slice(0, 8)
  return (
    <section ref={root} aria-labelledby="fav-title" className="relative z-10 -mt-8 rounded-t-[2rem] bg-paper pt-12 pb-8">
      <div className="flex items-end justify-between gap-4 px-(--space-gutter)">
        <h2 id="fav-title" className="text-h2 font-extrabold">
          <span className="lede block font-normal text-ink/70">Straight from the cabinet</span>
          Today’s favourites
        </h2>
        <Link to="/menu" className="btn btn-ghost hidden shrink-0 sm:inline-flex" style={{ ['--ghost-hover' as string]: '#F6E7DA' }}>
          Full menu
        </Link>
      </div>
      <Rail>
        {list.map((p) => (
          <ProductCard key={p.id} product={p} variant="strip" />
        ))}
      </Rail>
    </section>
  )
}

/** Horizontal scroller with snap; arrows on desktop. */
export function Rail({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const by = (d: number) => track.current?.scrollBy({ left: d * track.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div className="relative">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-(--space-gutter) px-(--space-gutter) pt-8 pb-4 [&>*]:snap-start" data-lenis-prevent-horizontal>
        {children}
      </div>
      <div className="mt-2 hidden justify-end gap-2 px-(--space-gutter) md:flex">
        <button type="button" onClick={() => by(-1)} className="hero-arrow h-12 w-12 text-ink" aria-label="Scroll left">
          <Chevron dir={-1} />
        </button>
        <button type="button" onClick={() => by(1)} className="hero-arrow h-12 w-12 text-ink" aria-label="Scroll right">
          <Chevron dir={1} />
        </button>
      </div>
    </div>
  )
}

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 1 ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'} />
    </svg>
  )
}

/** S2 · round category tiles. */
export function ShopByCategory() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, () => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%' } })
      tl.from('.sec-title', { yPercent: 100, autoAlpha: 0, duration: 0.8, ease: ease.swash }).from('.cat-tile', { scale: 0.6, y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: ease.pop }, 0.15)
    })
  })
  return (
    <section ref={root} aria-labelledby="cat-title" className="px-(--space-gutter) py-20 md:py-28">
      <div className="overflow-hidden text-center">
        <h2 id="cat-title" className="sec-title text-h1 font-extrabold">
          Shop by category
        </h2>
      </div>
      <p className="lede mx-auto mt-3 max-w-xl text-center text-ink/70">Cakes for the day, slices for the afternoon, savory for the road.</p>
      <ul className="no-scrollbar -mx-(--space-gutter) mt-12 flex snap-x gap-4 overflow-x-auto px-(--space-gutter) pb-4 md:mx-0 md:grid md:grid-cols-5 md:gap-6 md:overflow-visible md:px-0" data-lenis-prevent-horizontal>
        {liveCategories.map((c) => {
          const rep = productsIn(c.slug).find((p) => p.image) ?? productsIn(c.slug)[0]
          return (
            <li key={c.slug} className="cat-tile w-40 shrink-0 snap-start md:w-auto">
              <Link to={`/menu/${c.slug}`} className="group block text-center">
                <div className="relative mx-auto aspect-square w-full">
                  <div className="absolute inset-[4%] rounded-full transition-transform duration-(--duration-reveal) ease-(--ease-swash) group-hover:scale-[1.12]" style={{ background: c.disc }} />
                  <div className={`absolute transition-transform duration-(--duration-reveal) ease-(--ease-swash) group-hover:-translate-y-2 group-hover:rotate-6 [container-type:inline-size] ${rep?.cutout || !rep?.image ? 'inset-[8%]' : 'inset-[14%] overflow-hidden rounded-full'}`}>
                    {rep && <ProductArt product={rep} sizes="(min-width: 768px) 18vw, 10rem" />}
                  </div>
                </div>
                <h3 className="mt-4 text-h3 font-bold group-hover:text-maroon">{c.name}</h3>
                <p className="mt-1 text-micro text-ink/60">{productsIn(c.slug).length} {productsIn(c.slug).length === 1 ? 'item' : 'items'}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Featured category row (Caravan Fresh pattern): title, line, cards, View all. */
export function FeaturedRow({ title, lede, items, to, tone = 'paper' }: { title: string; lede: string; items: typeof products; to: string; tone?: 'paper' | 'icing' }) {
  const root = useRef<HTMLElement>(null)
  useGsap(root, () => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(root.current!.querySelectorAll('.product-card'), { y: 40, autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: ease.swash, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
    })
  })
  return (
    <section ref={root} className={`py-16 md:py-24 ${tone === 'icing' ? 'bg-icing' : ''}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 px-(--space-gutter)">
        <div>
          <h2 className="text-h1 font-extrabold">{title}</h2>
          <p className="lede mt-2 max-w-xl text-ink/70">{lede}</p>
        </div>
        <Link to={to} className="btn btn-ink">
          View all
        </Link>
      </div>
      <Rail>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} variant="strip" />
        ))}
      </Rail>
    </section>
  )
}

/** S6 · pinned poster: "Cake is the language of LOVE", the cake rising through the word. */
export function PosterBand() {
  const root = useRef<HTMLElement>(null)
  const cake = productBySlug('rosette-celebration-cake')!
  useGsap(root, () => {
    const m = gsap.matchMedia()
    m.add(mq.desktop, () => {
      const split = SplitText.create('.poster-word', { type: 'chars' })
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', scrub: 1, pin: true } })
      tl.from('.poster-lede', { autoAlpha: 0, y: 30, duration: 0.2 })
        .from(split.chars, { yPercent: 120, autoAlpha: 0, stagger: 0.05, duration: 0.3, ease: ease.swash }, 0.15)
        .from('.poster-word-wrap', { scale: 0.4, duration: 0.5, ease: 'none' }, 0.15)
        .from('.poster-cake', { yPercent: 70, autoAlpha: 0, scale: 0.8, duration: 0.4 }, 0.45)
        .to(split.chars, { x: (i: number) => (i < split.chars.length / 2 ? -60 : 60), duration: 0.3 }, 0.5)
        .from('.poster-swash .swash-stroke', { drawSVG: '0%', duration: 0.3, ease: ease.stroke }, 0.7)
      return () => split.revert()
    })
    m.add(mq.mobile, () => {
      gsap.from('.poster-cake', { y: 60, autoAlpha: 0, duration: 1, ease: ease.swash, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.from('.poster-swash .swash-stroke', { drawSVG: '0%', duration: 1.2, ease: ease.stroke, scrollTrigger: { trigger: root.current, start: 'top 60%' } })
    })
  })
  return (
    <section ref={root} aria-label="Cake is the language of love" className="relative grid h-[100svh] min-h-[560px] place-items-center overflow-hidden bg-night-deep px-(--space-gutter) text-icing">
      <BgVideo name="candles" className="absolute inset-0 h-full w-full opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgb(90_16_27/0.55),rgb(34_6_11/0.92))]" aria-hidden="true" />
      <div className="relative w-full text-center">
        <p className="poster-lede lede text-on-night-soft">Cake is the language of</p>
        <div className="poster-word-wrap relative mx-auto">
          <p className="poster-word punch text-[clamp(7rem,33vw,30rem)] leading-[0.8] text-gold uppercase" aria-hidden="true">
            Love
          </p>
          <div className="poster-cake pointer-events-none absolute z-10 inset-x-0 top-[2%] mx-auto h-[110%] w-[min(60vw,34rem)] [container-type:inline-size]">
            <ProductArt product={cake} sizes="60vw" />
          </div>
        </div>
        <Swash className="poster-swash mx-auto -mt-[4%] w-[min(80vw,46rem)]" />
        <Link to="/menu/celebration-cakes" className="btn btn-gold relative mt-6">
          Order a celebration cake
        </Link>
      </div>
    </section>
  )
}

/** Every product, grouped, with sticky scroll-spy chips (the "see everything" section). */
export function FullMenuPreview() {
  return (
    <section aria-labelledby="menu-title" className="bg-icing py-20 md:py-28">
      <div className="px-(--space-gutter)">
        <h2 id="menu-title" className="text-h1 font-extrabold">
          <span className="lede block font-normal text-ink/70">Everything in the cabinet</span>
          The full menu
        </h2>
      </div>
      <MenuByCategory />
      <div className="mt-12 text-center">
        <Link to="/menu" className="btn btn-maroon">
          Open full menu
        </Link>
      </div>
    </section>
  )
}

const VALUES = [
  { title: 'Baked fresh daily', line: 'Bread and buns every morning', icon: 'M4 16c0-5 4-9 8-9s8 4 8 9H4Zm0 0h16M8 7c0-2 1-3 2-3M12 7V3M16 7c0-2-1-3-2-3' },
  { title: '4 outlets', line: business.outlets.map((o) => o.name).join(', '), icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
  { title: 'Pickup or delivery', line: business.pickme ? 'Order here or on PickMe Food' : 'Order here, pay when you collect', icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' },
  { title: 'Cakes made to order', line: 'With your message on top', icon: 'M4 20h16M5 20v-7h14v7M8 13V9m4 4V8m4 5V9M8 6.5a1 1 0 1 0 0-.01M12 5.5a1 1 0 1 0 0-.01M16 6.5a1 1 0 1 0 0-.01' },
]

export function ValueStrip() {
  return (
    <section aria-label="Why Spunchy" className="relative overflow-hidden bg-night-deep px-(--space-gutter) py-20 text-icing md:py-28">
      <BgVideo name="pastries" className="absolute inset-0 h-full w-full opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-night-deep via-night-deep/80 to-night-deep/40" aria-hidden="true" />
      <h2 className="relative max-w-xl text-h1 font-extrabold">
        <span className="lede block font-normal text-on-night-soft">Out of the oven</span>
        Baked fresh, every morning
      </h2>
      <ul className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <li key={v.title} className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-maroon text-gold">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={v.icon} />
              </svg>
            </span>
            <span>
              <span className="block font-display text-h3 font-bold">{v.title}</span>
              <span className="block text-small text-on-night-soft">{v.line}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** S7 · outlets: cards slide in from alternating sides, a gold route draws between them. */
export function OutletsSection({ heading = true }: { heading?: boolean }) {
  const root = useRef<HTMLElement>(null)
  useGsap(root, () => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.outlet-card', { x: (i) => (i % 2 ? 60 : -60), autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: ease.swash, scrollTrigger: { trigger: root.current, start: 'top 75%' } })
      gsap.from('.outlet-route .swash-stroke', { drawSVG: '0%', duration: 1.4, ease: ease.stroke, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
    })
    ScrollTrigger.refresh()
  })
  return (
    <section ref={root} aria-labelledby="outlets-title" className="relative overflow-hidden bg-night px-(--space-gutter) py-20 text-icing md:py-28">
      <BgVideo name="bakery-display" className="absolute inset-0 h-full w-full opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 to-night" aria-hidden="true" />
      <div className="relative">
        {heading && (
          <h2 id="outlets-title" className="text-h1 font-extrabold">
            <span className="lede block font-normal text-on-night-soft">Come say hello</span>
            Four Spunchy outlets
          </h2>
        )}
        <Swash className="outlet-route pointer-events-none absolute top-[40%] left-0 hidden w-full opacity-60 md:block" stretch />
        <ul className="relative mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {business.outlets.map((o) => (
            <li key={o.id} className="outlet-card rounded-cabinet bg-velvet/90 p-6 shadow-lift backdrop-blur">
              <h3 className="punch text-[clamp(2.2rem,4vw,3.4rem)] break-words uppercase">{o.name}</h3>
              {o.address && <p className="mt-2 text-small text-on-night-soft">{o.address}</p>}
              {o.hours && <p className="mt-1 text-small text-on-night-soft">{o.hours}</p>}
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={mapsSearch(o.name)} target="_blank" rel="noopener noreferrer" className="btn btn-gold min-h-11 px-4">
                  Directions
                </a>
                <a href={`tel:${o.phone ? o.phone.replace(/\s/g, '') : business.phone.tel}`} className="btn btn-ghost min-h-11 px-4" style={{ ['--ghost-hover' as string]: '#3A0A12' }}>
                  Call
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
