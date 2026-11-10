// Writes every static route's server-rendered HTML into dist/<route>/index.html (see
// src/entry-server.tsx), with its own <title> and description, and inlines the stylesheet so
// first paint needs no extra round trip. dist/index.html stays the SPA fallback for
// dynamic URLs (/order/:id): it is the home page, and client.tsx renders fresh there.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const { render, staticRoutes, routeMeta } = await import(pathToFileURL('dist-ssr/entry-server.js').href)
let template = fs.readFileSync('dist/index.html', 'utf8')
if (!template.includes('<!--app-->')) throw new Error('dist/index.html has no <!--app--> placeholder')

template = template.replace(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/, (_, href) => `<style>${fs.readFileSync(`dist${href}`, 'utf8')}</style>`)
if (/<link rel="stylesheet"/.test(template)) throw new Error('stylesheet link was not inlined; check the Vite output format')

const display = fs.readdirSync('dist/assets').find((f) => /^bricolage-grotesque-latin-wdth-normal-.*\.woff2$/.test(f))
if (!display) throw new Error('Bricolage latin font file not found in dist/assets')
template = template.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <link rel="preload" as="font" type="font/woff2" href="/assets/${display}" crossorigin />`)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const route of staticRoutes) {
  const { title, description } = routeMeta(route)
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace('<div id="root"><!--app--></div>', `<div id="root" data-route="${route}">${render(route)}</div>`)
  if (route !== '/') {
    // Only the home page opens with the intro: drop the boot frame and its dark background.
    html = html.replace(/<div id="boot"[\s\S]*?<\/div><\/div>/, '').replace('html { background: #22060b; }', 'html { background: #f6e7da; }')
  }
  // Both /menu/slices/index.html and /menu/slices.html, so the right page is served with or
  // without a trailing slash (vite preview and most static hosts pick one of the two).
  const outs = route === '/' ? ['dist/index.html'] : [path.join('dist', route, 'index.html'), path.join('dist', `${route}.html`)]
  for (const out of outs) {
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, html)
  }
}
fs.rmSync('dist-ssr', { recursive: true, force: true })
console.log(`prerendered ${staticRoutes.length} routes`)
