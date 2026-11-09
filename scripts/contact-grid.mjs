import sharp from 'sharp'
import fs from 'node:fs'
const dir = process.argv[3] || 'assets/raw'
const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f)).sort()
const W = 300, H = 380, cols = 7
const tiles = []
for (const [i, f] of files.entries()) {
  const m = await sharp(`${dir}/${f}`).metadata()
  console.log(i, f, m.width + 'x' + m.height)
  const img = await sharp(`${dir}/${f}`).rotate().resize(W, H - 30, { fit: 'contain', background: '#222' }).toBuffer()
  const label = Buffer.from(`<svg width="${W}" height="30"><rect width="100%" height="100%" fill="#000"/><text x="6" y="20" font-size="15" fill="#fff" font-family="sans-serif">${i} ${f.slice(0, 30)}</text></svg>`)
  tiles.push({ input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H })
  tiles.push({ input: label, left: (i % cols) * W, top: Math.floor(i / cols) * H + H - 30 })
}
const rows = Math.ceil(files.length / cols)
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: '#111' } }).composite(tiles).jpeg({ quality: 80 }).toFile(process.argv[2])
