// /product/:slug. Floating product, options, flavour, message on cake, quantity, sticky
// "Add to cart · Rs. X" with a rolling total, related products.
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductArt } from '../components/ProductArt'
import { ProductCard } from '../components/ProductCard'
import { QtyStepper } from '../components/QtyStepper'
import { RollingNumber } from '../components/RollingNumber'
import { productBySlug, productsIn, formatPrice } from '../content/products'
import { categoryBySlug } from '../content/categories'
import { business } from '../content/business'
import { useCart } from '../store/cart'
import { flyToCart } from '../lib/flyToCart'
import { NotFound } from './NotFound'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = productBySlug(slug)
  // Reset choices when navigating between products.
  return product ? <ProductView key={product.id} slug={slug} /> : <NotFound />
}

function ProductView({ slug }: { slug: string }) {
  const p = productBySlug(slug)!
  const cat = categoryBySlug(p.category)!
  const firstPriced = p.options?.findIndex((o) => o.price !== null) ?? -1
  const [opt, setOpt] = useState(firstPriced >= 0 ? firstPriced : 0)
  const [flavour, setFlavour] = useState(p.flavours?.[0] ?? null)
  const [message, setMessage] = useState('')
  const [qty, setQty] = useState(1)
  const art = useRef<HTMLDivElement>(null)
  const add = useCart((s) => s.add)
  const showToast = useCart((s) => s.showToast)

  const option = p.options?.[opt] ?? null
  const unit = option ? option.price : p.price
  const msgCharge = message.trim() && p.messageCharge ? p.messageCharge : 0
  const total = unit === null ? null : (unit + msgCharge) * qty
  const orderable = p.available && unit !== null

  const onAdd = () => {
    if (!orderable) return
    add({ productId: p.id, name: p.name, option: option?.label ?? null, flavour, message: message.trim() || null, unitPrice: unit! + msgCharge }, qty)
    flyToCart(art.current?.querySelector('.product-art') ?? art.current)
    showToast(`${qty} × ${p.name} added`)
  }

  const related = productsIn(p.category).filter((x) => x.id !== p.id).slice(0, 4)

  return (
    <div className="pb-32">
      <div className="grid gap-10 px-(--space-gutter) pt-10 md:grid-cols-2 md:gap-16 md:pt-16">
        <div className="relative md:sticky md:top-28 md:self-start">
          <nav aria-label="Breadcrumb" className="font-display text-micro text-ink/60">
            <Link to="/menu" className="hover:text-ink">Menu</Link> / <Link to={`/menu/${cat.slug}`} className="hover:text-ink">{cat.name}</Link>
          </nav>
          <div className="relative mt-6 aspect-square">
            <div className="absolute inset-[4%] rounded-full" style={{ background: cat.disc }} />
            <div ref={art} className={`hero-float absolute [container-type:inline-size] ${p.cutout || !p.image ? 'inset-[6%]' : 'inset-[12%] overflow-hidden rounded-full'}`}>
              <ProductArt product={p} sizes="(min-width: 768px) 45vw, 90vw" priority />
            </div>
          </div>
          {p.image?.startsWith('art:') && <p className="mt-2 text-center text-micro text-ink/50">Illustration. Product photo coming soon.</p>}
        </div>

        <div>
          {p.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-roundel bg-maroon px-3 py-1 font-display text-micro font-bold text-icing capitalize">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <h1 className="punch mt-3 text-display uppercase">{p.name}</h1>
          <p className="mt-4 font-display text-h2 font-bold text-maroon">
            {unit === null ? 'Ask in store' : <RollingNumber value={unit} prefix="Rs. " />}
          </p>
          {p.description && <p className="lede mt-4 max-w-xl text-ink/80">{p.description}</p>}

          {p.options?.length ? (
            <fieldset className="mt-8">
              <legend className="font-display text-small font-bold">Size</legend>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
                {p.options.map((o, i) => (
                  <button key={o.label} type="button" role="radio" aria-checked={i === opt} className="chip" onClick={() => setOpt(i)}>
                    {o.label}
                    <span className="ml-2 font-normal opacity-70">{formatPrice(o.price)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {p.flavours?.length ? (
            <fieldset className="mt-6">
              <legend className="font-display text-small font-bold">Flavour</legend>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
                {p.flavours.map((f) => (
                  <button key={f} type="button" role="radio" aria-checked={f === flavour} className="chip" onClick={() => setFlavour(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {p.allowsMessage && (
            <div className="mt-6">
              <label htmlFor="msg" className="font-display text-small font-bold">
                Message on the cake <span className="font-normal text-ink/60">(optional{p.messageCharge ? `, + Rs. ${p.messageCharge}` : ''})</span>
              </label>
              <input id="msg" className="field mt-2" maxLength={40} placeholder="Happy birthday, Amma!" value={message} onChange={(e) => setMessage(e.target.value)} />
              <p className="mt-1 text-right text-micro text-ink/50">{message.length}/40</p>
            </div>
          )}

          {orderable ? (
            <div className="mt-8 flex items-center gap-4">
              <QtyStepper value={qty} onChange={setQty} min={1} label={p.name} />
              <span className="text-small text-ink/60">Quantity</span>
            </div>
          ) : (
            <div className="mt-8 rounded-cabinet bg-icing p-5">
              <p className="font-display font-bold">{p.available ? 'Price being confirmed' : 'Sold out today'}</p>
              <p className="mt-1 text-small text-ink/70">
                {p.available ? 'Call us to order this one, or ask at your nearest outlet.' : 'Check back tomorrow or call an outlet.'}
              </p>
              <a href={`tel:${business.phone.tel}`} className="btn btn-maroon mt-4">
                Call {business.phone.display}
              </a>
            </div>
          )}

          <div className="mt-10 rounded-cabinet border border-ink/10 p-5 text-small text-ink/75">
            <p className="font-display font-bold text-ink">Pickup or delivery</p>
            <p className="mt-1">Pick up at {business.outlets.map((o) => o.name).join(', ')}. Choose the outlet and time at checkout.</p>
            {cat.slug === 'celebration-cakes' && <p className="mt-2">Celebration cakes are made to order. The outlet will confirm the date with you.</p>}
          </div>
        </div>
      </div>

      {orderable && (
        <div className="fixed inset-x-0 bottom-0 z-[75] border-t border-ink/10 bg-paper/95 px-(--space-gutter) py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="hidden min-w-0 flex-1 sm:block">
              <p className="truncate font-display font-bold">{p.name}</p>
              <p className="text-micro text-ink/60">{[option?.label, flavour, qty > 1 && `× ${qty}`].filter(Boolean).join(' · ')}</p>
            </div>
            <button type="button" className="btn btn-maroon flex-1 sm:flex-none" onClick={onAdd}>
              Add to cart · <RollingNumber value={total ?? 0} prefix="Rs. " />
            </button>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-24 px-(--space-gutter)">
          <h2 id="related" className="text-h1 font-extrabold">
            More {cat.name.toLowerCase()}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
