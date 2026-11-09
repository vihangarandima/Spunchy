import { useRef } from 'react'
import { Swash } from '../components/Swash'
import { Logo } from '../components/Logo'
import { business } from '../content/business'
import { gsap, ease, scrollToTarget } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

/** Chapter 07: the swash draws across the page and the logo settles at its end, like the intro. */
export function Footer() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'bottom bottom', scrub: 1 } })
      tl.from('.footer-swash .swash-stroke', { drawSVG: '0%', ease: ease.stroke })
        .from('.footer-logo', { scale: 0.6, autoAlpha: 0, rotation: -20, ease: ease.swash }, '-=0.25')
    })
  })

  const year = new Date().getFullYear()

  return (
    <footer ref={root} className="relative overflow-hidden bg-night-deep px-(--space-gutter) pt-24 pb-10">
      <div className="relative">
        <Swash className="footer-swash w-full" />
        <div className="footer-logo absolute top-[-6%] right-[2%] w-[18%] max-w-[180px]">
          <Logo className="w-full shadow-glow" />
        </div>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        <div>
          <p className="punch text-h1 text-icing">{business.tagline}</p>
          <p className="mt-3 text-on-night-soft">{business.summary}.</p>
        </div>
        <div className="font-display text-small">
          <h2 className="mb-3 text-small font-bold text-gold">Outlets</h2>
          <ul className="space-y-1 text-icing">
            {business.outlets.map((o) => (
              <li key={o.id}>{o.name}</li>
            ))}
          </ul>
        </div>
        <div className="font-display text-small">
          <h2 className="mb-3 text-small font-bold text-gold">Say hello</h2>
          <ul className="space-y-1">
            <li><a className="footer-link inline-flex min-h-11 items-center text-icing" href={`tel:${business.phone.tel}`}>{business.phone.display}</a></li>
            <li><a className="footer-link inline-flex min-h-11 items-center text-icing" href={business.instagram.url} target="_blank" rel="noopener noreferrer">Instagram {business.instagram.handle}</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-icing/15 pt-6 font-display text-micro text-on-night-soft">
        <p>© {year} Spunchy Pastry &amp; Bakery, Sri Lanka</p>
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollToTarget('#top') }} className="inline-flex min-h-11 items-center rounded-roundel border border-icing/30 px-4 text-icing">
          Back to top
        </a>
      </div>
    </footer>
  )
}
