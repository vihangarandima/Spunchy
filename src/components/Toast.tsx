// "Choco Brick added · View cart" toast (S4) and, on phones, the floating cart pill.
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { useCart, cartCount, cartTotal } from '../store/cart'
import { formatLKR } from '../content/products'

export function Toast() {
  const toast = useCart((s) => s.toast)
  const openDrawer = useCart((s) => s.openDrawer)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!toast) return
    setShown(true)
    const t = setTimeout(() => setShown(false), 3000)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div role="status" aria-live="polite" className={`toast fixed bottom-24 left-1/2 z-[95] flex items-center gap-4 rounded-roundel bg-ink py-2 pr-2 pl-5 font-display text-small text-icing shadow-lift md:bottom-8 ${shown ? 'is-open' : ''}`}>
      <span>{toast?.text}</span>
      <button type="button" className="btn btn-gold min-h-10 px-4" onClick={() => openDrawer(true)} tabIndex={shown ? 0 : -1}>
        View cart
      </button>
    </div>
  )
}

export function FloatingCart() {
  const lines = useCart((s) => s.lines)
  const openDrawer = useCart((s) => s.openDrawer)
  const { pathname } = useLocation()
  const n = cartCount(lines)
  if (!n || pathname === '/checkout') return null
  return (
    <button
      type="button"
      onClick={() => openDrawer(true)}
      className="btn btn-gold fixed inset-x-4 bottom-4 z-[80] justify-between shadow-lift md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span>Cart · {n}</span>
      <span>{formatLKR(cartTotal(lines))}</span>
    </button>
  )
}
