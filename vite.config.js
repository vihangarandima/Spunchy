import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// SITE_URL (e.g. https://spunchy.lk) turns on canonical URLs and sitemap.xml.
// Left empty until the domain is confirmed — see CONTENT_TO_CONFIRM.md.
function seoFiles(siteUrl) {
  return {
    name: 'spunchy-seo-files',
    transformIndexHtml(html) {
      const url = siteUrl ? siteUrl.replace(/\/$/, '') : '';
      return html
        .replace('<!--canonical-->', url ? `<link rel="canonical" href="${url}/" />\n    <meta property="og:url" content="${url}/" />` : '')
        .replace(/__OG_IMAGE__/g, url ? `${url}/og.jpg` : '/og.jpg');
    },
    generateBundle() {
      const url = siteUrl ? siteUrl.replace(/\/$/, '') : '';
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\n${url ? `Sitemap: ${url}/sitemap.xml\n` : ''}`,
      });
      if (url) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><changefreq>daily</changefreq></url>\n</urlset>\n`,
        });
      } else {
        console.warn('\n[spunchy] SITE_URL not set: skipping sitemap.xml and canonical URL.\n');
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), seoFiles(env.SITE_URL)],
    server: { port: 5175 },
    build: {
      target: 'es2020',
      // three.js lives in its own lazy chunk, loaded after first paint.
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
          },
        },
      },
    },
  };
});
