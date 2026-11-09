// Writes the server-rendered app into dist/index.html (see src/entry-server.tsx) and
// inlines the stylesheet (about 9 kB gzipped) so first paint needs no extra round trip.
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const { render } = await import(pathToFileURL('dist-ssr/entry-server.js').href)
const file = 'dist/index.html'
let html = fs.readFileSync(file, 'utf8')
if (!html.includes('<!--app-->')) throw new Error('dist/index.html has no <!--app--> placeholder')
html = html.replace('<!--app-->', render())

html = html.replace(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/, (_, href) => {
  const css = fs.readFileSync(`dist${href}`, 'utf8')
  return `<style>${css}</style>`
})
if (/<link rel="stylesheet"/.test(html)) throw new Error('stylesheet link was not inlined; check the Vite output format')

// Preload the display face: the hero's "love" (the largest paint) is set in it.
const display = fs.readdirSync('dist/assets').find((f) => /^bricolage-grotesque-latin-wdth-normal-.*\.woff2$/.test(f))
if (!display) throw new Error('Bricolage latin font file not found in dist/assets')
html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <link rel="preload" as="font" type="font/woff2" href="/assets/${display}" crossorigin />`)
fs.writeFileSync(file, html)
fs.rmSync('dist-ssr', { recursive: true, force: true })
console.log(`prerendered dist/index.html (${Math.round(html.length / 1024)} kB)`)
