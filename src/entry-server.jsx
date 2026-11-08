import { renderToString } from 'react-dom/server';
import App from './App.jsx';

// Used only at build time by scripts/prerender.mjs.
export const render = () => renderToString(<App path="/" />);
