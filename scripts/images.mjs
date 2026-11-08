// Asset pipeline: assets/photos/*.jpg  ->  public/img/<name>-<w>.{avif,webp,jpg}
// plus src/content/images.json (intrinsic sizes, used for width/height to stop CLS)
// and brand assets (favicon, apple-touch-icon, Open Graph image).
//
// Run with `npm run images` after adding or replacing a photo.
import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const src = path.join(root, 'assets/photos');
const out = path.join(root, 'public/img');
const WIDTHS = [480, 720, 960, 1600];

await mkdir(out, { recursive: true });
const manifest = {};

for (const file of (await readdir(src)).filter((f) => /\.jpe?g$/i.test(f))) {
  const name = file.replace(/\.jpe?g$/i, '');
  const input = sharp(path.join(src, file)).rotate();
  const { width, height } = await input.metadata();
  const widths = WIDTHS.filter((w) => w < width - 80).concat([Math.min(width, 1600)]);
  const uniq = [...new Set(widths.map((w) => Math.min(w, 1600)))];
  for (const w of uniq) {
    const base = input.clone().resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(path.join(out, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 72 }).toFile(path.join(out, `${name}-${w}.webp`));
    if (w === uniq[uniq.length - 1]) await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(out, `${name}-${w}.jpg`));
  }
  // Tiny blurred placeholder (inline data URI) so images never pop in on a blank box.
  const lqip = await input.clone().resize(16).blur(1).webp({ quality: 40 }).toBuffer();
  manifest[name] = { w: width, h: height, widths: uniq, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
  console.log(name, width, 'x', height, '->', uniq.join(', '));
}
await writeFile(path.join(root, 'src/content/images.json'), JSON.stringify(manifest, null, 1));

// Brand: favicon + touch icon from the packaging logo, OG image from the signboard.
const brand = path.join(root, 'assets/brand');
const RED = { r: 200, g: 64, b: 28 };
const box = sharp(path.join(brand, 'logo-box.jpg'));
await box.clone().resize(180, 180, { fit: 'cover' }).png().toFile(path.join(root, 'public/apple-touch-icon.png'));
await box.clone().resize(48, 48, { fit: 'cover' }).png().toFile(path.join(root, 'public/favicon.png'));
await box.clone().resize(512, 512, { fit: 'cover' }).png().toFile(path.join(root, 'public/icon-512.png'));
const sign = await sharp(path.join(brand, 'logo-sign.jpg')).resize({ width: 760 }).png().toBuffer();
const cake = await sharp(path.join(src, 'hero-cake.jpg')).resize(560, 630, { fit: 'cover' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: RED } })
  .composite([
    { input: cake, left: 640, top: 0 },
    { input: sign, left: 0, top: 180 },
  ])
  .jpeg({ quality: 82 })
  .toFile(path.join(root, 'public/og.jpg'));
await sharp(path.join(brand, 'logo-sign.jpg')).resize({ width: 600 }).webp({ quality: 85 }).toFile(path.join(out, 'logo-sign.webp'));
const signMeta = await sharp(path.join(out, 'logo-sign.webp')).metadata();
manifest['logo-sign'] = { w: signMeta.width, h: signMeta.height };
await writeFile(path.join(root, 'src/content/images.json'), JSON.stringify(manifest, null, 1));
console.log('brand assets done');
