// js/api.js - Unified Backend API Layer

const BACKENDS = [
  'https://groq-proxy-7f82.onrender.com',
  'https://groq-proxy-0bfy.onrender.com'
];
const PROXY = BACKENDS[0];

async function smartFetch(url, options, max) {
  max = max || 3;
  options = options || {};
  // Strip any existing proxy base from the URL
  const path = url.replace(/^https?:\/\/[^\/]+/, '');
  let lastError = null;
  
  for (const backend of BACKENDS) {
    for (let i = 0; i < max; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(function() { controller.abort(); }, 30000);
        const opts = Object.assign({}, options, { signal: controller.signal });
        
        const resp = await fetch(backend + path, opts);
        clearTimeout(timeoutId);
        
        if (resp.status < 500) return resp;
        lastError = new Error('Status ' + resp.status);
        break;
      } catch(e) {
        lastError = e;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  throw lastError || new Error('All backends failed');
}

// Alias so create.html doesn't break
const fetchWithRetry = smartFetch;
