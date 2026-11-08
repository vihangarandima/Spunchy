// Decide how much motion/3D this device should get.
//   'off'  -> no 3D at all (reduced motion, data saver, very weak hardware)
//   'low'  -> 3D with fewer sprinkles and DPR 1
//   'high' -> full scene, DPR capped at 1.75
export function qualityTier() {
  if (typeof window === 'undefined') return 'off';
  const mq = (q) => window.matchMedia?.(q).matches;
  if (mq('(prefers-reduced-motion: reduce)')) return 'off';
  const conn = navigator.connection;
  if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || '')) return 'off';
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4; // Chrome only; others assume 4
  if (cores <= 2 || mem <= 1) return 'off';
  if (cores <= 4 || mem <= 3 || mq('(pointer: coarse)')) return 'low';
  return 'high';
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// WebGL check — only called right before the 3D chunk is mounted, never during
// first render (creating a GL context is expensive on weak phones).
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
