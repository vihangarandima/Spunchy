// The swash ribbon: a fresh S-curve echoing the logo swash (not traced from it).
// `progress` drawing is done by animating the mask stroke with DrawSVG.
import { useId } from 'react'

export const SWASH_VIEWBOX = '0 0 1000 300'
export const SWASH_SPINE = 'M 20 140 C 120 236, 240 272, 420 260 S 800 138, 986 28'
export const SWASH_RIBBON =
  'M 20 140 C 120 230, 240 262, 420 240 C 620 214, 800 130, 986 28 C 830 152, 640 264, 420 278 C 230 292, 90 242, 20 140 Z'

// The edge of a chapter wipe: the swash spine continued to the bottom corners, so a
// panel of the next chapter's colour arrives with the swash as its leading edge.
export const SWASH_EDGE = 'M 0 300 L 0 150 C 120 240, 240 276, 420 264 S 800 140, 1000 20 L 1000 300 Z'
/** The same curve, filled above it: the trailing edge of a panel that moves up and away. */
export const SWASH_EDGE_TOP = 'M 0 0 L 0 150 C 120 240, 240 276, 420 264 S 800 140, 1000 20 L 1000 0 Z'

type Props = {
  className?: string
  color?: string
  /** Class on the mask stroke, the element to animate with drawSVG. */
  strokeClassName?: string
  /** Stretch to the box instead of keeping the curve's proportions. */
  stretch?: boolean
}

export function Swash({ className, color = 'var(--color-gold)', strokeClassName = 'swash-stroke', stretch }: Props) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox={SWASH_VIEWBOX} aria-hidden="true" focusable="false" preserveAspectRatio={stretch ? 'none' : 'xMidYMid meet'}>
      <defs>
        <mask id={`swash-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="300">
          <path className={strokeClassName} d={SWASH_SPINE} fill="none" stroke="#fff" strokeWidth="84" strokeLinecap="round" />
        </mask>
      </defs>
      <path mask={`url(#swash-${id})`} fill={color} d={SWASH_RIBBON} />
    </svg>
  )
}
