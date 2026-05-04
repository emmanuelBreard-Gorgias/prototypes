# Koh — Shopping Triggers prototype

Static HTML prototype for the Koh customer interview, modelled on the Osea / 1st Phorm / Adrianna Papell prototypes. Storefront-side companion to the helpdesk-side Shopping Triggers initiative.

## What this shows

A recognizable Koh storefront with **4 Shopping Triggers entry points**, each opening a branded chat panel that runs a 2-3 question discovery flow and ends in real product recommendations pulled from the live Koh catalog.

## Pages and entry points

| File | Page | Entry points on this page |
|---|---|---|
| `index.html` | Homepage | **#1** Hero pill: *"Help me build my Koh kit"* (also repeated as a button in the dark mid-page band) |
| `pdp-universal-cleaner.html` | Universal Cleaner 4L PDP | **#2** Surface check below ATC: *"Will this work on my surfaces?"* · **#3** Compare helper above ATC: *"Universal or room-specific? Help me decide"* |
| `collection-bathroom.html` | Bathroom collection | **#4** Pink banner above the grid: *"Find my bathroom routine"* |

Each entry point uses a different scripted flow defined in `assets/chat.js`.

## Flows

| Trigger | Flow key | Questions | Recommends |
|---|---|---|---|
| Help me build my kit | `build-kit` | Rooms (multi) · Household sensitivities · Liquid vs sheets / mess level | Whole Home Starter Kit OR room-specific kits, plus sensitivity caveats |
| Surface check | `surface-check` | Surface type · Material · Job type | Yes/no on Universal, plus the right cleaner + tool. Marble triggers a "skip Universal" warning. |
| Universal vs room-specific | `vs-comparison` | Where (room) · Tough vs daily · What you already own | Universal alone, Universal + room-specific, or just the room-specific kit |
| Find my bathroom routine | `bathroom-routine` | Top concern (soap scum / mould / loo / daily) · Surface type · Number of bathrooms | Bathroom kit + paired tool (squeegee, grout brush, loo blade) |

All flows use **real product data**: real names, real prices, real CDN images. All product images load directly from `cdn.shopify.com`.

## How the entry points map to research signals

1. **"Help me build my Koh kit"** → maps to the brand's heaviest-marketed funnel (Starter Kits — 82 products in that collection on the live site, prominent in the homepage nav). One real ticket: *"I'm looking at the big started kit, but I don't own a dishwasher and wouldn't need those tablets, do you do one without those"* — exactly the kind of question this flow answers.

2. **"Will this work on my surfaces?"** → 15+ real chat tickets in the last 90 days: *"Can you use the bathroom cleaner on marble?"*, *"Is it safe for polymarble"*, *"Can your floor mop... be used on floating floors?"*, *"Is the universal cleaner safe for cleaning floors with cats"*, *"safe to use in caravans showers"*, etc. Maps to existing guidance *"When a customer asks if a Koh product is compatible with a surface, coating, appliance, material, or third-party brand"*.

3. **"Universal or room-specific?"** → 7+ real tickets: *"Hi is the universal cleaner as effective on bathrooms and kitchens as the dedicated bathroom spray and kitchen spray?"*, *"Quick tldr of when to use universal vs bathroom cleaner"*, *"What's the difference between the bathroom cleaner and universal cleaner"*, *"Why do you have kitchen and bathroom products, does the universal cleaner not work on them all now?"* Maps to existing bathroom and kitchen routing guidances.

4. **"Find my bathroom routine"** → catalog-driven (Bathroom collection has 69 products, the room is one of 3 main nav categories). Maps to existing guidance *"When a customer asks how to clean a bathroom surface or which Koh product to use in the bathroom"* + *"how to clean grout, tiles, or remove mould"*. Real ticket support: *"Does the new shower cleaner remove mould?"*, *"Can you use it on bathroom tiles"*, *"do i have to rinse the bathroom cleanser from the surfaces?"*.

## Account context

| Field | Value |
|---|---|
| Gorgias subdomain | `koh` |
| Gorgias account | 76307 |
| Domain | koh.com |
| Vertical | Home & Garden |
| Plan | Pro |
| ARR | $19,800 |
| AI Agent Chat | Enabled (since 2025-01-23) |
| AI Agent Email | Enabled (since 2025-01-23) |
| Main shop | `ekoworxstore` (also operates `ekoworx-dev-store-uk`) |
| **Trigger on Search** | **Already enabled** on the main store |
| Ask Anything Input | Disabled |
| Sales persuasion | Educational |
| Existing guidances | **93** on main store (79 active) |
| Support actions | 42 |
| Snippets | 678 |
| Help center articles | 419 |

## Why this merchant is a strong fit

- **Sophisticated SA setup** — 93 guidances, 42 support actions, custom tone of voice. They've already invested in teaching the AI about their products.
- **Existing discovery-style guidances** — bathroom routing, kitchen routing, floor routing, stain removal, grout/mould, surface compatibility, "which product to use, why a product works". Each of these is a candidate entry point waiting for a surface.
- **Search trigger already on** — the lighter-weight entry point is live on the main store, so they're already in the trigger ecosystem.
- **Real shopper-discovery patterns in the data** — out of ~400 sampled first messages from chat tickets, broad-discovery questions ("can I use X on Y", "what's the difference between universal and bathroom") show up 20+ times. Plus the brand's positioning (Allergy Friendly, Eco-Certified, dermatologist approved) generates compatibility/safety questions that 2-3 questions can resolve cleanly.
- **Catalog supports broad questions** — Universal Cleaner is the hero product (8 variants, 91 in the broader collection), but the room-specific cleaners (Bathroom 69 products, Kitchen 75, Loo 11, Laundry 50) create exactly the "which one do I need?" decision a discovery flow shines on.

## How to view

The prototype is fully static — no build step.

```bash
# Option A: open directly in the browser
open "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/koh/index.html"

# Option B: run a local server (avoids any file:// quirks)
cd "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/koh"
python3 -m http.server 8080
# then open http://localhost:8080
```

All product images come from `cdn.shopify.com` and load fine over `file://` and `localhost`. No backend, no build, no API keys.

## To deploy publicly

The prototypes repo at `/tmp/prototypes` is the standard place. Suggested layout:

```bash
mkdir -p /tmp/prototypes/koh
cp -r "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/koh/"* /tmp/prototypes/koh/
cd /tmp/prototypes
git add koh
git commit -m "Add Koh storefront triggers prototype"
git push
# Live at: https://emmanuelbreard-gorgias.github.io/prototypes/koh/index.html
```

Per the workflow used for other prototypes, the push step is **left as a manual step**.

## File map

```
koh/
├── index.html                       # Homepage with entry point #1
├── pdp-universal-cleaner.html       # Universal Cleaner PDP with entry points #2 and #3
├── collection-bathroom.html         # Bathroom collection with entry point #4
├── README.md                        # This file
└── assets/
    ├── chat.css                     # All storefront + chat panel styles
    ├── chat.js                      # Chat panel + 4 flow scripts
    └── data.js                      # Real Koh catalog snapshot (window.KOH_DATA)
```

## Open questions for the merchant interview

- Where do most "which product for my surface?" shoppers actually land today — homepage, collection, or PDP? The current SA search trigger handles some of this, but confirms whether a placement above the fold would lift conversion.
- Is the "Universal vs room-specific" confusion something Koh sees as a feature (educates shoppers) or a friction point worth removing at the point of decision?
- For the Whole Home Starter Kit specifically — what's the typical objection that stops a shopper from buying it? The "I don't own a dishwasher and wouldn't need those tabs" ticket suggests the kit composition is the friction, which a discovery flow could solve by recommending custom kits.
- Would Koh be comfortable with the AI giving definitive "skip Universal on marble" answers (pH-based caveats), or do they want all surface questions to soft-route to the room-specific cleaners? This shapes how confident the recommend step can be.

## Out of scope (intentional)

- Real cart, real checkout, real auth
- Real chat backend / LLM — flows are scripted
- Multi-region pricing (AU vs NZ vs UK)
- Mobile pixel-perfect parity
- Animation polish beyond a basic slide-in
