// Tiny entry: let the browser paint the prerendered HTML (boot frame + hero) first, then
// load and hydrate the app. Importing the app eagerly made first paint wait on ~490 kB of JS.
import './styles.css'

const afterFirstPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))

afterFirstPaint().then(() => import('./client'))
