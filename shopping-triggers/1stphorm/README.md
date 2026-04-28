# 1st Phorm — Shopping Triggers prototype

Static HTML prototype for the 1st Phorm customer interview. Storefront-side companion to the helpdesk-side work on `proto/shopping-triggers-settings`.

## What this shows

A recognizable 1st Phorm storefront with **4 Shopping Triggers entry points**, each opening a branded chat panel that runs a 2-3 question discovery flow and ends in real product recommendations pulled from the live 1st Phorm catalog (250 products fetched into `assets/data.js`).

## Pages and entry points

| File | Page | Entry points on this page |
|---|---|---|
| `index.html` | Homepage | **#1** Hero pill: *"Build my stack — what should I take?"* (also repeated as a button in the mid-page red callout band) |
| `pdp-phormula1.html` | Level-1 protein PDP | **#2** Stacking helper under Add to Cart: *"Can I take this with what I'm already on?"* · **#3** Flavor helper above the flavor grid: *"Not sure which flavor? Find your match"* |
| `collection-mens-apparel.html` | Apparel collection | **#4** Banner above the grid: *"Find my fit"* |

Each entry point uses a different scripted flow defined in `assets/chat.js`.

## Flows

| Trigger | Flow key | Questions | Recommends |
|---|---|---|---|
| Build my stack | `build-stack` | Goal · Experience level · Diet | 3 supplements tailored to goal (e.g., Build muscle → Level-1 + Micro Factor + Creatine) |
| Stacking | `stacking` | Current stack (multi-select) · Timing · Flags | Compatibility note + 1-3 product cards, surfaces gaps in user's stack |
| Flavor match | `flavor-match` | Profile · Mix method · Avoid | 2-3 Level-1 flavors with the matching flavor image swapped in |
| Find my fit | `find-fit` | Category · Size · Use case | 2-3 apparel items from the collection with size guidance |

All flows use **real product data**: real names, real prices, real CDN images. The Level-1 flavor images (Maple Butter Waffle, Birthday Cake, Caramel Latte etc.) all load directly from Shopify CDN.

## Catalog substitution note

The brief asked for **Phormula-1** as the hero PDP (a 10-flavor post-workout protein). That product was not in the fetched catalog of 250 products. **Level-1** is used instead — same shape (16 flavors, multi-flavor protein, top seller), and the stacking conversation is updated to reference Level-1 throughout. Same archetype, real images, real flavor list. Worth flagging this to 1st Phorm at the top of the interview so they understand why the PDP is Level-1 and not Phormula-1.

## How to view

The prototype is fully static — no build step.

```
# Option A: open directly in the browser
open "/Users/emmanuel/Documents/GorgiasClaude/Product Initiatives/🪝 Shopping Triggers Initiative/1stphorm-prototype/index.html"

# Option B: run a local server (avoids any file:// quirks)
cd "/Users/emmanuel/Documents/GorgiasClaude/Product Initiatives/🪝 Shopping Triggers Initiative/1stphorm-prototype"
python3 -m http.server 8080
# then open http://localhost:8080
```

All product images come from `cdn.shopify.com` and load fine over `file://` and `localhost`. No backend, no build, no API keys.

## To deploy publicly

The prototypes repo at `/tmp/prototypes` is the standard place. Suggested layout:

```bash
mkdir -p /tmp/prototypes/1stphorm
cp -r "/Users/emmanuel/Documents/GorgiasClaude/Product Initiatives/🪝 Shopping Triggers Initiative/1stphorm-prototype/"* /tmp/prototypes/1stphorm/
cd /tmp/prototypes
git add 1stphorm
git commit -m "Add 1st Phorm storefront triggers prototype"
git push
# Live at: https://prototypes-sooty.vercel.app/1stphorm/index.html
```

Per the brief, this push step is **left as a manual step**.

## File map

```
1stphorm-prototype/
├── index.html                       # Homepage with entry point #1
├── pdp-phormula1.html               # Level-1 PDP with entry points #2 and #3
├── collection-mens-apparel.html     # Apparel collection with entry point #4
├── README.md                        # This file
└── assets/
    ├── chat.css                     # All storefront + chat panel styles
    ├── chat.js                      # Chat panel + 4 flow scripts
    └── data.js                      # Real 1st Phorm catalog data (window.PHORM_DATA)
```

## Out of scope (intentional)

- Real cart, real checkout, real auth
- Real chat backend / LLM — flows are scripted
- Search results, review carousel widgets, related-product carousels driven by real recs
- Mobile pixel-perfect parity (desktop-first; the layout still works on a phone but isn't tuned)
- Animation polish beyond a basic slide-in
