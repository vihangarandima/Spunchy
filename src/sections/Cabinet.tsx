import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Img } from '../components/Img'
import { Button } from '../components/Button'
import { products, formatPrice, type Product } from '../content/products'
import { business } from '../content/business'
import { gsap, ease, isRichDevice, prefersReducedMotion, scrollToTarget, getLenis } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

type CabinetMotion = typeof import('../lib/cabinetMotion')

function ProductArt({ p, sizes, flipId }: { p: Product; sizes: string; flipId: string }) {
  if (!p.image) {
    // No photo yet: a typographic card rather than a stand-in photo.
    return (
      <div data-flip-id={flipId} className="grid h-full w-full place-items-center bg-velvet p-6 text-center">
        <span className="punch text-h1 text-gold">{p.name}</span>
      </div>
    )
  }
  return (
    <div data-flip-id={flipId} className="h-full w-full">
      <Img
        id={p.image}
        alt={p.name}
        sizes={sizes}
        placeholder={!p.cutout}
        className="block h-full w-full"
        imgClassName={`h-full w-full ${p.cutout ? 'object-contain p-4 drop-shadow-[0_1.5rem_1.25rem_rgb(18_3_6/0.85)]' : 'object-cover'}`}
      />
    </div>
  )
}

/** Chapter 03: the glowing cabinet. Drag (or scroll) the rail; open a product. */
export function Cabinet() {
  const root = useRef<HTMLElement>(null)
  const rail = useRef<HTMLUListElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Product | null>(null)
  const flipState = useRef<ReturnType<CabinetMotion['Flip']['getState']> | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  // Flip / Draggable / Inertia arrive in their own chunk; until then the sheet simply
  // opens without the Flip and the rail keeps native scrolling.
  const fx = useRef<CabinetMotion | null>(null)

  useEffect(() => {
    let drag: { kill: () => void } | undefined
    let cancelled = false
    import('../lib/cabinetMotion').then((m) => {
      if (cancelled) return
      fx.current = m
      // Drag with inertia on desktop. Touch keeps native scrolling with snap.
      if (scroller.current && isRichDevice()) {
        ;[drag] = m.Draggable.create(scroller.current, { type: 'scrollLeft', inertia: true, edgeResistance: 0.85, allowNativeTouchScrolling: true, dragClickables: true, minimumMovement: 6 })
      }
    })
    return () => {
      cancelled = true
      drag?.kill()
    }
  }, [])

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.cab-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: ease.swash, scrollTrigger: { trigger: '.cab-head', start: 'top 80%' } })
      gsap.from('.cab-card', { x: 120, autoAlpha: 0, stagger: 0.06, duration: 1, ease: ease.swash, scrollTrigger: { trigger: rail.current, start: 'top 85%' } })
    })
  })

  const show = useCallback((p: Product, fromEl?: HTMLElement | null) => {
    returnFocus.current = (document.activeElement as HTMLElement) ?? null
    const art = fromEl?.querySelector<HTMLElement>('[data-flip-id]')
    flipState.current = art && fx.current && !prefersReducedMotion() ? fx.current.Flip.getState(art) : null
    setOpen(p)
    if (location.hash !== `#${p.id}`) history.pushState({ product: p.id }, '', `#${p.id}`)
  }, [])

  const hide = useCallback((viaHistory = false) => {
    if (!sheet.current) return setOpen(null)
    const art = sheet.current.querySelector<HTMLElement>('[data-flip-id]')
    const id = art?.dataset.flipId
    const state = art && fx.current && !prefersReducedMotion() ? fx.current.Flip.getState(art) : null
    setOpen(null)
    if (!viaHistory && location.hash) history.back()
    requestAnimationFrame(() => {
      const target = id ? rail.current?.querySelector<HTMLElement>(`[data-flip-id="${id}"]`) : null
      if (state && target) fx.current?.Flip.from(state, { targets: target, duration: 0.7, ease: ease.swash, absolute: true, zIndex: 80 })
      returnFocus.current?.focus({ preventScroll: true })
    })
  }, [])

  // Animate the product's photo from its card into the sheet.
  useLayoutEffect(() => {
    if (!open || !sheet.current) return
    const art = sheet.current.querySelector<HTMLElement>('[data-flip-id]')
    if (flipState.current && art) {
      fx.current?.Flip.from(flipState.current, { targets: art, duration: 0.8, ease: ease.swash, absolute: true, zIndex: 80 })
    }
    gsap.from(sheet.current.querySelectorAll('.sheet-fade'), { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.2, ease: ease.swash })
    gsap.from(sheet.current.querySelector('.sheet-scrim'), { autoAlpha: 0, duration: 0.4 })
    sheet.current.querySelector<HTMLElement>('.sheet-close')?.focus({ preventScroll: true })
    getLenis()?.stop()
    return () => getLenis()?.start()
  }, [open])

  // Back button closes the sheet; a shared #product link opens it.
  useEffect(() => {
    const onPop = () => {
      const p = products.find((x) => `#${x.id}` === location.hash)
      if (p) setOpen(p)
      else hide(true)
    }
    const initial = products.find((x) => `#${x.id}` === location.hash)
    if (initial) {
      scrollToTarget('#cabinet')
      setOpen(initial)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [hide])

  // Keep focus inside the open sheet; Esc closes it.
  const onSheetKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return hide()
    if (e.key !== 'Tab' || !sheet.current) return
    const f = sheet.current.querySelectorAll<HTMLElement>('a[href], button')
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Arrow keys move along the rail.
  const onRailKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const cards = Array.from(rail.current?.querySelectorAll<HTMLButtonElement>('.cab-card button') ?? [])
    const i = cards.indexOf(document.activeElement as HTMLButtonElement)
    const next = cards[Math.max(0, Math.min(cards.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))]
    if (next) {
      e.preventDefault()
      next.focus()
      next.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  return (
    <section ref={root} id="cabinet" aria-labelledby="cabinet-title" className="cabinet relative bg-night-deep py-(--space-section)">
      <div className="cab-head flex flex-col gap-4 px-(--space-gutter) md:flex-row md:items-end md:justify-between">
        <h2 id="cabinet-title" className="text-display font-extrabold text-icing">
          <span className="block font-serif text-lede font-normal text-on-night-soft italic">Freshly baked cakes, savories &amp; more</span>
          In the cabinet
        </h2>
        <p className="max-w-[34ch] font-display text-small text-on-night-soft">
          Prices as labelled in our cabinets, November 2026. Ask in store for today's range.
        </p>
      </div>

      <div className="cab-glass relative mx-(--space-gutter) mt-12 rounded-cabinet">
        {/* Draggable (scrollLeft) wraps the scroller's children, so it gets the outer div */}
        <div ref={scroller} data-cursor="drag" className="cab-rail snap-x snap-mandatory overflow-x-auto">
        <ul ref={rail} onKeyDown={onRailKey} className="flex w-max gap-4 px-5 py-8 md:gap-6 md:px-8 md:py-10" aria-label="Products">
          {products.map((p) => (
            <li key={p.id} className="cab-card w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[22vw] md:min-w-[260px]">
              <button
                type="button"
                data-cursor="open"
                onClick={(e) => show(p, e.currentTarget)}
                className="group block w-full text-left"
                aria-haspopup="dialog"
              >
                <div className={`cab-photo relative aspect-[4/5] overflow-hidden rounded-cabinet ${p.cutout ? 'bg-velvet/60' : 'bg-velvet'}`}>
                  <ProductArt p={p} sizes="(min-width: 768px) 22vw, 68vw" flipId={`p-${p.id}`} />
                </div>
                <span className="mt-4 block font-display text-h3 leading-tight font-bold text-icing">{p.name}</span>
                <span className="mt-1 block font-display text-small font-semibold text-gold">{formatPrice(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
        </div>
      </div>

      {open && (
        <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="sheet-title" onKeyDown={onSheetKey} className="fixed inset-0 z-[70] grid place-items-center p-3 md:p-8">
          <div className="sheet-scrim absolute inset-0 bg-night-deep/85" onClick={() => hide()} />
          <div className="relative grid max-h-full w-full max-w-5xl overflow-auto rounded-cabinet bg-velvet shadow-lift md:grid-cols-[1.1fr_1fr]">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[70vh]">
              <ProductArt p={open} sizes="(min-width: 768px) 55vw, 100vw" flipId={`p-${open.id}`} />
            </div>
            <div className="flex flex-col gap-6 p-6 md:p-10">
              <button type="button" onClick={() => hide()} className="sheet-close self-end rounded-roundel border border-icing/30 px-5 py-3 font-display text-small font-bold text-icing">
                Close
              </button>
              <p className="sheet-fade font-display text-small text-on-night-soft">{open.kind}</p>
              <h3 id="sheet-title" className="sheet-fade punch text-display text-icing">{open.name}</h3>
              <p className="sheet-fade font-display text-h2 font-bold text-gold">{formatPrice(open.price)}</p>
              <p className="sheet-fade text-on-night-soft">
                {open.source === 'instagram' ? 'As announced on our Instagram.' : 'From our cabinet.'} Call ahead to check it's in at your nearest outlet: {business.outlets.map((o) => o.name).join(', ')}.
              </p>
              <div className="sheet-fade mt-auto flex flex-wrap gap-3">
                <Button href={`tel:${business.phone.tel}`}>Call to order</Button>
                <Button href="#find-us" variant="outline" onClick={(e) => { e.preventDefault(); hide(); setTimeout(() => scrollToTarget('#find-us'), 450) }}>
                  Find an outlet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
