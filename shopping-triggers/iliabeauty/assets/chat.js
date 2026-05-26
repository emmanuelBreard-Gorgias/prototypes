// ILIA Beauty Shopping Triggers — fake chat panel.
// Script-driven discovery flows. No backend. No LLM.

(function () {
  const data = window.ILIA_DATA || { products: {} };
  const P = data.products;

  function productCard(product, opts) {
    opts = opts || {};
    if (!product) return null;
    return {
      title: opts.titleOverride || product.title,
      tag: opts.tag || product.product_type,
      meta: opts.meta || (product.price ? `$${product.price} · ${product.blurb || ''}` : ''),
      image: opts.image || product.image,
      price: product.price,
      handle: product.handle,
    };
  }

  // === The 4 scripted flows ===

  const flows = {
    // FLOW 1 — Find my shade (Homepage hero pill + collection banner)
    // The headline "Find My Shade" ask Marissa has been raising since the January demo.
    'find-shade': {
      greeting: "Hi, I'm your ILIA shade guide. I'll match you in 3 quick questions. What are you looking to match?",
      steps: [
        {
          type: 'single',
          options: ['Skin tint / tinted moisturizer', 'Liquid foundation', 'Concealer', 'Foundation stick', 'Not sure — just want my shade'],
          key: 'category',
        },
        {
          type: 'single',
          prompt: () => "How would you describe your skin tone?",
          options: ['Very fair', 'Fair', 'Light', 'Light-medium', 'Medium', 'Tan', 'Deep', 'Rich'],
          key: 'depth',
        },
        {
          type: 'single',
          prompt: () => "What's your undertone? (Look at your wrist — green-ish veins = warm, blue-ish = cool, both = neutral)",
          options: ['Warm', 'Cool', 'Neutral', 'Not sure'],
          key: 'undertone',
        },
      ],
      recommend: answers => {
        const cat = answers.category;
        const depth = answers.depth;
        const undertone = answers.undertone;

        // Map depth + undertone → 2-3 shade picks per product
        const undertoneCode = undertone === 'Warm' ? 'W' : undertone === 'Cool' ? 'C' : 'N';

        const skinTintShades = {
          'Very fair':       ['Skye ST.5', 'Rendezvous ST1'],
          'Fair':            ['Rendezvous ST1', 'Tulum ST2'],
          'Light':           ['Tulum ST2', 'Sombrio ST2.5'],
          'Light-medium':    ['Sombrio ST2.5', 'Balos ST3'],
          'Medium':          ['Balos ST3', 'Formosa ST4'],
          'Tan':             ['Formosa ST4', 'Mallorca ST5'],
          'Deep':            ['Mallorca ST5', 'Hanalei ST6'],
          'Rich':            ['Hanalei ST6', 'Bantayan ST7'],
        };
        const foundationShades = {
          'Very fair':       ['Mindoro SF.25', 'Sable SF.5'],
          'Fair':            ['Sable SF.5', 'Formentera SF1'],
          'Light':           ['Formentera SF1', 'Mallorca SF1.5'],
          'Light-medium':    ['Mallorca SF1.5', 'Cozumel SF1.75'],
          'Medium':          ['Cozumel SF1.75', 'Tavarua SF2'],
          'Tan':             ['Tavarua SF2', 'Wategos SF2.5'],
          'Deep':            ['Wategos SF2.5', 'Bantayan SF3'],
          'Rich':            ['Bantayan SF3', 'Cocoa SF3.5'],
        };
        const concealerShades = {
          'Very fair':       ['Twill 1N', 'Gossamer 2C'],
          'Fair':            ['Gossamer 2C', 'Chambray 3W'],
          'Light':           ['Chambray 3W', 'Organza 4C'],
          'Light-medium':    ['Organza 4C', 'Satin 5N'],
          'Medium':          ['Satin 5N', 'Challis 6N'],
          'Tan':             ['Challis 6N', 'Damask 7W'],
          'Deep':            ['Damask 7W', 'Brocade 8N'],
          'Rich':            ['Brocade 8N', 'Velvet 9C'],
        };

        let intro = '';
        let recs = [];
        let summary = '';

        const undertoneNote = undertone === 'Warm'
          ? "Warm undertones lean toward W (warm) and N (neutral) shades."
          : undertone === 'Cool'
          ? "Cool undertones lean toward C (cool) and N (neutral) shades."
          : undertone === 'Neutral'
          ? "Neutral undertones can wear N (neutral) shades, plus the closest W or C if N runs out."
          : "When unsure on undertone, N (neutral) is the safest first pick, with W/C as backup.";

        // Single category → 2-3 shades of that product
        if (cat === 'Skin tint / tinted moisturizer') {
          const picks = skinTintShades[depth] || [];
          intro = `For Super Serum Skin Tint SPF 40 — based on ${depth.toLowerCase()} skin with ${undertone.toLowerCase()} undertone, these are your closest matches:`;
          recs = picks.map((shade, i) => productCard(P.skin_tint_spf40, {
            tag: `${i === 0 ? 'Closest match' : 'Try too'} · ${shade}`,
            meta: `$48 · sheer-to-light coverage, mineral SPF 40`,
          }));
          summary = `${undertoneNote} If both look close in natural daylight, the lighter one almost always blends better — it warms with the wrist test.`;
        } else if (cat === 'Liquid foundation') {
          const picks = foundationShades[depth] || [];
          intro = `For True Skin Serum Foundation — ${depth.toLowerCase()} skin with ${undertone.toLowerCase()} undertone matches to:`;
          recs = picks.map((shade, i) => productCard(P.true_skin_foundation, {
            tag: `${i === 0 ? 'Closest match' : 'Backup pick'} · ${shade}`,
            meta: `$56 · buildable medium coverage, skincare-infused`,
          }));
          summary = `${undertoneNote} Foundation reads slightly darker on application — start a half-shade lighter than you think.`;
        } else if (cat === 'Concealer') {
          const picks = concealerShades[depth] || [];
          intro = `For Skin Blur Serum Concealer — ${depth.toLowerCase()} skin with ${undertone.toLowerCase()} undertone:`;
          recs = picks.map((shade, i) => productCard(P.skin_blur_concealer, {
            tag: `${i === 0 ? 'Closest match' : 'Try too'} · ${shade}`,
            meta: `$32 · 34 total shades · sheer-buildable, hydrating`,
          }));
          summary = `${undertoneNote} For under-eye, go a half-shade lighter. For spot coverage, match exactly to your foundation/skin tint.`;
        } else if (cat === 'Foundation stick') {
          intro = `For Skin Rewind Complexion Stick — ${depth.toLowerCase()} skin with ${undertone.toLowerCase()} undertone. The stick line uses the same number system but with wood-grain names (Hinoki, Balsa, Spruce, Holly, Pine, Aspen...).`;
          recs = [productCard(P.skin_rewind_stick, {
            tag: `Match by depth · 42 shades`,
            meta: `$50 · 2-in-1 foundation + concealer, buildable`,
          })];
          summary = `${undertoneNote} The stick gets significantly creamier on warm skin — request a sample if you're between two depths.`;
        }
        // "Not sure — just want my shade" path: cross-product
        else {
          const stPick = (skinTintShades[depth] || ['Skye ST.5'])[0];
          const sfPick = (foundationShades[depth] || ['Sable SF.5'])[0];
          const concPick = (concealerShades[depth] || ['Twill 1N'])[0];
          intro = `Here are your closest matches across our 3 hero complexion products. ${undertoneNote}`;
          recs = [
            productCard(P.skin_tint_spf40, { tag: `Skin Tint · ${stPick}`, meta: `$48 · sheer-to-light, SPF 40` }),
            productCard(P.true_skin_foundation, { tag: `Foundation · ${sfPick}`, meta: `$56 · medium coverage` }),
            productCard(P.skin_blur_concealer, { tag: `Concealer · ${concPick}`, meta: `$32 · spot or under-eye` }),
          ];
          summary = "These match by depth + undertone. If you want a single product, start with the Skin Tint — it's the easiest entry point, hardest to mismatch.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 2 — Cross-brand shade conversion (PDP entry point #2)
    // The specific functionality Marissa called out: "I'm shade X in concealer A → what's the equivalent in B?"
    'cross-brand-shade': {
      greeting: "Tell me what you wear today and I'll convert it to ILIA. Which brand are you matching from?",
      steps: [
        {
          type: 'single',
          options: ['NARS', 'Charlotte Tilbury', 'Tower 28', 'Saie', 'Westman Atelier', 'Rare Beauty', 'Other brand'],
          key: 'brand',
        },
        {
          type: 'single',
          prompt: a => `In ${a.brand}, are you matching a concealer, foundation, or skin tint?`,
          options: ['Concealer', 'Liquid foundation', 'Tinted moisturizer / skin tint', 'Cream / stick foundation'],
          key: 'cat',
        },
        {
          type: 'single',
          prompt: a => `Which depth range is your ${a.cat.toLowerCase()} closest to?`,
          options: ['Very fair (lightest 1-2 shades)', 'Fair', 'Light', 'Light-medium', 'Medium', 'Tan', 'Deep', 'Rich (deepest 1-3 shades)'],
          key: 'depth',
        },
      ],
      recommend: answers => {
        const brand = answers.brand;
        const cat = answers.cat;
        const depth = answers.depth.split(' ')[0] === 'Very' ? 'Very fair'
                    : answers.depth.split(' ')[0] === 'Rich' ? 'Rich'
                    : answers.depth.split(' ')[0];

        // Brand-specific equivalent shades (the Findation-style table)
        const equivalents = {
          // NARS
          'NARS:Concealer:Very fair':    { ilia: 'Twill 1N',     note: 'NARS Radiant Creamy Light 1 / Vanilla' },
          'NARS:Concealer:Fair':         { ilia: 'Gossamer 2C',  note: 'NARS Radiant Creamy Light 2.5 / Custard' },
          'NARS:Concealer:Light':        { ilia: 'Chambray 3W',  note: 'NARS Radiant Creamy Vanilla / Custard' },
          'NARS:Concealer:Light-medium': { ilia: 'Organza 4C',   note: 'NARS Radiant Creamy Honey / Caramel' },
          'NARS:Concealer:Medium':       { ilia: 'Satin 5N',     note: 'NARS Radiant Creamy Café / Walnut' },
          'NARS:Concealer:Tan':          { ilia: 'Challis 6N',   note: 'NARS Radiant Creamy Cacao / Macadamia' },
          'NARS:Concealer:Deep':         { ilia: 'Damask 7W',    note: 'NARS Radiant Creamy Amande / Mocha' },
          'NARS:Concealer:Rich':         { ilia: 'Brocade 8N',   note: 'NARS Radiant Creamy Café Mocha / Ganache' },
          // Charlotte Tilbury
          'Charlotte Tilbury:Liquid foundation:Fair':         { ilia: 'Sable SF.5',      note: 'CT Airbrush Flawless Foundation 2 Neutral / 3 Cool' },
          'Charlotte Tilbury:Liquid foundation:Light':        { ilia: 'Formentera SF1',  note: 'CT Airbrush 4 Cool / 5 Neutral' },
          'Charlotte Tilbury:Liquid foundation:Light-medium': { ilia: 'Mallorca SF1.5',  note: 'CT Airbrush 6 Warm / 7 Neutral' },
          'Charlotte Tilbury:Liquid foundation:Medium':       { ilia: 'Tavarua SF2',     note: 'CT Airbrush 8 Warm / 9 Neutral' },
          'Charlotte Tilbury:Liquid foundation:Tan':          { ilia: 'Wategos SF2.5',   note: 'CT Airbrush 10 Neutral / 11 Warm' },
          'Charlotte Tilbury:Liquid foundation:Deep':         { ilia: 'Bantayan SF3',    note: 'CT Airbrush 12 Neutral / 13 Cool' },
          'Charlotte Tilbury:Liquid foundation:Rich':         { ilia: 'Cocoa SF3.5',     note: 'CT Airbrush 14 Cool / 15 Warm' },
        };

        const key = `${brand}:${cat}:${depth}`;
        let equiv = equivalents[key];
        // Fallback: if no exact mapping, use the depth-based default for the category
        const concealerDefaults = {
          'Very fair': 'Twill 1N', 'Fair': 'Gossamer 2C', 'Light': 'Chambray 3W',
          'Light-medium': 'Organza 4C', 'Medium': 'Satin 5N', 'Tan': 'Challis 6N',
          'Deep': 'Damask 7W', 'Rich': 'Brocade 8N',
        };
        const foundationDefaults = {
          'Very fair': 'Mindoro SF.25', 'Fair': 'Sable SF.5', 'Light': 'Formentera SF1',
          'Light-medium': 'Mallorca SF1.5', 'Medium': 'Tavarua SF2', 'Tan': 'Wategos SF2.5',
          'Deep': 'Bantayan SF3', 'Rich': 'Cocoa SF3.5',
        };
        const tintDefaults = {
          'Very fair': 'Skye ST.5', 'Fair': 'Rendezvous ST1', 'Light': 'Tulum ST2',
          'Light-medium': 'Sombrio ST2.5', 'Medium': 'Balos ST3', 'Tan': 'Formosa ST4',
          'Deep': 'Mallorca ST5', 'Rich': 'Hanalei ST6',
        };

        let primary, secondary, productKey;
        if (cat === 'Concealer') {
          productKey = 'skin_blur_concealer';
          primary = equiv?.ilia || concealerDefaults[depth];
          // secondary one notch deeper
          const order = Object.keys(concealerDefaults);
          const i = order.indexOf(depth);
          secondary = concealerDefaults[order[Math.min(i + 1, order.length - 1)]];
        } else if (cat === 'Liquid foundation') {
          productKey = 'true_skin_foundation';
          primary = equiv?.ilia || foundationDefaults[depth];
          const order = Object.keys(foundationDefaults);
          const i = order.indexOf(depth);
          secondary = foundationDefaults[order[Math.min(i + 1, order.length - 1)]];
        } else if (cat === 'Tinted moisturizer / skin tint') {
          productKey = 'skin_tint_spf40';
          primary = equiv?.ilia || tintDefaults[depth];
          const order = Object.keys(tintDefaults);
          const i = order.indexOf(depth);
          secondary = tintDefaults[order[Math.min(i + 1, order.length - 1)]];
        } else {
          // stick
          productKey = 'skin_rewind_stick';
          primary = depth === 'Very fair' ? 'Hinoki 1N' : depth === 'Fair' ? 'Balsa 2C' : depth === 'Light' ? 'Spruce 3W' : depth === 'Light-medium' ? 'Holly 4N' : depth === 'Medium' ? 'Pine 5C' : depth === 'Tan' ? 'Aspen 6N' : depth === 'Deep' ? 'Cedar 7W' : 'Ebony 8N';
          secondary = null;
        }

        const product = P[productKey];
        const recs = [
          productCard(product, {
            tag: `Match · ${primary}`,
            meta: equiv ? `Equivalent to ${equiv.note}` : `Best depth match for ${depth} skin in ${brand}`,
          })
        ];
        if (secondary) {
          recs.push(productCard(product, {
            tag: `Try too · ${secondary}`,
            meta: `If primary leans too light or too cool in daylight`,
          }));
        }

        const intro = equiv
          ? `Based on a verified shade map between ${brand} and ILIA, here's your match:`
          : `We don't have a verified shade map for ${brand}'s ${cat.toLowerCase()} yet, so this is a best-fit pick by depth. Tap "Get a sample" below to confirm.`;

        const summary = `Cross-brand matches are within ±1 shade ~92% of the time. If you can, request a sample — apply on your jawline in natural daylight, blend down to your neck. The shade that disappears is your shade.`;

        return { intro, recs: recs.filter(Boolean), summary };
      },
    },

    // FLOW 3 — Complexion router: Skin Tint vs Concealer vs Foundation (PDP entry #3)
    // Addresses Marissa's #1 SA frustration that the assistant pushed multiple products instead of guiding to ONE
    'complexion-router': {
      greeting: "Skin Tint, Foundation, Concealer, or Stick? I'll point you to the one product that fits your day. What look are you going for?",
      steps: [
        {
          type: 'single',
          options: ['Bare skin, just a glow', 'Even tone, looks like skin', 'Polished, covers redness', 'Full cover, photo-ready', 'Spot-only (under eye, blemishes)'],
          key: 'look',
        },
        {
          type: 'single',
          prompt: () => "How long do you want it to last?",
          options: ['4-6 hours (everyday)', '8-10 hours (long day)', 'All-day (event / wedding)'],
          key: 'wear',
        },
        {
          type: 'single',
          prompt: () => "Skin behavior — what does your skin do mid-day without makeup?",
          options: ['Gets dry / flaky', 'Stays balanced', 'Gets oily in T-zone', 'Gets oily all over'],
          key: 'skin',
        },
      ],
      recommend: answers => {
        const look = answers.look;
        const wear = answers.wear;
        const skin = answers.skin;

        let intro = '', recs = [], summary = '';

        // Spot-only path → concealer (no router needed)
        if (look === 'Spot-only (under eye, blemishes)') {
          intro = "You don't need foundation — concealer alone is the move.";
          recs = [
            productCard(P.skin_blur_concealer, { tag: 'The pick', meta: '$32 · 34 shades · spot or under-eye' }),
          ];
          if (skin === 'Gets oily in T-zone' || skin === 'Gets oily all over') {
            recs.push(productCard(P.true_skin_foundation, { tag: 'Optional — for high-cover days', meta: '$56 · only if spot-cover isn\'t enough' }));
          }
          summary = "Skin Blur Concealer is sheer-buildable: 1 layer for tone-evening, 2 for full coverage. Use a damp sponge for a skin-like finish.";
        }
        // Bare skin glow → Skin Tint
        else if (look === 'Bare skin, just a glow') {
          intro = "Super Serum Skin Tint is the answer — sheer, dewy, with mineral SPF 40. Most ILIA shoppers start here.";
          recs = [
            productCard(P.skin_tint_spf40, { tag: 'The pick', meta: '$48 · sheer, dewy, SPF 40 built in' }),
            productCard(P.skin_blur_concealer, { tag: 'For spots', meta: '$32 · use only where needed' }),
          ];
          summary = "Skin Tint over moisturizer, no primer needed. The SPF 40 means you skip a step in your AM routine.";
        }
        // Even tone, looks like skin → Skin Tint or Stick depending on wear
        else if (look === 'Even tone, looks like skin') {
          if (wear === 'All-day (event / wedding)' || skin === 'Gets oily all over') {
            intro = "For 'looks like skin' with all-day wear, the Skin Rewind Complexion Stick is sturdier than Skin Tint.";
            recs = [
              productCard(P.skin_rewind_stick, { tag: 'The pick', meta: '$50 · stick, longer wear, buildable' }),
              productCard(P.skin_blur_concealer, { tag: 'Spot layer', meta: '$32 · over the stick where needed' }),
            ];
            summary = "Stick formulas hold better through long days. Apply with a damp sponge to keep the 'skin' finish.";
          } else {
            intro = "Super Serum Skin Tint will hit it — light coverage, evens tone, looks like better skin.";
            recs = [
              productCard(P.skin_tint_spf40, { tag: 'The pick', meta: '$48 · light coverage, SPF 40' }),
              productCard(P.skin_blur_concealer, { tag: 'For brightening', meta: '$32 · under-eye, sparingly' }),
            ];
            summary = "Skin Tint with a touch of concealer under the eye is most ILIA shoppers' everyday combo.";
          }
        }
        // Polished, covers redness → Foundation
        else if (look === 'Polished, covers redness') {
          intro = "True Skin Serum Foundation is the right call — buildable medium coverage, photographs well, still feels light.";
          recs = [
            productCard(P.true_skin_foundation, { tag: 'The pick', meta: '$56 · buildable medium coverage' }),
            productCard(P.skin_blur_concealer, { tag: 'Touch up redness', meta: '$32 · over foundation for extra cover' }),
          ];
          if (skin === 'Gets dry / flaky') {
            recs.push(productCard(P.priming_serum, { tag: 'Prep step', meta: '$52 · primer + serum, smooths flakes' }));
          }
          summary = "True Skin is light enough for daily wear but holds up to photo light. Apply with a buffing brush, not a sponge, for a more polished finish.";
        }
        // Full cover, photo-ready → Foundation + concealer
        else if (look === 'Full cover, photo-ready') {
          intro = "Layer True Skin Foundation + Skin Blur Concealer. That's the photo-ready combo. Skin Rewind Stick if you want a single product.";
          recs = [
            productCard(P.true_skin_foundation, { tag: 'Base · build to full', meta: '$56 · 2 layers for full cover' }),
            productCard(P.skin_blur_concealer, { tag: 'Targeted cover', meta: '$32 · over foundation' }),
            productCard(P.skin_rewind_stick, { tag: 'Single-product alt', meta: '$50 · stick for grab-and-go full cover' }),
          ];
          summary = "Full cover in ILIA's line means layering. Foundation alone won't do it — concealer over the top is the real finish.";
        }

        if (skin === 'Gets oily in T-zone' || skin === 'Gets oily all over') {
          summary += " Set the T-zone (or full face) with Soft Focus Setting Powder if you trend oily — extends wear by 2-3 hours.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 4 — Build my routine (Homepage mid-page band)
    // Broader discovery for shoppers exploring beyond complexion
    'routine-builder': {
      greeting: "Hi, I'm your ILIA shopping guide. Let's build you a 3-product starter routine. What look are you after?",
      steps: [
        {
          type: 'single',
          options: ['No-makeup makeup', 'Soft + natural', 'Polished everyday', 'Bold lip / eye moment', 'Just trying clean makeup'],
          key: 'vibe',
        },
        {
          type: 'single',
          prompt: () => "Are you replacing existing products or starting fresh?",
          options: ['Replacing my current routine', 'Adding to what I have', 'Starting from zero'],
          key: 'context',
        },
        {
          type: 'single',
          prompt: () => "What matters most?",
          options: ['Skin-first (clean ingredients, SPF)', 'Color payoff', 'Travel-friendly (1-2 products only)', 'Best bang-for-buck (a kit)'],
          key: 'priority',
        },
      ],
      recommend: answers => {
        const vibe = answers.vibe;
        const ctx = answers.context;
        const priority = answers.priority;

        let intro = '', recs = [], summary = '';

        // Travel-friendly → Multi-Stick + Skin Tint
        if (priority === 'Travel-friendly (1-2 products only)') {
          intro = "Travel-light routine — 2 products do 80% of the work.";
          recs = [
            productCard(P.skin_tint_spf40, { tag: 'Step 1 · Complexion', meta: '$48 · skin tint + SPF in one' }),
            productCard(P.multi_stick, { tag: 'Step 2 · Lip + cheek', meta: '$36 · single stick, 12 shades' }),
            productCard(P.limitless_lash, { tag: 'Optional Step 3', meta: '$29 · mascara, plane-ready tube' }),
          ];
          summary = "Skin Tint + Multi-Stick is THE 5-minute routine. Multi-Stick is cream-based — works on lips, cheeks, and even a wash on eyelids.";
        }
        // Kit / starter
        else if (priority === 'Best bang-for-buck (a kit)' || ctx === 'Starting from zero') {
          intro = "Start with The Hero Set — our 4 bestsellers in your shades. Better value than buying separately.";
          recs = [
            productCard(P.hero_set, { tag: 'Best value', meta: '$171 · skin tint + concealer + mascara + lip oil' }),
            productCard(P.skin_tint_blur_duo, { tag: 'Or smaller', meta: '$80 · skin tint + concealer only' }),
          ];
          summary = "The Hero Set covers complexion, eyes, and lips with the bestsellers. Pick your shades at checkout. Save vs buying solo.";
        }
        // No-makeup makeup
        else if (vibe === 'No-makeup makeup') {
          intro = "No-makeup look — sheer, dewy, low-effort. Three products, 3 minutes.";
          recs = [
            productCard(P.skin_tint_spf40, { tag: 'Step 1 · Complexion', meta: '$48 · sheer, SPF 40' }),
            productCard(P.multi_stick, { tag: 'Step 2 · Lips + cheeks', meta: '$36 · one stick, dual use' }),
            productCard(P.limitless_lash, { tag: 'Step 3 · Lashes', meta: '$29 · subtle definition' }),
          ];
          summary = "Skin Tint over moisturizer, Multi-Stick blended with fingers on cheeks and lips, one coat of mascara. Done.";
        }
        // Polished everyday
        else if (vibe === 'Polished everyday') {
          intro = "Polished everyday — slightly more coverage, lip color with stay-power, defined eyes.";
          recs = [
            productCard(P.true_skin_foundation, { tag: 'Step 1 · Foundation', meta: '$56 · medium coverage, skincare-infused' }),
            productCard(P.blurring_blush, { tag: 'Step 2 · Cheek', meta: '$36 · soft-focus powder' }),
            productCard(P.lip_sketch, { tag: 'Step 3 · Lip', meta: '$27 · lip liner + lipstick crayon, 15 shades' }),
          ];
          summary = "Foundation with a buffing brush, blush on the apples blended up, Lip Sketch as both liner and color. Stays put through coffee + a meeting.";
        }
        // Bold lip/eye
        else if (vibe === 'Bold lip / eye moment') {
          intro = "Statement look — keep complexion light, let the lip or eye do the talking.";
          recs = [
            productCard(P.skin_tint_spf40, { tag: 'Base · keep light', meta: '$48 · so the lip or eye reads' }),
            productCard(P.lip_sketch, { tag: 'Bold lip', meta: '$27 · pigmented crayon, 15 shades' }),
            productCard(P.eye_stylus, { tag: 'Or bold eye', meta: '$33 · cream shadow stick, 20 shades' }),
          ];
          summary = "Pick the lip OR the eye — never both as the star. The Skin Tint keeps the rest of the face quiet.";
        }
        // Trying clean / soft natural
        else {
          intro = "Soft and natural — these three are the ILIA classics. Most-replaced-by-customers from drugstore + luxury.";
          recs = [
            productCard(P.skin_tint_spf40, { tag: 'Replaces tinted moisturizer', meta: '$48 · sheer + SPF 40' }),
            productCard(P.balmy_gloss, { tag: 'Replaces lip balm/gloss', meta: '$26 · tinted hydrating oil' }),
            productCard(P.limitless_lash, { tag: 'Replaces drugstore mascara', meta: '$29 · clean formula, no flake' }),
          ];
          if (priority === 'Skin-first (clean ingredients, SPF)') {
            recs.push(productCard(P.sun_serum_spf50, { tag: 'Add for outdoor days', meta: '$40 · SPF 50, no white cast' }));
          }
          summary = "These three are the bestsellers people don't return. Clean formulas, performance match drugstore at $5-10 more per product.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 4), summary };
      },
    },
  };

  // === Panel rendering ===

  function ensurePanel() {
    if (document.querySelector('.chat-panel')) return;
    const overlay = document.createElement('div');
    overlay.className = 'chat-overlay';
    overlay.addEventListener('click', closePanel);

    const panel = document.createElement('aside');
    panel.className = 'chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ILIA Shopping Guide');
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header__brand">
          <div class="chat-header__avatar">I</div>
          <div>
            <p class="chat-header__title">ILIA Shopping Guide</p>
            <p class="chat-header__status">Online · replies instantly</p>
          </div>
        </div>
        <button class="chat-header__close" aria-label="Close chat">&times;</button>
      </div>
      <div class="chat-body" id="chat-body"></div>
      <div class="chat-footer">
        <form class="chat-input" id="chat-input-form">
          <input type="text" placeholder="Type a message…" autocomplete="off" />
          <button type="submit" aria-label="Send">→</button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    panel.querySelector('.chat-header__close').addEventListener('click', closePanel);
    panel.querySelector('#chat-input-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = e.target.querySelector('input');
      if (!input.value.trim()) return;
      addUserMsg(input.value.trim());
      input.value = '';
      addTypingThen(() => {
        addAgentMsg("For this demo, please use the suggested options to continue.");
      }, 400);
    });
  }

  function closePanel() {
    document.querySelector('.chat-overlay')?.classList.remove('is-open');
    document.querySelector('.chat-panel')?.classList.remove('is-open');
  }

  function openPanel() {
    document.querySelector('.chat-overlay')?.classList.add('is-open');
    document.querySelector('.chat-panel')?.classList.add('is-open');
  }

  function clearBody() {
    document.getElementById('chat-body').innerHTML = '';
    const footer = document.querySelector('.chat-footer');
    if (footer) footer.style.display = '';
  }

  function scroll() {
    const body = document.getElementById('chat-body');
    body.scrollTop = body.scrollHeight;
  }

  function addAgentMsg(text) {
    const body = document.getElementById('chat-body');
    const el = document.createElement('div');
    el.className = 'msg msg--agent';
    el.innerHTML = `
      <div class="msg__avatar">I</div>
      <div class="msg__bubble"></div>
    `;
    el.querySelector('.msg__bubble').textContent = text;
    body.appendChild(el);
    scroll();
    return el;
  }

  function addUserMsg(text) {
    const body = document.getElementById('chat-body');
    const el = document.createElement('div');
    el.className = 'msg msg--user';
    el.innerHTML = `<div class="msg__bubble"></div>`;
    el.querySelector('.msg__bubble').textContent = text;
    body.appendChild(el);
    scroll();
    return el;
  }

  function addTyping() {
    const body = document.getElementById('chat-body');
    const el = document.createElement('div');
    el.className = 'msg msg--agent';
    el.innerHTML = `
      <div class="msg__avatar">I</div>
      <div class="typing-bubble"><span></span><span></span><span></span></div>
    `;
    body.appendChild(el);
    scroll();
    return el;
  }

  function addTypingThen(fn, delay) {
    delay = delay || 700;
    const t = addTyping();
    setTimeout(() => {
      t.remove();
      fn();
    }, delay);
  }

  function addChips(options, onPick, isMulti, confirmLabel) {
    const body = document.getElementById('chat-body');
    const row = document.createElement('div');
    row.className = 'chip-row';

    let selected = [];

    options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (isMulti) {
          if (b.classList.contains('is-selected')) {
            b.classList.remove('is-selected');
            selected = selected.filter(s => s !== opt);
          } else {
            b.classList.add('is-selected');
            selected.push(opt);
          }
          confirmBtn.disabled = selected.length === 0;
        } else {
          row.querySelectorAll('.chip').forEach(c => c.disabled = true);
          actionRow?.remove();
          onPick(opt);
        }
      });
      row.appendChild(b);
    });

    body.appendChild(row);

    let actionRow, confirmBtn;
    if (isMulti) {
      actionRow = document.createElement('div');
      actionRow.className = 'chip-row chip-row--multi-actions';
      confirmBtn = document.createElement('button');
      confirmBtn.className = 'chip chip--confirm';
      confirmBtn.type = 'button';
      confirmBtn.textContent = confirmLabel || 'Continue';
      confirmBtn.disabled = true;
      confirmBtn.addEventListener('click', () => {
        row.querySelectorAll('.chip').forEach(c => c.disabled = true);
        actionRow.remove();
        onPick(selected);
      });
      actionRow.appendChild(confirmBtn);
      body.appendChild(actionRow);
    }
    scroll();
  }

  function addRecCards(intro, recs, summary) {
    addAgentMsg(intro);

    setTimeout(() => {
      const body = document.getElementById('chat-body');
      const list = document.createElement('div');
      list.className = 'rec-list';
      recs.forEach(r => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.innerHTML = `
          <div class="rec-card__media"><img src="${r.image}" alt="${r.title}" onerror="this.style.opacity='0.2';this.alt='image unavailable'"/></div>
          <div class="rec-card__body">
            <p class="rec-card__tag"></p>
            <h4 class="rec-card__title"></h4>
            <p class="rec-card__meta"></p>
            <div class="rec-card__actions">
              <button class="rec-card__btn rec-card__btn--primary" data-action="add">Add to cart</button>
              <button class="rec-card__btn rec-card__btn--ghost" data-action="view">View</button>
            </div>
          </div>
        `;
        card.querySelector('.rec-card__tag').textContent = r.tag || '';
        card.querySelector('.rec-card__title').textContent = r.title;
        card.querySelector('.rec-card__meta').textContent = r.meta || '';
        card.querySelector('[data-action="add"]').addEventListener('click', () => showToast(`Added ${r.title} to cart`));
        card.querySelector('[data-action="view"]').addEventListener('click', () => showToast(`Would navigate to ${r.title} (prototype)`));
        list.appendChild(card);
      });
      body.appendChild(list);

      if (summary) {
        const sum = document.createElement('p');
        sum.className = 'rec-summary';
        sum.textContent = summary;
        body.appendChild(sum);
      }

      scroll();

      // Email capture, then the "try again" follow-up once it resolves
      setTimeout(addEmailCapture, 500);
    }, 300);
  }

  function addFollowup() {
    const body = document.getElementById('chat-body');
    const followup = document.createElement('div');
    followup.style.paddingLeft = '38px';
    followup.style.marginTop = '4px';
    const startOver = document.createElement('button');
    startOver.className = 'chip';
    startOver.type = 'button';
    startOver.textContent = 'Try a different question';
    startOver.addEventListener('click', () => {
      clearBody();
      runFlow(currentFlowKey);
    });
    followup.appendChild(startOver);
    body.appendChild(followup);
    scroll();
  }

  // Email capture shown after results — floats in the conversation, footer hidden (Osea only for now)
  function addEmailCapture() {
    addAgentMsg("Your results are ready. To get your full routine sent to you, enter your email below.");

    const body = document.getElementById('chat-body');
    const footer = document.querySelector('.chat-footer');
    if (footer) footer.style.display = 'none';
    body.querySelector('.email-capture')?.remove();

    const wrap = document.createElement('div');
    wrap.className = 'email-capture';
    wrap.innerHTML = `
      <label class="email-capture__consent">
        <input type="checkbox" class="email-capture__check" />
        <span>By checking this box, you agree to receive communications from ILIA.</span>
      </label>
      <form class="email-capture__form">
        <input type="text" inputmode="email" class="email-capture__input" placeholder="Enter your email" autocomplete="email" />
        <button type="submit" class="email-capture__send" aria-label="Send">→</button>
      </form>
      <button type="button" class="email-capture__skip">Skip this step</button>
    `;
    body.appendChild(wrap);

    const form = wrap.querySelector('.email-capture__form');
    const input = wrap.querySelector('.email-capture__input');
    const consent = wrap.querySelector('.email-capture__check');
    const skip = wrap.querySelector('.email-capture__skip');

    const restoreFooter = () => {
      wrap.remove();
      if (footer) footer.style.display = '';
    };

    input.addEventListener('input', () => input.classList.remove('is-error'));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = input.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        input.classList.add('is-error');
        input.focus();
        return;
      }
      const marketing = consent.checked;
      restoreFooter();
      addUserMsg(email);
      addTypingThen(() => {
        addAgentMsg(marketing
          ? `Done. Your routine is on the way to ${email}. We'll also keep you posted on new launches.`
          : `Done. Your routine is on the way to ${email}.`);
        showToast('Results sent');
        setTimeout(addFollowup, 400);
      }, 500);
    });

    skip.addEventListener('click', () => {
      restoreFooter();
      addAgentMsg("No problem. Your recommendations are saved above.");
      setTimeout(addFollowup, 400);
    });

    input.focus();
    scroll();
  }

  // === Flow runner ===

  let currentFlowKey = null;

  function runFlow(flowKey) {
    currentFlowKey = flowKey;
    const flow = flows[flowKey];
    if (!flow) {
      addAgentMsg("Hmm, something went wrong. Try a different option.");
      return;
    }
    const answers = {};

    addTypingThen(() => {
      addAgentMsg(flow.greeting);
      askStep(flow, 0, answers);
    }, 500);
  }

  function askStep(flow, idx, answers) {
    const step = flow.steps[idx];
    if (!step) {
      addTypingThen(() => {
        const result = flow.recommend(answers);
        addRecCards(result.intro, result.recs, result.summary);
      }, 900);
      return;
    }

    const showPrompt = () => {
      const opts = typeof step.options === 'function' ? step.options(answers) : step.options;
      if (idx === 0) {
        addChips(opts, picked => onPicked(picked), step.type === 'multi', step.confirmLabel);
      } else {
        addTypingThen(() => {
          addAgentMsg(typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt);
          addChips(opts, picked => onPicked(picked), step.type === 'multi', step.confirmLabel);
        }, 700);
      }
    };

    const onPicked = picked => {
      answers[step.key] = picked;
      const userText = Array.isArray(picked) ? (picked.length ? picked.join(', ') : 'None') : picked;
      addUserMsg(userText);
      askStep(flow, idx + 1, answers);
    };

    showPrompt();
  }

  function showToast(text) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2000);
  }

  function startChat(flowKey) {
    ensurePanel();
    clearBody();
    openPanel();
    runFlow(flowKey);
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-trigger]');
    if (trigger) {
      e.preventDefault();
      const flowKey = trigger.getAttribute('data-trigger');
      startChat(flowKey);
    }
  });

  window.IliaChat = { startChat, openPanel, closePanel };
})();
