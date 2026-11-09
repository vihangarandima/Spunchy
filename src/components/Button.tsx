import { useRef, type ReactNode, type MouseEvent } from 'react'
import { gsap, ease, isRichDevice } from '../lib/motion'

type Props = {
  href: string
  children: ReactNode
  variant?: 'gold' | 'outline' | 'icing'
  external?: boolean
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

const variants = {
  gold: 'bg-gold text-ink',
  outline: 'border border-gold text-gold hover:text-ink focus-visible:text-ink',
  icing: 'bg-icing text-ink',
}

/** Roundel pill. The fill sweeps in at the script's 12° slant; desktop adds a magnetic pull. */
export function Button({ href, children, variant = 'gold', external, className = '', onClick }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)

  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current || !isRichDevice()) return
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12
    const y = ((e.clientY - r.top) / r.height - 0.5) * 12
    gsap.to(ref.current, { x, y, duration: 0.4, ease: ease.swash })
  }
  const leave = () => ref.current && gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={move}
      onMouseLeave={leave}
      data-cursor="link"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`btn-swash relative inline-flex min-h-12 items-center overflow-hidden rounded-roundel px-6 font-display text-small font-bold transition-colors duration-(--duration-ui) ${variants[variant]} ${className}`}
    >
      <span className="relative">{children}</span>
    </a>
  )
}
