import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Img } from '../components/Img'
import { Button } from '../components/Button'
import { Crumbs } from '../components/Crumbs'
import { business } from '../content/business'
import { gsap, ease, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

// Three Spunchy products, each with a line from Spunchy's own posters. Prices are from the
// shop's labels; nothing here is invented.
const SLIDES = [
  {
    id: 'cake',
    lines: ['Cake is the', 'language', 'of love'],
    image: 'cake-rosettes-cut',
    alt: 'Rosette celebration cake with pink, ivory and plum buttercream',
    kind: 'Celebration cakes',
    title: 'Rosette celebration cake',
    text: 'Cream, rose and plum buttercream. Ask in store for today’s cakes, sizes and prices.',
    width: 'lg:w-[min(31vw,560px)]',
    crumbs: ['#f3e3c3', '#f4a3b0', '#6b2a4a', '#e8d4a8', '#fef6f5'],
  },
  {
    id: 'buns',
    lines: ['Soft,', 'fluffy &', 'fresh'],
    image: 'buns-triangle-cut',
    alt: 'Golden triangle buns, one cut open to show the filling',
    kind: 'From the bakery',
    title: 'Soft triangle buns',
    text: 'Golden, soft and filled, from the Spunchy bakery. Find them at the counter.',
    width: 'lg:w-[min(30vw,540px)]',
    crumbs: ['#d9893a', '#b8642a', '#f0c27a', '#8a4a1c', '#e8b46a'],
  },
  {
    id: 'tart',
    lines: ['A slice', 'of', 'heaven'],
    image: 'fruit-tart-cut',
    alt: 'A tray of fruit tart slices with a glossy yellow top',
    kind: 'Pastries',
    title: 'Fruit Tart',
    text: 'Rs. 290 a slice, as labelled in our cabinet. A Spunchy favourite.',
    width: 'lg:w-[min(31vw,560px)]',
    crumbs: ['#f5c518', '#f7b836', '#fff1c4', '#d9a31a', '#fef6f5'],
  },
] as const

const AUTOPLAY = 6.5 // seconds per product

/** The hero: a cream stage, a stacked serif line, a floating Spunchy product dropping crumbs. */
export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const [crumbSource, setCrumbSource] = useState<[number, number, number]>([0.5, 0.62, 0.14])
  const [crumbFloor, setCrumbFloor] = useState(0.86)
  const busy = useRef(false)
  const paused = useRef(false)
  const progress = useRef<gsap.core.Tween | null>(null)
  const slide = SLIDES[index]

  // Entrance, built paused at hydration (the copy was already painted once behind the
  // intro) and played the moment the intro hands over.
  const entrance = useRef<gsap.core.Timeline | null>(null)
  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      entrance.current = gsap
        .timeline({ paused: true, defaults: { ease: ease.swash } })
        .from('.hero-line-inner', { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.1)
        .from('.hero-product.is-active', { y: 90, scale: 0.88, rotation: 4, duration: 1.4 }, 0)
        .from('.hero-panel > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 0.45)
        .from('.hero-bottom > *', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.7)
      return () => {
        entrance.current = null
      }
    })
  })
  useEffect(() => {
    if (ready) entrance.current?.play()
  }, [ready])

  // Where the crumbs fall from: the bottom of the active product, measured.
  const measure = useCallback(() => {
    const hero = root.current
    const product = hero?.querySelector<HTMLElement>('.hero-product.is-active')
    if (!hero || !product) return
    const h = hero.getBoundingClientRect()
    const p = product.getBoundingClientRect()
    setCrumbSource([(p.left + p.width / 2 - h.left) / h.width, (p.bottom - p.height * 0.12 - h.top) / h.height, (p.width * 0.55) / h.width])
    setCrumbFloor(Math.min(0.97, (p.bottom + p.height * 0.35 - h.top) / h.height))
  }, [])
  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, index])

  // Change product: the old one lifts away, the new one rises in; the headline swaps line
  // by line through its masks.
  const go = useCallback(
    (next: number) => {
      const hero = root.current
      if (!hero || busy.current || next === index) return
      if (prefersReducedMotion()) return setIndex(next)
      busy.current = true
      gsap
        .timeline({ defaults: { ease: ease.exit } })
        .to(hero.querySelectorAll('.hero-line-inner'), { yPercent: -110, duration: 0.45, stagger: 0.05 }, 0)
        .to(hero.querySelector('.hero-product.is-active'), { y: -50, scale: 0.92, rotation: -5, autoAlpha: 0, duration: 0.55 }, 0)
        .to(hero.querySelectorAll('.hero-panel > *'), { y: -12, autoAlpha: 0, duration: 0.3, stagger: 0.03 }, 0)
        .add(() => setIndex(next))
    },
    [index],
  )

  // After the swap renders: bring the new product, line and panel in.
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const hero = root.current
    if (!hero) return
    const tl = gsap.timeline({ defaults: { ease: ease.swash }, onComplete: () => void (busy.current = false) })
    tl.fromTo(hero.querySelectorAll('.hero-line-inner'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.07 }, 0)
      .fromTo(hero.querySelector('.hero-product.is-active'), { y: 70, scale: 0.9, rotation: 5, autoAlpha: 0 }, { y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 1.2 }, 0)
      .fromTo(hero.querySelectorAll('.hero-panel > *'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06 }, 0.2)
    return () => {
      tl.kill()
      busy.current = false
    }
  }, [index])

  // Autoplay with a progress ring on the round control; pauses on hover/focus and offscreen.
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return
    const ring = root.current?.querySelector<SVGCircleElement>('.hero-ring')
    if (!ring) return
    progress.current?.kill()
    progress.current = gsap.fromTo(ring, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: AUTOPLAY, ease: 'none', onComplete: () => go((index + 1) % SLIDES.length) })
    if (paused.current) progress.current.pause()
    return () => {
      progress.current?.kill()
    }
  }, [ready, index, go])

  useEffect(() => {
    const hero = root.current
    if (!hero) return
    const pause = () => {
      paused.current = true
      progress.current?.pause()
    }
    const resume = () => {
      paused.current = false
      progress.current?.resume()
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? resume() : pause()), { threshold: 0.3 })
    io.observe(hero)
    hero.addEventListener('pointerenter', pause)
    hero.addEventListener('pointerleave', resume)
    hero.addEventListener('focusin', pause)
    hero.addEventListener('focusout', resume)
    return () => {
      io.disconnect()
      hero.removeEventListener('pointerenter', pause)
      hero.removeEventListener('pointerleave', resume)
      hero.removeEventListener('focusin', pause)
      hero.removeEventListener('focusout', resume)
    }
  }, [])

  // Scroll: the product drifts up a little faster than the page.
  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to('.hero-stage', { yPercent: -12, ease: 'none', scrollTrigger: st })
    })
  })

  return (
    <section
      ref={root}
      id="top"
      aria-roledescription="carousel"
      aria-label="Spunchy favourites"
      className="hero-cream relative isolate flex min-h-dvh flex-col overflow-hidden px-(--space-gutter) pt-28 pb-8 text-maroon lg:pt-32"
    >
      <Crumbs palette={[...slide.crumbs]} source={crumbSource} floor={crumbFloor} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />

      <div className="relative grid flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.75fr)] lg:gap-8">
        {/* 1. The stacked serif line */}
        <h1 className="relative z-20 font-serif leading-[0.86] font-semibold tracking-[-0.025em] uppercase">
          <span className="sr-only">{slide.lines.join(' ')}</span>
          {/* Sized from the longest line so every poster line stays on one line in its column */}
          <span aria-hidden="true" className="hero-lines block" style={{ '--chars': Math.max(...slide.lines.map((l) => l.length)) } as React.CSSProperties}>
            {slide.lines.map((line) => (
              <span key={`${slide.id}-${line}`} className="block overflow-hidden pb-[0.04em]">
                <span className="hero-line-inner block whitespace-nowrap">{line}</span>
              </span>
            ))}
          </span>
        </h1>

        {/* 2. The product, floating over a soft shadow */}
        <div className="hero-stage relative z-0 mx-auto h-[min(46vh,22rem)] w-full lg:h-[min(62vh,620px)]">
          {SLIDES.map((s, i) => (
            // Centred with flexbox, not translate, so GSAP can own the product's transform.
            <div key={s.id} aria-hidden={i !== index} className={`absolute inset-0 flex items-center justify-center ${i === index ? '' : 'invisible'}`}>
              <div className={`hero-product w-[min(80vw,420px)] ${s.width} ${i === index ? 'is-active' : ''}`}>
                <div className="hero-float">
                  <Img
                    id={s.image}
                    alt={s.alt}
                    sizes="(min-width: 1024px) 34vw, 80vw"
                    priority={i === 0}
                    placeholder={false}
                    className="block"
                    imgClassName="h-auto w-full drop-shadow-[0_2.2rem_1.6rem_rgb(90_16_27/0.28)]"
                  />
                </div>
                <div className="mx-auto -mt-[4%] h-6 w-[70%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(90_16_27/0.22),transparent)]" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

        {/* 3. The numbered panel */}
        <div className="hero-panel relative z-20 max-w-[22rem] lg:justify-self-end" aria-live="polite">
          <p className="font-serif text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-medium">{String(index + 1).padStart(2, '0')}</p>
          <p className="mt-3 font-display text-micro font-semibold tracking-[0.08em] text-plum uppercase">{slide.kind}</p>
          <h2 className="mt-2 font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-tight font-medium">{slide.title}</h2>
          <p className="mt-3 text-small leading-relaxed text-ink/80">{slide.text}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`tel:${business.phone.tel}`} variant="maroon">Call to order</Button>
          </div>
        </div>
      </div>

      {/* Bottom row: explore + product control */}
      <div className="hero-bottom relative z-20 mt-6 flex items-end justify-between gap-6">
        <a
          href="#cabinet"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#cabinet')
          }}
          className="inline-flex min-h-11 items-center gap-3 font-display text-small font-semibold"
        >
          Explore the cabinet
          <svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true"><path d="M0 5h32m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </a>

        <div className="flex items-center gap-4">
          <ol className="hidden items-center gap-3 font-display text-micro font-semibold sm:flex" aria-label="Choose a product">
            {SLIDES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index}
                  aria-label={`${s.title} (${i + 1} of ${SLIDES.length})`}
                  className={`min-h-11 px-1 transition-opacity duration-(--duration-ui) ${i === index ? 'opacity-100' : 'opacity-45 hover:opacity-80'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => go((index + 1) % SLIDES.length)}
            aria-label="Next product"
            className="relative grid h-14 w-14 place-items-center rounded-roundel bg-maroon text-icing"
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="26" fill="none" stroke="rgb(254 246 245 / 0.18)" strokeWidth="2" />
              <circle className="hero-ring" cx="28" cy="28" r="26" fill="none" stroke="var(--color-gold)" strokeWidth="2" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
        </div>
      </div>
    </section>
  )
}
