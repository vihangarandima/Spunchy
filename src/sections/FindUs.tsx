import { useRef, useState } from 'react'
import { Img } from '../components/Img'
import { Button } from '../components/Button'
import { business, mapsSearch } from '../content/business'
import { gsap, ease } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

/** Chapter 05: the four outlets on the oak wall, and one clear way to order. */
export function FindUs() {
  const root = useRef<HTMLElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.outlet', { xPercent: -8, autoAlpha: 0, stagger: 0.08, duration: 1, ease: ease.swash, scrollTrigger: { trigger: '.outlets', start: 'top 75%' } })
      gsap.fromTo('.oak-bg img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } })
    })
  })

  return (
    <section ref={root} id="find-us" aria-labelledby="find-title" className="relative isolate overflow-hidden py-(--space-section)">
      {/* The store's oak wall, darkened so the type reads (decorative) */}
      <div className="oak-bg absolute inset-0 -z-10" aria-hidden="true">
        <Img id="oak-wall" alt="" sizes="100vw" className="block h-[112%] w-full -translate-y-[6%]" imgClassName="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/95 via-night/80 to-night/95" />
      </div>

      <div className="px-(--space-gutter)">
        <h2 id="find-title" className="text-display font-extrabold text-icing">
          <span className="block font-serif text-lede font-normal text-on-night-soft italic">Four outlets</span>
          Find us
        </h2>

        <ul className="outlets mt-12 border-t border-icing/20">
          {business.outlets.map((o) => {
            const open = openId === o.id
            return (
              <li key={o.id} className="outlet border-b border-icing/20">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`outlet-${o.id}`}
                    onClick={() => setOpenId(open ? null : o.id)}
                    className="group flex w-full items-center justify-between gap-6 py-5 text-left md:py-7"
                  >
                    <span className="punch text-display text-icing transition-colors duration-(--duration-ui) group-hover:text-gold">{o.name}</span>
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-roundel border border-gold text-gold transition-transform duration-(--duration-ui) ${open ? 'rotate-45' : ''}`} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </span>
                  </button>
                </h3>
                <div id={`outlet-${o.id}`} hidden={!open} className="pb-8">
                  <p className="max-w-[52ch] text-on-night-soft">
                    {o.address ?? `Spunchy ${o.name}.`} {o.hours ?? `Call ${business.phone.display} for directions and today's opening hours.`}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button href={mapsSearch(o.name)} external variant="outline">Open in Google Maps</Button>
                    <Button href={`tel:${business.phone.tel}`}>Call {business.phone.display}</Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-20 grid gap-8 rounded-cabinet bg-maroon p-8 shadow-lift md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <p className="punch text-h1 text-icing">Want a cake for the weekend? Call us.</p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button href={`tel:${business.phone.tel}`}>Call {business.phone.display}</Button>
            {business.whatsapp && <Button href={`https://wa.me/${business.whatsapp}`} external variant="icing">WhatsApp</Button>}
            {business.pickme && <Button href={business.pickme} external variant="outline">Order on PickMe Food</Button>}
          </div>
        </div>
      </div>
    </section>
  )
}
