import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { business } from '../content/business'

// Real @spunchy.lk posts. Embedded with Instagram's own embed only when the section is
// near the viewport, so nothing from Instagram loads on first paint.
const POSTS = [
  'https://www.instagram.com/p/Denxm_kMypr/', // Viral Choco Brick, Oct 2026
  'https://www.instagram.com/p/DfWcyapsnL4/', // Nov 2026
  'https://www.instagram.com/p/DdteJansvMb/', // Sep 2026
]

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

/** Chapter 06: social proof straight from their feed. No invented reviews. */
export function Instagram() {
  const root = useRef<HTMLElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    if (!root.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: '600px' })
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!load) return
    if (window.instgrm) return window.instgrm.Embeds.process()
    const s = document.createElement('script')
    s.src = 'https://www.instagram.com/embed.js'
    s.async = true
    document.body.appendChild(s)
  }, [load])

  return (
    <section ref={root} id="instagram" aria-labelledby="ig-title" className="bg-night-deep py-(--space-section)">
      <div className="flex flex-col gap-6 px-(--space-gutter) md:flex-row md:items-end md:justify-between">
        <h2 id="ig-title" className="text-display font-extrabold text-icing">
          <span className="block font-serif text-lede font-normal text-on-night-soft italic">Fresh from the feed</span>
          {business.instagram.handle}
        </h2>
        <Button href={business.instagram.url} external variant="outline">Follow on Instagram</Button>
      </div>

      <ul className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-(--space-gutter) pb-4">
        {POSTS.map((url) => (
          <li key={url} className="w-[min(86vw,400px)] shrink-0 snap-start">
            {load ? (
              <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ margin: 0, minWidth: 0, width: '100%' }}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-gold underline">View this post on Instagram</a>
              </blockquote>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer" className="grid aspect-[4/5] place-items-center rounded-cabinet bg-velvet font-display text-small text-on-night-soft">
                View this post on Instagram
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
