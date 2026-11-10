// S0 · "The box opens". The logo is up from the first paint (index.html boot frame), the
// gold swash draws beneath it, four sprinkles flick off its end, the logo flies to the
// header and the maroon field splits like a cake-box lid to reveal the hero.
// Full once per session (2.2 s, 1.2 s on phones), quick after that; none with reduced motion.
// Any key or click skips it.
import { useLayoutEffect, useRef, useState } from 'react'
import { Swash } from '../components/Swash'
import { Logo } from '../components/Logo'
import { gsap, ease, prefersReducedMotion } from '../lib/motion'

const SEEN_KEY = 'spunchy:intro-seen'
const seen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
    if (prefersReducedMotion() || !root.current) {
      setGone(true)
      onDone()
      return
    }
    const phone = window.matchMedia('(max-width: 767.98px)').matches
    const k = seen() ? 0.35 : phone ? 0.55 : 1
    document.documentElement.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: ease.swash },
        onComplete: () => {
          try {
            sessionStorage.setItem(SEEN_KEY, '1')
          } catch {
            /* private mode */
          }
          document.documentElement.style.overflow = ''
          setGone(true)
          onDone()
        },
      })
      tl.from('.swash-stroke', { drawSVG: '0%', duration: 0.7 * k, ease: ease.stroke }, 0.25 * k)
        .fromTo('.intro-sprinkle', { x: 0, y: 0, autoAlpha: 1, rotate: 0 }, { x: (i) => 30 + i * 22, y: (i) => 120 + i * 40, rotate: (i) => 180 + i * 60, autoAlpha: 0, duration: 0.7 * k, stagger: 0.05, ease: 'power2.in' }, 0.85 * k)
      // Logo flies to the header slot
      tl.to('.intro-logo', {
        x: () => `+=${target().x}`,
        y: () => `+=${target().y}`,
        scale: () => target().s,
        duration: 0.7 * k,
        ease: ease.swash,
      }, 1.2 * k)
        .to('.intro-swash', { autoAlpha: 0, duration: 0.3 * k }, 1.2 * k)
        .to('.intro-lid-top', { yPercent: -101, duration: 0.6 * k, ease: ease.exit }, 1.4 * k)
        .to('.intro-lid-bottom', { yPercent: 101, duration: 0.6 * k, ease: ease.exit }, 1.4 * k)
        .to('.intro-logo', { autoAlpha: 0, duration: 0.15 }, 1.9 * k)

      const skip = () => tl.progress(1)
      window.addEventListener('keydown', skip, { once: true })
      window.addEventListener('pointerdown', skip, { once: true })
      return () => {
        window.removeEventListener('keydown', skip)
        window.removeEventListener('pointerdown', skip)
      }
    }, root)
    return () => {
      ctx.revert()
      document.documentElement.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Where the header logo sits, relative to the intro logo.
  const target = () => {
    const from = root.current?.querySelector('.intro-logo')?.getBoundingClientRect()
    const to = document.querySelector('header a[aria-label="Spunchy home"] img')?.getBoundingClientRect()
    if (!from || !to) return { x: 0, y: -200, s: 0.2 }
    return { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), s: to.width / from.width }
  }

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[110]" aria-hidden="true">
      <div className="intro-lid-top absolute inset-x-0 top-0 h-1/2 bg-night-deep" />
      <div className="intro-lid-bottom absolute inset-x-0 bottom-0 h-1/2 bg-night-deep" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-[min(78vw,720px)] aspect-[1000/300]">
          <Swash className="intro-swash absolute inset-0 w-full" />
          <div className="pointer-events-none absolute top-[10%] right-[2%]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="intro-sprinkle absolute block h-1.5 w-4 rounded-full bg-gold opacity-0" />
            ))}
          </div>
          <div className="intro-logo absolute top-[18%] left-1/2 w-[30%] -translate-x-1/2">
            <Logo className="w-full shadow-glow" />
          </div>
        </div>
      </div>
    </div>
  )
}
