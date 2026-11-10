// The product card used everywhere (S3): product on its category disc, tag, name, line,
// price pill and a round "+ Add" that turns into a − n + stepper once added.
// Products with options (cake sizes) open their page to choose instead of adding blind.
import { useRef } from 'react'
import { Link } from 'react-router'
import { ProductArt } from './ProductArt'
import { QtyStepper } from './QtyStepper'
import { categoryBySlug } from '../content/categories'
import { fromPrice, formatPrice, type Product } from '../content/products'
import { useCart, useSimpleLine, lineKey } from '../store/cart'
import { flyToCart } from '../lib/flyToCart'

const TAG_LABEL = { bestseller: 'Bestseller', new: 'New', viral: 'Viral', veg: 'Veg', spicy: 'Spicy' } as const

type Props = { product: Product; variant?: 'grid' | 'strip'; priority?: boolean }

export function ProductCard({ product, variant = 'grid', priority }: Props) {
  const art = useRef<HTMLDivElement>(null)
  const cat = categoryBySlug(product.category)!
  const line = useSimpleLine(product.id)
  const add = useCart((s) => s.add)
  const setQty = useCart((s) => s.setQty)
  const showToast = useCart((s) => s.showToast)

  const price = fromPrice(product)
  const needsChoice = !!product.options?.length || !!product.flavours?.length
  const orderable = product.available && product.price !== null && !needsChoice
  const tag = product.tags?.find((t) => t !== 'veg')
  const href = `/product/${product.slug}`

  const onAdd = () => {
    if (!orderable) return
    add({ productId: product.id, name: product.name, option: null, flavour: null, message: null, unitPrice: product.price! })
    flyToCart(art.current?.querySelector('img, svg, .product-art') ?? art.current)
    showToast(`${product.name} added`)
  }

  return (
    <article className={`product-card group relative flex flex-col ${variant === 'strip' ? 'w-[15.5rem] shrink-0 sm:w-[17rem]' : ''}`}>
      <Link to={href} className="relative block outline-offset-4" aria-label={`${product.name}, ${formatPrice(price)}`} data-cursor="link">
        <div className="relative aspect-square">
          <div
            className="card-disc absolute inset-[6%] rounded-full transition-transform duration-(--duration-reveal) ease-(--ease-swash) group-hover:scale-[1.06]"
            style={{ background: cat.disc }}
            aria-hidden="true"
          />
          <div
            ref={art}
            className={`absolute transition-transform duration-(--duration-reveal) ease-(--ease-swash) group-hover:-translate-y-1.5 group-hover:scale-[1.06] group-hover:rotate-[-6deg] ${
              product.cutout || !product.image ? 'inset-[10%] [container-type:inline-size]' : 'inset-[14%] overflow-hidden rounded-full'
            }`}
          >
            <ProductArt product={product} sizes="(min-width: 1024px) 18rem, 50vw" priority={priority} />
          </div>
          {tag && (
            <span className="absolute top-[4%] left-[4%] rounded-roundel bg-maroon px-3 py-1 font-display text-micro font-bold text-icing">{TAG_LABEL[tag]}</span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col px-1">
        <h3 className="text-h3 font-bold text-ink">
          <Link to={href} className="hover:text-maroon">{product.name}</Link>
        </h3>
        {product.description && <p className="mt-1 line-clamp-2 text-small leading-snug text-ink/70">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={`rounded-roundel px-3 py-1.5 font-display text-small font-bold ${price === null ? 'bg-ink/8 text-ink/70' : 'bg-ink text-gold'}`}>
            {needsChoice && price !== null ? `from ${formatPrice(price)}` : formatPrice(price)}
          </span>
          {orderable ? (
            line ? (
              <QtyStepper value={line.qty} onChange={(q) => setQty(lineKey({ productId: product.id, option: null, flavour: null, message: null }), q)} label={product.name} />
            ) : (
              <button type="button" onClick={onAdd} className="add-btn" aria-label={`Add ${product.name} to cart`}>
                <span aria-hidden="true">+</span>
                <span className="text-small">Add</span>
              </button>
            )
          ) : needsChoice && product.available && price !== null ? (
            <Link to={href} className="add-btn">
              <span className="text-small">Choose</span>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
