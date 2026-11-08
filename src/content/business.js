// Facts about the shop. RULE: only verified facts go here. Unknown = null,
// and every section that uses a null field hides that part instead of guessing.
// Open items are tracked in CONTENT_TO_CONFIRM.md.

export const BUSINESS = {
  name: 'Spunchy',
  descriptor: 'Pastry & Bakery', // from the hanging sign
  locality: 'Kottawa', // confirmed in the brief
  country: 'LK',
  streetAddress: null, // TODO confirm (a "18" is visible on the pillar in photos — not assumed)
  phone: null, // TODO confirm, E.164 e.g. '+94112345678'
  whatsapp: null, // TODO confirm, digits only for wa.me e.g. '94771234567'
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Spunchy+Kottawa', // search link until the exact pin is confirmed
  hours: null, // TODO e.g. [{ days: 'Mon–Sun', open: '07:00', close: '21:00' }]
  services: {
    dineIn: true, // seating visible in photos
    takeaway: true, // branded cake boxes and packed items visible in photos
    delivery: null, // TODO confirm
  },
  socials: {
    facebook: 'https://www.facebook.com/Spunchylk', // confirmed in the brief
    instagram: null,
    tiktok: null,
  },
};
