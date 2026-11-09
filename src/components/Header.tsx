import { useEffect, useRef, useState } from 'react'
import { business } from '../content/business'
import { Logo } from './Logo'
import { gsap, ease, getLenis, scrollToTarget } from '../lib/motion'

const links = [
  { href: '#cabinet', label: 'Cakes & bakes' },
  { href: '#walk-in', label: 'Our place' },
  { href: '#find-us', label: 'Find us' },
]

/** Hanging maroon tab with the logo; hides on scroll down, returns on scroll up. */
export function Header() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  // Over the cream hero the header switches to maroon ink (the open menu is always dark).
  const [onLight, setOnLight] = useState(true)
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setOnLight(e.isIntersecting), { rootMargin: '0px 0px -92% 0px' })
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  const light = onLight && !open

  useEffect(() => {
    let lastY = window.scrollY
    let hidden = false
    const onScroll = () => {
      const y = window.scrollY
      const hide = y > lastY && y > 240
      if (hide !== hidden && ref.current) {
        hidden = hide
        gsap.to(ref.current, { yPercent: hide ? -110 : 0, duration: hide ? 0.35 : 0.6, ease: hide ? ease.exit : ease.swash })
      }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-(--space-gutter)">
      <a href="#top" onClick={go('#top')} className="logo-tab block rounded-tab bg-maroon px-3 pt-4 pb-3 shadow-lift" aria-label="Spunchy, back to top">
        <Logo className="h-14 w-14 md:h-16 md:w-16" />
      </a>

      <nav aria-label="Main" className="mt-4 flex items-center gap-2">
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={go(l.href)} className={`nav-link rounded-roundel px-4 py-3 font-display text-small font-semibold transition-colors duration-(--duration-ui) ${light ? 'text-maroon' : 'text-icing'}`}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`tel:${business.phone.tel}`}
          className={`inline-flex min-h-12 items-center rounded-roundel px-5 font-display text-small font-bold transition-colors duration-(--duration-ui) ${light ? 'bg-maroon text-icing' : 'bg-gold text-ink'}`}
        >
          Call
        </a>
        <button
          type="button"
          className={`inline-flex min-h-12 items-center rounded-roundel border px-5 font-display text-small font-bold transition-colors duration-(--duration-ui) md:hidden ${light ? 'border-maroon/40 text-maroon' : 'border-icing/40 text-icing'}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`mobile-menu fixed inset-0 -z-10 flex flex-col justify-end bg-maroon px-(--space-gutter) pb-16 md:hidden ${open ? 'is-open' : ''}`}
        hidden={!open}
      >
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={go(l.href)} className="punch block py-1 text-display text-icing">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10 font-display text-small text-on-night-soft">{business.outlets.map((o) => o.name).join(', ')}</p>
      </div>
    </header>
  )
}
