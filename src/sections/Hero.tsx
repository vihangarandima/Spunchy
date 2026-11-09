import { useRef } from 'react'
import { Button } from '../components/Button'
import { business } from '../content/business'
import { gsap, ease, mq, SplitText, scrollToTarget } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'

// The hero photograph (scripts/hero-composite.mjs): Spunchy's own cake cabinet in its
// store. Stable /public URLs, preloaded from index.html with the same sets and media.
const LANDSCAPE = (ext: 'avif' | 'webp') => [1280, 1920, 2560].map((w) => `/hero/cafe-${w}.${ext} ${w}w`).join(', ')
const PORTRAIT = (ext: 'avif' | 'webp') => [720, 1080].map((w) => `/hero/cafe-portrait-${w}.${ext} ${w}w`).join(', ')
const PHONE = '(max-width: 767.98px)'

/** "Cake is the language of love", over a full-bleed photograph of the Spunchy cabinet. */
export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  // Entrance, after the intro hands over: one orchestrated reveal, nothing scattered.
  useGsap(
    root,
    () => {
      if (!ready) return
      const mm = gsap.matchMedia()
      mm.add(mq.reduced, () => {
        gsap.set('.hero-reveal', { autoAlpha: 1 })
      })
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // aria: 'none' because the h1 carries the sentence in an sr-only span.
        const split = SplitText.create('.hero-punch', { type: 'chars', mask: 'chars', aria: 'none' })
        const tl = gsap.timeline({ defaults: { ease: ease.swash } })
        tl.set('.hero-reveal', { autoAlpha: 1 })
          .from('.hero-photo', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0)
          .from('.hero-rule', { scaleX: 0, duration: 1, transformOrigin: 'left center' }, 0.2)
          .from('.hero-lede', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.3)
          .from(split.chars, { yPercent: 105, duration: 1.1, stagger: 0.06 }, 0.35)
          .from('.hero-foot > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.8)
        return () => split.revert()
      })
    },
    [ready],
  )

  // Scroll: the photograph drifts slower than the page; the type lifts away.
  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to('.hero-photo-wrap', { yPercent: 18, ease: 'none', scrollTrigger: st })
      gsap.to('.hero-copy', { yPercent: -25, autoAlpha: 0.2, ease: 'none', scrollTrigger: st })
    })
  })

  return (
    <section ref={root} id="top" className="hero relative isolate flex min-h-dvh flex-col justify-end overflow-hidden bg-night-deep px-(--space-gutter) pt-32 pb-12 md:justify-center md:pb-16">
      {/* The photograph, full bleed */}
      <div className="hero-photo-wrap absolute inset-0 -z-10" aria-hidden="true">
        <picture className="hero-photo block h-full w-full">
          <source media={PHONE} type="image/avif" srcSet={PORTRAIT('avif')} sizes="100vw" />
          <source media={PHONE} type="image/webp" srcSet={PORTRAIT('webp')} sizes="100vw" />
          <source type="image/avif" srcSet={LANDSCAPE('avif')} sizes="100vw" />
          <img
            src="/hero/cafe-1920.webp"
            srcSet={LANDSCAPE('webp')}
            sizes="100vw"
            width={2560}
            height={1440}
            fetchPriority="high"
            alt=""
            className="h-full w-full object-cover object-top md:object-[75%_center]"
          />
        </picture>
        {/* Keeps the type side calm on any screen ratio */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(34_6_11/0.85)_0%,rgb(34_6_11/0.35)_45%,transparent_70%)] max-md:bg-[linear-gradient(180deg,transparent_45%,rgb(34_6_11/0.85)_70%)]" />
      </div>

      <div className="hero-copy relative max-w-[40rem]">
        <span className="hero-rule hero-reveal mb-6 block h-px w-24 bg-gold" aria-hidden="true" />
        <h1 className="hero-reveal">
          <span className="sr-only">Cake is the language of love</span>
          <span aria-hidden="true" className="hero-lede block font-serif text-lede font-normal text-on-night-soft italic">Cake is the language of</span>
          <span aria-hidden="true" className="hero-punch punch block text-mega text-icing">love</span>
        </h1>
        <div className="hero-foot hero-reveal mt-8 md:mt-10">
          <p className="max-w-[36ch] text-on-night-soft">
            {business.summary}. {business.outlets.map((o) => o.name).join(', ')}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {business.pickme ? (
              <Button href={business.pickme} external>Order on PickMe Food</Button>
            ) : (
              <Button href="#cabinet" onClick={(e) => { e.preventDefault(); scrollToTarget('#cabinet') }}>See the cabinet</Button>
            )}
            <Button href={`tel:${business.phone.tel}`} variant="outline">Call {business.phone.display}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
