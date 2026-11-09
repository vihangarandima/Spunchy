// Image pipeline. Originals in assets/raw stay untouched; intermediates go to .cache/images.
//
//   node scripts/images.mjs crop     raw -> .cache/images/crop/<id>.png
//   python scripts/upscale.py        crop -> .cache/images/up/<id>.png      (Real-ESRGAN)
//   node scripts/images.mjs grade    up|crop -> .cache/images/graded/<id>.png
//   python scripts/cutout.py         graded -> .cache/images/cut/<id>.png   (rembg)
//   node scripts/images.mjs export   graded + cut -> src/assets/images (AVIF/WebP, sizes, LQIP manifest)
//
// `npm run images` runs all five in order.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { images, SIZES } from './images.config.mjs'

const RAW = 'assets/raw'
const CACHE = '.cache/images'
const OUT = 'src/assets/images'
const dir = (d) => (fs.mkdirSync(d, { recursive: true }), d)

async function crop() {
  dir(`${CACHE}/crop`)
  for (const im of images) {
    let img = sharp(path.join(RAW, im.src)).rotate()
    if (im.crop) {
      const [left, top, width, height] = im.crop
      img = img.extract({ left, top, width, height })
    }
    if (im.blur) {
      // Redaction: heavy blur inside feathered polygons (crop-local), e.g. a neighbour's signage.
      const base = await img.png().toBuffer()
      const { width: w, height: h } = await sharp(base).metadata()
      const polys = im.blur.map((pts) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="#fff"/>`)
      const mask = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${polys.join('')}</svg>`))
        .blur(6).extractChannel('alpha').toBuffer()
      const soft = await sharp(base).removeAlpha().blur(22).modulate({ brightness: 0.85 }).png().toBuffer()
      const blurred = await sharp(soft).joinChannel(mask).png().toBuffer()
      img = sharp(base).composite([{ input: blurred }])
    }
    if (im.paint) {
      // Flat fills over regions that must not reach the cut-out (crop-local coordinates).
      const [w, h] = im.crop ? im.crop.slice(2) : [(await img.metadata()).width, (await img.metadata()).height]
      const rects = im.paint.map(([x, y, rw, rh, fill]) => `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${fill}"/>`)
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rects.join('')}</svg>`)
      img = sharp(await img.png().toBuffer()).composite([{ input: svg }])
    }
    await img.png().toFile(`${CACHE}/crop/${im.id}.png`)
  }
  // The Python steps read the plan from here instead of parsing the JS config.
  fs.writeFileSync(`${CACHE}/plan.json`, JSON.stringify(images.map(({ id, up, cutout }) => ({ id, up, cutout: !!cutout }))))
  console.log(`cropped ${images.length}`)
}

// Shared look: warm cabinet light. Every photo is pulled toward the same neutral-warm
// white point, the same mid-tone brightness and the same contrast, so the set reads as
// one shoot. Spunchy's printed posters only get the tone step, not white balance.
const WARM = [1.03, 1.0, 0.93] // target r:g:b of a white surface under the house light
const TARGET_MEAN = 118 // mid-tone luminance (0-255)

async function gradeOne(im) {
  const upPath = `${CACHE}/up/${im.id}.png`
  const src = im.up > 1 && fs.existsSync(upPath) ? upPath : `${CACHE}/crop/${im.id}.png`
  let img = sharp(src).removeAlpha()
  if (im.grade === 'none') return img.png().toFile(`${CACHE}/graded/${im.id}.png`)

  const { channels } = await sharp(src).stats()
  const mean = channels.slice(0, 3).map((c) => c.mean)
  const lum = 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]

  // White balance from a white patch: the near-neutral highlights (icing, cream, cabinet
  // white) are pulled toward a warm white at strength 0.6. Grey-world was tried and
  // failed on single-colour subjects (it turned the fruit tart's cream blue).
  let gains = [1, 1, 1]
  if (im.grade === 'photo') {
    const { data } = await sharp(src).removeAlpha().resize(256).raw().toBuffer({ resolveWithObject: true })
    const sum = [0, 0, 0]
    let n = 0
    for (let i = 0; i < data.length; i += 3) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
      if (Math.max(r, g, b) - Math.min(r, g, b) < 40 && r + g + b > 450 && Math.max(r, g, b) < 252) {
        sum[0] += r; sum[1] += g; sum[2] += b; n++
      }
    }
    if (n > 200) {
      const white = sum.map((s) => s / n)
      const grey = (white[0] + white[1] + white[2]) / 3
      gains = white.map((w, i) => 1 + 0.6 * ((grey * WARM[i]) / w - 1))
    }
  }
  // Exposure: halfway toward the shared mid-tone, capped so dark scenes stay moody.
  const expo = Math.min(1.25, Math.max(0.85, 1 + 0.5 * (TARGET_MEAN / lum - 1)))
  // Contrast: gentle S around the mid-point.
  const k = im.grade === 'photo' ? 1.1 : 1.04
  const a = gains.map((g) => g * expo * k)
  const b = a.map(() => -128 * (k - 1))

  img = img
    .linear(a, b)
    .modulate({ saturation: im.grade === 'photo' ? 1.08 : 1.02 })
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.2 })
  return img.png().toFile(`${CACHE}/graded/${im.id}.png`)
}

async function grade() {
  dir(`${CACHE}/graded`)
  for (const im of images) await gradeOne(im)
  console.log(`graded ${images.length}`)
}

async function lqip(file) {
  const buf = await sharp(file).resize(24).webp({ quality: 40 }).toBuffer()
  return `data:image/webp;base64,${buf.toString('base64')}`
}

async function exportSet(file, name, alpha) {
  const { width, height } = await sharp(file).metadata()
  // Only sizes the (upscaled) source can honestly fill, plus the source width itself
  // when it falls between steps.
  const widths = SIZES.filter((w) => w <= width)
  if (!widths.length || (width < 2560 && width > widths.at(-1) * 1.15)) widths.push(width)
  for (const w of widths) {
    const base = sharp(file).resize(w)
    await base.clone().avif({ quality: alpha ? 60 : 55, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`)
    await base.clone().webp({ quality: alpha ? 82 : 78, alphaQuality: 90 }).toFile(`${OUT}/${name}-${w}.webp`)
  }
  return { width, height, widths, lqip: await lqip(file) }
}

async function exportAll() {
  fs.rmSync(OUT, { recursive: true, force: true })
  dir(OUT)
  const manifest = {}
  for (const im of images) {
    manifest[im.id] = await exportSet(`${CACHE}/graded/${im.id}.png`, im.id, false)
    const cut = `${CACHE}/cut/${im.id}.png`
    if (im.cutout && fs.existsSync(cut)) {
      // Trim the transparent margin so the product fills its box.
      const trimmed = await sharp(cut).trim({ threshold: 1 }).png().toBuffer()
      const tmp = `${CACHE}/cut/${im.id}.trim.png`
      fs.writeFileSync(tmp, trimmed)
      manifest[`${im.id}-cut`] = await exportSet(tmp, `${im.id}-cut`, true)
    }
  }
  fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2))
  console.log(`exported ${Object.keys(manifest).length} sets`)
}

// Before/after review page: docs/contact-sheet/index.html (open via `npm run dev`,
// then /docs/contact-sheet/). "Before" is the same crop of the untouched original.
async function sheet() {
  const SHEET = 'docs/contact-sheet'
  fs.rmSync(`${SHEET}/before`, { recursive: true, force: true })
  dir(`${SHEET}/before`)
  const manifest = JSON.parse(fs.readFileSync(`${OUT}/manifest.json`, 'utf8'))
  const rows = []
  for (const im of images) {
    await sharp(`${CACHE}/crop/${im.id}.png`).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${SHEET}/before/${im.id}.webp`)
    const before = await sharp(`${CACHE}/crop/${im.id}.png`).metadata()
    const after = manifest[im.id]
    const big = after.widths.at(-1)
    const cut = manifest[`${im.id}-cut`]
    rows.push(`
    <section>
      <h2>${im.id}</h2>
      <p>${im.src}${im.crop ? ` · crop ${im.crop.join(',')}` : ''} · ${before.width}×${before.height} → ${after.width}×${after.height}${im.up > 1 ? ` (Real-ESRGAN ×${im.up})` : ''} · grade: ${im.grade}</p>
      <div class="pair">
        <figure><img src="before/${im.id}.webp" alt="${im.id} before" loading="lazy"><figcaption>Before (original pixels)</figcaption></figure>
        <figure><img src="../../src/assets/images/${im.id}-${big}.webp" alt="${im.id} after" loading="lazy"><figcaption>After · exports ${after.widths.join(' / ')} px · AVIF + WebP</figcaption></figure>
        ${cut ? `<figure class="cut"><img src="../../src/assets/images/${im.id}-cut-${cut.widths.at(-1)}.webp" alt="${im.id} cut-out" loading="lazy"><figcaption>Cut-out (transparent) on the maroon stage</figcaption></figure>` : ''}
      </div>
    </section>`)
  }
  fs.writeFileSync(`${SHEET}/index.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spunchy images: before / after</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 24px 16px 80px; background: #1a0508; color: #fef6f5; font: 15px/1.5 system-ui, sans-serif; }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 17px; margin: 0; color: #f7b836; }
  header p, section p { margin: 4px 0 12px; opacity: .75; font-size: 13px; }
  section { max-width: 1600px; margin: 0 auto 40px; }
  .pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
  figure { margin: 0; background: #2a0a0f; border-radius: 10px; overflow: hidden; }
  figure img { display: block; width: 100%; height: 420px; object-fit: contain; background: #111; }
  .cut img { background: radial-gradient(circle at 50% 40%, #7a1523, #3a0a12 75%); }
  figcaption { padding: 8px 12px; font-size: 13px; opacity: .8; }
</style></head><body>
<header style="max-width:1600px;margin:0 auto 28px"><h1>Spunchy images: before / after</h1>
<p>${images.length} images · same crop on both sides · originals in assets/raw are untouched</p></header>
${rows.join('\n')}
</body></html>`)
  console.log(`sheet: ${SHEET}/index.html`)
}

const step = process.argv[2]
const steps = { crop, grade, export: exportAll, sheet }
if (!steps[step]) {
  console.error('usage: node scripts/images.mjs crop|grade|export|sheet')
  process.exit(1)
}
await steps[step]()
