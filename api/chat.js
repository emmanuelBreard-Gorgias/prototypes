// Serverless proxy for the Adrianna Papell prototype's LLM chat.
// The prototypes repo is PUBLIC, so the OpenAI key cannot live in client code.
// This Edge function keeps it server-side and streams OpenAI's SSE response
// straight back to the browser, in the same format the client already parses.
//
// Required env var:  OPENAI_API_KEY
// Optional env var:  OPENAI_MODEL  (overrides the model the client requests)

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Strip ALL whitespace: a key pasted into the env with a newline/space
  // (even mid-string from a wrapped copy) produces an "Invalid header value"
  // in the Authorization header. Real keys never contain whitespace.
  const key = (process.env.OPENAI_API_KEY || '').replace(/\s/g, '');
  if (!key) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY is not set on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let payload = {};
    try { payload = await req.json(); } catch (e) { /* keep defaults */ }
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const model = process.env.OPENAI_MODEL || payload.model || 'gpt-4o';

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({ model, messages, stream: true })
    });

    // Pass the streamed response straight through to the client.
    // (No `Connection` header — it's a forbidden response header and throws
    // in the spec-strict Edge runtime.)
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error: ' + ((err && err.message) || String(err)) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
