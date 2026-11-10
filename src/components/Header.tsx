// Announcement bar + header. Transparent over the hero (light or dark text to suit the
// current slide), paper with blur once scrolled. Cart icon carries the count badge and is
// the landing point of the add-to-cart flight (data-cart-icon).
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Logo } from './Logo'
import { RollingNumber } from './RollingNumber'
import { business } from '../content/business'
import { liveCategories } from '../content/products'
import { useCart, cartCount } from '../store/cart'
import { useUi } from '../store/ui'
import { getLenis } from '../lib/motion'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/menu/celebration-cakes', label: 'Cakes' },
  { to: '/menu/savory', label: 'Savory' },
  { to: '/outlets', label: 'Outlets' },
]

export function Header() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [barClosed, setBarClosed] = useState(false)
  const heroTone = useUi((s) => s.heroTone)
  const openSearch = useUi((s) => s.setSearchOpen)
  const lines = useCart((s) => s.lines)
  const openDrawer = useCart((s) => s.openDrawer)
  const count = cartCount(lines)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const overHero = pathname === '/' && !scrolled && !open
  const light = overHero && heroTone === 'light' // light text on a dark slide
  const ink = open ? 'text-icing' : light ? 'text-icing' : 'text-ink'

  return (
    <>
      {!barClosed && (
        <div className="relative z-[60] bg-maroon px-(--space-gutter) py-2 pr-12 text-center font-display text-micro font-semibold text-icing sm:text-small">
          <span className="sm:hidden">Order online · Pick up at {business.outlets.length} outlets</span>
          <span className="max-sm:hidden">
            Order online · Pick up at {business.outlets.map((o) => o.name).join(', ')}
            {business.pickme ? ' · Delivery on PickMe' : ''}
          </span>
          <button type="button" onClick={() => setBarClosed(true)} className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-lg hover:bg-icing/15" aria-label="Dismiss announcement">
            ×
          </button>
        </div>
      )}
      <header
        className={`sticky top-0 z-[70] transition-[background-color,box-shadow,color] duration-(--duration-ui) ${
          overHero ? 'bg-transparent' : open ? 'bg-maroon' : 'bg-paper/85 shadow-[0_1px_0_rgb(42_10_15/0.08)] backdrop-blur-md'
        } ${ink}`}
        style={pathname === '/' ? { marginBottom: 'calc(-1 * var(--header-h))' } : undefined}
      >
        <div className="flex h-(--header-h) items-center gap-3 px-(--space-gutter)">
          <Link to="/" className="relative z-10 -mt-1 self-start rounded-tab bg-maroon px-2.5 pt-3 pb-2 shadow-lift" aria-label="Spunchy home">
            <Logo className="h-12 w-12 md:h-14 md:w-14" />
          </Link>

          <nav aria-label="Main" className="ml-4 hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.end} className="nav-link rounded-roundel px-4 py-3 font-display text-small font-semibold">
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <IconButton label="Search the menu" onClick={() => openSearch(true)}>
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </IconButton>
            <button
              type="button"
              data-cart-icon
              onClick={() => openDrawer(true)}
              className="relative grid h-12 w-12 place-items-center rounded-full hover:bg-current/10"
              aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z" />
                <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
              </svg>
              {count > 0 && (
                <span key={count} className="badge-pop absolute top-0.5 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 font-display text-[0.7rem] font-bold text-ink">
                  <RollingNumber value={count} />
                </span>
              )}
            </button>
            <button
              type="button"
              className="ml-1 inline-flex h-12 items-center rounded-roundel border border-current/40 px-4 font-display text-small font-bold lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        <div id="mobile-menu" className={`mobile-menu fixed inset-0 -z-10 overflow-y-auto bg-maroon px-(--space-gutter) pt-28 pb-12 text-icing lg:hidden ${open ? 'is-open' : ''}`} hidden={!open}>
          <ul className="grid grid-cols-2 gap-3">
            {liveCategories.map((c) => (
              <li key={c.slug}>
                <Link to={`/menu/${c.slug}`} className="flex min-h-24 items-end rounded-cabinet bg-velvet p-4 font-display text-h3 font-bold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-8 space-y-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="punch block py-1 text-h1 uppercase">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={`tel:${business.phone.tel}`} className="btn btn-gold mt-8">
            Call {business.phone.display}
          </a>
        </div>
      </header>
    </>
  )
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="grid h-12 w-12 place-items-center rounded-full hover:bg-current/10" aria-label={label}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
