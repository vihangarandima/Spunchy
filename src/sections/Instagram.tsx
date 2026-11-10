import { useRef } from 'react'
import { Img } from '../components/Img'
import { business } from '../content/business'
import { gsap, ease } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

// Instagram's embed script proved unreliable (blocked by ad blockers, privacy settings and
// slow networks) and heavy, so the section links to the real posts instead of embedding
// them, beside a mosaic of Spunchy's own shop photos.
const IG_HANDLE = '@spunchy.lk'

const POSTS = [
  { url: 'https://www.instagram.com/p/Denxm_kMypr/', label: 'Viral Choco Brick', date: '17 October 2026' },
  { url: 'https://www.instagram.com/p/DfWcyapsnL4/', label: 'Latest post', date: '4 November 2026' },
  { url: 'https://www.instagram.com/p/DdteJansvMb/', label: 'From the cabinet', date: '25 September 2026' },
]

const MOSAIC = [
  { id: 'cake-cabinet', alt: 'The cake cabinet at a Spunchy outlet', cls: 'row-span-2' },
  { id: 'buns-triangle', alt: 'Soft, fluffy triangle buns', cls: '' },
  { id: 'fruit-tart', alt: 'Fruit tart slices', cls: '' },
  { id: 'poster-love-wall', alt: 'The Love poster on the oak wall', cls: 'row-span-2' },
  { id: 'tray-blueberry', alt: 'Blueberry gateau slices', cls: '' },
  { id: 'interior', alt: 'Inside a Spunchy outlet', cls: '' },
]

/** Chapter 06: Spunchy on Instagram. No invented reviews; links to their real posts. */
export function Instagram() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.ig-tile', { y: 60, autoAlpha: 0, stagger: 0.08, duration: 1, ease: ease.swash, scrollTrigger: { trigger: '.ig-mosaic', start: 'top 80%' } })
    })
  })

  return (
    <section ref={root} id="instagram" aria-labelledby="ig-title" className="overflow-x-clip bg-night-deep py-(--space-section)">
      <div className="grid gap-12 px-(--space-gutter) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-center lg:gap-16">
        <div>
          <h2 id="ig-title" className="text-[clamp(2.2rem,3.6vw,3.75rem)] font-extrabold whitespace-nowrap text-icing">
            <span className="block font-serif text-lede font-normal text-on-night-soft italic">Fresh from the feed</span>
            {IG_HANDLE}
          </h2>
          <ul className="mt-10 border-t border-icing/15">
            {POSTS.map((p) => (
              <li key={p.url} className="border-b border-icing/15">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-6 py-4">
                  <span className="font-display text-h3 font-bold text-icing transition-colors duration-(--duration-ui) group-hover:text-gold">{p.label}</span>
                  <span className="shrink-0 font-display text-micro text-on-night-soft">{p.date}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <a href={business.socials.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Follow {IG_HANDLE}</a>
          </div>
        </div>

        <a
          href={business.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Spunchy on Instagram, ${IG_HANDLE}`}
          className="ig-mosaic grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] md:grid-cols-3 md:gap-4"
        >
          {MOSAIC.map((m) => (
            <div key={m.id} className={`ig-tile overflow-hidden rounded-cabinet bg-velvet ${m.cls}`}>
              <Img id={m.id} alt={m.alt} sizes="(min-width: 768px) 20vw, 50vw" className="block h-full w-full" imgClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          ))}
        </a>
      </div>
    </section>
  )
}
