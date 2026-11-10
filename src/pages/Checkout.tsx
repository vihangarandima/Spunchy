// One-page checkout in three steps (How → Who → Confirm), shown as a progress swash.
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ProductArt } from '../components/ProductArt'
import { productBySlug, formatLKR } from '../content/products'
import { business } from '../content/business'
import { useCart, cartTotal } from '../store/cart'
import { newOrderId, normalisePhone, submitOrder, type Order } from '../lib/order'

const SLOTS = ['9:00 – 11:00 am', '11:00 am – 1:00 pm', '1:00 – 3:00 pm', '3:00 – 5:00 pm', '5:00 – 7:00 pm']

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function Checkout() {
  const lines = useCart((s) => s.lines)
  const clear = useCart((s) => s.clear)
  const navigate = useNavigate()
  const total = cartTotal(lines)

  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [outletId, setOutletId] = useState(business.outlets[0].id)
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(SLOTS[1])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [tried, setTried] = useState(false)

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Please add your name.'
    if (!normalisePhone(phone)) e.phone = 'Enter a Sri Lankan mobile number, e.g. 077 123 4567.'
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = 'That email doesn’t look right.'
    if (method === 'delivery' && address.trim().length < 8) e.address = 'Please add the delivery address.'
    if (!date || date < today()) e.date = 'Choose today or a later date.'
    return e
  }, [name, phone, email, method, address, date])

  const step = !Object.keys(errors).some((k) => ['date', 'address'].includes(k)) ? (errors.name || errors.phone || errors.email ? 2 : 3) : 1

  if (lines.length === 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-(--space-gutter) py-24 text-center">
        <div>
          <h1 className="punch text-display uppercase">Your box is empty</h1>
          <p className="lede mt-3 text-ink/70">Pick something from the cabinet first.</p>
          <Link to="/menu" className="btn btn-maroon mt-8">
            Browse the menu
          </Link>
        </div>
      </div>
    )
  }

  const place = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (Object.keys(errors).length) {
      const first = ['date', 'address', 'name', 'phone', 'email'].find((k) => errors[k])
      if (first) document.getElementById(first)?.focus()
      return
    }
    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      method,
      outletId,
      date,
      time,
      name: name.trim(),
      phone: `+${normalisePhone(phone)}`,
      email: email.trim() || null,
      address: method === 'delivery' ? address.trim() : null,
      note: note.trim() || null,
      lines,
      total,
    }
    const res = submitOrder(order)
    window.open(res.handoff, '_blank', 'noopener')
    clear()
    navigate(`/order/${order.id}`)
  }

  const err = (k: string) => (tried && errors[k] ? errors[k] : null)

  return (
    <form onSubmit={place} noValidate className="grid gap-10 px-(--space-gutter) pt-10 pb-24 lg:grid-cols-[1fr_24rem] lg:gap-16 lg:pt-16">
      <div>
        <h1 className="punch text-display uppercase">Checkout</h1>
        <Progress step={step} />

        <Step n={1} title="How would you like it?">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pickup or delivery">
            <button type="button" role="radio" aria-checked={method === 'pickup'} className="chip" onClick={() => setMethod('pickup')}>
              Pick up at an outlet
            </button>
            <button type="button" role="radio" aria-checked={method === 'delivery'} className="chip" onClick={() => setMethod('delivery')}>
              Delivery
            </button>
          </div>
          <fieldset className="mt-6">
            <legend className="font-display text-small font-bold">{method === 'pickup' ? 'Pickup outlet' : 'Nearest outlet'}</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {business.outlets.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={outletId === o.id} className="chip justify-center" onClick={() => setOutletId(o.id)}>
                  {o.name}
                </button>
              ))}
            </div>
          </fieldset>
          {method === 'delivery' && (
            <Field id="address" label="Delivery address" error={err('address')}>
              <textarea id="address" className="field min-h-24" value={address} onChange={(e) => setAddress(e.target.value)} aria-invalid={!!err('address')} aria-describedby="address-err" autoComplete="street-address" />
              <p className="mt-1 text-micro text-ink/60">Delivery is arranged by the outlet{business.pickme ? ' or through PickMe Food' : ''}. They will confirm any charge.</p>
            </Field>
          )}
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field id="date" label="Date" error={err('date')}>
              <input id="date" type="date" className="field" min={today()} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!err('date')} aria-describedby="date-err" />
            </Field>
            <Field id="time" label="Time">
              <select id="time" className="field" value={time} onChange={(e) => setTime(e.target.value)}>
                {SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
        </Step>

        <Step n={2} title="Who is it for?">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Name" error={err('name')}>
              <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err('name')} aria-describedby="name-err" autoComplete="name" />
            </Field>
            <Field id="phone" label="Mobile number" error={err('phone')}>
              <input id="phone" type="tel" inputMode="tel" className="field" placeholder="077 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!err('phone')} aria-describedby="phone-err" autoComplete="tel" />
            </Field>
            <Field id="email" label="Email (optional)" error={err('email')}>
              <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err('email')} aria-describedby="email-err" autoComplete="email" />
            </Field>
            <Field id="note" label="Note for the outlet (optional)">
              <input id="note" className="field" value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} />
            </Field>
          </div>
        </Step>

        <Step n={3} title="Confirm">
          <p className="text-small text-ink/75">
            Placing the order opens WhatsApp with your order filled in, addressed to Spunchy {business.outlets.find((o) => o.id === outletId)?.name}. Send it and the outlet will confirm.
            You pay when you collect{method === 'delivery' ? ' or on delivery' : ''}.
          </p>
          <button type="submit" className="btn btn-maroon mt-6 w-full sm:w-auto">
            Place order · {formatLKR(total)}
          </button>
          {business.pickme && (
            <a href={business.pickme} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto">
              Order on PickMe instead
            </a>
          )}
        </Step>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Order summary">
        <div className="rounded-cabinet bg-icing p-6">
          <h2 className="text-h3 font-bold">Your order</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => {
              const p = productBySlug(l.productId)
              return (
                <li key={l.key} className="flex items-center gap-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-paper [container-type:inline-size]">{p && <ProductArt product={p} sizes="48px" />}</span>
                  <span className="min-w-0 flex-1 text-small">
                    <span className="block font-display font-bold">
                      {l.qty} × {l.name}
                    </span>
                    {(l.option || l.message) && <span className="block truncate text-micro text-ink/60">{[l.option, l.flavour, l.message && `“${l.message}”`].filter(Boolean).join(' · ')}</span>}
                  </span>
                  <span className="font-display text-small font-bold">{formatLKR(l.qty * l.unitPrice)}</span>
                </li>
              )
            })}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-4 font-display">
            <span className="font-semibold">Total</span>
            <span className="text-h3 font-bold">{formatLKR(total)}</span>
          </div>
        </div>
      </aside>
    </form>
  )
}

function Progress({ step }: { step: number }) {
  return (
    <div className="mt-6 flex items-center gap-3" aria-hidden="true">
      {['How', 'Who', 'Confirm'].map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-small font-bold transition-colors duration-(--duration-ui) ${i + 1 <= step ? 'bg-maroon text-icing' : 'bg-ink/10'}`}>{i + 1}</span>
          <span className="hidden font-display text-small font-semibold sm:block">{s}</span>
          {i < 2 && (
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
              <span className="absolute inset-y-0 left-0 rounded-full bg-gold transition-[width] duration-(--duration-reveal) ease-(--ease-swash)" style={{ width: i + 1 < step ? '100%' : '0%' }} />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-ink/10 pt-8" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-5 text-h2 font-extrabold">
        <span className="text-maroon">{n}.</span> {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-2 block font-display text-small font-bold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-micro font-semibold text-maroon">
          {error}
        </p>
      )}
    </div>
  )
}
