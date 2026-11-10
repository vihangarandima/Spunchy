// GSAP + Lenis setup, shared motion tokens and capability checks.
// Easings mirror the CSS tokens in src/styles/tokens.css.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, MotionPathPlugin)

export const ease = {
  swash: 'expo.out',
  stroke: 'power3.inOut',
  pop: 'back.out(1.5)',
  exit: 'power2.in',
}
export const dur = { tap: 0.14, ui: 0.26, reveal: 0.75, scene: 1.2 }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Desktop-class device where the WebGL hero and custom cursor are worth it. */
export const isRichDevice = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine) and (min-width: 768px)').matches &&
  (navigator.hardwareConcurrency ?? 4) >= 4 &&
  !prefersReducedMotion()

/** Breakpoints for gsap.matchMedia. Pinned scenes only run on `desktop`. */
export const mq = {
  desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
}

let lenis: Lenis | null = null

/** Smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  // Dev only: lets automated checks jump to exact scroll positions.
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __ScrollTrigger: ScrollTrigger })
  return lenis
}

export const getLenis = () => lenis

export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -88, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export { gsap, ScrollTrigger, SplitText, Flip }

/** Jump to the top on route changes (Lenis keeps its own scroll position). */
export function scrollTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}
