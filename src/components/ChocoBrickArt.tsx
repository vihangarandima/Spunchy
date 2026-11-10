// Drawn stand-in for the Choco Brick until a real cut-out photo is supplied
// (docs/premium/animation-script.md, section 3: hero-chocobrick.png). Two halves of a
// fudge brick, the front one showing its layered cut face.
export function ChocoBrickArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 420" className={className} role="img" aria-label="Choco Brick, cut in half">
      <defs>
        <linearGradient id="cb-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3a22" />
          <stop offset="1" stopColor="#3b1a0d" />
        </linearGradient>
        <linearGradient id="cb-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a1007" />
          <stop offset="1" stopColor="#4a2312" />
        </linearGradient>
        <linearGradient id="cb-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cb-fudge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a2a14" />
          <stop offset="1" stopColor="#3a170a" />
        </linearGradient>
      </defs>
      {/* back half */}
      <g transform="translate(250 40) rotate(8)">
        <path d="M0 60 L210 20 L300 70 L90 112 Z" fill="url(#cb-top)" />
        <path d="M0 60 L90 112 L90 250 L0 198 Z" fill="url(#cb-side)" />
        <path d="M90 112 L300 70 L300 208 L90 250 Z" fill="#3e1b0c" />
        <path d="M20 66 L200 32 L250 58 L70 94 Z" fill="url(#cb-shine)" opacity=".7" />
      </g>
      {/* front half, cut face towards us */}
      <g transform="translate(40 120) rotate(-6)">
        <path d="M0 60 L220 24 L300 70 L80 108 Z" fill="url(#cb-top)" />
        <path d="M18 64 L210 32 L250 56 L60 90 Z" fill="url(#cb-shine)" opacity=".8" />
        {/* drips of ganache over the front edge */}
        <path d="M80 108 L300 70 L300 92 C 290 104, 282 92, 274 104 C 262 122, 250 96, 238 106 C 222 118, 214 98, 200 110 C 180 128, 170 104, 152 116 C 130 132, 118 110, 100 122 C 92 128, 86 120, 80 128 Z" fill="#2b1108" />
        {/* cut face: layers */}
        <path d="M80 108 L300 70 L300 230 L80 268 Z" fill="url(#cb-fudge)" />
        <path d="M80 150 L300 112 L300 128 L80 166 Z" fill="#7a3b1c" />
        <path d="M80 200 L300 162 L300 172 L80 210 Z" fill="#8a4a24" />
        <path d="M80 236 L300 198 L300 206 L80 244 Z" fill="#6b3218" />
        {/* molten centre */}
        <ellipse cx="190" cy="178" rx="54" ry="22" transform="rotate(-10 190 178)" fill="#2a0d05" />
        <ellipse cx="184" cy="174" rx="30" ry="9" transform="rotate(-10 184 174)" fill="#5c2a12" opacity=".7" />
        <path d="M0 60 L80 108 L80 268 L0 220 Z" fill="url(#cb-side)" />
        {/* crumbs on the cut face */}
        <circle cx="120" cy="140" r="3" fill="#a0603a" />
        <circle cx="260" cy="120" r="2.5" fill="#a0603a" />
        <circle cx="230" cy="214" r="3" fill="#a0603a" />
        <circle cx="140" cy="232" r="2" fill="#a0603a" />
      </g>
    </svg>
  )
}
