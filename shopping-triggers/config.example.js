// LOCAL DEV ONLY — copy this file to `config.js` (which is gitignored) and
// paste a real OpenAI key to run the Adrianna Papell chat locally without the
// serverless proxy. In production the key is NOT here; it lives in the Vercel
// env var OPENAI_API_KEY and is used by /api/chat.
//
//   cp config.example.js config.js   # then edit config.js
//
// Never commit config.js — the prototypes repo is public.

const OPENAI_API_KEY = "sk-REPLACE_WITH_YOUR_KEY";
