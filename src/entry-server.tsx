// Build-time prerender (scripts/prerender.mjs): the page's HTML is written into
// dist/index.html so content and the hero image paint before JavaScript; main.tsx hydrates it.
import { renderToString } from 'react-dom/server'
import { App } from './App'

export function render() {
  return renderToString(<App />)
}
