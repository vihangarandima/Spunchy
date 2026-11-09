import { useRef } from 'react'
import { Img } from '../components/Img'
import { business } from '../content/business'
import { gsap, ease, mq } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

// A walk through the shop, in the order you'd see it. Copy uses only Spunchy's own bio.
const scenes = [
  { id: 'shopfront', alt: 'The Spunchy shopfront: the script sign over a glass entrance', line: business.tagline },
  { id: 'interior', alt: 'Inside: the maroon ceiling raft, glowing cabinets and fresh bread', line: business.summary },
  { id: 'cake-cabinet', alt: 'The tall cake cabinet, with orange Spunchy boxes stacked on top', line: 'Celebration cakes, boxed to take home' },
  { id: 'poster-love-wall', alt: 'The Love poster on the oak wall under two spotlights', line: business.outlets.map((o) => o.name).join(', ') },
]

/** Chapter 04. Desktop: pinned; the camera pushes through one scene into the next. */
export function WalkIn() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const mm = gsap.matchMedia()

    mm.add(mq.desktop, () => {
      const frames = gsap.utils.toArray<HTMLElement>('.walk-frame')
      const lines = gsap.utils.toArray<HTMLElement>('.walk-line')
      gsap.set(frames.slice(1), { autoAlpha: 0, scale: 0.72 })
      gsap.set(lines.slice(1), { autoAlpha: 0, y: 40 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.walk-stage', start: 'top top', end: `+=${frames.length * 90}%`, pin: true, scrub: 1 },
      })
      frames.forEach((f, i) => {
        if (i === 0) return
        const at = tl.duration()
        // The current scene pushes past the camera while the next comes up behind it.
        tl.to(frames[i - 1], { scale: 1.35, autoAlpha: 0, duration: 1, ease: 'power2.in' }, at)
          .to(lines[i - 1], { autoAlpha: 0, y: -40, duration: 0.4 }, at)
          .to(f, { scale: 1, autoAlpha: 1, duration: 1, ease: ease.swash }, at + 0.15)
          .to(lines[i], { autoAlpha: 1, y: 0, duration: 0.5, ease: ease.swash }, at + 0.6)
          .to({}, { duration: 0.4 })
      })
    })

    mm.add(mq.mobile, () => {
      gsap.utils.toArray<HTMLElement>('.walk-scene').forEach((s) =>
        gsap.from(s, { y: 60, autoAlpha: 0, duration: 1, ease: ease.swash, scrollTrigger: { trigger: s, start: 'top 80%' } }),
      )
    })
  })

  return (
    <section ref={root} id="walk-in" aria-labelledby="walk-title" className="relative bg-night">
      <div className="px-(--space-gutter) pt-(--space-section) pb-10 md:pb-0">
        <h2 id="walk-title" className="text-display font-extrabold text-icing">
          <span className="block font-serif text-lede font-normal text-on-night-soft italic">Come in, the cabinet's lit</span>
          Our place
        </h2>
      </div>

      <div className="walk-stage relative grid gap-16 px-(--space-gutter) pb-(--space-section) md:motion-safe:h-dvh md:motion-safe:grid-cols-[1fr_1.25fr] md:items-center md:gap-10 md:motion-safe:overflow-hidden md:motion-safe:pb-0">
        <div className="relative hidden md:motion-safe:block md:h-[6em]">
          {scenes.map((s) => (
            <p key={s.id} className="walk-line absolute inset-x-0 top-0 punch text-h1 text-icing">{s.line}</p>
          ))}
        </div>
        <div className="relative mx-auto w-full max-w-3xl md:motion-safe:h-[78vh] md:motion-safe:max-w-none">
          {scenes.map((s) => (
            <figure key={s.id} className="walk-scene mb-12 md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:mb-0">
              <div className="walk-frame h-full overflow-hidden rounded-tab shadow-lift md:origin-center">
                <Img id={s.id} alt={s.alt} sizes="(min-width: 768px) 55vw, 92vw" className="block aspect-[4/5] md:motion-safe:aspect-auto md:motion-safe:h-full" imgClassName="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-4 font-display text-h3 font-bold text-icing md:motion-safe:sr-only">{s.line}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
