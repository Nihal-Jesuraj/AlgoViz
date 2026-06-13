import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const scraperProxyPlugin = () => ({
  name: 'scraper-proxy',
  configureServer(server) {
    server.middlewares.use('/api/scrape', async (req, res) => {
      try {
        const urlParam = new URL(req.url, `http://${req.headers.host}`).searchParams.get('url');
        if (!urlParam) {
          res.statusCode = 400;
          return res.end('Missing url parameter');
        }

        const response = await fetch(urlParam, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from target: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      } catch (e) {
        console.error("Scraper proxy error:", e);
        res.statusCode = 500;
        res.end(`Proxy Error: ${e.message}`);
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), scraperProxyPlugin()],
});
