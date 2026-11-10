// A product's picture, wherever it appears: a cut-out (floats on its disc), a photo
// (cropped into the disc), or a typographic stand-in when there is no photo yet.
import { Img } from './Img'
import type { Product } from '../content/products'

type Props = {
  product: Product
  sizes: string
  className?: string
  priority?: boolean
}

export function ProductArt({ product, sizes, className = '', priority }: Props) {
  const { image, cutout, name } = product
  if (!image) {
    return (
      <div className={`product-art grid h-full w-full place-items-center ${className}`} aria-hidden="true">
        <span className="punch text-[min(28cqw,7rem)] uppercase text-ink/80">{initials(name)}</span>
      </div>
    )
  }
  return (
    <Img
      id={image}
      alt={name}
      sizes={sizes}
      priority={priority}
      placeholder={!cutout}
      className={`product-art block h-full w-full ${className}`}
      imgClassName={`h-full w-full ${cutout ? 'object-contain drop-shadow-[0_1.25rem_1.25rem_rgb(42_10_15/0.35)]' : 'object-cover'}`}
    />
  )
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
