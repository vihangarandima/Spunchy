import { createRoot, hydrateRoot } from 'react-dom/client';
import App, { isAdminPath } from './App.jsx';
import './styles.css';

// The public page is prerendered at build time (scripts/prerender.mjs) and
// hydrated here. /admin shares the same HTML file, so it renders fresh.
const root = document.getElementById('root');
if (root.hasChildNodes() && !isAdminPath(location.pathname)) {
  hydrateRoot(root, <App />);
} else {
  root.textContent = '';
  createRoot(root).render(<App />);
}

if (import.meta.env.DEV || new URLSearchParams(location.search).has('perf')) {
  import('./lib/perf.js').then((m) => m.startPerfMonitor());
}
