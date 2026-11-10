import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
// Production HTML is prerendered per route (scripts/prerender.mjs). Hydrate only when the
// HTML was rendered for this exact path; anything else (e.g. /order/:id served by the SPA
// fallback) renders fresh.
const norm = (p: string) => p.replace(/\/+$/, '') || '/'
if (root.firstElementChild && norm(root.dataset.route ?? '') === norm(location.pathname)) hydrateRoot(root, app)
else {
  root.replaceChildren()
  createRoot(root).render(app)
}
