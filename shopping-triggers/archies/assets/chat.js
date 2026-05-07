// Archies Footwear Shopping Triggers — fake chat panel.
// Script-driven discovery flows. No backend. No LLM.
// Adapted from the Koh prototype with Archies-specific flows.

(function () {
  const data = window.AR_DATA || { products: {}, variantSizes: [] };
  const P = data.products;

  // ---------- Sizing helpers ----------

  // The "size paired" variants are e.g. "US M 8 / W 9". This helper picks
  // the right side for the chosen gender.
  function variantForGender(idx, gender) {
    const v = data.variantSizes[idx] || '';
    const parts = v.split(' / ');
    return gender === "Men's" ? parts[0] : parts[1];
  }

  // Map "another brand" sizes (used as a stand-in input) to a base index in
  // the Archies chart. Index 0 = US M 4 / W 5, index 11 = US M 15 / W 16.
  const BASE_BY_GENDER = {
    "Men's": {
      'M 5': 1, 'M 6': 2, 'M 7': 3, 'M 8': 4, 'M 9': 5, 'M 10': 6,
      'M 11': 7, 'M 12': 8, 'M 13': 9, 'M 14': 10, 'M 15': 11,
    },
    "Women's": {
      'W 5': 0, 'W 6': 1, 'W 7': 2, 'W 8': 3, 'W 9': 4, 'W 10': 5,
      'W 11': 6, 'W 12': 7, 'W 13': 8, 'W 14': 9, 'W 15': 10, 'W 16': 11,
    },
  };

  // International conversion (rough). AU/UK women = US-1 (women), AU/UK men = US-1 (men).
  // EU women: 35→4, 36→5, 37→6, 38→7, 39→8, 40→9, 41→10, 42→11.
  // EU men:   38→5, 39→6, 40→7, 41→8, 42→9, 43→10, 44→11, 45→12.
  function convertIntlToUs(system, gender, sizeStr) {
    const num = parseInt(sizeStr, 10);
    if (!num) return null;
    if (system === 'AU' || system === 'UK') {
      // AU/UK ≈ US-1 for women's, US-1 for men's (close enough for the demo)
      return gender === "Women's" ? num + 1 : num + 1;
    }
    if (system === 'EU') {
      if (gender === "Women's") return Math.max(4, num - 31);
      return Math.max(4, num - 33);
    }
    return null;
  }

  // ---------- Card helper ----------

  function productCard(product, opts) {
    opts = opts || {};
    if (!product) return null;
    return {
      title: opts.titleOverride || product.title,
      tag: opts.tag || (product.line ? `${product.product_type} · ${product.line}` : product.product_type),
      meta: opts.meta || (product.price ? `$${product.price} · ${product.blurb || ''}` : ''),
      image: opts.image || product.image,
      price: product.price,
      handle: product.handle,
    };
  }

  // ---------- Flows ----------

  const flows = {
    // FLOW 1 — Find your perfect pair (homepage hero pill)
    'pair-finder': {
      greeting: "Hi, I'm your Archies fit guide. Let's match you in 3 quick questions. What kind of pair are you after?",
      steps: [
        {
          type: 'single',
          options: ['Flip flops', 'Slides', 'Not sure — show me both'],
          key: 'productType',
        },
        {
          type: 'single',
          prompt: () => "Are you shopping Men's or Women's?",
          options: ["Men's", "Women's"],
          key: 'gender',
        },
        {
          type: 'single',
          prompt: () => "Where will you wear them most?",
          options: ['Around the house', 'Casual everyday', 'Beach / pool', 'Walking longer distances', 'Post-workout / recovery'],
          key: 'usage',
        },
      ],
      recommend: answers => {
        const t = answers.productType;
        const g = answers.gender;
        const u = answers.usage;

        let intro = '';
        let recs = [];
        let summary = '';

        if (t === 'Slides' || (t === 'Not sure — show me both' && (u === 'Around the house' || u === 'Post-workout / recovery'))) {
          intro = "Slides are the move — slip-on, easy on/off, the post-shower or around-the-house pick.";
          recs = [
            productCard(P.sl_black, { tag: 'Most popular' }),
            productCard(P.sl_brown, { tag: 'Warm neutral' }),
            productCard(P.sl_navy, { tag: 'Casual smart' }),
          ];
          summary = "Heads up — slides run a touch wide. If you have narrow feet, ask me about sizing before you check out.";
        } else if (t === 'Flip flops' || (t === 'Not sure — show me both' && (u === 'Beach / pool' || u === 'Walking longer distances'))) {
          intro = u === 'Beach / pool'
            ? "Flip flops with a toe post are best for beach — sand drains out, no straps to soak."
            : "Flip flops with the toe-post strap give you the most secure fit for walking.";
          recs = g === "Women's"
            ? [
                productCard(P.ff_classic_pink, { tag: 'Bestseller (W)' }),
                productCard(P.ff_classic_tan, { tag: 'Goes with everything' }),
                productCard(P.ff_crystal_pink, { tag: 'Crystal line' }),
              ]
            : [
                productCard(P.ff_classic_black, { tag: 'Bestseller (M)' }),
                productCard(P.ff_classic_navy, { tag: 'Smart-casual' }),
                productCard(P.ff_classic_olive, { tag: 'Earthy' }),
              ];
          summary = "Flip flops run snug — most people size up by one (e.g. if you're usually a 10, go 11).";
        } else {
          intro = "Showing one of each — flip flop with toe post, slide with the wide strap.";
          recs = [
            productCard(P.ff_classic_black, { tag: 'Flip flop' }),
            productCard(P.sl_black, { tag: 'Slide' }),
            productCard(P.socks_crew_black, { tag: 'Pair with slides' }),
          ];
          summary = "Different sizing rules: flip flops run snug (size up), slides run wide (narrow feet size down).";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },

    // FLOW 2 — Find my size (PDP, above ATC, on flip flop and slide PDPs)
    'size-finder': {
      // Per-page context is set on the trigger via data-product-type:
      //   data-product-type="Flip Flops" or "Slides"
      greeting: "Let's get the size right. Three quick questions and I'll give you a confident pick.",
      steps: [
        {
          type: 'single',
          options: ["Men's", "Women's"],
          key: 'gender',
        },
        {
          type: 'single',
          prompt: a => `What size do you usually wear in another brand of ${a._productType === 'Slides' ? 'sandal or sneaker' : 'flip flop or sneaker'}?`,
          options: a => {
            const opts = a.gender === "Men's"
              ? ['M 5', 'M 6', 'M 7', 'M 8', 'M 9', 'M 10', 'M 11', 'M 12', 'M 13']
              : ['W 5', 'W 6', 'W 7', 'W 8', 'W 9', 'W 10', 'W 11', 'W 12', 'W 13'];
            return opts;
          },
          key: 'baseSize',
        },
        {
          type: 'single',
          prompt: () => "Last one — how do your feet run?",
          options: ['Narrow', 'Regular', 'Wide'],
          key: 'width',
        },
      ],
      recommend: answers => {
        const isSlide = answers._productType === 'Slides';
        const g = answers.gender;
        const baseIdx = (BASE_BY_GENDER[g] || {})[answers.baseSize];
        const width = answers.width;

        let recIdx = baseIdx;
        let intro = '';
        let summary = '';
        const reasons = [];

        if (typeof recIdx !== 'number') {
          // Fallback if mapping fails
          recIdx = g === "Men's" ? 5 : 4;
          reasons.push("rough match from the size you gave me");
        }

        if (isSlide) {
          // Slides run wide. Narrow feet → -1. Wide feet → as-is.
          if (width === 'Narrow') {
            recIdx = Math.max(0, recIdx - 1);
            reasons.push('slides run wide so narrow feet should size down by one');
          } else if (width === 'Regular') {
            reasons.push('your usual size is the right call here');
          } else {
            reasons.push('slides run wide which works in your favour at your usual size');
          }
        } else {
          // Flip flops run snug. Most people size up by 1. Wide feet → +2.
          if (width === 'Wide') {
            recIdx = Math.min(11, recIdx + 2);
            reasons.push('flip flops run snug and wide feet need extra room — size up by two');
          } else {
            recIdx = Math.min(11, recIdx + 1);
            reasons.push('flip flops run snug — most people size up by one');
          }
        }

        const recommendedVariant = variantForGender(recIdx, g);
        const altUp = variantForGender(Math.min(11, recIdx + 1), g);
        const altDown = variantForGender(Math.max(0, recIdx - 1), g);

        intro = `Go with **${recommendedVariant}**.`;
        summary = `Why: ${reasons.join('; ')}. If between sizes, try ${altDown} or ${altUp} — the variants are 1 US size apart.`;

        // Pick a representative product card from the same product type
        const exemplar = isSlide
          ? P.sl_black
          : (g === "Women's" ? P.ff_classic_pink : P.ff_classic_black);
        const recs = [
          productCard(exemplar, {
            tag: `Recommended size: ${recommendedVariant}`,
            meta: `$${exemplar.price} · in stock`,
          }),
        ];

        // For very narrow + slide, suggest sock combo as a second rec.
        if (isSlide && width === 'Narrow') {
          recs.push(productCard(P.socks_crew_black, {
            tag: 'Tighten the fit',
            meta: '$20 · made for slides — locks the foot in place',
          }));
        }

        return { intro, recs, summary };
      },
    },

    // FLOW 3 — Convert international size (PDP, below ATC, flip flop only in this prototype)
    'intl-size': {
      greeting: "AU, UK, EU, or somewhere else? Tell me your home sizing and I'll convert to US.",
      steps: [
        {
          type: 'single',
          options: ['AU', 'UK', 'EU'],
          key: 'system',
        },
        {
          type: 'single',
          prompt: () => "Are you shopping Men's or Women's?",
          options: ["Men's", "Women's"],
          key: 'gender',
        },
        {
          type: 'single',
          prompt: a => `What's your usual size in ${a.system}?`,
          options: a => {
            if (a.system === 'EU') {
              return a.gender === "Women's"
                ? ['35', '36', '37', '38', '39', '40', '41', '42']
                : ['38', '39', '40', '41', '42', '43', '44', '45'];
            }
            return a.gender === "Women's"
              ? ['4', '5', '6', '7', '8', '9', '10', '11']
              : ['5', '6', '7', '8', '9', '10', '11', '12'];
          },
          key: 'size',
        },
      ],
      recommend: answers => {
        const sys = answers.system;
        const g = answers.gender;
        const usNum = convertIntlToUs(sys, g, answers.size);
        const isSlide = answers._productType === 'Slides';

        let intro, summary;
        let recs = [];

        if (!usNum) {
          intro = "I couldn't match that one cleanly.";
          summary = "Reach out to support and they'll handle it 1:1.";
        } else {
          // Build the paired variant string. usNum is the US number for the gender chosen.
          const idx = g === "Men's" ? Math.max(0, usNum - 4) : Math.max(0, usNum - 5);
          const baseVariant = variantForGender(idx, g);

          // Apply the snug-up rule for flip flops (default +1 for regular feet).
          const finalIdx = isSlide ? idx : Math.min(11, idx + 1);
          const finalVariant = variantForGender(finalIdx, g);

          if (isSlide) {
            intro = `Your ${sys} size ${answers.size} maps to **${finalVariant}**.`;
            summary = `Slides run a touch wide, so this is the call for a regular foot. If you have narrow feet, drop one size to ${variantForGender(Math.max(0, idx - 1), g)}.`;
          } else {
            intro = `Your ${sys} size ${answers.size} maps to ${baseVariant} — but Archies flip flops run snug, so go **${finalVariant}**.`;
            summary = "Flip flops: size up by one from the converted US size. Wide feet, size up by two.";
          }

          const exemplar = isSlide
            ? P.sl_black
            : (g === "Women's" ? P.ff_classic_pink : P.ff_classic_black);
          recs.push(productCard(exemplar, {
            tag: `Recommended size: ${finalVariant}`,
            meta: `$${exemplar.price} · in stock`,
          }));
        }

        return { intro, recs, summary };
      },
    },

    // FLOW 4 — Will these slides fit narrow feet? (slides PDP, below ATC)
    'slide-fit': {
      greeting: "Slides run wide — let me check whether they'll work for you.",
      steps: [
        {
          type: 'single',
          options: ['Narrow', 'Regular', 'Wide'],
          key: 'width',
        },
        {
          type: 'single',
          prompt: () => "Have you owned Archies slides before?",
          options: ['Yes — they ran loose', 'Yes — they fit fine', 'No, first time'],
          key: 'history',
        },
        {
          type: 'single',
          prompt: () => "Where will you wear them most?",
          options: ['Around the house', 'Walking longer distances', 'Post-shower / pool', 'Post-workout / recovery'],
          key: 'usage',
        },
      ],
      recommend: answers => {
        const width = answers.width;
        const history = answers.history;

        let intro = '';
        let summary = '';
        let recs = [];

        if (width === 'Narrow' || history === 'Yes — they ran loose') {
          intro = "Honest answer: slides will probably feel loose for you. Two things help.";
          recs = [
            productCard(P.sl_black, {
              tag: 'Size down by one',
              meta: 'Drop one size from your usual — narrow foot fix #1',
            }),
            productCard(P.socks_crew_black, {
              tag: 'Pair with',
              meta: '$20 · made for slides, locks the foot',
            }),
            productCard(P.ff_classic_black, {
              tag: 'Or pivot',
              meta: '$40 · flip flop with toe post is more secure',
            }),
          ];
          summary = "If size-down + sock still feels loose, the flip flops with the toe-post strap are the more reliable pick for narrow feet.";
        } else if (width === 'Wide') {
          intro = "Wide feet are exactly who slides are made for. Stay at your usual size.";
          recs = [
            productCard(P.sl_black, { tag: 'Best fit', meta: 'Wide-friendly construction' }),
          ];
          summary = "Slides run wide, so if you've had to size up in flip flops or sneakers for width, you won't need to here.";
        } else {
          intro = "Regular foot, slides will fit at your usual size — no adjustment needed.";
          recs = [
            productCard(P.sl_black, { tag: 'Best fit' }),
          ];
          summary = "If you're between sizes, go down — slides break in slightly with wear.";
        }

        return { intro, recs: recs.filter(Boolean).slice(0, 3), summary };
      },
    },
  };

  // ---------- Panel rendering (identical to Koh) ----------

  function ensurePanel() {
    if (document.querySelector('.chat-panel')) return;
    const overlay = document.createElement('div');
    overlay.className = 'chat-overlay';
    overlay.addEventListener('click', closePanel);

    const panel = document.createElement('aside');
    panel.className = 'chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Archies Helper');
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header__brand">
          <div class="chat-header__avatar">A</div>
          <div>
            <p class="chat-header__title">Archies Fit Guide</p>
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
        <p class="chat-footer__legal">Powered by Archies · Doctor-recommended arch support.</p>
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
  function clearBody() { document.getElementById('chat-body').innerHTML = ''; }
  function scroll() {
    const body = document.getElementById('chat-body');
    body.scrollTop = body.scrollHeight;
  }
  function addAgentMsg(text) {
    const body = document.getElementById('chat-body');
    const el = document.createElement('div');
    el.className = 'msg msg--agent';
    el.innerHTML = `<div class="msg__avatar">A</div><div class="msg__bubble"></div>`;
    // Allow simple **bold** markdown
    el.querySelector('.msg__bubble').innerHTML = String(text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
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
    el.innerHTML = `<div class="msg__avatar">A</div><div class="typing-bubble"><span></span><span></span><span></span></div>`;
    body.appendChild(el);
    scroll();
    return el;
  }
  function addTypingThen(fn, delay) {
    delay = delay || 700;
    const t = addTyping();
    setTimeout(() => { t.remove(); fn(); }, delay);
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
      (recs || []).forEach(r => {
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
        sum.innerHTML = String(summary)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
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
        runFlow(currentFlowKey, currentContext);
      });
      followup.appendChild(startOver);
      body.appendChild(followup);
      scroll();
    }, 300);
  }

  // ---------- Flow runner ----------

  let currentFlowKey = null;
  let currentContext = {};

  function runFlow(flowKey, context) {
    currentFlowKey = flowKey;
    currentContext = context || {};
    const flow = flows[flowKey];
    if (!flow) {
      addAgentMsg("Hmm, something went wrong. Try a different option.");
      return;
    }
    const answers = Object.assign({}, currentContext); // seeds with _productType etc.

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

  function startChat(flowKey, context) {
    ensurePanel();
    clearBody();
    openPanel();
    runFlow(flowKey, context);
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-trigger]');
    if (trigger) {
      e.preventDefault();
      const flowKey = trigger.getAttribute('data-trigger');
      const productType = trigger.getAttribute('data-product-type'); // optional, used by size-finder/intl-size
      const ctx = {};
      if (productType) ctx._productType = productType;
      startChat(flowKey, ctx);
    }
  });

  window.ArchiesChat = { startChat, openPanel, closePanel };
})();
