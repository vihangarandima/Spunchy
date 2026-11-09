// Facts about Spunchy. Everything here comes from Spunchy's own Instagram bio, posters or
// price labels. `null` means "not known yet": the UI hides what depends on it.
// Open items are listed in docs/design-system.md, section 10.

export const business = {
  name: 'Spunchy',
  tagline: 'Premium Pastry & Bakery Brand', // Instagram bio
  summary: 'Freshly baked cakes, savories & more', // Instagram bio
  phone: { display: '077 376 8615', tel: '+94773768615' },
  whatsapp: null as string | null, // number to confirm
  pickme: null as string | null, // PickMe Food link to confirm
  instagram: { handle: '@spunchy.lk', url: 'https://www.instagram.com/spunchy.lk/' },
  outlets: [
    { id: 'kottawa', name: 'Kottawa' },
    { id: 'boralesgamuwa', name: 'Boralesgamuwa' },
    { id: 'piliyandala', name: 'Piliyandala' },
    { id: 'kotikawatta', name: 'Kotikawatta' },
  ] as { id: string; name: string; address?: string; hours?: string }[],
  // Real numbers (years, customers...) stay out until the client supplies them.
  stats: [] as { value: string; label: string }[],
}

export const mapsSearch = (outlet: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Spunchy ${outlet} Sri Lanka`)}`
