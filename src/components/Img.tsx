import { useEffect, useState } from 'react'
import { imageSet } from '../lib/images'

type Props = {
  id: string
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  priority?: boolean
  /** Blurred placeholder behind the image until it loads (off for cut-outs). */
  placeholder?: boolean
}

/**
 * Responsive <picture> from the image manifest: AVIF, WebP, LQIP, intrinsic size.
 * In the prerendered HTML, non-priority images carry only size, alt and placeholder; the
 * sources are attached after hydration so they never compete with the hero for bandwidth.
 */
export function Img({ id, alt, sizes, className, imgClassName, priority, placeholder = true }: Props) {
  const s = imageSet(id)
  const [loaded, setLoaded] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const withSources = priority || hydrated

  return (
    <picture
      className={className}
      style={placeholder && !loaded ? { backgroundImage: `url(${s.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {withSources && <source type="image/avif" srcSet={s.avif} sizes={sizes} />}
      {withSources && <source type="image/webp" srcSet={s.webp} sizes={sizes} />}
      <img
        src={withSources ? s.fallback : undefined}
        alt={alt}
        width={s.width}
        height={s.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={imgClassName}
      />
    </picture>
  )
}
