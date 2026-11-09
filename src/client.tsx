import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'

// The story starts at the top; pinned scenes can't be restored mid-way reliably.
if ('scrollRestoration' in history && !location.hash) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// Production HTML is prerendered (scripts/prerender.mjs); the dev server is not.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
