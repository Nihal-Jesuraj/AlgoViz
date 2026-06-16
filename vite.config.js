import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Buffer } from 'node:buffer';

const ALLOWED_DOMAINS = ['leetcode.com', 'geeksforgeeks.org', 'gfg.org'];

function isAllowedUrl(urlString) {
  try {
    const url = new URL(urlString);
    return ALLOWED_DOMAINS.some(domain => url.hostname.includes(domain));
  } catch {
    return false;
  }
}

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

        // Security: Whitelist allowed domains
        if (!isAllowedUrl(urlParam)) {
          res.statusCode = 403;
          return res.end('Domain not allowed. Only LeetCode and GeeksForGeeks are supported.');
        }

        let response;
        let isLeetCode = urlParam.includes('leetcode.com');

        if (isLeetCode) {
          // Extract title slug
          const match = urlParam.match(/problems\/([^/]+)/);
          if (match && match[1]) {
            const titleSlug = match[1];
            response = await fetch('https://leetcode.com/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
              },
              body: JSON.stringify({
                operationName: 'questionData',
                variables: { titleSlug },
                query: 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }'
              })
            });
          }
        }

        if (!response) {
          response = await fetch(urlParam, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000 // 10 second timeout
          });
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from target: ${response.status} ${response.statusText}`);
        }

        let html = '';
        if (isLeetCode && response.headers.get('content-type')?.includes('application/json')) {
          const json = await response.json();
          html = json?.data?.question?.content || '';
        } else {
          html = await response.text();
        }
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      } catch (e) {
        console.error("Scraper proxy error:", e);
        res.statusCode = 500;
        res.end(`Proxy Error: ${e.message}`);
      }
    });

    server.middlewares.use('/api/image-proxy', async (req, res) => {
      try {
        const urlParam = new URL(req.url, `http://${req.headers.host}`).searchParams.get('url');
        if (!urlParam) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing url parameter' }));
        }

        // Security: Only allow image URLs from LeetCode and GFG domains
        if (!isAllowedUrl(urlParam) && !urlParam.includes('cdn.')) {
          res.statusCode = 403;
          return res.end(JSON.stringify({ error: 'Image URL domain not allowed' }));
        }

        const response = await fetch(urlParam, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          timeout: 10000
        });
        
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/png';

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ base64, mimeType }));
      } catch (e) {
        console.error("Image proxy error:", e);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message }));
      }
    });

    server.middlewares.use('/api/gemini', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: 'Method not allowed' }));
      }
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const { prompt, apiKey } = JSON.parse(body);
          if (!apiKey) throw new Error("Missing API Key");

          // Directly hit the Gemini REST API from Node.js to bypass browser/network adblockers
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errText}`);
          }

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ text }));
        } catch (e) {
          console.error("Gemini proxy error:", e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), scraperProxyPlugin()],
});
