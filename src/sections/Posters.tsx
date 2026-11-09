import { useRef, type ReactNode } from 'react'
import { Img } from '../components/Img'
import { Swash, SWASH_EDGE } from '../components/Swash'
import { gsap, ease, mq } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

// Spunchy's in-store poster campaign, act by act. The words are theirs.
type Act = {
  id: string
  bg: string // CSS colour of the stage
  text: string // Tailwind text colour class
  soft: string // Tailwind class for the lead-in line
  before?: string
  punch: string
  after?: string
  art: ReactNode
}

const SLICES = [
  { id: 'tray-nuga', alt: 'Nuga gateau slices' },
  { id: 'tray-blueberry', alt: 'Blueberry gateau slices' },
  { id: 'tray-coffee', alt: 'Coffee slices' },
  { id: 'tray-choc-gateau', alt: 'Chocolate gateau slice showing its layers' },
  { id: 'tray-mousse', alt: 'Mousse cups' },
]

const acts: Act[] = [
  {
    id: 'fresh',
    bg: 'var(--color-ink)',
    text: 'text-paper',
    soft: 'text-on-night-soft',
    before: 'Soft, fluffy &',
    punch: 'fresh',
    art: (
      <Img
        id="buns-triangle-cut"
        alt="Golden triangle buns, one cut open to show its filling"
        sizes="(min-width: 768px) 46vw, 90vw"
        placeholder={false}
        className="act-art block w-[min(90vw,420px)] md:w-[46vw] md:max-w-[760px]"
        imgClassName="h-auto w-full drop-shadow-[0_2.5rem_2rem_rgb(0_0_0/0.6)]"
      />
    ),
  },
  {
    id: 'savory',
    bg: 'var(--color-paper)',
    text: 'text-maroon',
    soft: 'text-plum',
    punch: 'savory',
    after: 'Crispy, crunchy, crave-worthy.',
    art: (
      <div className="act-art w-[min(84vw,380px)] overflow-hidden rounded-tab shadow-lift md:w-[30vw] md:max-w-[480px]">
        <Img id="poster-savory" alt="Spunchy's Savory poster: crumbed savoury rolls on a white plate" sizes="(min-width: 768px) 30vw, 84vw" imgClassName="h-auto w-full" />
      </div>
    ),
  },
  {
    id: 'heaven',
    bg: 'var(--color-night)',
    text: 'text-icing',
    soft: 'text-on-night-soft',
    before: 'A slice of',
    punch: 'heaven',
    after: 'in every bite.',
    art: (
      <ul
        className="act-art act-shelf -mx-(--space-gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--space-gutter) pb-4 md:mx-0 md:motion-safe:snap-none md:gap-6 md:motion-safe:overflow-visible md:px-0 md:pb-0"
        aria-label="Gateau slices from the cabinet"
      >
        {SLICES.map((s) => (
          <li key={s.id} className="w-[58vw] shrink-0 snap-start overflow-hidden rounded-cabinet bg-velvet shadow-lift md:w-[17vw] md:max-w-[300px]">
            <Img id={s.id} alt={s.alt} sizes="(min-width: 768px) 17vw, 58vw" className="block aspect-[4/5] md:aspect-square" imgClassName="h-full w-full object-cover" />
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'love',
    bg: 'var(--color-maroon)',
    text: 'text-icing',
    soft: 'text-on-night-soft',
    before: 'Cake is the language of',
    punch: 'love',
    art: (
      <div className="act-art w-[min(88vw,420px)] overflow-hidden rounded-tab shadow-lift md:w-[34vw] md:max-w-[560px]">
        <Img
          id="poster-love-wall"
          alt="The 'Cake is the language of Love' poster on Spunchy's oak wall, under two spotlights"
          sizes="(min-width: 768px) 34vw, 88vw"
          className="block aspect-[4/5]"
          imgClassName="act-zoom h-full w-full object-cover"
        />
      </div>
    ),
  },
]

/** Chapter 02. Desktop: one pinned stage, acts wipe in along the swash as you scroll. */
export function Posters() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const mm = gsap.matchMedia()

    mm.add(mq.desktop, () => {
      const panels = gsap.utils.toArray<HTMLElement>('.act')
      gsap.set(panels.slice(1), { yPercent: 118 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.acts', start: 'top top', end: `+=${panels.length * 100}%`, pin: true, scrub: 1, anticipatePin: 1 },
      })
      panels.forEach((panel, i) => {
        const at = i === 0 ? 0 : tl.duration()
        if (i > 0) {
          tl.to(panel, { yPercent: 0, duration: 1, ease: ease.stroke }, at)
          tl.fromTo(panel.querySelector('.act-ribbon'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7 }, at)
        }
        const art = panel.querySelector('.act-art')
        // The first act is already on screen when the pin starts, so it is shown in its
        // final state (animating it in from nothing left a blank first frame).
        if (i > 0) tl.from(panel.querySelectorAll('.act-line'), { yPercent: 60, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: ease.swash }, at + 0.55)
        if (panel.dataset.act === 'fresh') tl.to(art, { xPercent: -6, yPercent: -4, rotation: 2, duration: 1, ease: 'none' }, at)
        if (panel.dataset.act === 'savory') tl.from(art, { yPercent: -70, autoAlpha: 0, duration: 0.8, ease: ease.swash }, at + 0.5)
        if (panel.dataset.act === 'heaven') tl.fromTo(art, { x: () => window.innerWidth * 0.35 }, { x: () => -(art!.scrollWidth - window.innerWidth * 0.6), duration: 1.6 }, at + 0.4)
        if (panel.dataset.act === 'love') {
          tl.from(art, { scale: 0.7, autoAlpha: 0, duration: 0.8, ease: ease.swash }, at + 0.5)
          tl.fromTo(panel.querySelector('.act-zoom'), { scale: 1.6 }, { scale: 1, duration: 1.2 }, at + 0.5)
        }
        tl.to({}, { duration: 0.6 }) // dwell
      })
    })

    mm.add(mq.mobile, () => {
      gsap.utils.toArray<HTMLElement>('.act').forEach((panel) => {
        gsap.from(panel.querySelectorAll('.act-line, .act-art'), {
          y: 40,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: ease.swash,
          scrollTrigger: { trigger: panel, start: 'top 70%' },
        })
      })
    })
  })

  return (
    <section ref={root} id="posters" aria-label="From our posters" className="relative">
      <div className="acts relative md:motion-safe:h-dvh md:motion-safe:overflow-hidden">
        {acts.map((a, i) => (
          <article
            key={a.id}
            data-act={a.id}
            className={`act relative flex min-h-dvh flex-col justify-center gap-10 px-(--space-gutter) py-24 md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:min-h-0 md:flex-row md:justify-between md:motion-safe:py-0 ${
              a.id === 'heaven' ? 'md:items-start md:motion-safe:pt-[18vh]' : 'md:items-center'
            }`}
            style={{ background: a.bg, zIndex: i }}
          >
            {/* Leading edge: the panel arrives with the swash as its top */}
            {i > 0 && (
              <div className="pointer-events-none absolute inset-x-0 -top-[17vh] h-[18vh]" aria-hidden="true">
                <svg className="h-full w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <path d={SWASH_EDGE} fill={a.bg} />
                </svg>
                <Swash className="act-ribbon-wrap absolute inset-0 h-full w-full" strokeClassName="act-ribbon" stretch />
              </div>
            )}
            <h2 className={`relative z-10 max-w-[12ch] md:max-w-none ${a.text}`}>
              {a.before && <span className={`act-line block font-serif text-lede font-normal italic ${a.soft}`}>{a.before}</span>}
              <span className="act-line punch block text-mega">{a.punch}</span>
              {a.after && <span className={`act-line mt-3 block font-serif text-lede font-normal italic ${a.soft}`}>{a.after}</span>}
            </h2>
            <div className={`relative ${a.id === 'heaven' ? 'md:motion-safe:absolute md:motion-safe:bottom-[9vh] md:motion-safe:left-0 md:motion-safe:w-full' : ''}`}>{a.art}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
