import IMAGES from '../content/images.json';

// Responsive photo: AVIF -> WebP -> JPEG, with srcset, intrinsic size (no CLS)
// and a blurred placeholder behind it while it loads.
export function Img({ name, alt, sizes = '100vw', priority = false, className, style }) {
  const m = IMAGES[name];
  if (!m) return null;
  const set = (ext) => m.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const largest = m.widths[m.widths.length - 1];
  return (
    <picture className={className} style={{ backgroundImage: `url(${m.lqip})`, ...style }}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/img/${name}-${largest}.jpg`}
        alt={alt}
        width={m.w}
        height={m.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
