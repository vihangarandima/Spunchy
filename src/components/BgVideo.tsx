// Decorative background loop. Loads only when it comes near the viewport, plays only while
// visible, and stays a still poster for reduced motion or Save-Data. Always muted and
// hidden from assistive tech.
import { useEffect, useRef, useState } from 'react'

type Props = {
  name: string // public/media/<name>.mp4 + <name>.webp
  className?: string
  style?: React.CSSProperties
  /** Start playing only when this is true (e.g. the hero slide is active). */
  active?: boolean
}

export function BgVideo({ name, className = '', style, active = true }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [still, setStill] = useState(true)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    setStill(!!(reduced || saveData))
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true)
        setVisible(e.intersectionRatio > 0)
      },
      { rootMargin: '400px 0px', threshold: [0, 0.01] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v || still || !near) return
    if (visible && active) v.play().catch(() => {})
    else v.pause()
  }, [visible, active, near, still])

  return (
    <video
      ref={ref}
      className={`pointer-events-none object-cover ${className}`}
      style={style}
      poster={`/media/${name}.webp`}
      src={near && !still ? `/media/${name}.mp4` : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
