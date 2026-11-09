import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '../lib/motion'

/**
 * Runs GSAP setup scoped to a container and reverts every tween, ScrollTrigger and
 * SplitText created inside it on unmount (gsap.context).
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (ctx: gsap.Context) => void | (() => void), deps: DependencyList = []) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context((self) => setup(self), scope.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
