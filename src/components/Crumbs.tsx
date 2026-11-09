import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

type Props = {
  /** Crumb colours for the current product */
  palette: string[]
  /** Where crumbs fall from, as fractions of the canvas: [x, y, spread] */
  source: [number, number, number]
  /** Fraction of the canvas height where crumbs land and fade */
  floor: number
  className?: string
}

type Crumb = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; c: string; shape: number[]; life: number }

/**
 * Crumbs falling from the hero product, like grounds from a bean: small irregular pieces
 * in the product's own colours, with gravity, drift and spin, fading at the shelf line.
 * Restrained on purpose (a few dozen at a time). Off with reduced motion; paused offscreen.
 */
export function Crumbs({ palette, source, floor, className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const state = useRef({ palette, source, floor })
  state.current = { palette, source, floor }

  useEffect(() => {
    const el = canvas.current
    if (!el || prefersReducedMotion()) return
    const ctx = el.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const phone = window.matchMedia('(max-width: 767.98px)').matches
    const max = phone ? 22 : 42
    const crumbs: Crumb[] = []
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let last = performance.now()
    let spawnAcc = 0

    const resize = () => {
      w = el.clientWidth
      h = el.clientHeight
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const spawn = () => {
      const { palette: p, source: [sx, sy, spread] } = state.current
      const r = 1.2 + Math.random() * (phone ? 2.4 : 3.2)
      // An irregular crumb: a jittered polygon
      const sides = 5 + Math.floor(Math.random() * 3)
      const shape = Array.from({ length: sides }, () => 0.65 + Math.random() * 0.5)
      crumbs.push({
        x: w * (sx + (Math.random() - 0.5) * spread),
        y: h * sy + Math.random() * 8,
        vx: (Math.random() - 0.5) * 18,
        vy: 10 + Math.random() * 30,
        r,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 4,
        c: p[Math.floor(Math.random() * p.length)],
        shape,
        life: 1,
      })
    }
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      spawnAcc += dt * (phone ? 9 : 16)
      while (spawnAcc > 1 && crumbs.length < max) {
        spawn()
        spawnAcc -= 1
      }
      ctx.clearRect(0, 0, w, h)
      const floorY = h * state.current.floor
      for (let i = crumbs.length - 1; i >= 0; i--) {
        const c = crumbs[i]
        c.vy += 260 * dt // gravity
        c.vx *= 0.995
        c.x += c.vx * dt
        c.y += c.vy * dt
        c.rot += c.vr * dt
        if (c.y > floorY - 40) c.life -= dt * 2.2
        if (c.life <= 0 || c.y > h) {
          crumbs.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, c.life))
        ctx.translate(c.x, c.y)
        ctx.rotate(c.rot)
        ctx.fillStyle = c.c
        ctx.beginPath()
        c.shape.forEach((k, j) => {
          const a = (j / c.shape.length) * Math.PI * 2
          const px = Math.cos(a) * c.r * k
          const py = Math.sin(a) * c.r * k * 0.8
          if (j) ctx.lineTo(px, py)
          else ctx.moveTo(px, py)
        })
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = performance.now()
    })
    io.observe(el)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={canvas} className={className} aria-hidden="true" />
}
