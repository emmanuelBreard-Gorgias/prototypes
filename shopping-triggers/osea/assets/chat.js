// Osea Shopping Triggers — fake chat panel
// Script-driven discovery flows. No backend. No LLM.

(function () {
  const data = window.OSEA_DATA || { products: {} };
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
    // FLOW 1 — Find my routine (Homepage hero pill)
    'find-routine': {
      greeting: "Hi, I'm your Osea shopping guide. Let's match you with a routine in 3 quick questions. How would you describe your skin?",
      steps: [
        {
          type: 'single',
          options: ['Dry / mature', 'Combination', 'Oily / blemish-prone', 'Sensitive', 'Not sure'],
          key: 'skin_type',
        },
        {
          type: 'single',
          prompt: a => "And what's your top concern right now?",
          options: a => {
            if (a.skin_type === 'Dry / mature') return ['Fine lines & firmness', 'Hydration', 'Dullness / uneven tone', 'A bit of everything'];
            if (a.skin_type === 'Oily / blemish-prone') return ['Breakouts', 'Pores / texture', 'Hydration without grease', 'Dullness'];
            if (a.skin_type === 'Sensitive') return ['Calming / barrier', 'Hydration', 'Anti-aging without irritation', 'Even tone'];
            return ['Hydration', 'Fine lines & firmness', 'Brightening / glow', 'Breakouts', 'Just want a routine'];
          },
          key: 'concern',
        },
        {
          type: 'single',
          prompt: () => "Last one. AM, PM, or both?",
          options: ['AM only', 'PM only', 'Both'],
          key: 'when',
        },
      ],
      recommend: answers => {
        const skin = answers.skin_type;
        const concern = answers.concern;
        const when = answers.when;

        let intro = '';
        let recs = [];
        let summary = '';

        // Mature / dry path
        if (skin === 'Dry / mature') {
          if (concern === 'Fine lines & firmness') {
            intro = "For mature skin focused on fine lines, this is the bio-retinol routine. Gentle enough for daily use.";
            recs = [
              productCard(P.ocean_wave_cleanser, { tag: 'Step 1 · Cleanse' }),
              productCard(P.dream_night_serum, { tag: 'Step 2 · PM serum', meta: '$88 · bio-retinol, brightens & smooths' }),
              productCard(when === 'AM only' ? P.advanced_protection_cream : P.dream_night_cream, { tag: 'Step 3 · Cream', meta: when === 'AM only' ? '$108 · daytime, anti-aging' : '$68 · overnight, bio-retinol' }),
            ];
            summary = "Bio-retinol works overnight. AM only? Skip the night serum and use Hyaluronic Sea Serum instead. Pair with Advanced Repair Eye Cream for fine lines around the eyes.";
          } else if (concern === 'Hydration') {
            intro = "For very dry, mature skin — Atmosphere or Advanced Protection Cream is the move. The Hyaluronic Sea Serum layers under either.";
            recs = [
              productCard(P.ocean_wave_cleanser, { tag: 'Step 1 · Cleanse' }),
              productCard(P.hyaluronic_sea_serum, { tag: 'Step 2 · Serum', meta: '$88 · plumps & holds water' }),
              productCard(P.advanced_protection_cream, { tag: 'Step 3 · Cream', meta: '$108 · for very dry mature skin' }),
              productCard(P.essential_hydrating_oil, { tag: 'Add for very dry', meta: '$68 · layer over cream PM' }),
            ];
            summary = "Apply serum on damp skin, then cream while serum is still wet — locks in more water. Use the oil only on extra-dry days or PM.";
          } else {
            intro = "Here's a balanced routine for mature skin — covers lines, hydration, and tone in 3 steps.";
            recs = [
              productCard(P.ocean_wave_cleanser, { tag: 'Step 1' }),
              productCard(P.hyaluronic_sea_serum, { tag: 'Step 2 · AM serum' }),
              productCard(P.dream_night_cream, { tag: 'Step 3 · PM cream' }),
              productCard(P.advanced_repair_eye_cream, { tag: 'Add for eyes' }),
            ];
            summary = "Hyaluronic Sea Serum every morning. Dream Night Cream every night. The eye cream is optional but high-impact for crow's feet.";
          }
        }
        // Combination path
        else if (skin === 'Combination') {
          if (concern === 'Hydration without grease' || concern === 'Pores / texture') {
            intro = "For combination skin, Seabiotic Water Cream is the lighter pick — hydrates without sitting heavy.";
            recs = [
              productCard(P.ocean_wave_cleanser, { tag: 'Step 1' }),
              productCard(P.hyaluronic_sea_serum, { tag: 'Step 2', meta: '$88 · lightweight, won\'t clog' }),
              productCard(P.seabiotic_water_cream, { tag: 'Step 3', meta: '$54 · gel-cream finish' }),
            ];
            summary = "Seabiotic gel-cream sinks in fast — no shine in the T-zone. If your cheeks need more, layer a drop of Essential Hydrating Oil on dry patches only.";
          } else {
            intro = "Combination skin balanced — light serum, gel-cream, plus a brightening step if you want glow.";
            recs = [
              productCard(P.ocean_wave_cleanser, { tag: 'Step 1' }),
              productCard(P.hyaluronic_sea_serum, { tag: 'Step 2 · AM' }),
              productCard(when === 'PM only' ? P.dream_night_serum : P.seabiotic_water_cream, { tag: 'Step 3', meta: when === 'PM only' ? '$88 · bio-retinol PM' : '$54 · daily gel-cream' }),
            ];
            summary = "Add Seaglow Overnight 2x/week if dullness is the issue — gentle AHA, brightens without scrubbing.";
          }
        }
        // Oily / blemish-prone path
        else if (skin === 'Oily / blemish-prone') {
          intro = "For oily, blemish-prone skin — Seabiotic Water Cream is the bestseller pick. Lightweight, balances oil, won't clog.";
          recs = [
            productCard(P.ocean_wave_cleanser, { tag: 'Step 1', meta: '$38 · gentle gel, no stripping' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Step 2', meta: '$88 · oil-free hydration' }),
            productCard(P.seabiotic_water_cream, { tag: 'Step 3', meta: '$54 · gel-cream, blemish-friendly' }),
          ];
          if (concern === 'Dullness') {
            recs.push(productCard(P.seaglow_overnight_serum, { tag: 'Add for dullness', meta: '$68 · gentle AHA, 2-3x/week' }));
          }
          summary = "Skip heavy oils on the face. The Hyaluronic Sea Serum hydrates without grease — most acne-prone shoppers tolerate it well.";
        }
        // Sensitive path
        else if (skin === 'Sensitive') {
          intro = "For sensitive skin — fragrance-free, no actives in the cleanser, and we can layer in anti-aging gradually.";
          recs = [
            productCard(P.ocean_wave_cleanser, { tag: 'Step 1', meta: '$38 · gentle, no fragrance overload' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Step 2', meta: '$88 · soothes & plumps' }),
            productCard(P.atmosphere_protection_cream, { tag: 'Step 3', meta: '$54 · barrier-repair, sensitive-skin tested' }),
          ];
          if (concern === 'Anti-aging without irritation') {
            recs.push(productCard(P.dream_bio_retinol_duo, { tag: 'Add for anti-aging', meta: '$44 · mini bio-retinol, gentler than retinol' }));
          }
          summary = "Bio-Retinol is gentler than traditional retinol — start 2x/week and ramp up. Patch-test on the jaw before going all-in.";
        }
        // Default / not sure
        else {
          intro = "Here's our most-loved 3-step routine — works for most skin types and you can swap pieces later.";
          recs = [
            productCard(P.ocean_wave_cleanser, { tag: 'Step 1' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Step 2' }),
            productCard(P.atmosphere_protection_cream, { tag: 'Step 3' }),
          ];
          summary = "If skin runs oily, swap the cream for Seabiotic Water Cream. If very dry, swap up to Advanced Protection Cream.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 4), summary };
      },
    },

    // FLOW 2 — Atmosphere fit-check (PDP, below ATC)
    'fit-check': {
      greeting: "Quick fit check — I'll tell you if Atmosphere Protection Cream is right for your skin in 3 questions. How would you describe your skin?",
      steps: [
        {
          type: 'single',
          options: ['Dry / mature', 'Combination', 'Oily / blemish-prone', 'Sensitive', 'Very dry / barrier damaged'],
          key: 'skin',
        },
        {
          type: 'single',
          prompt: () => "What's the texture preference?",
          options: ['Lightweight, fast-absorbing', 'Rich and nourishing', 'Layer with an oil', 'Doesn\'t matter'],
          key: 'texture',
        },
        {
          type: 'single',
          prompt: () => "AM, PM, or both?",
          options: ['AM only', 'PM only', 'Both'],
          key: 'when',
        },
      ],
      recommend: answers => {
        const skin = answers.skin;
        const texture = answers.texture;
        const when = answers.when;

        let intro = '';
        let recs = [];
        let summary = '';
        let isFit = true;

        // Misfit cases — redirect
        if (skin === 'Oily / blemish-prone') {
          isFit = false;
          intro = "Atmosphere is great but probably too rich for oily/blemish-prone skin — Seabiotic Water Cream is the better fit. Lighter texture, balances oil.";
          recs = [
            productCard(P.seabiotic_water_cream, { tag: 'Better fit', meta: '$54 · gel-cream, won\'t clog' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Pair under', meta: '$88 · lightweight hydration' }),
          ];
          summary = "Seabiotic = same price, better feel for oily skin. If you do want Atmosphere for the ceramides, use it PM only and skip on T-zone.";
        } else if (skin === 'Very dry / barrier damaged') {
          isFit = false;
          intro = "For very dry or barrier-damaged skin, Atmosphere helps but Advanced Protection Cream is purpose-built for it — richer, more ceramides.";
          recs = [
            productCard(P.advanced_protection_cream, { tag: 'Better fit', meta: '$108 · richer, mature-skin formula' }),
            productCard(P.atmosphere_protection_cream, { tag: 'You\'re viewing', meta: '$54 · still good, just lighter' }),
            productCard(P.essential_hydrating_oil, { tag: 'Layer with', meta: '$68 · oil first if cracking/flaking' }),
          ];
          summary = "If barrier is damaged, focus on layering: oil first, then a rich cream. Skip exfoliants and acids until skin calms down.";
        } else if (skin === 'Combination' && texture === 'Lightweight, fast-absorbing') {
          isFit = false;
          intro = "Atmosphere is on the richer side — for combination skin who want lightweight, Seabiotic Water Cream is the better match.";
          recs = [
            productCard(P.seabiotic_water_cream, { tag: 'Better fit', meta: '$54 · gel-cream, sinks in fast' }),
            productCard(P.atmosphere_protection_cream, { tag: 'You\'re viewing', meta: '$54 · works, but heavier' }),
          ];
          summary = "Both are $54. Seabiotic is the move if you want to skip the heavier feeling. Atmosphere is the choice if cheeks tend to flake.";
        }
        // Fit cases — confirm
        else if (skin === 'Dry / mature' && when !== 'AM only') {
          intro = "Yes — Atmosphere Protection Cream is a strong fit. For mature/dry, this is the bestseller pick. Pair under serum for full benefit.";
          recs = [
            productCard(P.atmosphere_protection_cream, { tag: 'Best fit', meta: '$54 · bestseller for dry/mature' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Pair under', meta: '$88 · plumps before cream' }),
          ];
          if (when === 'PM only' || when === 'Both') {
            recs.push(productCard(P.dream_night_serum, { tag: 'Add for PM', meta: '$88 · bio-retinol, anti-aging' }));
          }
          summary = "Apply on damp skin (within 30 sec of cleansing). Press, don't rub. The seaweed actives need a little water to work.";
        } else if (skin === 'Sensitive') {
          intro = "Yes — Atmosphere is a smart pick for sensitive skin. Barrier-repair focus, no fragrance overload, no acids.";
          recs = [
            productCard(P.atmosphere_protection_cream, { tag: 'Best fit', meta: '$54 · sensitive-skin friendly' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Pair under', meta: '$88 · soothes & plumps' }),
          ];
          summary = "Sensitive-skin tested. Patch-test on jaw for 2 days first if you've reacted to creams before. Skip retinol pairings until skin is calm.";
        } else {
          intro = "Yes — Atmosphere Protection Cream works for you. It's the daily moisturizer most Osea customers settle on.";
          recs = [
            productCard(P.atmosphere_protection_cream, { tag: 'Good fit', meta: '$54 · daily moisturizer' }),
            productCard(P.hyaluronic_sea_serum, { tag: 'Pair under', meta: '$88 · plumps before cream' }),
          ];
          summary = "Layer over Hyaluronic Sea Serum for the best result. Texture is rich-but-not-greasy — sinks in within a minute.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 3 — Atmosphere vs Seabiotic comparison (PDP, above ATC)
    'vs-comparison': {
      greeting: "Atmosphere vs Seabiotic — let me match you to the right one in 3 questions. What's your main skin concern?",
      steps: [
        {
          type: 'single',
          options: ['Dryness / barrier', 'Pores / oil balance', 'Both — combo skin', 'Sensitivity', 'Anti-aging'],
          key: 'concern',
        },
        {
          type: 'single',
          prompt: () => "What texture do you reach for?",
          options: ['Rich, nourishing', 'Lightweight, gel-like', 'Either, just want results'],
          key: 'texture',
        },
        {
          type: 'single',
          prompt: () => "Already use a serum?",
          options: ['Hyaluronic Sea Serum', 'Bio-Retinol serum', 'Other / none', 'Just starting'],
          key: 'serum',
        },
      ],
      recommend: answers => {
        const concern = answers.concern;
        const texture = answers.texture;
        const serum = answers.serum;

        let intro = '';
        let recs = [];
        let summary = '';

        // Seabiotic recommendation
        if (concern === 'Pores / oil balance' || (concern === 'Both — combo skin' && texture === 'Lightweight, gel-like') || texture === 'Lightweight, gel-like') {
          intro = "Seabiotic Water Cream is the pick for you — gel-cream finish, balances oil, hydrates without grease.";
          recs = [
            productCard(P.seabiotic_water_cream, { tag: 'Best fit', meta: '$54 · gel-cream, lightweight' }),
            productCard(P.atmosphere_protection_cream, { tag: 'Skip for now', meta: '$54 · richer, save for winter' }),
          ];
          summary = "Both are $54. Seabiotic = lighter, every-day go-to for combo/oily. Atmosphere = save for when skin runs dry or cold weather hits.";
        }
        // Atmosphere recommendation
        else if (concern === 'Dryness / barrier' || concern === 'Sensitivity' || (concern === 'Anti-aging' && texture !== 'Lightweight, gel-like')) {
          intro = "Atmosphere Protection Cream is the better fit — richer ceramide formula, barrier-focused, sensitive-skin friendly.";
          recs = [
            productCard(P.atmosphere_protection_cream, { tag: 'Best fit', meta: '$54 · ceramide-rich, barrier' }),
            productCard(P.seabiotic_water_cream, { tag: 'Skip for now', meta: '$54 · too light for dry/sensitive' }),
          ];
          if (serum === 'Bio-Retinol serum') {
            recs.push(productCard(P.hyaluronic_sea_serum, { tag: 'Pair AM', meta: '$88 · soothing, alternates with bio-retinol' }));
          }
          summary = "Atmosphere is built for dryness and barrier repair. Pair with Hyaluronic Sea Serum AM. Apply within 30 seconds of cleansing for max water retention.";
        }
        // Combo / either / undecided
        else {
          intro = "For combo skin, you can do either, but most shoppers in your spot land on Seabiotic for daily and pick up Atmosphere for cold months.";
          recs = [
            productCard(P.seabiotic_water_cream, { tag: 'Daily go-to', meta: '$54 · gel-cream' }),
            productCard(P.atmosphere_protection_cream, { tag: 'Seasonal', meta: '$54 · richer, winter pick' }),
          ];
          summary = "Same price, same line. Many customers own both eventually. Start with whichever matches today's skin and add the other in 3-6 months.";
        }

        if (serum === 'Just starting') {
          summary += " Start with cleanser + cream. Add Hyaluronic Sea Serum after 2-3 weeks once you've settled the basics.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 4 — Body format finder (Body Moisturizers collection)
    'body-format': {
      greeting: "Oil, butter, lotion, balm — let me match you to the right body moisturizer format in 3 questions. What's your main need?",
      steps: [
        {
          type: 'single',
          options: ['Daily all-over hydration', 'Very dry rough patches (elbows, knees)', 'Anti-aging, firmness', 'Lightweight glow under clothes', 'A bit of everything'],
          key: 'need',
        },
        {
          type: 'single',
          prompt: () => "Texture preference?",
          options: ['Light, non-greasy', 'Rich, buttery', 'Layer-friendly (oil + lotion)', 'No preference'],
          key: 'texture',
        },
        {
          type: 'single',
          prompt: () => "Scent — Undaria's signature seaweed-citrus, or fragrance-free?",
          options: ['Signature scent is great', 'Prefer fragrance-free', 'No strong opinion'],
          key: 'scent',
        },
      ],
      recommend: answers => {
        const need = answers.need;
        const texture = answers.texture;
        const scent = answers.scent;

        let intro = '';
        let recs = [];
        let summary = '';

        // Anti-aging path
        if (need === 'Anti-aging, firmness') {
          intro = "For anti-aging body care — Anti-Aging Body Balm for targeted areas, Bio-Retinol Body Serum for body-wide texture.";
          recs = [
            productCard(P.anti_aging_body_balm, { tag: 'Targeted', meta: '$84 · neck, décolleté, arms' }),
            productCard(P.dream_bio_retinol_body_serum, { tag: 'PM all-over', meta: '$52 · smooths crepe-y texture' }),
            productCard(P.undaria_body_oil, { tag: 'AM hydration', meta: '$84 · daily moisture' }),
          ];
          summary = "Body Balm is concentrated — use a small amount on the neck, décolleté, arms. The Bio-Retinol Serum handles body-wide texture overnight.";
        }
        // Very dry / rough patches
        else if (need === 'Very dry rough patches (elbows, knees)') {
          intro = "For very dry rough patches — Body Butter is purpose-built. Rich shea + seaweed, layer over the oil for stubborn dry spots.";
          recs = [
            productCard(P.undaria_body_butter, { tag: 'Best fit', meta: '$54 · rich, for dry patches' }),
            productCard(P.undaria_body_oil, { tag: 'Layer under', meta: '$84 · oil first, then butter' }),
            productCard(P.mega_moisture_duo, { tag: 'Save 10%', meta: '$84 · butter + lotion duo' }),
          ];
          summary = "Apply oil to damp skin → butter on top while still damp. Locks in 2-3x more moisture. Best done after the shower.";
        }
        // Daily / lightweight
        else if (need === 'Lightweight glow under clothes' || (need === 'Daily all-over hydration' && texture === 'Light, non-greasy')) {
          if (scent === 'Prefer fragrance-free') {
            intro = "Fragrance-free + lightweight = Undaria Algae Body Oil Fragrance Free. Same hero formula, no scent.";
            recs = [
              productCard(P.undaria_body_oil_ff, { tag: 'Best fit', meta: '$52 · fast-absorbing, scent-free' }),
              productCard(P.hyaluronic_body_serum, { tag: 'Layer under', meta: '$48 · water-based, hydrates first' }),
            ];
            summary = "Apply on damp skin straight after the shower. Sinks in within 60 seconds — no greasy residue, safe under clothes.";
          } else {
            intro = "For lightweight daily glow — the Undaria Body Oil is the cult bestseller. Sinks in fast, signature scent.";
            recs = [
              productCard(P.undaria_body_oil, { tag: 'Bestseller', meta: '$84 · cult favorite, daily glow' }),
              productCard(P.undaria_body_lotion, { tag: 'Or lighter still', meta: '$48 · classic body lotion' }),
              productCard(P.hyaluronic_body_serum, { tag: 'Layer under', meta: '$48 · for humid climates' }),
            ];
            summary = "Body Oil on damp skin = fastest absorption, no greasy after-feel. The Body Lotion is the cheaper everyday alternative if oil texture isn't your thing.";
          }
        }
        // Daily, rich texture
        else if (need === 'Daily all-over hydration' && texture === 'Rich, buttery') {
          intro = "Rich and daily = Body Butter for AM, Body Oil PM. Or grab the Mega Moisture Duo for both in one.";
          recs = [
            productCard(P.undaria_body_butter, { tag: 'AM rich', meta: '$54 · shea + seaweed' }),
            productCard(P.undaria_body_oil, { tag: 'PM oil', meta: '$84 · sinks in overnight' }),
            productCard(P.mega_moisture_duo, { tag: 'Best value', meta: '$84 · butter + lotion bundle' }),
          ];
          summary = "If you tend to feel tight after showering, butter in the morning is the right move. Oil at night locks in moisture overnight.";
        }
        // A bit of everything / undecided
        else {
          intro = "Hard to pick just one. The Undaria Body Collection is the full lineup — oil + butter + lotion. Best for trying all three.";
          recs = [
            productCard(P.undaria_body_collection, { tag: 'All formats', meta: '$138 · oil + butter + lotion' }),
            productCard(P.undaria_body_oil, { tag: 'Or just the oil', meta: '$84 · most popular single' }),
            productCard(P.body_hydration_heroes, { tag: 'Smaller set', meta: '$84 · hydration duo' }),
          ];
          summary = "Most shoppers eventually own oil + butter. Body Collection saves vs buying separately. The oil alone is the safest single-bottle pick.";
        }

        if (scent === 'Prefer fragrance-free' && recs[0] && recs[0].title.includes('Body Oil') && !recs[0].title.includes('Fragrance Free')) {
          // Swap to FF version where applicable
          recs.unshift(productCard(P.undaria_body_oil_ff, { tag: 'Fragrance-free version', meta: '$52 · same formula, no scent' }));
          recs = recs.slice(0, 3);
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
    panel.setAttribute('aria-label', 'Osea Shopping Guide');
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header__brand">
          <div class="chat-header__avatar">O</div>
          <div>
            <p class="chat-header__title">Osea Shopping Guide</p>
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
        <p class="chat-footer__legal">Powered by Osea · Seaweed-powered skincare</p>
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
      <div class="msg__avatar">O</div>
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
      <div class="msg__avatar">O</div>
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
    }, 300);
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

  window.OseaChat = { startChat, openPanel, closePanel };
})();
