# Osea Malibu — Shopping Triggers prototype

Static HTML prototype for the Osea Malibu customer interview, modelled on the Koh / 1st Phorm / Adrianna Papell prototypes. Storefront-side companion to the helpdesk Shopping Triggers initiative.

Replaces the earlier single-file `osea.html` prototype with a multi-page version backed by real ticket research and the live Osea Shopify catalog.

## What this shows

A recognizable Osea storefront with **4 Shopping Triggers entry points**, each opening a branded chat panel that runs a 2-3 question discovery flow and ends in real product recommendations from the live Osea catalog (real names, real prices, real CDN images).

## Pages and entry points

| File | Page | Entry points |
|---|---|---|
| `index.html` | Homepage | **#1** Hero pill: *"Find my skincare routine"* (also repeated as a button in the cream mid-page band) |
| `pdp-atmosphere-protection-cream.html` | Atmosphere Protection Cream PDP | **#2** Fit check below ATC: *"Not sure if this is right for your skin?"* · **#3** Compare helper above ATC: *"Atmosphere or Seabiotic Water Cream?"* |
| `collection-body-moisturizers.html` | Body Moisturizers collection | **#4** Green banner above the grid: *"Oil, butter, lotion, or balm? Help me decide"* |

Each entry point uses a different scripted flow defined in `assets/chat.js`.

## Flows

| Trigger | Flow key | Questions | Recommends |
|---|---|---|---|
| Find my routine | `find-routine` | Skin type · Top concern · AM/PM/both | 3-4 step routine: cleanser → serum → moisturizer (varies by skin/concern, eg. mature/dry → Atmosphere or Advanced Protection + Hyaluronic Sea Serum + Dream Night Cream) |
| Atmosphere fit-check | `fit-check` | Skin type · Texture preference · AM/PM | Confirms Atmosphere if dry/sensitive; redirects oily → Seabiotic, very dry → Advanced Protection |
| Atmosphere vs Seabiotic | `vs-comparison` | Main concern · Texture · Existing serum | Atmosphere for dryness/barrier, Seabiotic for combo/oil-balance, both for combo with seasonal swap |
| Oil/butter/lotion/balm finder | `body-format` | Need · Texture · Scent | Body Oil, Body Butter, Body Lotion, Anti-Aging Body Balm, Hyaluronic Body Serum, or Bio-Retinol Body Serum |

All flows use **real product data**: real names, real prices, real CDN images. All product images load directly from `cdn.shopify.com`.

## How the entry points map to research signals

Pulled 500 first user messages from Osea SA chat tickets (V2 architecture, account 62235, last 90 days). 287 of 500 (~57%) were broad-discovery intents — exactly the kind of question a 2-3 question flow could resolve. Top patterns:

1. **Skin type / concern / age — 78 tickets (15.6%)** — biggest signal
   *Real shopper quotes from the sample:*
   - *"What body care for severely dry, crepey, and damaged skin barrier"*
   - *"what is the best face serum for a 71 yr old woman?"*
   - *"My husband deals with hyper pigmentation along with wrinkles and breakouts"*
   - *"sensitive skin care routine"*

   → Powers entry point **#1 Find my skincare routine** and **#2 Atmosphere fit-check**.

2. **"I'm looking for / I need" — 60 tickets (12%)**
   - *"First time wanting to try hydrating"*
   - *"What product helps most for facial wrinkles"*
   - *"Hi, I need a day time lip balm"*

   → Reinforces #1, also pulls in body-care routing.

3. **Body-specific discovery — 32 tickets (6.4%) + Undaria family mentions (46) + body lotion/butter/cream (28)**
   - *"How well does it work on creepy texture skin arms and legs"*
   - *"Aging body" / "Anything for the shower?"*
   - *"What is a good neck product"*

   → Powers entry point **#4 Oil/butter/lotion/balm finder**.

4. **"Best / which / compare" — 23 tickets (4.6%)** — recurring friction point
   - *"What is the difference between atmosphere protection cream and sea biotic water cream"*
   - *"Compare eye treatments"*
   - *"What is the difference between a cream and a serum"*

   → Powers entry point **#3 Atmosphere vs Seabiotic comparison**.

5. **Routine / how to layer — 9 tickets (1.8%)** — small count, high intent (every one is a multi-product cross-sell)
   - *"do you use the body lotion first and then the oil"*
   - *"How to layer Hyaluronic Sea Serum?"*

   → Reinforces all 4 flows, especially #1.

The catalog supports each flow without any product fabrication — face care has 13 moisturizers + 6 serums + 2 eye products; body care has 25 body moisturizers across all 4 formats (oil/butter/lotion/balm) + 9 body oils.

## Account context

| Field | Value |
|---|---|
| Gorgias subdomain | `oseamalibu` |
| Gorgias account | 62235 |
| Domain | oseamalibu.com |
| Vertical | Skincare / Beauty |
| AI Agent architecture | V2 (no V3 PromptLayer traces yet) |
| SA chat ticket volume (90d) | 4,358 |
| Sample analyzed | 500 first-user messages, Apr 15 → May 3, 2026 |

*Cortex `dim_accounts` resolution failed during the run (table not found at the expected path). Account ID 62235 + subdomain confirmed via `dim_tickets` query in the parallel research subagent.*

## Why this merchant is a strong fit

- **High intent density** — 57% of first messages were broad discovery, vs ~11% narrow lookups (orders/shipping/discount/returns). A homepage trigger has real questions to catch.
- **Friction pair already visible in the data** — "Atmosphere vs Seabiotic" specifically shows up in tickets, plus broader "cream vs serum" confusion. Entry point #3 is built directly from that.
- **Body care under-served** — body-specific questions (~120 mentions across body parts, formats, and the Undaria family) outweigh face-specific questions in raw count. PDPs and the body collection are the highest-leverage placement real estate.
- **Age-anchored shoppers** — repeat pattern of shoppers volunteering their age ("71", "66", "I'm 80") to seed a recommendation. The skin-type flow handles this natively.

## How to view

The prototype is fully static — no build step.

```bash
# Option A: open directly in the browser
open "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/osea/index.html"

# Option B: run a local server (avoids any file:// quirks)
cd "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/osea"
python3 -m http.server 8080
# then open http://localhost:8080
```

All product images come from `cdn.shopify.com` and load fine over `file://` and `localhost`. No backend, no build, no API keys.

## Public deployment

Deployed via Vercel from the `prototypes` repo:
- Live at `https://prototypes-sooty.vercel.app/shopping-triggers/osea/`
- Linked from the prototype index at `https://prototypes-sooty.vercel.app/`

## File map

```
osea/
├── index.html                              # Homepage with entry point #1
├── pdp-atmosphere-protection-cream.html    # Atmosphere PDP with entry points #2 and #3
├── collection-body-moisturizers.html       # Body Moisturizers with entry point #4
├── README.md                               # This file
└── assets/
    ├── chat.css                            # All storefront + chat panel styles
    ├── chat.js                             # Chat panel + 4 flow scripts
    └── data.js                             # Real Osea catalog snapshot (window.OSEA_DATA)
```

## Open questions for the merchant interview

- The "Atmosphere vs Seabiotic" question shows up in tickets repeatedly, but does Osea see it as a feature (educates shoppers about the line) or a friction point worth removing at the point of decision?
- Where do most "what's right for my [skin type / age / concern]" shoppers actually land today — homepage, collection, or PDP? This shapes whether entry point #1 should be a homepage hero or repeated everywhere.
- For body care: would Osea support an in-chat *format* recommendation (eg. "you need the butter, not the oil") that bypasses brand/marketing positioning, or must body recs default to the bestseller (Undaria Algae Body Oil) regardless of fit?
- Bio-Retinol family is the obvious cross-sell from anti-aging routes — does Osea want a dedicated Bio-Retinol entry point on those PDPs, or is it better to fold it into the routine builder?

## Out of scope (intentional)

- Real cart, real checkout, real auth
- Real chat backend / LLM — flows are scripted
- Live A/B test instrumentation
- Mobile pixel-perfect parity
- Animation polish beyond a basic slide-in
