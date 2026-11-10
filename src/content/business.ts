// Facts about Spunchy. Everything here comes from Spunchy's own Instagram bio, posters or
// price labels. `null` means "not known yet": the UI hides what depends on it.

export type Outlet = {
  id: string
  name: string
  address: string | null
  hours: string | null
  phone: string | null // display format
  whatsapp: string | null // international digits, e.g. 94771234567
}

export const business = {
  name: 'Spunchy',
  tagline: 'Premium Pastry & Bakery Brand', // Instagram bio
  summary: 'Freshly baked cakes, savories & more', // Instagram bio
  phone: { display: '077 376 8615', tel: '+94773768615' },
  // Orders are handed off as a WhatsApp message. Until each outlet's own number is supplied,
  // they go to the main number. CONFIRM WITH THE CLIENT that this number is on WhatsApp.
  orderWhatsApp: '94773768615',
  socials: {
    instagram: 'https://www.instagram.com/spunchy.lk/',
    facebook: null as string | null, // to be supplied
    tiktok: null as string | null, // to be supplied
  },
  pickme: null as string | null, // PickMe Food store link, to be supplied
  outlets: [
    { id: 'kottawa', name: 'Kottawa', address: null, hours: null, phone: null, whatsapp: null },
    { id: 'boralesgamuwa', name: 'Boralesgamuwa', address: null, hours: null, phone: null, whatsapp: null },
    { id: 'piliyandala', name: 'Piliyandala', address: null, hours: null, phone: null, whatsapp: null },
    { id: 'kotikawatta', name: 'Kotikawatta', address: null, hours: null, phone: null, whatsapp: null },
  ] as Outlet[],
}

export const mapsSearch = (outlet: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Spunchy ${outlet} Sri Lanka`)}`

export const outletWhatsApp = (id: string) => business.outlets.find((o) => o.id === id)?.whatsapp ?? business.orderWhatsApp
