// Favicon, touch icon and Open Graph image, made from the processed images.
// Run after `npm run images`. Logo is the Instagram-avatar stand-in until the SVG arrives.
import fs from 'node:fs'
import sharp from 'sharp'

const CACHE = '.cache/images'
fs.mkdirSync('public', { recursive: true })

const logo = `${CACHE}/graded/logo-roundel.png`
const circle = (s) => Buffer.from(`<svg width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/></svg>`)
const roundLogo = async (s) => sharp(logo).resize(s, s).composite([{ input: circle(s), blend: 'dest-in' }]).png().toBuffer()

await sharp(await roundLogo(64)).toFile('public/favicon.png')
// Touch icons are masked by the OS, so the logo sits on its own maroon square.
await sharp({ create: { width: 180, height: 180, channels: 3, background: '#7a1523' } })
  .composite([{ input: await roundLogo(168), left: 6, top: 6 }])
  .png()
  .toFile('public/apple-touch-icon.png')

// OG 1200x630: the cake on the night stage with the logo, like the hero.
const W = 1200
const H = 630
const bg = Buffer.from(`<svg width="${W}" height="${H}"><defs><radialGradient id="g" cx="68%" cy="0%" r="75%"><stop offset="0" stop-color="#f7b836" stop-opacity=".28"/><stop offset=".7" stop-color="#f7b836" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="#3a0a12"/><rect width="100%" height="100%" fill="url(#g)"/></svg>`)
const cake = await sharp(`${CACHE}/cut/cake-rosettes.png`).trim({ threshold: 1 }).resize({ height: 560 }).png().toBuffer()
const cakeMeta = await sharp(cake).metadata()
await sharp(bg)
  .composite([
    { input: cake, left: W - cakeMeta.width - 40, top: 50 },
    { input: await roundLogo(260), left: 80, top: (H - 260) / 2 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/og.jpg')

console.log('public/favicon.png, public/apple-touch-icon.png, public/og.jpg')

// Logo for the boot frame in index.html and the <Logo> component: a stable public URL,
// so the HTML can paint it before any JavaScript loads.
await sharp(await roundLogo(256)).webp({ quality: 86 }).toFile('public/logo-roundel.webp')
console.log('public/logo-roundel.webp')

// Hero cake at stable public URLs so index.html can preload it alongside the JS bundle
// (it is the LCP element). The <Hero> uses these same URLs.
fs.mkdirSync('public/hero', { recursive: true })
for (const w of [480, 800, 1280, 1920]) {
  const base = sharp(`${CACHE}/cut/cake-rosettes.png`).trim({ threshold: 1 }).resize(w)
  await base.clone().avif({ quality: 60, effort: 6 }).toFile(`public/hero/cake-${w}.avif`)
  await base.clone().webp({ quality: 82, alphaQuality: 90 }).toFile(`public/hero/cake-${w}.webp`)
}
console.log('public/hero/cake-{480,800,1280,1920}.{avif,webp}')

// Hero backdrop: the real cake cabinet, heavily blurred into bokeh, overlaid with maroon
// and sunk into the night, so the hero has depth from the first paint (before WebGL loads).
for (const w of [960, 1920]) {
  const h = Math.round(w * 0.62)
  const rect = (fill, opacity) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="${fill}" fill-opacity="${opacity}"/></svg>`)
  const blurred = await sharp(`${CACHE}/graded/cake-cabinet.png`)
    .resize({ width: w, height: h, fit: 'cover' })
    .blur(w / 52)
    .modulate({ brightness: 1.05, saturation: 1.2 })
    .toBuffer()
  await sharp(blurred)
    .composite([{ input: rect('#7a1523', 1), blend: 'overlay' }, { input: rect('#3a0a12', 0.62) }])
    .webp({ quality: 72 })
    .toFile(`public/hero/backdrop-${w}.webp`)
}
console.log('public/hero/backdrop-{960,1920}.webp')
