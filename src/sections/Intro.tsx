import { useLayoutEffect, useRef, useState } from 'react'
import { Swash, SWASH_EDGE_TOP } from '../components/Swash'
import { Logo } from '../components/Logo'
import { gsap, ease, prefersReducedMotion } from '../lib/motion'

const SEEN_KEY = 'spunchy:intro-seen'

const readSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Opening: the logo is up from the first paint (index.html boot frame), the gold swash
 * draws itself beneath it, then the night field lifts away with the swash as its edge to
 * reveal the hero. About 2 s; repeat visits about 0.8 s; none with reduced motion.
 * Any key or click skips it.
 */
export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  // Starts mounted on the server and the client alike (hydration); reduced motion is
  // checked in the layout effect, before the first paint.
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    // index.html painted the first frame (field + logo) before JS; this component now
    // renders the identical frame, so the static one can go without a flash.
    document.getElementById('boot')?.remove()
    if (prefersReducedMotion() || !root.current) {
      setGone(true)
      onDone()
      return
    }
    const repeat = readSeen()
    const k = repeat ? 0.4 : 1
    document.documentElement.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: ease.swash },
        onComplete: () => {
          try {
            localStorage.setItem(SEEN_KEY, '1')
          } catch {
            /* private mode: the intro just plays in full next time */
          }
          document.documentElement.style.overflow = ''
          setGone(true)
          onDone()
        },
      })
      // The logo is already on screen (boot frame); the swash draws in beneath it.
      tl.from('.swash-stroke', { drawSVG: '0%', duration: 0.95 * k, ease: ease.stroke }, 0.1 * k)
        .to('.intro-logo', { y: -12, scale: 1.04, duration: 0.5 * k, ease: 'sine.inOut' }, '>-0.2')
        // Lift: the field rises with the swash as its trailing edge.
        .to('.intro-field', { y: () => -(window.innerHeight * 1.2), duration: 0.85 * k, ease: ease.stroke }, '>-0.05')
        .to('.intro-mark', { yPercent: -60, autoAlpha: 0, duration: 0.6 * k, ease: ease.exit }, '<')

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

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[90]" aria-hidden="true">
      <div className="intro-field absolute inset-x-0 top-0 h-full">
        <div className="h-full bg-night-deep" />
        {/* The trailing edge: the field ends in the swash curve */}
        <svg className="block h-[18vh] w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <path d={SWASH_EDGE_TOP} fill="var(--color-night-deep)" />
        </svg>
      </div>
      <div className="intro-mark absolute inset-0 grid place-items-center">
        <div className="relative w-[min(78vw,720px)]">
          <Swash className="w-full" />
          <div className="intro-logo absolute top-[18%] left-1/2 w-[30%] -translate-x-1/2">
            <Logo className="w-full shadow-glow" />
          </div>
        </div>
      </div>
    </div>
  )
}
