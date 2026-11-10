// Footer: categories, quick links, outlets, contact and socials, then the big wordmark.
import { useRef } from 'react'
import { Link } from 'react-router'
import { Swash } from '../components/Swash'
import { Logo } from '../components/Logo'
import { business, mapsSearch } from '../content/business'
import { liveCategories } from '../content/products'
import { gsap, ease } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

export function Footer() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.footer-swash .swash-stroke', { drawSVG: '0%', duration: 1.6, ease: ease.stroke, scrollTrigger: { trigger: root.current, start: 'top 85%' } })
    })
  })

  const socials = [
    { label: 'Instagram', href: business.socials.instagram },
    { label: 'Facebook', href: business.socials.facebook },
    { label: 'TikTok', href: business.socials.tiktok },
  ].filter((s): s is { label: string; href: string } => !!s.href)

  return (
    <footer ref={root} className="relative overflow-hidden bg-night-deep px-(--space-gutter) pt-20 pb-28 text-icing md:pb-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Logo className="h-16 w-16 shadow-glow" />
          <p className="punch mt-5 text-h2 uppercase">{business.tagline}</p>
          <p className="mt-2 text-on-night-soft">{business.summary}.</p>
        </div>
        <FooterCol title="Our products">
          {liveCategories.map((c) => (
            <li key={c.slug}>
              <Link className="nav-link py-1.5 inline-block" to={`/menu/${c.slug}`}>{c.name}</Link>
            </li>
          ))}
        </FooterCol>
        <FooterCol title="Quick links">
          <li><Link className="nav-link py-1.5 inline-block" to="/menu">Full menu</Link></li>
          <li><Link className="nav-link py-1.5 inline-block" to="/outlets">Outlets</Link></li>
          <li><Link className="nav-link py-1.5 inline-block" to="/about">About Spunchy</Link></li>
          <li><Link className="nav-link py-1.5 inline-block" to="/checkout">Checkout</Link></li>
        </FooterCol>
        <FooterCol title="Outlets">
          {business.outlets.map((o) => (
            <li key={o.id}>
              <a className="nav-link py-1.5 inline-block" href={mapsSearch(o.name)} target="_blank" rel="noopener noreferrer">{o.name}</a>
            </li>
          ))}
        </FooterCol>
        <FooterCol title="Get in touch">
          <li><a className="nav-link py-1.5 inline-block" href={`tel:${business.phone.tel}`}>{business.phone.display}</a></li>
          {socials.map((s) => (
            <li key={s.label}>
              <a className="nav-link py-1.5 inline-block" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
            </li>
          ))}
          {business.pickme && (
            <li><a className="nav-link py-1.5 inline-block" href={business.pickme} target="_blank" rel="noopener noreferrer">Order on PickMe Food</a></li>
          )}
        </FooterCol>
      </div>

      <div className="relative mt-16">
        <p className="punch text-center text-[24vw] leading-none text-maroon uppercase select-none" aria-hidden="true">Spunchy</p>
        <Swash className="footer-swash absolute inset-x-0 bottom-[-6%] mx-auto w-[70%]" />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-icing/15 pt-6 font-display text-micro text-on-night-soft">
        <p>© {new Date().getFullYear()} Spunchy Pastry &amp; Bakery, Sri Lanka</p>
        <p>Prices in Sri Lankan rupees. Availability varies by outlet.</p>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="font-display text-small">
      <h2 className="mb-3 text-small font-bold text-gold">{title}</h2>
      <ul>{children}</ul>
    </div>
  )
}
