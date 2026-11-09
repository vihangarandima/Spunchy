import { useEffect, useRef, useState } from 'react'
import { gsap, isRichDevice } from '../lib/motion'

/**
 * The gold comet: a dot whose tail stretches along its direction of travel, like the
 * swash. Over interactive elements it grows into a roundel, labelled from data-cursor.
 * Desktop + fine pointer only; the native cursor is hidden only while this is active.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const tail = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  // Decided after mount so the prerendered HTML and the first client render match.
  const [enabled, setEnabled] = useState(false)
  useEffect(() => setEnabled(isRichDevice()), [])

  useEffect(() => {
    if (!enabled || !root.current || !tail.current) return
    document.documentElement.classList.add('has-comet')
    const xTo = gsap.quickTo(root.current, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(root.current, 'y', { duration: 0.35, ease: 'power3.out' })
    let last = { x: 0, y: 0, t: performance.now() }

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const now = performance.now()
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      const speed = Math.min(Math.hypot(dx, dy) / Math.max(now - last.t, 1), 3)
      gsap.to(tail.current, {
        rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
        scaleX: 1 + speed * 1.6,
        duration: 0.25,
        overwrite: true,
      })
      last = { x: e.clientX, y: e.clientY, t: now }
      settle.restart(true)
    }
    // When the pointer stops, the tail pulls back into the dot.
    const settle = gsap.delayedCall(0.12, () => gsap.to(tail.current, { scaleX: 1, duration: 0.45, ease: 'power3.out' })).pause()
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button')
      const kind = t?.dataset.cursor ?? (t ? 'link' : '')
      root.current!.dataset.state = kind
      setLabel(kind === 'drag' ? 'Drag' : kind === 'open' ? 'Open' : '')
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    return () => {
      document.documentElement.classList.remove('has-comet')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      settle.kill()
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={root} className="comet pointer-events-none fixed top-0 left-0 z-[100]" aria-hidden="true">
      <div ref={tail} className="comet-tail" />
      <div className="comet-ring">{label && <span>{label}</span>}</div>
    </div>
  )
}
