// Particle sprites for the hero burst, drawn in code (no image requests). Each is a 40×40
// SVG; size is set by the parent.
import type { ParticleKind } from '../content/heroSlides'

export function Particle({ kind }: { kind: ParticleKind }) {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full overflow-visible" aria-hidden="true">
      {shapes[kind]}
    </svg>
  )
}

const rosette = (fill: string, line: string) => (
  <g>
    <circle cx="20" cy="20" r="15" fill={fill} />
    <path d="M20 8 C 30 10, 32 24, 22 28 C 14 30, 10 22, 16 18 C 20 16, 24 20, 21 23" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" />
  </g>
)

const shapes: Record<ParticleKind, React.ReactNode> = {
  'rosette-pink': rosette('#f2a7b5', '#d97f92'),
  'rosette-ivory': rosette('#fbf1e3', '#e2cfb5'),
  'rosette-plum': rosette('#8e3b5f', '#6b2a4a'),
  sprinkle: <rect x="6" y="16" width="28" height="8" rx="4" fill="#F7B836" />,
  shard: (
    <g>
      <path d="M4 14 L22 4 L36 18 L26 36 L8 30 Z" fill="#3b1a0d" />
      <path d="M8 15 L22 7 L32 18 L22 20 Z" fill="#6b3a22" />
    </g>
  ),
  crumb: <path d="M8 18 C 8 8, 26 6, 32 14 C 38 24, 28 34, 18 32 C 10 30, 8 24, 8 18 Z" fill="#a0603a" />,
  sesame: <ellipse cx="20" cy="20" rx="12" ry="6" fill="#fff1d2" stroke="#e0c08a" strokeWidth="1.5" />,
  chilli: <path d="M6 22 L18 8 L34 14 L30 30 Z" fill="#c9341c" />,
  blueberry: (
    <g>
      <circle cx="20" cy="20" r="15" fill="#3b3f78" />
      <circle cx="14" cy="14" r="4" fill="#fff" opacity=".35" />
      <path d="M17 6 L20 10 L23 6" stroke="#23264f" strokeWidth="2" fill="none" />
    </g>
  ),
  kiwi: (
    <g>
      <rect x="5" y="5" width="30" height="30" rx="5" fill="#8cc04a" />
      <circle cx="20" cy="20" r="6" fill="#f3f0c4" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={20 + Math.cos((a * Math.PI) / 180) * 10} cy={20 + Math.sin((a * Math.PI) / 180) * 10} r="1.6" fill="#1d1d10" />
      ))}
    </g>
  ),
  strawberry: (
    <g>
      <rect x="5" y="5" width="30" height="30" rx="6" fill="#e2384d" />
      <rect x="10" y="10" width="20" height="20" rx="4" fill="#f26b79" />
      <circle cx="16" cy="16" r="1.4" fill="#fde7a6" />
      <circle cx="24" cy="22" r="1.4" fill="#fde7a6" />
    </g>
  ),
  flour: <circle cx="20" cy="20" r="14" fill="#fffaf2" opacity=".85" style={{ filter: 'blur(2px)' }} />,
  sugar: <rect x="12" y="12" width="16" height="16" rx="2" fill="#fff" stroke="#e8dccb" strokeWidth="1.5" transform="rotate(20 20 20)" />,
}
