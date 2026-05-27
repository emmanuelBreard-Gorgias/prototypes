// Serverless proxy for the Conversational Search Takeover prototype.
// Unlike api/chat.js (same-origin only), this is called CROSS-ORIGIN from a
// Tampermonkey userscript running on a merchant's Shopify storefront, so it
// adds a CORS allowlist (Shopify storefronts + the prototypes preview domains).
// The OpenAI key stays server-side (the prototypes repo is PUBLIC).
//
// Required env var:  OPENAI_API_KEY
// Optional env var:  OPENAI_MODEL  (overrides the model the client requests)

export const config = { runtime: 'edge' };

// Origins allowed to use this proxy from a browser. Keeps the key from being
// trivially abused by arbitrary sites (does not stop non-browser callers, but
// this is a low-limit prototype key).
const ALLOW = [
  /\.myshopify\.com$/,
  /prototypes-[a-z0-9-]+\.vercel\.app$/,
  /^https?:\/\/localhost(:\d+)?$/,
];

function cors(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (origin && ALLOW.some((r) => r.test(origin))) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  const headers = cors(origin);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

  const key = (process.env.OPENAI_API_KEY || '').replace(/\s/g, '');
  if (!key) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server.' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    let payload = {};
    try { payload = await req.json(); } catch (_) { /* keep defaults */ }
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const model = process.env.OPENAI_MODEL || payload.model || 'gpt-4o';
    const body = { model, messages, stream: true };
    if (payload.temperature != null) body.temperature = payload.temperature;

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify(body),
    });

    // Stream OpenAI's SSE straight back to the browser.
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...headers, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error: ' + ((err && err.message) || String(err)) }), {
      status: 502,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
