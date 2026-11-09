import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { business } from '../content/business'
import { imageSet } from '../lib/images'
import { gsap, ease, isRichDevice, mq, prefersReducedMotion, SplitText, ScrollTrigger, scrollToTarget } from '../lib/motion'
import { useGsap } from '../hooks/useGsap'
import type { SceneInput } from '../three/HeroScene'

const HeroScene = lazy(() => import('../three/HeroScene'))

// Must match the <link rel="preload"> in index.html.
const HERO_SIZES = '(min-width: 768px) 50vw, 92vw'
const HERO_SRCSET = (ext: 'avif' | 'webp') => [480, 800, 1280, 1920].map((w) => `/hero/cake-${w}.${ext} ${w}w`).join(', ')

/** Which version of the 3D scene this device gets, or none (static backdrop + image). */
function sceneMode(): 'full' | 'lite' | null {
  if (prefersReducedMotion()) return null
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (conn?.saveData) return null
  try {
    const c = document.createElement('canvas')
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return null
  } catch {
    return null
  }
  if (isRichDevice()) return 'full'
  return (navigator.hardwareConcurrency ?? 4) >= 4 ? 'lite' : null
}

/**
 * "Cake is the language of love": the cabinet at night. Layers, back to front:
 * the blurred real cabinet (instant), the 3D scene with the real cake (after the intro),
 * then the poster type and actions.
 */
export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<'full' | 'lite' | null>(null)
  const [sceneOn, setSceneOn] = useState(false)
  const cake = imageSet('cake-rosettes-cut')
  const input = useRef<SceneInput>({ pointer: { current: { x: 0, y: 0 } }, scroll: { current: 0 } }).current

  // Entrance, after the intro hands over.
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
          .from(split.chars, { yPercent: 105, duration: 1.1, stagger: 0.06 })
          .from('.hero-lede', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.1)
          // Transform only: the cake is painted under the intro from the start (LCP).
          .from('.hero-cake', { y: 60, scale: 0.92, duration: 1.3 }, 0.15)
          .from('.hero-foot > *', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.5)
        return () => split.revert()
      })
    },
    [ready],
  )

  // Scroll: the word slides away; the 3D camera dollies in (progress fed to the scene).
  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 }
      gsap.to('.hero-cake', { yPercent: -18, scale: 0.86, ease: 'none', scrollTrigger: st })
      gsap.to('.hero-punch', { xPercent: -14, ease: 'none', scrollTrigger: st })
      gsap.to('.hero-lede', { yPercent: -60, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '40% top' } })
      ScrollTrigger.create({ ...st, scrub: false, onUpdate: (self) => (input.scroll.current = self.progress) })
    })
  })

  // Pointer (desktop) or device tilt (phones) steer the camera.
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      input.pointer.current = { x: (e.clientX / innerWidth) * 2 - 1, y: -((e.clientY / innerHeight) * 2 - 1) }
    }
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      input.pointer.current = { x: Math.max(-1, Math.min(1, e.gamma / 30)), y: Math.max(-1, Math.min(1, (45 - e.beta) / 30)) }
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [input])

  // The scene loads once the intro has handed over (it is a separate ~250 kB chunk).
  useEffect(() => {
    if (ready) setMode(sceneMode())
  }, [ready])

  return (
    <section ref={root} id="top" className="hero grain relative isolate flex min-h-dvh flex-col overflow-hidden px-(--space-gutter) pt-28 pb-10 md:pt-32">
      {/* 1. The real cabinet, blurred into bokeh: depth from the first paint */}
      <div className="hero-backdrop absolute inset-0 -z-20" aria-hidden="true" />

      {/* 2. The 3D scene */}
      {mode && (
        <div className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${sceneOn ? 'opacity-100' : 'opacity-0'}`}>
          <Suspense fallback={null}>
            <HeroScene input={input} lite={mode === 'lite'} onReady={() => setSceneOn(true)} />
          </Suspense>
        </div>
      )}

      {/* The cut-out image: what you see before the scene (and instead of it without WebGL).
          In flow on phones, to the right on larger screens; it keeps its space once hidden. */}
      <div className="hero-cake pointer-events-none relative z-10 mx-auto -mb-6 w-[min(92vw,520px)] md:absolute md:top-[14%] md:right-[3%] md:mb-0 md:w-[min(50vw,820px)]">
        <div className="relative" style={{ aspectRatio: `${cake.width} / ${cake.height}` }}>
          {/* The LCP image: stable /public URLs, preloaded from index.html (same srcset/sizes) */}
          <picture className={`absolute inset-0 transition-opacity duration-1000 ${sceneOn ? 'opacity-0' : 'opacity-100'}`}>
            <source type="image/avif" srcSet={HERO_SRCSET('avif')} sizes={HERO_SIZES} />
            <img
              src="/hero/cake-1280.webp"
              srcSet={HERO_SRCSET('webp')}
              sizes={HERO_SIZES}
              width={cake.width}
              height={cake.height}
              fetchPriority="high"
              alt="Rosette celebration cake with pink, ivory and plum buttercream, from the Spunchy cabinet"
              className="h-full w-full object-contain drop-shadow-[0_3rem_2.5rem_rgb(18_3_6/0.85)]"
            />
          </picture>
        </div>
      </div>

      <div className="relative z-0 mt-auto">
        <h1 className="hero-reveal">
          <span className="sr-only">Cake is the language of love</span>
          <span aria-hidden="true" className="hero-lede relative z-20 block font-serif text-lede font-normal text-on-night-soft italic">Cake is the language of</span>
          <span aria-hidden="true" className="hero-punch punch block text-mega text-icing [text-shadow:0_0.5rem_2.5rem_rgb(18_3_6/0.55)]">love</span>
        </h1>
      </div>

      <div className="hero-foot hero-reveal relative z-20 mt-8 flex flex-col gap-5 md:mt-10 md:flex-row md:items-end md:justify-between">
        <p className="font-display text-small text-on-night-soft">
          {business.tagline}. {business.outlets.map((o) => o.name).join(', ')}.
        </p>
        <div className="flex flex-wrap gap-3">
          {business.pickme ? (
            <Button href={business.pickme} external>Order on PickMe Food</Button>
          ) : (
            <Button href="#cabinet" onClick={(e) => { e.preventDefault(); scrollToTarget('#cabinet') }}>See the cabinet</Button>
          )}
          <Button href={`tel:${business.phone.tel}`} variant="outline">Call {business.phone.display}</Button>
        </div>
      </div>
    </section>
  )
}
