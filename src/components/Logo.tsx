// Stand-in: the Instagram avatar (logo on its maroon roundel), upscaled and served from
// /public so index.html's boot frame can paint it before JavaScript. Swap for the official
// SVG once the client supplies it (docs/design-system.md, section 10).
export function Logo({ className = '' }: { className?: string }) {
  return <img src="/logo-roundel.webp" width={256} height={256} alt="Spunchy" className={`rounded-roundel ${className}`} decoding="async" />
}
