// Checks the §7 budgets on dist/: initial JS <= 170 KB gzip (lazy chunks —
// three, sprinkles, Admin, perf — excluded) and lists every chunk. `npm run budget`
import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const dir = new URL('../dist/assets/', import.meta.url);
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
let initial = 0;
for (const f of (await readdir(dir)).sort()) {
  const kb = gzipSync(await readFile(new URL(f, dir))).length / 1024;
  const isInitial = html.includes(`/assets/${f}`);
  if (isInitial && f.endsWith('.js')) initial += kb;
  console.log(`${isInitial ? 'initial' : 'lazy   '}  ${kb.toFixed(1).padStart(6)} KB gz  ${f}`);
}
console.log(`\nInitial JS: ${initial.toFixed(1)} KB gzip (budget 170) ${initial <= 170 ? 'OK' : 'OVER'}`);
process.exit(initial <= 170 ? 0 : 1);
