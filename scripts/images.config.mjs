// One entry per processed image. Crops are [left, top, width, height] in source pixels
// (after EXIF rotation). `up` is the Real-ESRGAN factor applied to the crop (1 = none).
// `grade`: 'photo' = full colour correction, 'artwork' = Spunchy's own printed posters
// (only gentle tone, no white balance, since their colours are intentional), 'none'.
// `cutout`: also produce a transparent product cut-out with rembg.
// Rejected: a savoury-rolls cut-out from the 375 px Savory poster photo (too soft to cut
// cleanly). Needs a product shot.

export const SIZES = [640, 1280, 1920, 2560]

export const images = [
  // Celebration cake with pink/ivory/plum rosettes: the hero product
  { id: 'cake-rosettes', src: 'visit-cake-rosettes.jpg', crop: [40, 470, 790, 740], up: 4, grade: 'photo', cutout: true },
  // Tall cake cabinet with the orange Spunchy boxes on top
  { id: 'cake-cabinet', src: 'visit-cake-cabinet-boxes.jpg', crop: [100, 0, 800, 1150], up: 2, grade: 'photo' },
  // Fruit tart slices (tray only; the price card is left out so the photo never contradicts a price)
  { id: 'fruit-tart', src: 'visit-fruit-tart.jpg', crop: [150, 690, 680, 330], up: 4, grade: 'photo', cutout: true },
  // Store interior: maroon ceiling raft, cabinets, bread basket (cropped right of the customer)
  { id: 'interior', src: 'visit-interior-ceiling.jpg', crop: [400, 250, 563, 1030], up: 2, grade: 'photo' },
  // "Cake is the language of Love" poster under the track spots, on the oak wall
  { id: 'poster-love-wall', src: 'visit-poster-love-wall.jpg', crop: [0, 0, 963, 1110], up: 2, grade: 'photo' },
  // "Soft, Fluffy & Fresh" poster, squared up
  { id: 'poster-fresh', src: 'visit-poster-fresh.jpg', crop: [92, 238, 808, 797], up: 2, grade: 'artwork' },
  // The triangle buns from that poster, for a floating cut-out
  { id: 'buns-triangle', src: 'visit-poster-fresh.jpg', crop: [290, 495, 545, 530], up: 4, grade: 'artwork', cutout: true,
    // The poster's "Fresh" lettering overlaps the crop; paint it out with the poster's own black.
    paint: [[0, 0, 280, 110, '#0b0a0a']] },
  // Savory corner: poster, oak ladder shelf, packed bakes (cropped right of the seated customer)
  { id: 'savory-corner', src: 'visit-savory-shelf-b.jpg', crop: [225, 0, 480, 1070], up: 4, grade: 'photo' },
  // "Savory: crispy, crunchy, crave-worthy" poster
  { id: 'poster-savory', src: 'poster-savory.jpg', up: 4, grade: 'artwork' },
  // "A slice of heaven in every bite" poster
  { id: 'poster-heaven', src: 'poster-heaven.jpg', up: 4, grade: 'artwork' },
  // Shopfront: sign and glass entrance (rider, number plate and street cropped out)
  { id: 'shopfront', src: 'visit-shopfront-street.jpg', crop: [230, 560, 650, 540], up: 4, grade: 'photo',
    // The salon banner above (name and phone) runs diagonally just above the sign, so a
    // rectangle crop can't remove it without cutting the logo. It is blurred instead.
    blur: [[[0, 0], [420, 0], [0, 150]]] },
  // Counter with display cases
  { id: 'counter', src: 'counter.jpg', up: 2, grade: 'photo' },
  // Cabinet trays
  { id: 'tray-blueberry', src: 'tray-blueberry.jpg', up: 4, grade: 'photo' },
  // No cut-out: shot through cabinet glass, the matte keeps the reflections. Needs a reshoot.
  { id: 'tray-choc-gateau', src: 'tray-choc-gateau.jpg', up: 4, grade: 'photo' },
  { id: 'tray-coffee', src: 'tray-coffee.jpg', up: 4, grade: 'photo' },
  { id: 'tray-mousse', src: 'tray-mousse.jpg', up: 4, grade: 'photo' },
  { id: 'tray-nuga', src: 'tray-nuga.jpg', up: 4, grade: 'photo' },
  { id: 'bread', src: 'bread.jpg', up: 4, grade: 'photo' },
  // Oak plank wall, used as a texture
  { id: 'oak-wall', src: 'visit-poster-love-wall.jpg', crop: [715, 140, 245, 960], up: 4, grade: 'photo' },
]
