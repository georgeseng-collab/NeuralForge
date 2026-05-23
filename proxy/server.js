const http = require('http');

const ZAI_HOST = '172.25.136.193';
const ZAI_PORT = 8080;
const PROXY_PORT = process.env.PROXY_PORT || 3456;

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token, X-Chat-Id, X-User-Id, X-Z-AI-From, XTransformPort');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', proxy: 'neuralforge-zai-proxy' }));
    return;
  }

  // Parse the request URL
  let targetPath = req.url;
  
  // Handle XTransformPort query param (from lib/ai.ts buildApiUrl)
  const urlObj = new URL(req.url, `http://localhost:${PROXY_PORT}`);
  const transformPort = urlObj.searchParams.get('XTransformPort');
  const targetPort = transformPort || ZAI_PORT;
  
  // Remove XTransformPort from query params before forwarding
  urlObj.searchParams.delete('XTransformPort');
  targetPath = urlObj.pathname + urlObj.search;

  console.log(`[Proxy] ${req.method} ${req.url} -> ${ZAI_HOST}:${targetPort}${targetPath}`);

  // Collect request body
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    const body = chunks.length > 0 ? Buffer.concat(chunks) : null;

    // Forward request to ZAI API
    const options = {
      hostname: ZAI_HOST,
      port: targetPort,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${ZAI_HOST}:${targetPort}`,
      },
    };
    
    // Remove proxy-specific headers
    delete options.headers['x-forwarded-for'];
    delete options.headers['x-forwarded-proto'];
    delete options.headers['x-forwarded-host'];

    const proxyReq = http.request(options, (proxyRes) => {
      // Collect response body for image URLs that need to be converted
      const resChunks = [];
      proxyRes.on('data', chunk => resChunks.push(chunk));
      proxyRes.on('end', () => {
        const resBody = Buffer.concat(resChunks);
        
        // Forward response headers
        const resHeaders = { ...proxyRes.headers };
        resHeaders['access-control-allow-origin'] = '*';
        
        // Check if response contains image URLs that need converting to base64
        const contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes('application/json') && resBody.length > 0) {
          try {
            const json = JSON.parse(resBody.toString());
            if (json.data && Array.isArray(json.data)) {
              // Process each image item
              Promise.all(json.data.map(async (item) => {
                if (item.url && !item.base64) {
                  try {
                    const imgUrl = new URL(item.url);
                    const imgResult = await new Promise((resolve, reject) => {
                      const imgReq = http.request({
                        hostname: imgUrl.hostname,
                        port: imgUrl.port || 80,
                        path: imgUrl.pathname + imgUrl.search,
                        method: 'GET',
                      }, (imgRes) => {
                        const imgChunks = [];
                        imgRes.on('data', c => imgChunks.push(c));
                        imgRes.on('end', () => resolve(Buffer.concat(imgChunks)));
                      });
                      imgReq.on('error', reject);
                      imgReq.setTimeout(30000, () => { imgReq.destroy(); reject(new Error('Image download timeout')); });
                      imgReq.end();
                    });
                    item.base64 = imgResult.toString('base64');
                    delete item.url;
                  } catch (e) {
                    console.error('[Proxy] Failed to download image:', e.message);
                  }
                }
                return item;
              })).then(() => {
                const newBody = JSON.stringify(json);
                resHeaders['content-length'] = Buffer.byteLength(newBody);
                res.writeHead(proxyRes.statusCode, resHeaders);
                res.end(newBody);
              });
              return;
            }
          } catch (e) {
            // Not valid JSON or doesn't have data array, forward as-is
          }
        }
        
        resHeaders['content-length'] = resBody.length;
        res.writeHead(proxyRes.statusCode, resHeaders);
        res.end(resBody);
      });
    });

    proxyReq.on('error', (err) => {
      console.error('[Proxy] Request error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }));
    });

    proxyReq.setTimeout(60000, () => {
      proxyReq.destroy();
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Gateway timeout' }));
    });

    if (body) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[NeuralForge ZAI Proxy] Running on http://0.0.0.0:${PROXY_PORT}`);
  console.log(`[NeuralForge ZAI Proxy] Forwarding to http://${ZAI_HOST}:${ZAI_PORT}`);
});
