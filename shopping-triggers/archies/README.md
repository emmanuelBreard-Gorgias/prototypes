# Archies Footwear — Shopping Triggers prototype

Static HTML prototype for the Archies Footwear customer interview, modelled on the Koh / OSEA / 1st Phorm / Adrianna Papell prototypes. Storefront-side companion to the helpdesk-side Shopping Triggers (Discovery Triggers / Quiz-to-Skill) initiative.

## What this shows

A recognizable Archies storefront with **5 Shopping Triggers entry points**, each opening a branded chat panel that runs a 2-3 question discovery flow and ends with sizing/product recommendations from the live Archies catalog.

The four flows are designed around the sizing pain Javid (Archies) raised on the 2026-04-30 call:

- Flip flops run snug → most shoppers should size up by one
- Slides run wide → narrow-footed shoppers should size down by one
- AU/UK/EU shoppers regularly ask to convert sizing because Archies follows global (not AU) standards
- 85-90% of Archies traffic is mobile, so triggers are embedded inline rather than as a floating popup

## Pages and entry points

| File | Page | Entry points on this page |
|---|---|---|
| `index.html` | Homepage | **#1** Hero pill: *"Find my perfect pair in 3 questions"* (also repeated as a button in the dark mid-page band) |
| `pdp-flip-flop.html` | Crystal Black flip flops PDP | **#2** Compare helper above ATC: *"Find my size in 3 questions"* · **#3** Below ATC: *"AU, UK or EU shopper? Convert my size"* |
| `pdp-slide.html` | Black slides PDP | **#4** Compare helper above ATC: *"Find my size in 3 questions"* · **#5** Below ATC: *"Will these fit my narrow / wide feet?"* |

Each entry point uses a different scripted flow defined in `assets/chat.js`. The `data-product-type` attribute on the trigger tells the size-finder/intl-size flows whether to apply the snug-up rule (flip flop) or wide-down rule (slide).

## Flows

| Trigger | Flow key | Questions | Output |
|---|---|---|---|
| Find my perfect pair | `pair-finder` | Flip flops or slides · Men's/Women's · Where will you wear them | 2-3 product cards with the right sizing caveat |
| Find my size | `size-finder` | Men's/Women's · Usual size in another brand · Foot width | A specific US Men's/Women's variant + reasoning, with the snug-up (flip flop) or wide-down (slide) rule applied |
| Convert my international size | `intl-size` | AU/UK/EU · Men's/Women's · Your usual size | A US variant, plus sizing rule for the product type |
| Will these fit narrow feet? | `slide-fit` | Foot width · Owned slides before · Use case | Honest fit call. For narrow feet, a size-down + sock combo, or a pivot to flip flops |

All flows use **real product data**: real names, real prices, real CDN images. All product images load directly from `cdn.shopify.com`.

## How the entry points map to research signals

1. **"Find my perfect pair"** → broad-discovery entry point matching the proven pattern across Adrianna Papell, OSEA, Koh. Top-of-funnel for first-time visitors. No direct guidance match, but pairs cleanly with the merchant's existing sizing knowledge.

2. **"Find my size" (flip flops)** → directly maps to the existing US-shop guidance ***WHEN A CUSTOMER ASKS WHAT SIZE TO CHOOSE*** (gendered Women's US 5–16 / Men's rules) and Javid's #1 stated priority on the call ("we want them to check out with the right size"). Catalog supports it: every flip flop carries the same paired Men's/Women's variant chart.

3. **"Convert my international size"** → maps directly to the existing US-shop guidance ***When shopper asks to convert AU sizing to US sizing***, plus Javid's call ("Why don't you offer AU sizing?"). High-confidence ship-day-one candidate.

4. **"Find my size" (slides)** → same guidance match as flip flop, but with the wide-fit rule. Slides have wider strap construction, narrow feet are a known issue.

5. **"Will these fit narrow / wide feet?"** → maps to the existing slides guidance ***Fit Check for Slides*** ("I'd love the opportunity to check the fit on your feet so we can work out the best way to solve this issue"). Pre-purchase version of a flow Archies already runs post-purchase.

## Account context

| Field | Value |
|---|---|
| Gorgias subdomain | `archiesfootwear` |
| Gorgias account | 35384 |
| Domain | archies-arch-support-thongs.myshopify.com (US) |
| Vertical | Footwear / Apparel & Accessories |
| Status | Customer · Enterprise GMV ($30-150M) |
| ARR | $48,999 |
| AI Agent (chat + email) | Enabled |
| **Shopping Assistant** | **Enabled on US shop only** (other regions: AI Agent for support only) |
| AI FAQs | Disabled (matches Michelle's pitch to enable embedded inline) |
| Ask Anything Input | Disabled |
| Trigger on Search | Disabled |
| Sales persuasion | Educational |
| Discount strategy | None |
| Existing guidances on US shop | 34 active |
| Total guidances across all 8 region shops | 226 active |

## Why this merchant is a strong fit

- **Sizing is THE pain point** — Javid said it directly on the 2026-04-30 call. Static size tip already drove ~20% return reduction. They want to push further.
- **Existing guidance library covers the discovery flows out of the box** — *WHAT SIZE TO CHOOSE*, *Convert AU to US sizing*, *Fit Check for Slides*, *AU language* (thongs vs flip flops). The size flows don't require new merchant config.
- **Two product lines with opposite sizing rules** is exactly the kind of "two-bucket decision" a 2-3 question flow shines on. Static tips collapse this; a conversational flow can disambiguate.
- **85-90% mobile traffic** means embedded triggers (vs floating popup) is the right form factor — Javid was enthusiastic about Michelle's embedded FAQ pitch.
- **Multiple regional storefronts** (US, AU, NZ, UK, EU, CA, Asia) means the AU/UK/EU sizing converter is a real cross-store wedge.

## How to view

The prototype is fully static — no build step.

```bash
# Open directly in a browser
open "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/archies/index.html"

# Or run a local server
cd "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/archies"
python3 -m http.server 8080
# then open http://localhost:8080
```

All product images come from `cdn.shopify.com` and load fine over `file://` and `localhost`. No backend, no build, no API keys.

## Live URL

After commit + push to `emmanuelBreard-Gorgias/prototypes`:
- https://prototypes-sooty.vercel.app/shopping-triggers/archies/index.html

## File map

```
archies/
├── index.html                       # Homepage with entry point #1
├── pdp-flip-flop.html               # Crystal Black flip flops PDP with #2 and #3
├── pdp-slide.html                   # Black slides PDP with #4 and #5
├── README.md                        # This file
└── assets/
    ├── chat.css                     # Storefront + chat panel styles (forked from Koh, palette swapped)
    ├── chat.js                      # Chat panel + 4 flow scripts
    └── data.js                      # Real Archies catalog snapshot (window.AR_DATA)
```

## Open questions for the merchant interview

- **Placement preference** — embedded inline below the size selector, or above ATC as the prototype shows? Javid's mobile-first concern probably tilts to "inside the size area," but worth getting his read.
- **AU/UK/EU sizing converter** — which region matters most to ship first? AU for the home market, EU for the next growth bet, or US-as-destination for international visitors?
- **Sock cross-sell** — for narrow-foot shoppers, the prototype recommends slides + sock or a pivot to flip flops with toe post. Is that the right rescue play, or would Archies prefer a "size down + try" message without a substitute SKU?
- **Discount strategy** — Archies currently has `discount strategy = none`. Would they want SA to offer a one-time email-capture discount at the end of the size flow (matching Sol/OSEA/Cosmedix) or stay no-discount (matching 1st Phorm)?
- **Confidence threshold** — should the flow give a definitive size ("Go with M 9 / W 10") or a range ("between M 8 and M 9, lean to M 9")? The prototype gives definitive picks; merchant tolerance for that confidence call shapes how shoppers experience it.

## Out of scope (intentional)

- Real cart, real checkout, real auth
- Real chat backend / LLM — flows are scripted
- Region-aware pricing
- Pixel-perfect mobile parity (the styles are responsive but not exhaustively tuned)
- Photo upload for slides fit check (the existing guidance asks for photos; the prototype keeps the flow text-only for simplicity)
