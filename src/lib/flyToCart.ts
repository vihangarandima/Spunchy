// S4 of the animation script: a copy of the product flies along an arc into the header
// cart, which wobbles and throws three gold sprinkles.
import { gsap, ease, prefersReducedMotion } from './motion'

export function flyToCart(from: Element | null) {
  const cart = document.querySelector<HTMLElement>('[data-cart-icon]:not([hidden])')
  if (!cart) return
  const wobble = () => {
    gsap.fromTo(cart, { rotate: -12 }, { rotate: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.35)' })
    sprinkles(cart)
  }
  if (!from || prefersReducedMotion()) return
  const src = from.getBoundingClientRect()
  const dst = cart.getBoundingClientRect()
  if (!src.width) return wobble()

  const ghost = from.cloneNode(true) as HTMLElement
  ghost.removeAttribute('id')
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${src.left}px`,
    top: `${src.top}px`,
    width: `${src.width}px`,
    height: `${src.height}px`,
    margin: '0',
    zIndex: '120',
    pointerEvents: 'none',
  })
  ghost.setAttribute('aria-hidden', 'true')
  document.body.appendChild(ghost)

  const dx = dst.left + dst.width / 2 - (src.left + src.width / 2)
  const dy = dst.top + dst.height / 2 - (src.top + src.height / 2)
  const lift = Math.max(80, Math.hypot(dx, dy) * 0.3)
  const scale = 28 / Math.max(src.width, src.height)

  gsap.to(ghost, {
    motionPath: { path: [{ x: 0, y: 0 }, { x: dx * 0.45, y: Math.min(dy, 0) - lift }, { x: dx, y: dy }], curviness: 1.4 },
    scale,
    rotate: 180,
    duration: 0.75,
    ease: ease.stroke,
    onComplete: () => {
      ghost.remove()
      wobble()
    },
  })
}

function sprinkles(cart: HTMLElement) {
  if (prefersReducedMotion()) return
  const r = cart.getBoundingClientRect()
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span')
    Object.assign(s.style, {
      position: 'fixed',
      left: `${r.left + r.width / 2}px`,
      top: `${r.top + r.height / 2}px`,
      width: '10px',
      height: '4px',
      borderRadius: '4px',
      background: '#F7B836',
      zIndex: '120',
      pointerEvents: 'none',
    })
    document.body.appendChild(s)
    const a = -Math.PI / 2 + (i - 1) * 0.9
    gsap.to(s, { x: Math.cos(a) * 34, y: Math.sin(a) * 34 + 10, rotate: 200, autoAlpha: 0, duration: 0.6, ease: ease.swash, onComplete: () => s.remove() })
  }
}
