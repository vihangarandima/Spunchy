// Order confirmation, outlets, about.
import { Link, useParams } from 'react-router'
import { Img } from '../components/Img'
import { Swash } from '../components/Swash'
import { OutletsSection } from '../sections/HomeSections'
import { Instagram } from '../sections/Instagram'
import { business } from '../content/business'
import { formatLKR } from '../content/products'
import { readLastOrder, whatsappUrl } from '../lib/order'

export function OrderDone() {
  const { id = '' } = useParams()
  const order = typeof window === 'undefined' ? null : readLastOrder(id)
  const outlet = business.outlets.find((o) => o.id === order?.outletId)
  return (
    <div className="mx-auto max-w-2xl px-(--space-gutter) py-20 text-center">
      <Swash className="mx-auto w-48" />
      <h1 className="punch mt-6 text-display uppercase">Order sent to the oven</h1>
      <p className="mt-3 font-display text-h3 font-bold text-maroon">{id}</p>
      <p className="lede mt-4 text-ink/75">
        WhatsApp opened with your order. Send the message and Spunchy {outlet?.name ?? ''} will confirm it with you.
      </p>
      {order && (
        <div className="mt-10 rounded-cabinet bg-icing p-6 text-left">
          <ul className="space-y-2">
            {order.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-4 text-small">
                <span>
                  {l.qty} × {l.name}
                  {l.option ? ` (${l.option})` : ''}
                </span>
                <span className="font-display font-bold">{formatLKR(l.qty * l.unitPrice)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-display font-bold">
            <span>Total</span>
            <span>{formatLKR(order.total)}</span>
          </p>
          <p className="mt-3 text-small text-ink/70">
            {order.method === 'pickup' ? `Pickup at ${outlet?.name}` : `Delivery to ${order.address}`} · {order.date}, {order.time}
          </p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order && (
          <a href={whatsappUrl(order)} target="_blank" rel="noopener noreferrer" className="btn btn-maroon">
            Open WhatsApp again
          </a>
        )}
        <a href={`tel:${outlet?.phone?.replace(/\s/g, '') ?? business.phone.tel}`} className="btn btn-ink">
          Call the outlet
        </a>
        <Link to="/menu" className="btn btn-ghost" style={{ ['--ghost-hover' as string]: '#F6E7DA' }}>
          Back to the menu
        </Link>
      </div>
    </div>
  )
}

export function Outlets() {
  return (
    <>
      <header className="px-(--space-gutter) pt-12 pb-10 md:pt-16">
        <h1 className="punch text-display uppercase">Outlets</h1>
        <p className="lede mt-3 max-w-2xl text-ink/70">Four Spunchy outlets in the southern suburbs of Colombo. Pick up your order at any of them.</p>
      </header>
      <OutletsSection heading={false} />
      <section className="px-(--space-gutter) py-16">
        <p className="text-small text-ink/70">
          Questions? Call <a className="font-bold underline" href={`tel:${business.phone.tel}`}>{business.phone.display}</a>.
        </p>
      </section>
    </>
  )
}

export function About() {
  return (
    <>
      <header className="grid gap-10 px-(--space-gutter) pt-12 pb-16 md:grid-cols-2 md:items-end md:pt-16">
        <div>
          <h1 className="punch text-display uppercase">{business.tagline}</h1>
          <p className="lede mt-4 max-w-xl text-ink/75">{business.summary}. Cakes for the day, slices for the afternoon, savory for the road, at four outlets around Kottawa.</p>
          <Link to="/menu" className="btn btn-maroon mt-8">
            See the menu
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="row-span-2 overflow-hidden rounded-cabinet">
            <Img id="cake-cabinet" alt="The cake cabinet at a Spunchy outlet" sizes="(min-width: 768px) 25vw, 50vw" priority imgClassName="h-full w-full object-cover" className="block h-full" />
          </div>
          <div className="overflow-hidden rounded-cabinet">
            <Img id="interior" alt="Inside a Spunchy outlet" sizes="25vw" imgClassName="h-full w-full object-cover" className="block h-full" />
          </div>
          <div className="overflow-hidden rounded-cabinet">
            <Img id="shopfront" alt="A Spunchy shopfront" sizes="25vw" imgClassName="h-full w-full object-cover" className="block h-full" />
          </div>
        </div>
      </header>
      <Instagram />
    </>
  )
}
