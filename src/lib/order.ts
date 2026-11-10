// Phase 1 ordering: the order is handed to the outlet as a pre-filled WhatsApp message.
// Everything goes through submitOrder(), so a real backend or payment gateway (PayHere,
// for example) can replace it later without touching the UI.
import { business, outletWhatsApp } from '../content/business'
import { formatLKR } from '../content/products'
import type { CartLine } from '../store/cart'

export type Order = {
  id: string
  createdAt: string
  method: 'pickup' | 'delivery'
  outletId: string
  date: string // yyyy-mm-dd
  time: string
  name: string
  phone: string
  email: string | null
  address: string | null
  note: string | null
  lines: CartLine[]
  total: number
}

export const LAST_ORDER_KEY = 'spunchy-last-order'

export function newOrderId(d = new Date()) {
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SP-${ymd}-${rnd}`
}

/** 07X XXX XXXX or +94 7X XXX XXXX (Sri Lankan mobile). Returns normalised 94… or null. */
export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[^\d+]/g, '')
  const m = d.match(/^(?:\+?94|0)?(7\d{8})$/)
  return m ? `94${m[1]}` : null
}

export function orderMessage(o: Order) {
  const outlet = business.outlets.find((x) => x.id === o.outletId)?.name ?? o.outletId
  const lines = o.lines.map((l) => {
    const extra = [l.option, l.flavour, l.message && `message: "${l.message}"`].filter(Boolean).join(', ')
    return `• ${l.qty} × ${l.name}${extra ? ` (${extra})` : ''} = ${formatLKR(l.qty * l.unitPrice)}`
  })
  return [
    `Hi Spunchy! New order ${o.id}`,
    '',
    ...lines,
    '',
    `Total: ${formatLKR(o.total)}`,
    o.method === 'pickup' ? `Pickup at ${outlet}` : `Delivery from ${outlet} to: ${o.address}`,
    `When: ${o.date} ${o.time}`,
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
    o.note ? `Note: ${o.note}` : '',
  ]
    .filter((x, i, a) => !(x === '' && a[i - 1] === ''))
    .join('\n')
    .trim()
}

export const whatsappUrl = (o: Order) => `https://wa.me/${outletWhatsApp(o.outletId)}?text=${encodeURIComponent(orderMessage(o))}`

export function submitOrder(o: Order): { ok: true; handoff: string } {
  try {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(o))
  } catch {
    /* private mode: the confirmation page falls back to the id only */
  }
  return { ok: true, handoff: whatsappUrl(o) }
}

export function readLastOrder(id: string): Order | null {
  try {
    const o = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) ?? 'null') as Order | null
    return o?.id === id ? o : null
  } catch {
    return null
  }
}
