// Resolves processed images (src/assets/images, made by `npm run images`) to URLs.
import manifest from '../assets/images/manifest.json'

const urls = import.meta.glob('../assets/images/*.{avif,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

type Entry = { width: number; height: number; widths: number[]; lqip: string }
const entries = manifest as Record<string, Entry>

const url = (id: string, w: number, ext: 'avif' | 'webp') => urls[`../assets/images/${id}-${w}.${ext}`]

export type ImageSet = {
  width: number
  height: number
  avif: string
  webp: string
  fallback: string
  lqip: string
}

export function imageSet(id: string): ImageSet {
  const e = entries[id]
  if (!e) throw new Error(`Unknown image "${id}". Run npm run images.`)
  const set = (ext: 'avif' | 'webp') => e.widths.map((w) => `${url(id, w, ext)} ${w}w`).join(', ')
  const mid = e.widths.find((w) => w >= 1280) ?? e.widths.at(-1)!
  return { width: e.width, height: e.height, avif: set('avif'), webp: set('webp'), fallback: url(id, mid, 'webp'), lqip: e.lqip }
}

/** Largest WebP, for WebGL textures. */
export const largestWebp = (id: string, max = 2048) => {
  const e = entries[id]
  const w = [...e.widths].reverse().find((x) => x <= max) ?? e.widths[0]
  return url(id, w, 'webp')
}
