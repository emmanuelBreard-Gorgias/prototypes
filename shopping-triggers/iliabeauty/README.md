# ILIA Beauty — Shopping Triggers prototype

Static HTML prototype for the ILIA Beauty customer interview with Marissa Bell (Senior Manager, CX), 2026-05-21. Storefront-side companion to the Quiz-to-Skill / Discovery Triggers initiative.

## What this shows

A recognizable ILIA storefront with **5 Shopping Triggers entry points** across 3 pages, each opening a branded chat panel that runs a 2-3 question discovery flow and ends with recommendations from the live ILIA catalog.

The four flows are designed around the asks Marissa has raised across 15 Gong calls (Jan-May 2026):

- **Shade matching is unsolved** — the SA they ran April 12 → May 15 did not handle it well, and they killed the channel on May 15 right before the Friends & Family sale
- **Cross-brand shade conversion** — "I'm shade X in NARS / Charlotte Tilbury — what's my ILIA?" was the explicit ask
- **The complexion choice is confusing** — Skin Tint vs Foundation vs Concealer vs Skin Rewind Stick is a real merchandising problem; SA was over-pushing products rather than picking ONE
- **Skin tone × undertone matrix** is the right framing — Marissa has explicitly said she doesn't want selfie-based or generic recommendations; the math is "depth + undertone → 2 shades."

## Pages and entry points

| File | Page | Entry points on this page |
|---|---|---|
| `index.html` | Homepage | **#1** Hero pill: *"Find my shade in 3 questions"* · **#2** Mid-page band: *"Build my routine"* |
| `pdp-skin-blur-serum-concealer.html` | 34-shade concealer PDP | **#3** Above the shade grid: *"Already wear NARS, CT, Tower 28? Convert your shade"* · **#4** Below ATC: *"Skin Tint, Foundation, or Concealer? I'll point to one"* |
| `collection-complexion.html` | Complexion collection | **#5** Banner above grid: *"Find your shade match in 3 questions"* (re-uses the find-shade flow) |

Each entry point uses a scripted flow defined in `assets/chat.js`.

## Flows

| Trigger | Flow key | Questions | Recommends |
|---|---|---|---|
| Find my shade | `find-shade` | Product category · Skin depth (8 levels) · Undertone (warm/cool/neutral/unsure) | 2-3 specific shade picks per product, with an undertone reasoning note |
| Cross-brand shade conversion | `cross-brand-shade` | Source brand (NARS, CT, Tower 28, Saie, Westman, Rare, Other) · Product type · Depth | The specific ILIA shade equivalent for the input combo, with a fallback if the brand isn't mapped yet |
| Complexion router | `complexion-router` | Look (5 options) · Wear time · Skin behavior | Routes to ONE product (Skin Tint, Foundation, Concealer, or Stick) instead of dumping multiple |
| Build my routine | `routine-builder` | Look · Replace/add/fresh · Priority | A 3-product starter routine or set, biased to the Hero Set for new shoppers |

All flows use **real product data**: real shade names (Twill 1N, Mindoro SF.25, Skye ST.5...), real prices, real images from the live `cdn.shopify.com` storefront.

## How the entry points map to research signals

1. **"Find my shade in 3 questions"** (hero) → matches the verbatim ask Marissa surfaced in #rd-product-internal on 2026-05-13: *"Interested in an alpha for shopping-assistant and quiz entry points because shade matching is too nuanced for generic AI recommendations and needs guidance-driven behavior."*

2. **"Build my routine"** (homepage band) → broader discovery for first-time visitors. Pairs with the existing Hero Set bundle ($171, the 4 bestsellers). Matches the pattern in Osea (find-routine) and 1st Phorm (build-stack).

3. **"Convert your shade from NARS / Charlotte Tilbury / Tower 28"** (PDP, above shade grid) → directly maps to the cross-product shade conversion Marissa called out across April-May Gong calls: *"I'm shade X in concealer A → what's the equivalent in skin tint B?"* She's explicitly said she does NOT want selfie-based matching. This flow uses a verified mapping table for NARS and CT and a depth-based fallback for the others.

4. **"Skin Tint, Foundation, or Concealer?"** (PDP, below ATC) → answers the actual SA failure mode Marissa flagged on April 9: *"AI was trying to sell products/bundles or asking repetitive questions unnecessarily, even when information was available."* This flow routes to ONE product per shopper. Same pattern that worked on Osea's "Atmosphere or Seabiotic?" trigger.

5. **"Find your shade match"** (collection banner) → same `find-shade` flow, surfaced at the right funnel stage for shoppers who landed on the complexion category but haven't picked a product yet.

## Account context

| Field | Value |
|---|---|
| Gorgias subdomain | `iliabeauty` |
| Gorgias account ID | 30176 |
| Domain | iliabeauty.com (Shopify Plus) |
| Vertical | Beauty & Cosmetics / Clean Makeup |
| Status | Customer · Enterprise GMV ($30-150M) · Top 100 |
| Yearly GMV | $40.4M · 572k orders |
| ARR | $86,451 · yearly billing · renewal 2026-10-30 |
| Health score | 8.67 (healthy) · Churn risk 38 |
| Customer since | 2021-03-31 (5+ years) |
| AI Agent | **Disabled 2026-05-15** (after re-enabling April 6 → 5 weeks before disabling) |
| **Shopping Assistant** | **Disabled 2026-05-15** (after enabling April 12 → 33 days of activity: 249 conversations, 2.23% conv rate, $502 GMV influenced, ROI 1.48 on 30d window) |
| AI guidances | 86 total, 18 published, 65% handover rate |
| Customer Success Manager | Kristyn Murphy |
| Implementation Manager | Alyssa O'Hara |
| Account Executive | Suzanna Dumas |
| Primary contact | Marissa Bell — Senior Manager, CX (maternity leave starts ~Sep 25, 2026) |

## Why this merchant is a strong fit

- **Shade matching is THE pain point** — Marissa has raised it on every monthly sync since the January 7 demo. They have a 34-shade concealer, 30-shade foundation, 30-shade skin tint, and 42-shade stick. The shade combinatorics ARE the buying decision.
- **They just killed SA on 2026-05-15** — the generic-recommendation SA didn't deliver. A focused, skill-driven quiz is exactly the architectural fix Corentin Huillard described in #rd-ai-agent-orchestration on 2026-05-18: *"merchant-specific rules out of Qualify and into Skills/guidance."*
- **Existing competitor (Findation)** — Marissa references a "Findation"-style tool they're building internally. The cross-brand shade conversion flow is a direct alternative.
- **Verbatim alpha-interest signal** — captured in Maxime's weekly customer-demand digest, 2026-05-13.
- **Enterprise tier with strong retention** — $86k ARR, 5+ year customer, renewing Oct 30. Not a churn-save play, this is a reignite-the-channel play. Reframe before the meeting: Marissa is operationally fatigued (Help Desk 2.0 launch landed badly on May 8, ~20 weeks pregnant, mat leave Sep 25), not on the way out.

## How to view

The prototype is fully static — no build step.

```bash
# Open directly in a browser
open "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/iliabeauty/index.html"

# Or run a local server
cd "/Users/emmanuel/Documents/GorgiasClaude/code_base/prototypes/shopping-triggers/iliabeauty"
python3 -m http.server 8080
# then open http://localhost:8080
```

All product images come from `cdn.shopify.com` and load fine over `file://` and `localhost`. No backend, no build, no API keys.

## Live URL

After commit + push to `emmanuelBreard-Gorgias/prototypes`:
- https://prototypes-sooty.vercel.app/shopping-triggers/iliabeauty/index.html

## File map

```
iliabeauty/
├── index.html                            # Homepage with entry points #1 and #2
├── pdp-skin-blur-serum-concealer.html    # 34-shade concealer PDP with #3 and #4
├── collection-complexion.html            # Complexion collection with #5
├── README.md                             # This file
└── assets/
    ├── chat.css                          # Storefront + chat panel styles (forked from Osea, Ilia palette)
    ├── chat.js                           # Chat panel + 4 flow scripts (find-shade, cross-brand-shade, complexion-router, routine-builder)
    └── data.js                           # Real ILIA catalog snapshot (window.ILIA_DATA)
```

## Open questions for the merchant interview

- **Placement preference** — embedded inline below the shade grid like the prototype shows, or a floating pill above ATC? Most ILIA shoppers land on PDPs directly from paid search and ads.
- **Cross-brand mapping coverage** — the prototype maps NARS and Charlotte Tilbury with named shade equivalents, falls back to depth-only for the rest. Which competitor brands matter most to ship verified mappings for in v1 (Tower 28, Saie, Westman Atelier, Rare Beauty)?
- **Relationship to Findation** — they have an internal shade-matching tool in development. Does the quiz replace it, complement it, or pull from its database?
- **Selfie / photo path** — Marissa has explicitly said NO to selfie-based matching ("hand it over to a human"). Should the chat surface a "send a photo to our shade experts" handover at the end if the shopper is still unsure, or stay text-only?
- **"Skin Tint, Foundation, or Concealer?" routing** — does Marissa want this conversation on every complexion PDP, or only on the concealer (where the ambiguity is highest)?
- **Discount strategy** — should the routine-builder offer a discount code at the end (matching Osea, 1st Phorm)? ILIA currently has `discount strategy = none` on their SA config.
- **Confidence threshold** — should `find-shade` give 2-3 shade picks (current) or a single "go with this" answer? The closer to a single answer, the higher the return-risk if wrong.
- **What killed SA on May 15?** — was it tied to the Friends & Family sale prep, the helpdesk 2.0 rollout, the generic recommendation problem, or all three? Understanding the proximate cause shapes how we frame the re-enablement story.

## Out of scope (intentional)

- Real cart, real checkout, real auth
- Real chat backend / LLM — flows are scripted
- Pixel-perfect mobile parity (responsive but not exhaustively tuned)
- The full 34-shade picker swatches use approximated hex colors, not the verified Ilia swatch images
- The cross-brand shade map covers NARS + CT only with named-shade verification; other brands use a depth-only fallback. A production version would need verified mapping data per brand.
