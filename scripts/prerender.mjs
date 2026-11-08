// Inject the server-rendered public page into dist/index.html so the hero
// photo, tagline and menu are in the first HTML response (fast LCP, works
// without JavaScript for crawlers). Run as part of `npm run build`.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href);
const file = path.join(root, 'dist/index.html');
const html = await readFile(file, 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('root placeholder not found');
await writeFile(file, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`));
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log('prerendered dist/index.html');
