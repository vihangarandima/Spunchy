// The home page hero image, composed from Spunchy's own photos (no generated imagery):
// the store's oak-panelled counter, softly out of focus, as the room, and the lit cake
// cabinet with the orange Spunchy boxes as the sharp subject. One warm grade over both.
// Outputs public/hero/cafe-{1280,1920,2560}.{avif,webp} (landscape) and
// public/hero/cafe-portrait-{720,1080}.{avif,webp} (phones).
import sharp from 'sharp'

const CACHE = '.cache/images/graded'
const W = 2560
const H = 1440

// Room: the counter photo, blurred like a fast lens, sunk into the night.
const room = await sharp(`${CACHE}/counter.png`)
  .resize({ width: W, height: H, fit: 'cover', position: 'left' })
  .blur(12)
  .modulate({ brightness: 0.45, saturation: 0.55 })
  .composite([{ input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="#5a101b" fill-opacity="0.45"/></svg>`) }])
  .toBuffer()

// Subject: the cake cabinet, full height, on the right third.
const cabH = H
const cab = await sharp(`${CACHE}/cake-cabinet.png`).resize({ height: cabH }).toBuffer()
const cabW = (await sharp(cab).metadata()).width
const cabX = W - cabW - Math.round(W * 0.06)

// Feather the cabinet into the room with an oval mask, so the bright ceiling above the
// boxes and the street reflections at its sides fall away into the dark.
const oval = Buffer.from(`<svg width="${cabW}" height="${cabH}"><ellipse cx="${cabW / 2}" cy="${cabH * 0.5}" rx="${cabW * 0.46}" ry="${cabH * 0.5}" fill="#fff"/></svg>`)
const feather = await sharp(oval).blur(70).png().toBuffer()
const cabFeathered = await sharp(cab).ensureAlpha().composite([{ input: feather, blend: 'dest-in' }]).png().toBuffer()

// Grade: warm light from the cabinet, maroon night at the edges, darker left for type.
const grade = Buffer.from(`<svg width="${W}" height="${H}"><defs>
  <radialGradient id="glow" cx="${(cabX + cabW / 2) / W}" cy="0.45" r="0.45"><stop offset="0" stop-color="#ffcf7a" stop-opacity="0.16"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
  <linearGradient id="left" x1="0" x2="1"><stop offset="0" stop-color="#22060b" stop-opacity="0.9"/><stop offset="0.55" stop-color="#22060b" stop-opacity="0.35"/><stop offset="0.75" stop-color="#22060b" stop-opacity="0"/></linearGradient>
  <radialGradient id="vig" cx="0.6" cy="0.5" r="0.85"><stop offset="0.55" stop-color="#22060b" stop-opacity="0"/><stop offset="1" stop-color="#22060b" stop-opacity="0.85"/></radialGradient>
  </defs><rect width="100%" height="100%" fill="url(#glow)"/><rect width="100%" height="100%" fill="url(#left)"/><rect width="100%" height="100%" fill="url(#vig)"/></svg>`)

const landscape = await sharp(room)
  .composite([{ input: cabFeathered, left: cabX, top: 0 }, { input: grade }])
  .modulate({ saturation: 1.05 })
  .png()
  .toBuffer()

for (const w of [1280, 1920, 2560]) {
  const img = sharp(landscape).resize(w)
  await img.clone().avif({ quality: 55, effort: 6 }).toFile(`public/hero/cafe-${w}.avif`)
  await img.clone().webp({ quality: 78 }).toFile(`public/hero/cafe-${w}.webp`)
}

// Phones: the whole cabinet (boxes included) in the top half of a tall frame, set in the
// same darkened room, falling off to night where the headline sits.
const PW = 1080
const PH = 2340
const pRoom = await sharp(`${CACHE}/counter.png`)
  .resize({ width: PW, height: PH, fit: 'cover', position: 'left' })
  .blur(14)
  .modulate({ brightness: 0.4, saturation: 0.5 })
  .composite([{ input: Buffer.from(`<svg width="${PW}" height="${PH}"><rect width="100%" height="100%" fill="#5a101b" fill-opacity="0.5"/></svg>`) }])
  .toBuffer()
const pCab = await sharp(`${CACHE}/cake-cabinet.png`).resize({ width: Math.round(PW * 0.98) }).toBuffer()
const pCabMeta = await sharp(pCab).metadata()
const pOval = Buffer.from(`<svg width="${pCabMeta.width}" height="${pCabMeta.height}"><ellipse cx="${pCabMeta.width / 2}" cy="${pCabMeta.height * 0.5}" rx="${pCabMeta.width * 0.47}" ry="${pCabMeta.height * 0.5}" fill="#fff"/></svg>`)
const pFeather = await sharp(pOval).blur(55).png().toBuffer()
const pCabFeathered = await sharp(pCab).ensureAlpha().composite([{ input: pFeather, blend: 'dest-in' }]).png().toBuffer()
const pGrade = Buffer.from(`<svg width="${PW}" height="${PH}"><defs>
  <linearGradient id="b" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22060b" stop-opacity="0.25"/><stop offset="0.12" stop-color="#22060b" stop-opacity="0"/><stop offset="0.42" stop-color="#22060b" stop-opacity="0.1"/><stop offset="0.6" stop-color="#22060b" stop-opacity="0.88"/><stop offset="1" stop-color="#22060b" stop-opacity="1"/></linearGradient>
  </defs><rect width="100%" height="100%" fill="url(#b)"/></svg>`)
const portrait = await sharp(pRoom)
  .composite([{ input: pCabFeathered, left: Math.round((PW - pCabMeta.width) / 2), top: Math.round(PH * 0.04) }, { input: pGrade }])
  .png()
  .toBuffer()
for (const w of [720, 1080]) {
  const img = sharp(portrait).resize(w)
  await img.clone().avif({ quality: 55, effort: 6 }).toFile(`public/hero/cafe-portrait-${w}.avif`)
  await img.clone().webp({ quality: 78 }).toFile(`public/hero/cafe-portrait-${w}.webp`)
}
console.log('public/hero/cafe-*.{avif,webp}')
