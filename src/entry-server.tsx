// Build-time prerender (scripts/prerender.mjs): each route's HTML is written into
// dist/<route>/index.html so content paints before JavaScript; client.tsx hydrates it.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'

export { staticRoutes, routeMeta } from './routes'

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
