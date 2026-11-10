// S1 · "The Cabinet": the five-slide hero from docs/premium/animation-script.md.
// One product per slide on its own colour (the new colour opens as a circle from the
// product), a two-line headline in its own column, a calm glide between slides with a
// light motion blur, autoplay with progress dots, swipe, keys and a gentle pointer parallax.
// Revised 2026-11-10 after client feedback: no duplicate "ghost" headline, no particles,
// no tilted neighbours at the edges.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { heroSlides, type HeroSlide } from '../content/heroSlides'
import { productBySlug, formatPrice, type Product } from '../content/products'
import { ProductArt } from '../components/ProductArt'
import { BgVideo } from '../components/BgVideo'
import { useCart } from '../store/cart'
import { useUi } from '../store/ui'
import { flyToCart } from '../lib/flyToCart'
import { gsap, ease, prefersReducedMotion, ScrollTrigger } from '../lib/motion'

const SLIDE_MS = 5500
const N = heroSlides.length

const product = (s: HeroSlide) => productBySlug(s.productId) as Product

export function HeroCabinet({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [visible, setVisible] = useState(true)
  const busy = useRef<gsap.core.Timeline | null>(null)
  const indexRef = useRef(0)
  // Navigation waits for the intro: the first slide's entrance runs when it hands over.
  const readyRef = useRef(false)
  readyRef.current = ready
  const setHeroTone = useUi((s) => s.setHeroTone)
  const add = useCart((s) => s.add)
  const showToast = useCart((s) => s.showToast)

  const q = (sel: string, i: number) => root.current!.querySelectorAll<HTMLElement>(`[data-slide="${i}"] ${sel}`)
  const one = (sel: string, i: number) => root.current!.querySelector<HTMLElement>(`[data-slide="${i}"] ${sel}`)

  /** Entrance of slide i (also used for the first slide after the intro). */
  const enter = useCallback((tl: gsap.core.Timeline, i: number, dir: 1 | -1, at: number) => {
    tl.set(`[data-slide="${i}"]`, { autoAlpha: 1 }, at)
      .fromTo(one('.hero-product-wrap', i), { x: () => dir * window.innerWidth * 0.08, scale: 0.94, autoAlpha: 0 }, { x: 0, scale: 1, autoAlpha: 1, duration: 1, ease: ease.swash }, at)
      .fromTo(q('.hero-line > span', i), { yPercent: 105, x: 0, autoAlpha: 1 }, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: ease.swash }, at + 0.05)
      .fromTo(q('.hero-reveal', i), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, ease: ease.swash }, at + 0.35)
    return tl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      const from = indexRef.current
      next = (next + N) % N
      if (next === from || !root.current || !readyRef.current) return
      busy.current?.progress(1)
      indexRef.current = next
      setIndex(next)
      setHeroTone(heroSlides[next].tone)

      if (prefersReducedMotion()) {
        gsap.to(`[data-slide="${from}"]`, { autoAlpha: 0, duration: 0.2 })
        gsap.set(q('.hero-line > span, .hero-reveal, .hero-product-wrap', next), { clearProps: 'all' })
        gsap.fromTo(`[data-slide="${next}"]`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
        gsap.set(`[data-bg="${from}"]`, { autoAlpha: 0 })
        gsap.set(`[data-bg="${next}"]`, { autoAlpha: 1, clipPath: 'none' })
        return
      }

      const desktop = window.matchMedia('(min-width: 768px)').matches
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(`[data-slide="${from}"]`, { autoAlpha: 0 })
          gsap.set(`[data-bg="${from}"]`, { autoAlpha: 0 })
          busy.current = null
        },
      })
      busy.current = tl
      // out
      tl.to(q('.hero-line > span', from), { yPercent: -105, duration: 0.45, stagger: 0.05, ease: ease.exit }, 0)
        .to(q('.hero-reveal', from), { autoAlpha: 0, duration: 0.3, ease: ease.exit }, 0)
        .to(one('.hero-product-wrap', from), { x: () => -dir * window.innerWidth * 0.08, scale: 0.94, autoAlpha: 0, duration: 0.5, ease: ease.exit }, 0)
      // background: the new colour opens as a circle from the product
      const bg = root.current.querySelector(`[data-bg="${next}"]`)
      gsap.set(bg, { zIndex: 2, autoAlpha: 1 })
      gsap.set(root.current.querySelector(`[data-bg="${from}"]`), { zIndex: 1 })
      tl.fromTo(bg, { clipPath: `circle(0% at ${desktop ? 70 : 50}% 50%)` }, { clipPath: `circle(150% at ${desktop ? 70 : 50}% 50%)`, duration: 0.9, ease: ease.stroke }, 0)
      // motion-blur sweep (desktop only)
      if (desktop) {
        const blur = root.current.querySelector('#hero-sweep feGaussianBlur')
        const stage = root.current.querySelector<HTMLElement>('.hero-slides')!
        tl.set(stage, { filter: 'url(#hero-sweep)' }, 0.25)
          .fromTo(blur, { attr: { stdDeviation: '0 0' } }, { attr: { stdDeviation: '8 0' }, duration: 0.15, ease: 'none' }, 0.25)
          .to(blur, { attr: { stdDeviation: '0 0' }, duration: 0.2, ease: 'none' }, 0.4)
          .set(stage, { filter: 'none' }, 0.6)
      }
      enter(tl, next, dir, 0.45)
    },
    [enter, setHeroTone],
  )

  // First slide entrance once the intro hands over.
  useEffect(() => {
    if (!ready || !root.current) return
    setHeroTone(heroSlides[0].tone)
    if (prefersReducedMotion()) return
    const tl = gsap.timeline()
    enter(tl, 0, 1, 0)
    return () => {
      tl.progress(1).kill()
    }
  }, [ready, enter, setHeroTone])

  // Autoplay: pauses on hover/focus, when off-screen or the tab is hidden; stops for good
  // once the visitor drives the carousel themselves.
  const running = ready && !paused && !stopped && visible && !prefersReducedMotionSafe()
  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => go(indexRef.current + 1, 1), SLIDE_MS)
    return () => clearTimeout(t)
  }, [running, index, go])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const user = (fn: () => void) => () => {
    setStopped(true)
    fn()
  }

  // Swipe / drag
  const drag = useRef<{ x: number; id: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    drag.current = { x: e.clientX, id: e.pointerId }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current = null
    if (Math.abs(dx) > 60) {
      setStopped(true)
      go(indexRef.current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1)
    }
  }

  // Pointer parallax (desktop, fine pointer)
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return
    const layers = [...el.querySelectorAll<HTMLElement>('[data-depth]')].map((n) => ({
      d: Number(n.dataset.depth),
      x: gsap.quickTo(n, 'x', { duration: 0.6, ease: 'power3' }),
      y: gsap.quickTo(n, 'y', { duration: 0.6, ease: 'power3' }),
    }))
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      layers.forEach((l) => {
        l.x(nx * l.d * 2)
        l.y(ny * l.d * 2)
      })
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  // Scroll-out: product sinks back, headline rises faster than the page.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to('.hero-depth-product', { scale: 0.85, y: -80, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 } })
      gsap.to('.hero-text', { yPercent: -25, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 } })
    }, el)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  const onAdd = (s: HeroSlide) => {
    const p = product(s)
    if (p.price === null) return
    setStopped(true)
    add({ productId: p.id, name: p.name, option: null, flavour: null, message: null, unitPrice: p.price })
    flyToCart(root.current?.querySelector(`[data-slide="${indexRef.current}"] .hero-product-wrap .product-art`) ?? null)
    showToast(`${p.name} added`)
  }

  const cur = heroSlides[index]

  return (
    <section
      ref={root}
      id="top"
      className="hero-stage relative isolate h-[calc(100svh-2.25rem)] max-h-[1000px] min-h-[640px] overflow-hidden select-none"
      aria-roledescription="carousel"
      aria-label="Spunchy favourites"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') user(() => go(indexRef.current + 1, 1))()
        if (e.key === 'ArrowLeft') user(() => go(indexRef.current - 1, -1))()
      }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="hero-sweep" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation="0 0" />
        </filter>
      </svg>

      {/* Backgrounds */}
      {heroSlides.map((s, i) => (
        <div key={s.id} data-bg={i} className="absolute inset-0" style={{ background: s.background, ...(i === 0 ? { zIndex: 1 } : { visibility: 'hidden', opacity: 0 }) }} aria-hidden="true">
          {s.video && (
            <BgVideo name={s.video.name} active={i === index} className="absolute inset-0 h-full w-full" style={{ mixBlendMode: s.video.blend, opacity: s.video.opacity, maskImage: 'linear-gradient(90deg, transparent 35%, #000 75%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 35%, #000 75%)' }} />
          )}
          {s.ambient === 'spotlight' && <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_0%,rgb(247_184_54/0.16),transparent_70%)]" />}
          <div data-depth="4" className="absolute inset-0 bg-[radial-gradient(32%_42%_at_70%_52%,rgb(255_255_255/0.16),transparent_70%)] max-md:bg-[radial-gradient(50%_30%_at_50%_50%,rgb(255_255_255/0.16),transparent_70%)]" />
        </div>
      ))}


      {/* Slides */}
      <div className="hero-slides absolute inset-0 z-[4]">
        {heroSlides.map((s, i) => {
          const p = product(s)
          const ink = s.tone === 'light' ? 'text-icing' : 'text-ink'
          return (
            <div
              key={s.id}
              data-slide={i}
              className={`absolute inset-0 ${ink}`}
              style={i === 0 ? undefined : { visibility: 'hidden', opacity: 0 }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${N}: ${s.headline.join(' ')}`}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              {/* Product */}
              <div className="hero-depth-product absolute top-[clamp(14.5rem,31%,20rem)] left-1/2 z-[2] h-[30%] w-[min(86vw,30rem)] -translate-x-1/2 md:top-[16%] md:left-[71%] md:h-[64%] md:w-[min(44vw,46rem)]">
                <div className="hero-product-wrap relative h-full w-full">
                  <div data-depth="8" className="relative h-full w-full">
                    <div className="hero-shadow absolute inset-x-[18%] bottom-[2%] h-[8%] rounded-[50%] bg-[rgb(34_6_11/0.45)] blur-xl" />
                    <div className="hero-float relative h-full w-full [container-type:inline-size]" style={{ scale: s.productScale ?? 1 }}>
                      <ProductArt product={p} sizes="(min-width: 768px) 46vw, 86vw" priority={i === 0} />
                    </div>
                    {s.ambient === 'steam' && <Steam />}
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="hero-text relative z-[3] flex h-full flex-col px-(--space-gutter) pt-[calc(var(--header-h)+1.25rem)] pb-28 md:justify-center md:pt-(--header-h) md:pb-24">
                <div className="max-w-[min(100%,46rem)] md:max-w-[46%] lg:max-w-[44%]">
                  <p className="hero-reveal eyebrow-pill" style={{ color: s.accent }}>
                    {s.eyebrow}
                  </p>
                  <h2 className="punch hero-headline mt-4 uppercase" style={{ ['--chars' as string]: chars(s) }} aria-live={i === index ? 'polite' : undefined}>
                    <span className="hero-line"><span>{s.headline[0]}</span></span>
                    <span className="hero-line"><span>{s.headline[1]}</span></span>
                  </h2>
                  <div className="mt-auto max-md:absolute max-md:inset-x-(--space-gutter) max-md:bottom-24 md:mt-0">
                    <p className="hero-reveal mt-5 max-w-[34ch] text-small leading-snug opacity-90 md:text-body">{s.copy}</p>
                    <div className="hero-reveal mt-6 flex flex-wrap gap-3">
                      {s.primary.action === 'add' && p.price !== null ? (
                        <button type="button" className={`btn ${s.tone === 'light' ? 'btn-gold' : 'btn-maroon'}`} onClick={() => onAdd(s)} tabIndex={i === index ? 0 : -1}>
                          {s.primary.label} · {formatPrice(p.price)}
                        </button>
                      ) : (
                        <Link to={s.primary.to ?? `/product/${p.slug}`} className={`btn ${s.tone === 'light' ? 'btn-gold' : 'btn-maroon'}`} tabIndex={i === index ? 0 : -1}>
                          {s.primary.label}
                        </Link>
                      )}
                      <Link to={s.secondary.to} className="btn btn-ghost" style={{ ['--ghost-hover' as string]: s.tone === 'light' ? '#3A0A12' : '#F6E7DA' }} tabIndex={i === index ? 0 : -1}>
                        {s.secondary.label}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Arrows + dots */}
      <div className={`absolute inset-x-0 bottom-6 z-[5] flex items-center justify-between px-(--space-gutter) md:bottom-10 ${cur.tone === 'light' ? 'text-icing' : 'text-ink'}`}>
        <button type="button" className="hero-arrow" onClick={user(() => go(indexRef.current - 1, -1))} aria-label="Previous slide">
          <Chevron dir={-1} />
        </button>
        <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={user(() => go(i, i > indexRef.current ? 1 : -1))}
              className="grid h-11 place-items-center"
              aria-label={`Slide ${i + 1} of ${N}: ${s.headline.join(' ')}`}
              aria-current={i === index}
            >
              <span className={`relative block h-2 overflow-hidden rounded-full bg-current/30 transition-[width] duration-(--duration-ui) ${i === index ? 'w-10' : 'w-2'}`}>
                {i === index && (
                  <span
                    key={`${index}-${stopped}`}
                    className={`dot-fill absolute inset-0 rounded-full bg-current ${running ? 'is-running' : stopped ? 'is-done' : 'is-running is-paused'}`}
                    style={{ ['--slide-ms' as string]: `${SLIDE_MS}ms` }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="hero-arrow" onClick={user(() => go(indexRef.current + 1, 1))} aria-label="Next slide">
          <Chevron dir={1} />
        </button>
      </div>
    </section>
  )
}

const chars = (s: HeroSlide) => Math.max(8, ...s.headline.map((l) => l.length))
const prefersReducedMotionSafe = () => typeof window !== 'undefined' && prefersReducedMotion()

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 1 ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'} />
    </svg>
  )
}

function Steam() {
  return (
    <svg viewBox="0 0 200 200" className="pointer-events-none absolute -top-[22%] left-1/2 h-[45%] -translate-x-1/2" aria-hidden="true">
      {[60, 100, 140].map((x, i) => (
        <path
          key={x}
          className="steam"
          style={{ animationDelay: `${i * 0.9}s` }}
          d={`M${x} 190 C ${x - 20} 150, ${x + 20} 120, ${x} 80 S ${x - 15} 30, ${x + 5} 10`}
          fill="none"
          stroke="#fff"
          strokeOpacity=".45"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#steam-blur)"
        />
      ))}
      <filter id="steam-blur">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </svg>
  )
}
