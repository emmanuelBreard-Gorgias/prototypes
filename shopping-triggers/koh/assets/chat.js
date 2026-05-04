// Koh Shopping Triggers — fake chat panel
// Script-driven discovery flows. No backend. No LLM.

(function () {
  const data = window.KOH_DATA || { products: {} };
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
    // FLOW 1 — Build my Koh kit (homepage)
    'build-kit': {
      greeting: "Hi, I'm your Koh helper. Let's set you up with the right products in 3 quick questions. Where do you want to start cleaning?",
      steps: [
        {
          type: 'multi',
          options: ['Bathroom & shower', 'Kitchen', 'Loo (toilet)', 'Laundry', 'Floors', 'Whole home'],
          key: 'rooms',
          confirmLabel: "That's me",
        },
        {
          type: 'single',
          prompt: a => {
            const roomsList = (a.rooms || []).join(', ').toLowerCase();
            return `Got it. Anyone in the home with sensitivities I should keep in mind?`;
          },
          options: ['Babies / young kids', 'Pets', 'Sensitive skin', 'Fragrance-sensitive', 'None'],
          key: 'household',
        },
        {
          type: 'single',
          prompt: a => {
            if ((a.rooms || []).includes('Laundry') || (a.rooms || []).includes('Whole home')) {
              return "For laundry — do you prefer liquid or pre-dosed sheets?";
            }
            return "Last one. How light or heavy is the typical mess?";
          },
          options: a => {
            if ((a.rooms || []).includes('Laundry') || (a.rooms || []).includes('Whole home')) {
              return ['Liquid', 'Sheets', 'Either', 'No laundry'];
            }
            return ['Daily wipe-downs', 'Tough / built-up grime', 'Mix of both'];
          },
          key: 'preference',
        },
      ],
      recommend: answers => {
        const rooms = answers.rooms || [];
        const household = answers.household;
        const pref = answers.preference;
        const isWhole = rooms.includes('Whole home') || rooms.length >= 4;

        let recs = [];
        let intro = '';
        let summary = '';

        if (isWhole) {
          recs = [
            productCard(P.whole_home, { tag: 'Best fit', meta: '$178.45 · Universal + Bathroom + Kitchen + Laundry' }),
            productCard(pref === 'Liquid' ? P.laundry_starter_liquid : P.laundry_sheets, { tag: 'Add to fit pref', meta: pref === 'Liquid' ? '$28.70 · sub if you want liquid' : '$21.95 · already in the kit' }),
            productCard(P.loo_blade_white, { tag: 'Add for the loo', meta: '$64.95 · brush replacement' }),
          ];
          intro = "For a full setup, the Whole Home Starter Kit is the best value — covers Universal, Bathroom, Kitchen, and Laundry in one box.";
          summary = "Adds up to ~$200 vs ~$280 buying separately. Ships in one box. The Loo Blade is the only extra you'll likely want for full coverage.";
        } else {
          // Build per-room recommendations
          if (rooms.includes('Bathroom & shower')) {
            recs.push(productCard(P.bathroom_starter, { tag: 'Bathroom', meta: '$48.70 · cleaner + foaming bottle + mitt' }));
          }
          if (rooms.includes('Kitchen')) {
            recs.push(productCard(P.kitchen_complete, { tag: 'Kitchen', meta: '$91.45 · grease + dish + universal' }));
          }
          if (rooms.includes('Loo (toilet)')) {
            recs.push(productCard(P.loo_blade_white, { tag: 'Loo', meta: '$64.95 · silicone blade, no bristles' }));
          }
          if (rooms.includes('Laundry')) {
            const laundryPick = pref === 'Liquid' ? P.laundry_starter_liquid : P.laundry_complete;
            recs.push(productCard(laundryPick, { tag: 'Laundry', meta: pref === 'Liquid' ? '$28.70 · liquid + pump' : '$85.20 · sheets + stain remover + bag' }));
          }
          if (rooms.includes('Floors')) {
            recs.push(productCard(P.spray_mop_starter, { tag: 'Floors', meta: '$68.95 · spray mop + 2 pads + universal' }));
          }
          if (rooms.length === 1 && rooms[0] === 'Whole home') {
            // already handled
          }
          if (recs.length === 0) {
            recs.push(productCard(P.universal_starter, { tag: 'Start here', meta: '$56.70 · Universal Cleaner kit' }));
          }
          intro = `Here's the kit for ${rooms.join(' + ').toLowerCase()}:`;
          summary = "Each kit comes with the cleaner + the right tool. Skip the kit if you already own the bottle, just grab the refill.";
        }

        if (household === 'Babies / young kids' || household === 'Sensitive skin' || household === 'Fragrance-sensitive') {
          summary += " Heads up — all Koh laundry options are fragrance-free and dermatologist-approved, you're safe across the line.";
        } else if (household === 'Pets') {
          summary += " All Koh formulas are pet-safe once dry. Universal Cleaner is the one to use around pet areas (food bowls, litter zones).";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 4), summary };
      },
    },

    // FLOW 2 — Surface check (Universal Cleaner PDP, below ATC)
    'surface-check': {
      greeting: "Quick safety check — I'll tell you if Universal Cleaner works on your surface in 3 questions. What are you cleaning?",
      steps: [
        {
          type: 'single',
          options: ['Kitchen benchtops', 'Bathroom tiles', 'Floors (hard)', 'Glass / mirrors', 'Stainless / appliances', 'Painted walls', 'Something else'],
          key: 'surface',
        },
        {
          type: 'single',
          prompt: a => {
            if (a.surface === 'Floors (hard)') return "What floor type?";
            if (a.surface === 'Kitchen benchtops') return "What's the benchtop made of?";
            if (a.surface === 'Bathroom tiles') return "What's the tile material?";
            return "What's the material?";
          },
          options: a => {
            if (a.surface === 'Floors (hard)') return ['Sealed timber / floating', 'Vinyl / laminate', 'Tile / stone', 'Hybrid (engineered)', 'Polished concrete'];
            if (a.surface === 'Kitchen benchtops') return ['Stone / granite', 'Marble', 'Engineered (Caesarstone)', 'Wood / butcher block', 'Laminate'];
            if (a.surface === 'Bathroom tiles') return ['Ceramic / porcelain', 'Natural stone', 'Marble', 'Acrylic shower'];
            return ['Marble', 'Granite / stone', 'Wood', 'Plastic / acrylic', 'Metal', 'Other'];
          },
          key: 'material',
        },
        {
          type: 'single',
          prompt: () => "Light daily wipe or tough job?",
          options: ['Light / daily', 'Tough / built-up', 'Mould or grout', 'Grease / oil'],
          key: 'job',
        },
      ],
      recommend: answers => {
        const surface = answers.surface;
        const material = answers.material;
        const job = answers.job;

        let safe = true;
        let warn = '';
        let recs = [];
        let intro = '';
        let summary = '';

        // Marble + acid-based formulas: warn
        if (material === 'Marble') {
          safe = false;
          warn = 'Skip Universal Cleaner on marble.';
          intro = "Heads up — marble is acid-sensitive, so Universal Cleaner isn't the safest pick.";
          recs = [
            productCard(P.bathroom_cleaner, { tag: 'Better fit', meta: '$19.95 · pH-balanced for delicate stone' }),
            productCard(P.ultra_cloth, { tag: 'Pair with', meta: '$24.95 · microfibre, no scratching' }),
          ];
          summary = "Use a small amount on a damp cloth. Avoid soaking marble. Test on a hidden spot first.";
        } else if (job === 'Mould or grout') {
          intro = "Mould and grout — Bathroom & Shower foam is what does the lifting here.";
          recs = [
            productCard(P.bathroom_cleaner, { tag: 'Best for mould', meta: '$19.95 · foaming, dwells on grout' }),
            productCard(P.grout_brush, { tag: 'Pair with', meta: '$17.95 · stiff bristle for grout lines' }),
            productCard(P.foaming_bottle, { tag: 'If needed', meta: '$15.95 · foaming pump head' }),
          ];
          summary = "Spray, leave 5-10 min, scrub the grout, rinse. Universal works on light surface mould but Bathroom & Shower is the heavy hitter.";
        } else if (job === 'Grease / oil' && surface === 'Kitchen benchtops') {
          intro = "Universal works for daily kitchen wipe-downs. For baked-on grease (range hood, oven), grab the Kitchen Grease & Oil.";
          recs = [
            productCard(P.universal_4l, { tag: 'Daily', meta: '$35.90 · 4L concentrate' }),
            productCard(P.kitchen_grease, { tag: 'Tough grease', meta: '$28.70 · range hoods, oven, splashbacks' }),
          ];
          summary = "1:25 dilution for daily, undiluted spray for tough grease. Always wipe with a damp cloth after.";
        } else if (surface === 'Floors (hard)' && (material === 'Sealed timber / floating' || material === 'Vinyl / laminate' || material === 'Hybrid (engineered)')) {
          intro = "Yes — Universal Cleaner is safe on " + material.toLowerCase() + ". Use it diluted in the spray mop.";
          recs = [
            productCard(P.spray_mop_starter, { tag: 'Best fit', meta: '$68.95 · mop + pads + cleaner' }),
            productCard(P.universal_4l, { tag: 'Refill', meta: '$35.90 · 4L lasts ~6 months' }),
          ];
          summary = "Dilute 1:25 in the mop bottle. Light spray, microfibre wipe — no excess water on timber/hybrid.";
        } else if (surface === 'Glass / mirrors') {
          intro = "Yes for glass — Universal works diluted, but Glass Cloths are the secret to streak-free.";
          recs = [
            productCard(P.universal_4l, { tag: 'Cleaner', meta: '$35.90 · dilute 1:50 for glass' }),
            productCard(P.glass_cloths, { tag: 'Tool', meta: '$29.95 · lint-free 3pk' }),
          ];
          summary = "Spray light, wipe with the lint-free cloth in one direction. No streaks, no residue.";
        } else if (surface === 'Stainless / appliances') {
          intro = "Yes — Universal is fine on stainless. Use a microfibre cloth and wipe with the grain.";
          recs = [
            productCard(P.universal_4l, { tag: 'Cleaner', meta: '$35.90 · 1:25 dilution' }),
            productCard(P.universal_cloths, { tag: 'Pair with', meta: '$29.95 · microfibre 3pk' }),
          ];
          summary = "Spray onto the cloth (not the surface) for stainless. Wipes smudges and fingerprints in one pass.";
        } else {
          intro = "Yes — Universal Cleaner is the right pick. Here's the setup.";
          recs = [
            productCard(P.universal_4l, { tag: 'Cleaner', meta: '$35.90 · 4L concentrate' }),
            productCard(P.universal_cloths, { tag: 'Pair with', meta: '$29.95 · microfibre 3pk' }),
            productCard(P.scrubby_pads, { tag: 'For tough bits', meta: '$15.95 · non-scratch' }),
          ];
          summary = "Standard 1:25 dilution covers most surfaces. Stronger 1:10 for tough jobs. Always damp-wipe after.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 3 — Universal vs room-specific (Universal Cleaner PDP, above ATC)
    'vs-comparison': {
      greeting: "Universal vs the room-specific cleaners — let me match you to the right one. Where will you mostly use it?",
      steps: [
        {
          type: 'single',
          options: ['Mostly bathroom', 'Mostly kitchen', 'Mostly floors', 'A bit of everything', 'I have no idea'],
          key: 'where',
        },
        {
          type: 'single',
          prompt: a => {
            if (a.where === 'Mostly bathroom') return "How tough is the bathroom usually?";
            if (a.where === 'Mostly kitchen') return "What's the main kitchen mess?";
            if (a.where === 'Mostly floors') return "What floor type?";
            return "What's the main thing you want it to handle?";
          },
          options: a => {
            if (a.where === 'Mostly bathroom') return ['Daily wipe-downs only', 'Soap scum / glass screens', 'Mould / grout', 'A bit of everything'];
            if (a.where === 'Mostly kitchen') return ['Daily benchtop wipes', 'Greasy range / oven', 'Both equally'];
            if (a.where === 'Mostly floors') return ['Sealed timber', 'Vinyl / laminate', 'Tile', 'Hybrid'];
            return ['Light everyday cleans', 'Tough / built-up grime', 'Mix of both'];
          },
          key: 'job',
        },
        {
          type: 'single',
          prompt: () => "Already own anything Koh?",
          options: ['Universal Cleaner already', 'Bathroom Cleaner already', 'Some bottles, no cleaner', 'Nothing yet'],
          key: 'owned',
        },
      ],
      recommend: answers => {
        const where = answers.where;
        const job = answers.job;
        const owned = answers.owned;

        let intro = '';
        let recs = [];
        let summary = '';

        if (where === 'Mostly bathroom' && (job === 'Mould / grout' || job === 'Soap scum / glass screens')) {
          intro = "For mould and soap scum, Bathroom & Shower beats Universal — it's foaming, so it dwells on vertical tile. Get the bathroom one.";
          recs = [
            productCard(P.bathroom_starter, { tag: 'Best fit', meta: owned !== 'Bathroom Cleaner already' ? '$48.70 · cleaner + foaming bottle + mitt' : 'Already covered' }),
            productCard(P.grout_brush, { tag: 'Pair with', meta: '$17.95 · for grout lines' }),
          ];
          summary = "Universal is the daily allrounder, but the foaming Bathroom & Shower is the right tool for vertical surfaces and mould.";
        } else if (where === 'Mostly bathroom' && job === 'Daily wipe-downs only') {
          intro = "For light daily bathroom wipes, Universal is enough — you don't need both.";
          recs = [
            productCard(P.universal_4l, { tag: 'You\'re viewing', meta: '$35.90 · 4L lasts months' }),
            productCard(P.foaming_bottle, { tag: 'Worth adding', meta: '$15.95 · foam mode for vertical surfaces' }),
          ];
          summary = "Save the Bathroom & Shower for when you have a soap-scum or mould job to do.";
        } else if (where === 'Mostly kitchen' && job === 'Greasy range / oven') {
          intro = "Universal handles most kitchen surfaces, but for the range hood and oven you want the dedicated Grease & Oil.";
          recs = [
            productCard(P.universal_4l, { tag: 'Daily', meta: '$35.90 · benchtops, fronts' }),
            productCard(P.kitchen_grease, { tag: 'Heavy grease', meta: '$28.70 · range hood, oven' }),
          ];
          summary = "Universal cuts day-to-day grease. Kitchen Grease & Oil is what you reach for on baked-on jobs once a month.";
        } else if (where === 'Mostly kitchen' && job === 'Daily benchtop wipes') {
          intro = "For everyday benchtops, Universal is all you need.";
          recs = [
            productCard(P.universal_starter, { tag: 'Start here', meta: '$56.70 · cleaner + bottle + cloths' }),
          ];
          summary = "Benchtops, splashbacks, fridge fronts, microwave — same bottle. 1:25 dilution.";
        } else if (where === 'Mostly floors') {
          intro = "Floors are Universal's strong suit. Pair it with the Spray Mop and you're done.";
          recs = [
            productCard(P.spray_mop_starter, { tag: 'Best fit', meta: '$68.95 · mop + pads + cleaner' }),
            productCard(P.universal_4l, { tag: 'Refill', meta: '$35.90 · 4L = ~6 months' }),
          ];
          summary = "Universal at 1:25 is gentle enough for sealed timber, hybrid, vinyl, and tile. Dedicated floor cleaners aren't necessary.";
        } else if (where === 'A bit of everything' || where === 'I have no idea') {
          intro = "If you want one bottle that handles 90% of cleaning — Universal is the move. Add room-specifics only when you hit a job they're built for.";
          recs = [
            productCard(P.universal_starter, { tag: 'Start here', meta: '$56.70 · daily everywhere' }),
            productCard(P.bathroom_cleaner, { tag: 'Add later', meta: '$19.95 · when you do soap scum' }),
            productCard(P.kitchen_grease, { tag: 'Add later', meta: '$28.70 · for the oven' }),
          ];
          summary = "Universal is 90% of cleaning. The room-specifics earn their spot when you have soap scum, mould, or baked-on grease.";
        } else {
          intro = "Universal Cleaner covers most situations. Here's the kit.";
          recs = [
            productCard(P.universal_starter, { tag: 'Best fit', meta: '$56.70 · cleaner + bottle + cloths' }),
          ];
          summary = "1:25 dilution = 100L of cleaner from one 4L. That's a year for most homes.";
        }

        if (owned === 'Universal Cleaner already' && recs[0] && recs[0].title.includes('Universal')) {
          recs[0] = productCard(P.universal_4l, { tag: 'Refill instead', meta: '$35.90 · skip the kit, just refill' });
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 4 — Find your bathroom routine (Bathroom collection)
    'bathroom-routine': {
      greeting: "Let's match you to the right bathroom setup in 3 questions. What's the main thing you're trying to fix?",
      steps: [
        {
          type: 'single',
          options: ['Soap scum on glass / tile', 'Mould in grout or sealant', 'Grimy toilet bowl', 'Daily quick clean', 'A bit of everything'],
          key: 'concern',
        },
        {
          type: 'single',
          prompt: () => "What's the bath/shower surface type?",
          options: ['Ceramic / porcelain tile', 'Natural stone or marble', 'Acrylic / plastic', 'Mostly glass screen', 'Mixed'],
          key: 'surface',
        },
        {
          type: 'single',
          prompt: () => "How many bathrooms in the home?",
          options: ['1', '2-3', '4+'],
          key: 'count',
        },
      ],
      recommend: answers => {
        const concern = answers.concern;
        const surface = answers.surface;
        const count = answers.count;

        let intro = '';
        let recs = [];
        let summary = '';

        if (concern === 'Soap scum on glass / tile' || surface === 'Mostly glass screen') {
          intro = "For soap scum on glass and tile, the foaming Bathroom & Shower Cleaner + the squeegee combo is the move.";
          recs = [
            productCard(P.bathroom_starter, { tag: 'Cleaner kit', meta: '$48.70 · foaming cleaner + mitt' }),
            productCard(P.squeegee, { tag: 'Daily fix', meta: '$24.95 · stops scum forming' }),
            productCard(P.glass_cloths, { tag: 'Streak-free', meta: '$29.95 · for the screen' }),
          ];
          summary = "Squeegee after every shower = no more soap scum. The cleaner does the catch-up cleans.";
        } else if (concern === 'Mould in grout or sealant') {
          intro = "Mould in grout — foaming Bathroom & Shower + a stiff grout brush gets it without bleach.";
          recs = [
            productCard(P.bathroom_cleaner, { tag: 'Best for mould', meta: '$19.95 · foam dwells on grout' }),
            productCard(P.grout_brush, { tag: 'Pair with', meta: '$17.95 · stiff bristle' }),
            productCard(P.foaming_bottle, { tag: 'Tool', meta: '$15.95 · if you don\'t have one' }),
          ];
          summary = "Spray, wait 10 min, scrub the grout lines, rinse. No bleach fumes, allergy-friendly.";
        } else if (concern === 'Grimy toilet bowl') {
          intro = "For the loo, the Loo Blade is what replaces a regular brush — silicone, no bristles to trap.";
          recs = [
            productCard(P.loo_blade_white, { tag: 'Best fit', meta: '$64.95 · silicone, no bristles' }),
            productCard(P.loo_tabs, { tag: 'Pair with', meta: '$19.95 · drop-in tabs, 2-week clean' }),
          ];
          summary = "Loo Blade flexes around the rim — gets where brushes don't. The tabs handle in-between freshness.";
        } else if (concern === 'Daily quick clean') {
          intro = "For daily upkeep, you want the foaming Bathroom & Shower + a microfibre mitt. 60 seconds, done.";
          recs = [
            productCard(P.bathroom_starter, { tag: 'Best fit', meta: '$48.70 · cleaner + foaming bottle + mitt' }),
            productCard(P.squeegee, { tag: 'Worth adding', meta: '$24.95 · prevents scum buildup' }),
          ];
          summary = "30 seconds of foaming cleaner + a 30-second squeegee after each shower keeps the bathroom tidy.";
        } else {
          intro = "For full bathroom coverage, the Core Bathroom & Shower kit is the upgrade — bigger refills, more tools.";
          recs = [
            productCard(P.bathroom_core, { tag: 'Full coverage', meta: '$96.55 · cleaner + foaming + mitt + squeegee + refills' }),
            productCard(P.loo_blade_white, { tag: 'Add for the loo', meta: '$64.95 · brush replacement' }),
          ];
          summary = "This is the all-in for one bathroom. Bigger homes can scale up with the Refill Kit.";
        }

        if (surface === 'Natural stone or marble') {
          summary += " Heads up — marble is acid-sensitive. Bathroom & Shower is pH-balanced and safe; just avoid Universal on the stone.";
        }
        if (count === '2-3' || count === '4+') {
          recs.push(productCard(P.bathroom_refill, { tag: 'For multiple baths', meta: '$50.85 · refill multipack' }));
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
    panel.setAttribute('aria-label', 'Koh Helper');
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header__brand">
          <div class="chat-header__avatar">K</div>
          <div>
            <p class="chat-header__title">Koh Helper</p>
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
        <p class="chat-footer__legal">Powered by Koh · 100% clean. 0% crap.</p>
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
      <div class="msg__avatar">K</div>
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
      <div class="msg__avatar">K</div>
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

  window.KohChat = { startChat, openPanel, closePanel };
})();
