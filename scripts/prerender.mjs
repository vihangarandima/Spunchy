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
fs.writeFileSync(file, html)
fs.rmSync('dist-ssr', { recursive: true, force: true })
console.log(`prerendered dist/index.html (${Math.round(html.length / 1024)} kB)`)
