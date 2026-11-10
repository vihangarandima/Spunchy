// Drawn stand-in for the Tandoori Chicken Bun until a real cut-out photo is supplied
// (docs/premium/animation-script.md, section 3: hero-bun.png). A glazed bun torn open,
// tandoori filling and a stretch of cheese between the halves.
export function BunArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 420" className={className} role="img" aria-label="Tandoori Chicken Bun, torn open">
      <defs>
        <radialGradient id="bun-crust" cx=".4" cy=".25" r=".9">
          <stop offset="0" stopColor="#f1b866" />
          <stop offset=".45" stopColor="#c97a2a" />
          <stop offset="1" stopColor="#7c3e12" />
        </radialGradient>
        <linearGradient id="bun-crumb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe6c0" />
          <stop offset="1" stopColor="#e8c28a" />
        </linearGradient>
        <linearGradient id="bun-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9452a" />
          <stop offset="1" stopColor="#8f2312" />
        </linearGradient>
      </defs>
      {/* left half */}
      <g transform="rotate(-10 180 250)">
        <path d="M40 270 C 40 150, 130 96, 220 100 C 260 102, 290 120, 300 150 L 300 300 C 220 318, 110 316, 40 300 Z" fill="url(#bun-crust)" />
        <path d="M228 120 C 262 128, 286 148, 298 176 L 300 300 C 280 304, 262 306, 240 306 C 248 250, 246 180, 228 120 Z" fill="url(#bun-crumb)" />
        <path d="M244 170 C 270 168, 292 186, 300 210 L 300 262 C 280 268, 258 262, 248 246 C 262 230, 256 196, 244 170 Z" fill="url(#bun-fill)" />
        <path d="M70 160 C 110 120, 160 108, 200 112" stroke="#fff" strokeOpacity=".35" strokeWidth="10" strokeLinecap="round" fill="none" />
      </g>
      {/* right half */}
      <g transform="rotate(9 420 250)">
        <path d="M560 270 C 560 150, 470 96, 380 100 C 340 102, 312 120, 304 150 L 304 300 C 380 318, 490 316, 560 300 Z" fill="url(#bun-crust)" />
        <path d="M372 120 C 338 128, 316 148, 306 176 L 304 300 C 322 304, 340 306, 360 306 C 352 250, 354 180, 372 120 Z" fill="url(#bun-crumb)" />
        <path d="M356 170 C 330 168, 310 186, 304 210 L 304 262 C 322 268, 344 262, 354 246 C 340 230, 346 196, 356 170 Z" fill="url(#bun-fill)" />
      </g>
      {/* cheese stretch between the halves */}
      <path d="M296 212 C 300 230, 306 236, 312 214 L 316 232 C 312 252, 296 256, 290 236 Z" fill="#ffd877" />
      <path d="M294 232 C 300 256, 304 262, 312 238" stroke="#ffe39a" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* sesame */}
      {[
        [110, 150, -20], [150, 128, 10], [190, 120, 30], [130, 186, -5], [176, 160, 15], [214, 150, -25],
        [420, 128, -15], [460, 140, 20], [500, 170, -10], [440, 170, 5], [480, 200, 25], [400, 156, -30],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="7" ry="3.4" transform={`rotate(${r} ${x} ${y})`} fill="#fff4dc" />
      ))}
    </svg>
  )
}
