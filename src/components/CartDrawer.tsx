// The cart, sliding in from the right on every page.
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ProductArt } from './ProductArt'
import { QtyStepper } from './QtyStepper'
import { RollingNumber } from './RollingNumber'
import { productBySlug, formatLKR } from '../content/products'
import { useCart, cartTotal, cartCount } from '../store/cart'
import { getLenis } from '../lib/motion'

export function CartDrawer() {
  const { lines, drawerOpen, openDrawer, setQty, remove } = useCart()
  const panel = useRef<HTMLDivElement>(null)
  const total = cartTotal(lines)
  const count = cartCount(lines)

  useEffect(() => {
    const lenis = getLenis()
    if (!drawerOpen) {
      lenis?.start()
      return
    }
    lenis?.stop()
    const prev = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openDrawer(false)
      if (e.key === 'Tab' && panel.current) trapFocus(e, panel.current)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [drawerOpen, openDrawer])

  return (
    <>
      <div className={`scrim ${drawerOpen ? 'is-open' : ''}`} onClick={() => openDrawer(false)} aria-hidden="true" />
      <div
        ref={panel}
        className={`drawer flex flex-col bg-paper text-ink shadow-lift ${drawerOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        data-lenis-prevent
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 id="cart-title" className="text-h3 font-bold">
            Your order {count > 0 && <span className="text-ink/60">({count})</span>}
          </h2>
          <button type="button" onClick={() => openDrawer(false)} className="grid h-11 w-11 place-items-center rounded-full text-2xl hover:bg-ink/8" aria-label="Close cart">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <Whisk />
            <p className="lede text-ink/80">Nothing in the box yet.</p>
            <Link to="/menu" onClick={() => openDrawer(false)} className="btn btn-maroon">
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {lines.map((l) => {
                const product = productBySlug(l.productId)
                return (
                  <li key={l.key} className="flex gap-4 rounded-cabinet bg-icing p-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full [container-type:inline-size]" style={{ background: '#F3C9CF' }}>
                      {product && <ProductArt product={product} sizes="80px" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display font-bold leading-tight">{l.name}</p>
                        <button type="button" onClick={() => remove(l.key)} className="-mt-1 -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-ink/8 hover:text-ink" aria-label={`Remove ${l.name}`}>
                          ×
                        </button>
                      </div>
                      <p className="text-micro text-ink/70">
                        {[l.option, l.flavour, l.message && `“${l.message}”`].filter(Boolean).join(' · ') || formatLKR(l.unitPrice)}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <QtyStepper value={l.qty} onChange={(q) => setQty(l.key, q)} label={l.name} />
                        <span className="font-display font-bold">{formatLKR(l.unitPrice * l.qty)}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-ink/10 px-6 py-5">
              <div className="flex items-baseline justify-between font-display">
                <span className="text-small font-semibold">Subtotal</span>
                <span className="text-h3 font-bold">
                  <RollingNumber value={total} prefix="Rs. " />
                </span>
              </div>
              <p className="mt-1 text-micro text-ink/60">Pay at pickup or on delivery. Delivery charges, if any, are confirmed by the outlet.</p>
              <Link to="/checkout" onClick={() => openDrawer(false)} className="btn btn-maroon mt-4 w-full">
                Checkout · {formatLKR(total)}
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export function trapFocus(e: KeyboardEvent, root: HTMLElement) {
  const f = [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null)
  if (!f.length) return
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

/** Empty-cart whisk that gives a little stir. */
function Whisk() {
  return (
    <svg viewBox="0 0 120 120" className="whisk h-28 w-28 text-maroon" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M60 112 V70" strokeWidth="7" />
      <path d="M60 70 C 30 60, 32 14, 60 10 C 88 14, 90 60, 60 70 Z" />
      <path d="M60 70 C 44 58, 46 18, 60 10 C 74 18, 76 58, 60 70 Z" />
      <path d="M60 70 V10" />
    </svg>
  )
}
