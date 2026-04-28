// 1st Phorm Shopping Triggers — fake chat panel
// Script-driven discovery flows. No backend. No LLM.

(function () {
  const data = window.PHORM_DATA || { products: {}, apparel: [] };
  const P = data.products;
  const A = data.apparel;

  // === Helpers to build product cards from real catalog data ===

  function findApparel(titleSubstr) {
    return A.find(p => p.title.toLowerCase().includes(titleSubstr.toLowerCase()));
  }

  function flavorImage(level1, flavorName) {
    if (!level1) return null;
    const slug = flavorName.toLowerCase().replace(/[^a-z]+/g, '-');
    const match = level1.images.find(src => src.toLowerCase().includes(slug));
    return match || level1.images[0];
  }

  function productCard(product, opts) {
    opts = opts || {};
    if (!product) return null;
    return {
      title: opts.titleOverride || product.title,
      tag: opts.tag || product.product_type,
      meta: opts.meta || (product.variants[0] ? `$${product.variants[0].price}` : ''),
      image: opts.image || product.images[0],
      price: product.variants[0] ? product.variants[0].price : '',
      handle: product.handle,
    };
  }

  // === The 4 scripted flows ===

  const flows = {
    // FLOW 1 — Build my stack (homepage)
    'build-stack': {
      greeting: "Hey, I'm your 1st Phorm Athlete Assistant. Let's find what fits your goal. What are you working on right now?",
      steps: [
        {
          type: 'single',
          options: ['Build muscle', 'Lose weight', 'Endurance', 'Cognition', 'Daily health'],
          key: 'goal',
        },
        {
          type: 'single',
          prompt: a => `${a.goal === 'Build muscle' ? 'Solid choice — protein and recovery first.' : a.goal === 'Lose weight' ? 'Got it — we lean on protein and metabolism support.' : a.goal === 'Endurance' ? 'Endurance crowd — we cover hydration and cellular fuel.' : a.goal === 'Cognition' ? 'Brain stack incoming.' : 'Daily health — foundation first.'} Where are you at today?`,
          options: ['New to supplements', 'Have the basics', 'Dialed in, looking to optimize'],
          key: 'experience',
        },
        {
          type: 'single',
          prompt: () => "One last thing. Any dietary preferences I should keep in mind?",
          options: ['Standard', 'Vegan', 'Bariatric / lower carb', 'Lactose-sensitive'],
          key: 'diet',
        },
      ],
      recommend: answers => {
        const goal = answers.goal;
        const exp = answers.experience;

        let intro = `Here's the stack I'd build for "${goal}" given you said "${exp}":`;
        let recs = [];
        let summary = '';

        if (goal === 'Build muscle') {
          recs = [
            productCard(P.level1, { tag: 'Protein', meta: '5lb · 16 flavors · $59.99' }),
            productCard(P.micro_factor, { tag: 'Multivitamin', meta: 'Daily foundation · $69.99' }),
            productCard(P.creatine, { tag: 'Performance', meta: 'Strength + size · $39.99' }),
          ];
          summary = "Pair Level-1 post-workout, Micro Factor with breakfast, creatine any time. Consistency beats dose.";
        } else if (goal === 'Lose weight') {
          const stack = answers.diet === 'Vegan' ? P.opti_greens : P.wl_men_stack;
          recs = [
            productCard(P.level1, { tag: 'Protein', meta: 'Hunger control · $59.99' }),
            productCard(P.gda, { tag: 'Carb partition', meta: 'With meals · $44.99' }),
            productCard(stack || P.opti_health, { tag: 'Stack', meta: 'Full protocol' }),
          ];
          summary = "Protein keeps you full, GDA helps your body use carbs better, stack gives you the full protocol.";
        } else if (goal === 'Endurance') {
          recs = [
            productCard(P.project1, { tag: 'Pre-workout', meta: 'Endurance formula · $56.99' }),
            productCard(P.opti_greens, { tag: 'Daily greens', meta: 'Recovery · $69.99' }),
            productCard(P.collagen, { tag: 'Joint support', meta: '6 flavors · $59.99' }),
          ];
          summary = "Project-1 30 min before training, Opti-Greens any time, Collagen daily for joints and connective tissue.";
        } else if (goal === 'Cognition') {
          recs = [
            productCard(P.cognition_stack, { tag: 'Stack', meta: 'AM + PM brain · $79.99' }),
            productCard(P.masterbrain, { tag: 'Focus', meta: 'AM dose · $51.99' }),
            productCard(P.phorm_energy, { tag: 'Clean energy', meta: '12-pack · $32.99' }),
          ];
          summary = "Cognition Stack is the backbone. MasterBrain AM if you only want one. Phorm Energy is the kick when you need it.";
        } else {
          recs = [
            productCard(P.foundation_stack, { tag: 'Stack', meta: 'Foundation · $130' }),
            productCard(P.micro_factor, { tag: 'Multivitamin', meta: 'Daily · $69.99' }),
            productCard(P.opti_greens, { tag: 'Greens', meta: 'Daily · $69.99' }),
          ];
          summary = "Foundation Health Stack covers your bases. Micro Factor + Opti-Greens are the workhorses.";
        }

        if (exp === 'New to supplements') {
          summary += ' Start with the first one for 2 weeks before adding the others.';
        }

        return { intro, recs: recs.filter(Boolean), summary };
      },
    },

    // FLOW 2 — Can I take this with what I'm already on? (PDP, Level-1)
    'stacking': {
      greeting: "Got it — checking compatibility with Level-1 protein. What's already in your stack?",
      steps: [
        {
          type: 'multi',
          options: ['Micro Factor', 'M-Factor', 'Project-1 pre-workout', 'Creatine', 'BCAA', 'GDA', 'Adrenal Restore', 'Other'],
          key: 'current_stack',
          confirmLabel: 'That\'s my stack',
        },
        {
          type: 'single',
          prompt: () => "When do you usually take Level-1?",
          options: ['Post-workout', 'In the morning', 'Throughout the day', 'Before bed'],
          key: 'timing',
        },
        {
          type: 'single',
          prompt: () => "Any flags I should know about?",
          options: ['On prescription meds', 'Sensitive to caffeine', 'Lactose-sensitive', 'None'],
          key: 'flags',
        },
      ],
      recommend: answers => {
        const stack = answers.current_stack || [];
        const timing = answers.timing;
        const flag = answers.flags;

        let intro = `Level-1 stacks well with what you've got. Here's how I'd time it.`;
        const notes = [];

        if (stack.includes('Project-1 pre-workout')) {
          notes.push('Project-1 30 min before training, Level-1 within 30 min after — that\'s the protein window.');
        }
        if (stack.includes('Creatine')) {
          notes.push('Drop your creatine into the Level-1 shake post-workout, no separate dose needed.');
        }
        if (stack.includes('Micro Factor') || stack.includes('M-Factor')) {
          notes.push('Take your multivitamin with a meal, not in the protein shake (better absorption).');
        }
        if (flag === 'Lactose-sensitive') {
          notes.push('Heads up: Level-1 is whey-based. If you bloat, look at Vegan Level-1 or our plant alternatives.');
        }
        if (flag === 'Sensitive to caffeine') {
          notes.push('Level-1 has zero caffeine, you\'re fine.');
        }
        if (notes.length === 0) {
          notes.push('No conflicts. Take Level-1 ' + (timing === 'Post-workout' ? 'within 30 min after training' : timing === 'Before bed' ? '30 min before sleep — slow-digesting whey is great for overnight recovery' : 'as a snack between meals to hit your protein target') + '.');
        }

        const recs = [
          productCard(P.level1, { tag: 'You\'re viewing', meta: 'Continue with this' }),
        ];
        if (!stack.includes('Micro Factor') && !stack.includes('M-Factor')) {
          recs.push(productCard(P.micro_factor, { tag: 'Add to stack', meta: 'Multivitamin · $69.99' }));
        }
        if (!stack.includes('Creatine')) {
          recs.push(productCard(P.creatine, { tag: 'Worth adding', meta: 'Mixes in your shake · $39.99' }));
        }

        return {
          intro,
          recs: recs.filter(Boolean).slice(0, 3),
          summary: notes.join(' '),
        };
      },
    },

    // FLOW 3 — Find your flavor (PDP, Level-1)
    'flavor-match': {
      greeting: "16 flavors is a lot — let's narrow it down. Which flavor profile do you usually love?",
      steps: [
        {
          type: 'single',
          options: ['Sweet / dessert-like', 'Fruity', 'Coffee or mocha', 'Classic vanilla or chocolate', 'Earthy / clean'],
          key: 'profile',
        },
        {
          type: 'single',
          prompt: () => "How do you usually drink your protein?",
          options: ['Mixed with milk', 'Mixed with water', 'Blended in a shake', 'In oatmeal or baking'],
          key: 'mix',
        },
        {
          type: 'single',
          prompt: () => "Anything you usually don't like?",
          options: ['Banana', 'Coffee', 'Artificial sweeteners', 'Nothing in particular'],
          key: 'avoid',
        },
      ],
      recommend: answers => {
        const profile = answers.profile;
        const mix = answers.mix;
        const avoid = answers.avoid;

        let picks = [];
        let intro = '';

        if (profile === 'Sweet / dessert-like') {
          picks = ['Birthday Cake', 'Iced Oatmeal Cookie', 'Peppermint Bark'];
          intro = "Dessert-lover detected. These are the sweet end of the lineup:";
        } else if (profile === 'Fruity') {
          picks = ['Strawberry Milkshake', 'Blueberry Muffin', 'Birthday Cake'];
          intro = "Fruity profiles — these are the closest in our line:";
        } else if (profile === 'Coffee or mocha') {
          picks = ['Caramel Latte', 'Milk Chocolate', 'Iced Oatmeal Cookie'];
          intro = "Coffee crowd. Caramel Latte is the obvious pick — but here's the full short list:";
        } else if (profile === 'Classic vanilla or chocolate') {
          picks = ['Milk Chocolate', 'Vanilla Ice Cream', 'Salted Peanut Butter'];
          intro = "Classics never miss. Top three from the lineup:";
        } else {
          picks = ['Vanilla Natural', 'Chocolate Natural', 'Salted Peanut Butter'];
          intro = "Clean profile, no artificial sweeteners. The Natural line is built for you:";
        }

        if (avoid === 'Artificial sweeteners') {
          picks = ['Vanilla Natural', 'Chocolate Natural', picks.find(f => !['Birthday Cake'].includes(f)) || 'Salted Peanut Butter'];
          intro = "Sticking to clean — go with the Natural line. No artificial sweeteners, just stevia and monk fruit:";
        }
        if (avoid === 'Coffee') {
          picks = picks.filter(f => f !== 'Caramel Latte');
        }

        // Ensure 3 unique picks
        picks = [...new Set(picks)].slice(0, 3);

        const recs = picks.map(flavor => ({
          title: 'Level-1 — ' + flavor,
          tag: 'Top match',
          meta: '5lb · $59.99' + (mix === 'Mixed with water' && flavor.includes('Natural') ? ' · mixes well in water' : ''),
          image: flavorImage(P.level1, flavor),
          price: '59.99',
          handle: 'level-1',
        }));

        // Replace tag for #2 and #3
        if (recs[1]) recs[1].tag = 'Also try';
        if (recs[2]) recs[2].tag = 'Also try';

        return {
          intro,
          recs,
          summary: "Top match is the first one. If you're between two, grab the Variety Pack — Level-1 also comes in protein bars in the same flavors.",
        };
      },
    },

    // FLOW 4 — Find my fit (apparel collection)
    'find-fit': {
      greeting: "Quick fit check — I'll get you in the right gear in 3 questions. What are you shopping for?",
      steps: [
        {
          type: 'single',
          options: ['Tops / tees', 'Bottoms / shorts', 'Hoodies / outerwear', 'Sports bras', 'Leggings'],
          key: 'category',
        },
        {
          type: 'single',
          prompt: () => "What's your usual size in athletic wear?",
          options: ['XS', 'Small', 'Medium', 'Large', 'XL', '2XL', 'Between sizes'],
          key: 'size',
        },
        {
          type: 'single',
          prompt: () => "What's the use case?",
          options: ['Heavy lifting', 'Running', 'Everyday wear', 'Lounge / recovery'],
          key: 'use',
        },
      ],
      recommend: answers => {
        const cat = answers.category;
        const size = answers.size;
        const use = answers.use;

        let picks = [];
        let intro = '';

        if (cat === 'Tops / tees') {
          picks = ['Fortify Tee', 'Classic Crest Tee', 'Tempo Tank'];
          intro = "Tops in your size — these run true to size with stretch built in:";
        } else if (cat === 'Bottoms / shorts') {
          picks = ['Collegiate Cloud Fleece Short - Mid', 'Collegiate Cloud Fleece Short - Long', 'Terry Sweat Pant'];
          intro = "Bottoms — these are the lifter favorites, stretch in the gusset:";
        } else if (cat === 'Hoodies / outerwear') {
          picks = ['Collegiate Fleece Zip Hoodie', 'American Crest Hoodie', 'Classic Cropped Crew Sweatshirt'];
          intro = "Hoodies built for cold mornings or post-lift recovery:";
        } else if (cat === 'Sports bras') {
          picks = ['Forme Seamless Bra', 'Axel Bra'];
          intro = "Bras that hold up under heavy training:";
        } else {
          picks = ['Luxe Flare Legging', 'Forme Seamless Scrunch Legging'];
          intro = "Leggings — both run true to size, Luxe Flare has more compression:";
        }

        const recs = picks.map((title, i) => {
          const product = findApparel(title);
          if (!product) return null;
          return productCard(product, {
            tag: i === 0 ? 'Best fit' : 'Also great',
            meta: `${size === 'Between sizes' ? 'Size up — ' : ''}Size ${size === 'Between sizes' ? 'guide ↓' : size} · $${product.variants[0].price}`,
          });
        }).filter(Boolean);

        let summary = '';
        if (size === 'Between sizes') {
          summary = "Tip: most of our gear has a fitted cut. If you're between sizes and you lift, size up. If you're going for that tapered look, size down.";
        } else if (use === 'Heavy lifting') {
          summary = "All of these stretch in the right places for squats and pulls. The Fortify line is reinforced at the seams.";
        } else if (use === 'Running') {
          summary = "Lightest weight options are the tanks and the Cloud Fleece Short Mid — wicks and dries fast.";
        } else {
          summary = "Free returns on all gear up to 30 days, swap sizes if anything's off.";
        }

        return { intro, recs: recs.slice(0, 3), summary };
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
    panel.setAttribute('aria-label', '1st Phorm Athlete Assistant');
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header__brand">
          <div class="chat-header__avatar">1P</div>
          <div>
            <p class="chat-header__title">Athlete Assistant</p>
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
        <p class="chat-footer__legal">Powered by 1st Phorm · <a href="#" style="color:inherit;text-decoration:underline">Privacy</a></p>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    panel.querySelector('.chat-header__close').addEventListener('click', closePanel);
    panel.querySelector('#chat-input-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = e.target.querySelector('input');
      if (!input.value.trim()) return;
      // For prototype: type-anything just nudges the user back to chips
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
      <div class="msg__avatar">1P</div>
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
      <div class="msg__avatar">1P</div>
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
      // Done — show recs
      addTypingThen(() => {
        const result = flow.recommend(answers);
        addRecCards(result.intro, result.recs, result.summary);
      }, 900);
      return;
    }

    const showPrompt = () => {
      if (idx === 0) {
        // greeting already covers prompt for step 0
        addChips(step.options, picked => onPicked(picked), step.type === 'multi', step.confirmLabel);
      } else {
        addTypingThen(() => {
          addAgentMsg(typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt);
          addChips(step.options, picked => onPicked(picked), step.type === 'multi', step.confirmLabel);
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

  // === Toast ===

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

  // === Public entry point ===

  function startChat(flowKey) {
    ensurePanel();
    clearBody();
    openPanel();
    runFlow(flowKey);
  }

  // Wire up all elements with data-trigger
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-trigger]');
    if (trigger) {
      e.preventDefault();
      const flowKey = trigger.getAttribute('data-trigger');
      startChat(flowKey);
    }
  });

  // Expose globally for any custom callers
  window.PhormChat = { startChat, openPanel, closePanel };
})();
