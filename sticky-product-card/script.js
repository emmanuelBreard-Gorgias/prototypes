/* ============================================================
   Sticky Product Card — Variant Comparison Prototype
   Vanilla JS. No dependencies.

   Architecture:
   - PRODUCTS: catalog
   - SCRIPT: ordered list of 7 paired steps (customer + agent turn)
   - State: { variant, stepIndex, focused_product_id, recent_products[],
              v2Expanded, v3DismissedIds }
   - Renderers: renderBanner(variant, state), renderMessages(stepIndex)
   - Driver: stepForward(), reset(), setVariant()
   ============================================================ */

// ---------- Catalog ---------------------------------------------------------

const PRODUCTS = {
  'trailhead-2p': {
    id: 'trailhead-2p',
    title: 'Trailhead 2P Tent',
    price: '$289',
    compareAt: '$329',
    onSale: true,
    glyph: '🏕️',
    bg: 'linear-gradient(135deg, #3a7a4c 0%, #1d4d3c 100%)',
  },
  'summit-dome-2p': {
    id: 'summit-dome-2p',
    title: 'Summit Dome 2P Tent',
    price: '$349',
    glyph: '⛺',
    bg: 'linear-gradient(135deg, #d97a3a 0%, #a8551f 100%)',
  },
  'cocoon-20f': {
    id: 'cocoon-20f',
    title: 'Cocoon 20°F Sleeping Bag',
    price: '$179',
    glyph: '🛌',
    bg: 'linear-gradient(135deg, #2f4d7e 0%, #1b2f56 100%)',
  },
  'nimbus-30f': {
    id: 'nimbus-30f',
    title: 'Nimbus 30°F Sleeping Bag',
    price: '$129',
    glyph: '😴',
    bg: 'linear-gradient(135deg, #3a8a8f 0%, #1f5a5f 100%)',
  },
  'embers-stove': {
    id: 'embers-stove',
    title: 'Embers Camp Stove',
    price: '$89',
    glyph: '🔥',
    bg: 'linear-gradient(135deg, #c0492f 0%, #8a2a1a 100%)',
  },
  'roamer-65l': {
    id: 'roamer-65l',
    title: 'Roamer 65L Pack',
    price: '$219',
    glyph: '🎒',
    bg: 'linear-gradient(135deg, #556579 0%, #2e3a48 100%)',
  },
};

// Storefront tiles (4 in the visible grid + 2 extras)
const STOREFRONT_TILES = [
  'trailhead-2p',
  'summit-dome-2p',
  'cocoon-20f',
  'nimbus-30f',
  'embers-stove',
  'roamer-65l',
];

// ---------- Scripted conversation -------------------------------------------
// 7 paired steps. Each step shows customer message + agent reply.
// Metadata describes the banner state AFTER the step completes.

const SCRIPT = [
  {
    // Step 1: broad opening
    customer: "Hi! I'm looking for gear for a camping trip this weekend.",
    agent: "Happy to help. Quick check: how many people, and are you car-camping or hiking in?",
    focused_product_id: null,
    recent_products: [],
  },
  {
    // Step 2: narrowing (tent need surfaces, recs shown)
    customer: "Two people, car camping. We mostly need a tent.",
    agent: "Here are two tents we recommend for couples car-camping.",
    agentProducts: ['trailhead-2p', 'summit-dome-2p'],
    focused_product_id: null,
    recent_products: [],
  },
  {
    // Step 3: focus on Product A — banner appears
    customer: "Tell me more about the Trailhead 2P.",
    agent: "The Trailhead 2P sleeps two comfortably with a small vestibule for boots and a backpack. 4.2 kg packed weight.",
    focused_product_id: 'trailhead-2p',
    recent_products: ['trailhead-2p'],
  },
  {
    // Step 4: continued focus — banner persists, no in-message card
    customer: "Is it waterproof? And how does it pack down?",
    agent: "Yes, 3000mm waterproof rating on the fly, taped seams. Packs to 18 × 50 cm, fits inside most trunks easily.",
    focused_product_id: 'trailhead-2p',
    recent_products: ['trailhead-2p'],
  },
  {
    // Step 5: switch to Product B — banner swaps (V1/V2) / adds (V3)
    customer: "Hmm, what about the Summit Dome 2P? How is it different?",
    agent: "Summit Dome is lighter (3.4 kg) and has two doors so you don't climb over your tent partner. Slightly smaller floor area.",
    focused_product_id: 'summit-dome-2p',
    recent_products: ['summit-dome-2p', 'trailhead-2p'],
  },
  {
    // Step 6: broad shift to sleeping bags — banner drops (V1/V2), stays (V3)
    customer: "Cool. Switching gears, do you have sleeping bags too?",
    agent: "Yes, here are two we'd suggest for car camping in spring conditions.",
    agentProducts: ['cocoon-20f', 'nimbus-30f'],
    focused_product_id: null,
    recent_products: ['summit-dome-2p', 'trailhead-2p'],
  },
  {
    // Step 7: re-focus on Sleeping Bag Z — banner reappears (V1/V2) / 3rd item (V3)
    customer: "I'll go with the Cocoon 20°F.",
    agent: "Great choice. Want me to add it to your cart with the Trailhead 2P?",
    focused_product_id: 'cocoon-20f',
    recent_products: ['cocoon-20f', 'summit-dome-2p', 'trailhead-2p'],
  },
];

const TOTAL_STEPS = SCRIPT.length;

// ---------- State -----------------------------------------------------------

const state = {
  variant: 'v1',
  stepIndex: 0, // 0 = nothing shown yet
  v2Expanded: false, // per-active-product expand state
  v2ExpandedForProductId: null, // resets when active product changes
  v3DismissedIds: new Set(), // products explicitly dismissed by user in V3
  cartCount: 0,
  isStepping: false, // guards against double-clicks
};

// ---------- DOM refs --------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const refs = {
  storeGrid: $('#store-grid'),
  cartCount: $('#cart-count'),
  cartBtn: $('.store-cart'),
  storeToast: $('#store-toast'),
  bannerZone: $('#banner-zone'),
  messages: $('#messages'),
  stepBtn: $('#step-btn'),
  resetBtn: $('#reset-btn'),
  stepCounter: $('#step-counter'),
  conversation: $('#chat-conversation'),
  segments: $$('.proto-seg'),
  dbgStep: $('#dbg-step'),
  dbgFocused: $('#dbg-focused'),
  dbgRecent: $('#dbg-recent'),
};

// ---------- Storefront rendering --------------------------------------------

function renderStorefront() {
  refs.storeGrid.innerHTML = STOREFRONT_TILES.map((id) => {
    const p = PRODUCTS[id];
    const saleHtml = p.onSale
      ? `<span class="store-tile__price-compare">${p.compareAt}</span><span class="store-tile__sale">SALE</span>`
      : '';
    return `
      <a class="store-tile" data-product-id="${p.id}" href="#" onclick="return false;">
        <div class="store-tile__image" style="background:${p.bg};">${p.glyph}</div>
        <div class="store-tile__body">
          <div class="store-tile__title">${p.title}</div>
          <div class="store-tile__meta">
            <span>${p.price}</span>
            ${saleHtml}
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function flashStoreTile(productId) {
  const tile = refs.storeGrid.querySelector(`[data-product-id="${productId}"]`);
  if (!tile) return;
  tile.classList.add('is-highlighted');
  tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => tile.classList.remove('is-highlighted'), 1200);
}

function incrementCart(productTitle) {
  state.cartCount += 1;
  refs.cartCount.textContent = `Cart (${state.cartCount})`;
  refs.cartBtn.classList.remove('is-bumped');
  void refs.cartBtn.offsetWidth; // restart animation
  refs.cartBtn.classList.add('is-bumped');

  refs.storeToast.textContent = `Added to cart: ${productTitle}`;
  refs.storeToast.classList.add('is-visible');
  clearTimeout(refs.storeToast._t);
  refs.storeToast._t = setTimeout(() => {
    refs.storeToast.classList.remove('is-visible');
  }, 2000);
}

// ---------- Banner rendering ------------------------------------------------

function currentMetadata() {
  if (state.stepIndex === 0) {
    return { focused_product_id: null, recent_products: [] };
  }
  return SCRIPT[state.stepIndex - 1];
}

function activeBannerProductIds() {
  const meta = currentMetadata();

  if (state.variant === 'v3') {
    // V3 uses the recent_products list, filtered by user dismissals
    return meta.recent_products.filter((id) => !state.v3DismissedIds.has(id));
  }

  // V1 / V2: single product driven by focused_product_id
  return meta.focused_product_id ? [meta.focused_product_id] : [];
}

function svgPlus() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/><circle cx="18" cy="6" r="3.5" fill="currentColor" stroke="none" opacity="0"/></svg>`;
}

function svgCartPlus() {
  // simple cart + plus glyph, matching shopper-uikit AddShoppingCart spirit
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="20" r="1.5"/>
    <circle cx="17" cy="20" r="1.5"/>
    <path d="M3 4h2l2.5 11h11l2.5-8H6"/>
    <line x1="14" y1="8.5" x2="18" y2="8.5"/>
    <line x1="16" y1="6.5" x2="16" y2="10.5"/>
  </svg>`;
}

function svgChevronDown() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>`;
}

function svgX() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>`;
}

function svgArrowRight() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
}

function bannerImgHtml(product, sizeClass = '') {
  return `<div class="banner-img ${sizeClass}" style="background:${product.bg};"><span class="banner-img__glyph">${product.glyph}</span></div>`;
}

function bannerPriceRowHtml(product) {
  const compare = product.onSale ? `<span class="banner-compare">${product.compareAt}</span>` : '';
  return `<div class="banner-price-row">${compare}<span class="banner-price">${product.price}</span></div>`;
}

function renderV1(productId) {
  const p = PRODUCTS[productId];
  return `
    <div class="banner banner--v1" data-product-id="${p.id}" role="region" aria-label="Pinned product: ${p.title}">
      ${bannerImgHtml(p)}
      <div class="banner-content">
        <div class="banner-pinned-label">Pinned</div>
        <div class="banner-title">${p.title}</div>
        ${bannerPriceRowHtml(p)}
      </div>
      <button class="banner-add-btn" data-add-product="${p.id}" aria-label="Add ${p.title} to cart">
        ${svgCartPlus()}
      </button>
    </div>
  `;
}

function renderV2(productId) {
  const p = PRODUCTS[productId];
  const isExpanded = state.v2Expanded && state.v2ExpandedForProductId === p.id;
  const expandedClass = isExpanded ? ' is-open' : '';
  return `
    <div class="banner banner--v2" data-product-id="${p.id}" role="region" aria-label="Pinned product: ${p.title}">
      <div class="banner-row" data-v2-toggle>
        ${bannerImgHtml(p)}
        <div class="banner-content banner-content--collapsed">
          <div class="banner-pinned-label banner-pinned-label--inline">Pinned</div>
          <div class="banner-title">${p.title}</div>
        </div>
        <button class="banner-chevron${expandedClass}" aria-label="${isExpanded ? 'Collapse' : 'Expand'} details" aria-expanded="${isExpanded}">
          ${svgChevronDown()}
        </button>
        <button class="banner-add-btn" data-add-product="${p.id}" aria-label="Add ${p.title} to cart">
          ${svgCartPlus()}
        </button>
      </div>
      <div class="banner-expand${expandedClass}">
        <div class="banner-expand__inner">
          <div class="banner-expand__price">
            ${bannerPriceRowHtml(p)}
          </div>
          <a class="banner-expand__link" href="#" data-view-product="${p.id}">View product ${svgArrowRight()}</a>
        </div>
      </div>
    </div>
  `;
}

let v3ActiveIndex = 0;

function renderV3(productIds) {
  if (productIds.length === 0) return '';

  // Active index: clamp to 0 (most recent), or last known index if products unchanged.
  // Most-recent is at index 0 in recent_products (per script). We want active = 0 by default
  // so the most recent is visible.
  v3ActiveIndex = Math.min(v3ActiveIndex, productIds.length - 1);

  const slidesHtml = productIds.map((id) => {
    const p = PRODUCTS[id];
    return `
      <div class="banner-slide" data-product-id="${p.id}" role="group" aria-label="${p.title}">
        <button class="banner-slide__dismiss" data-dismiss-product="${p.id}" aria-label="Dismiss ${p.title} from pinned products">${svgX()}</button>
        ${bannerImgHtml(p)}
        <div class="banner-content">
          <div class="banner-title">${p.title}</div>
          ${bannerPriceRowHtml(p)}
        </div>
        <button class="banner-add-btn" data-add-product="${p.id}" aria-label="Add ${p.title} to cart">
          ${svgCartPlus()}
        </button>
      </div>
    `;
  }).join('');

  const dotsHtml = productIds.map((id, i) => `
    <button class="banner-dot${i === v3ActiveIndex ? ' is-active' : ''}" data-dot-index="${i}" aria-label="Go to product ${i + 1}"></button>
  `).join('');

  return `
    <div class="banner banner--v3" role="region" aria-label="Pinned products (carousel)">
      <div class="banner-carousel" id="banner-carousel">
        ${slidesHtml}
      </div>
      <div class="banner-pagination">${dotsHtml}</div>
    </div>
  `;
}

function renderBanner({ animateSwap = false } = {}) {
  const productIds = activeBannerProductIds();
  const zone = refs.bannerZone;
  const meta = currentMetadata();

  // Reset v2 expand state when active product changes
  if (state.variant === 'v2' && productIds.length > 0) {
    if (state.v2ExpandedForProductId !== productIds[0]) {
      state.v2Expanded = false;
      state.v2ExpandedForProductId = productIds[0];
    }
  }

  if (productIds.length === 0) {
    // Empty state: collapse zone
    zone.classList.remove('has-banner');
    // Remove children after transition for cleanliness
    setTimeout(() => {
      if (!zone.classList.contains('has-banner')) zone.innerHTML = '';
    }, 220);
    return;
  }

  // Has banner
  zone.classList.add('has-banner');

  let html = '';
  if (state.variant === 'v1') {
    html = renderV1(productIds[0]);
  } else if (state.variant === 'v2') {
    html = renderV2(productIds[0]);
  } else if (state.variant === 'v3') {
    html = renderV3(productIds);
  }

  if (animateSwap && zone.firstElementChild) {
    // Cross-fade swap: fade out → swap → fade in
    const existing = zone.firstElementChild;
    existing.classList.add('is-swapping');
    setTimeout(() => {
      zone.innerHTML = html;
      // Force reflow for transition
      void zone.offsetWidth;
      attachBannerHandlers();
      if (state.variant === 'v3') scrollCarouselToActive();
    }, 150);
  } else {
    zone.innerHTML = html;
    attachBannerHandlers();
    if (state.variant === 'v3') scrollCarouselToActive();
  }
}

function attachBannerHandlers() {
  // Add-to-cart buttons
  refs.bannerZone.querySelectorAll('[data-add-product]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-add-product');
      const p = PRODUCTS[id];
      btn.classList.remove('is-bumped');
      void btn.offsetWidth;
      btn.classList.add('is-bumped');
      incrementCart(p.title);
    });
  });

  // View product link (V2 expanded)
  refs.bannerZone.querySelectorAll('[data-view-product]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = link.getAttribute('data-view-product');
      flashStoreTile(id);
    });
  });

  // V2 toggle (chevron + row)
  refs.bannerZone.querySelectorAll('[data-v2-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Ignore clicks that bubbled from add-to-cart or chevron children
      if (e.target.closest('[data-add-product]')) return;
      e.stopPropagation();
      state.v2Expanded = !state.v2Expanded;
      const productId = refs.bannerZone.querySelector('.banner--v2')?.getAttribute('data-product-id');
      state.v2ExpandedForProductId = productId;
      renderBanner();
    });
  });

  // Banner body click (V1) → flash store tile
  refs.bannerZone.querySelectorAll('.banner--v1').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-product]')) return;
      const id = el.getAttribute('data-product-id');
      flashStoreTile(id);
    });
  });

  // V3 slide click → flash store tile
  refs.bannerZone.querySelectorAll('.banner-slide').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-product]') || e.target.closest('[data-dismiss-product]')) return;
      const id = el.getAttribute('data-product-id');
      flashStoreTile(id);
    });
  });

  // V3 dismiss
  refs.bannerZone.querySelectorAll('[data-dismiss-product]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-dismiss-product');
      state.v3DismissedIds.add(id);
      // Reset active index if needed
      const remaining = activeBannerProductIds();
      if (v3ActiveIndex >= remaining.length) v3ActiveIndex = Math.max(0, remaining.length - 1);
      renderBanner();
    });
  });

  // V3 pagination dots
  refs.bannerZone.querySelectorAll('[data-dot-index]').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      v3ActiveIndex = parseInt(dot.getAttribute('data-dot-index'), 10);
      scrollCarouselToActive();
      updateCarouselDots();
    });
  });

  // V3 carousel scroll → update active dot
  const carousel = refs.bannerZone.querySelector('.banner-carousel');
  if (carousel) {
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const slideWidth = carousel.firstElementChild.getBoundingClientRect().width + 8; // + gap
        const newIndex = Math.round(carousel.scrollLeft / slideWidth);
        if (newIndex !== v3ActiveIndex) {
          v3ActiveIndex = newIndex;
          updateCarouselDots();
        }
      }, 80);
    }, { passive: true });
  }
}

function scrollCarouselToActive() {
  const carousel = refs.bannerZone.querySelector('.banner-carousel');
  if (!carousel) return;
  const slide = carousel.children[v3ActiveIndex];
  if (!slide) return;
  carousel.scrollTo({ left: slide.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
}

function updateCarouselDots() {
  refs.bannerZone.querySelectorAll('.banner-dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === v3ActiveIndex);
  });
}

// ---------- Conversation rendering ------------------------------------------

function renderMessages() {
  refs.messages.innerHTML = '';

  for (let i = 0; i < state.stepIndex; i++) {
    const turn = SCRIPT[i];
    appendCustomerMessage(turn.customer, /*animated=*/false);
    appendAgentMessage(turn.agent, turn.agentProducts, /*animated=*/false);
  }

  scrollToBottom();
}

function customerMsgHtml(text) {
  return `
    <div class="msg-group">
      <div class="msg-customer">
        <div class="msg-customer__bubble">${escapeHtml(text)}</div>
      </div>
    </div>
  `;
}

function agentMsgHtml(text, productIds) {
  let productsHtml = '';
  if (productIds && productIds.length > 0) {
    productsHtml = `<div class="msg-products">
      ${productIds.map((id) => {
        const p = PRODUCTS[id];
        return `
          <div class="msg-product-card" data-product-id="${p.id}">
            <div class="msg-product-card__image" style="background:${p.bg};">
              ${p.glyph}
              <div class="msg-product-card__add">
                <button class="banner-add-btn" data-add-product="${p.id}" aria-label="Add ${p.title} to cart">
                  ${svgCartPlus()}
                </button>
              </div>
            </div>
            <div class="msg-product-card__body">
              <div class="msg-product-card__title">${p.title}</div>
              <div class="msg-product-card__price">${p.price}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>`;
  }

  return `
    <div class="msg-group">
      <div class="msg-agent">
        <div class="msg-agent__header">
          <div class="msg-agent__avatar">SA</div>
          <span>Shopping Assistant</span>
        </div>
        <div class="msg-agent__body">${escapeHtml(text)}</div>
        ${productsHtml}
      </div>
    </div>
  `;
}

function appendCustomerMessage(text) {
  refs.messages.insertAdjacentHTML('beforeend', customerMsgHtml(text));
  scrollToBottom();
}

function appendShimmer() {
  const html = `
    <div class="msg-group msg-shimmer-group">
      <div class="msg-agent">
        <div class="msg-agent__header">
          <div class="msg-agent__avatar">SA</div>
          <span>Shopping Assistant</span>
        </div>
        <div class="msg-shimmer"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
  refs.messages.insertAdjacentHTML('beforeend', html);
  scrollToBottom();
}

function removeShimmer() {
  const last = refs.messages.querySelector('.msg-shimmer-group');
  if (last) last.remove();
}

function appendAgentMessage(text, productIds) {
  refs.messages.insertAdjacentHTML('beforeend', agentMsgHtml(text, productIds));
  attachInMessageProductHandlers();
  scrollToBottom();
}

function attachInMessageProductHandlers() {
  refs.messages.querySelectorAll('.msg-product-card [data-add-product]').forEach((btn) => {
    // Avoid double-binding
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.getAttribute('data-add-product');
      btn.classList.remove('is-bumped');
      void btn.offsetWidth;
      btn.classList.add('is-bumped');
      incrementCart(PRODUCTS[id].title);
    });
  });
  refs.messages.querySelectorAll('.msg-product-card').forEach((card) => {
    if (card._bound) return;
    card._bound = true;
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-product]')) return;
      const id = card.getAttribute('data-product-id');
      flashStoreTile(id);
    });
  });
}

function scrollToBottom() {
  // Use scroll-behavior smooth on the wrapper
  refs.conversation.scrollTop = refs.conversation.scrollHeight;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Driver ----------------------------------------------------------

async function stepForward() {
  if (state.isStepping) return;
  if (state.stepIndex >= TOTAL_STEPS) {
    // Replay
    reset();
    return;
  }

  state.isStepping = true;
  refs.stepBtn.disabled = true;

  const turn = SCRIPT[state.stepIndex];
  const prevMeta = currentMetadata();

  // 1. Append customer message
  appendCustomerMessage(turn.customer);

  // 2. Wait for SA "typing"
  await sleep(450);
  appendShimmer();
  await sleep(650);
  removeShimmer();

  // 3. Append agent message + advance step
  appendAgentMessage(turn.agent, turn.agentProducts);
  state.stepIndex += 1;

  // 4. Update banner — animate cross-fade if focused product changed in V1/V2
  const newMeta = currentMetadata();
  const focusedChanged = prevMeta.focused_product_id !== newMeta.focused_product_id;
  const animateSwap = focusedChanged && (state.variant === 'v1' || state.variant === 'v2');

  // V3: if new product added, snap to it (index 0)
  if (state.variant === 'v3') {
    const prevRecent = prevMeta.recent_products;
    const newRecent = newMeta.recent_products;
    if (newRecent.length > prevRecent.length || (newRecent[0] && newRecent[0] !== prevRecent[0])) {
      v3ActiveIndex = 0;
    }
  }

  renderBanner({ animateSwap });
  updateChrome();

  state.isStepping = false;
  updateStepButton();
}

function reset() {
  state.stepIndex = 0;
  state.v2Expanded = false;
  state.v2ExpandedForProductId = null;
  state.v3DismissedIds.clear();
  v3ActiveIndex = 0;
  refs.messages.innerHTML = '';
  renderBanner();
  updateChrome();
  updateStepButton();
}

function setVariant(variant) {
  if (variant === state.variant) return;
  state.variant = variant;
  // Reset v2 state on variant change (but not v3 dismissals — they're carousel-specific)
  state.v2Expanded = false;
  state.v2ExpandedForProductId = null;
  v3ActiveIndex = 0;

  refs.segments.forEach((seg) => {
    const isActive = seg.getAttribute('data-variant') === variant;
    seg.classList.toggle('is-active', isActive);
    seg.setAttribute('aria-selected', String(isActive));
  });

  // Re-render banner instantly (no cross-fade — variant switch should be snappy)
  renderBanner();
}

function updateChrome() {
  refs.stepCounter.textContent = `Step ${state.stepIndex} / ${TOTAL_STEPS}`;
  const meta = currentMetadata();
  refs.dbgStep.textContent = state.stepIndex;
  refs.dbgFocused.textContent = meta.focused_product_id || 'null';
  refs.dbgRecent.textContent = '[' + meta.recent_products.join(', ') + ']';
}

function updateStepButton() {
  if (state.stepIndex >= TOTAL_STEPS) {
    refs.stepBtn.textContent = 'Replay';
    refs.stepBtn.setAttribute('aria-label', 'Replay conversation');
  } else {
    refs.stepBtn.textContent = 'Next step ›';
    refs.stepBtn.setAttribute('aria-label', `Advance to step ${state.stepIndex + 1}`);
  }
  refs.stepBtn.disabled = false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Wire up ---------------------------------------------------------

function init() {
  renderStorefront();
  renderBanner();
  updateChrome();
  updateStepButton();

  refs.stepBtn.addEventListener('click', stepForward);
  refs.resetBtn.addEventListener('click', reset);

  refs.segments.forEach((seg) => {
    seg.addEventListener('click', () => setVariant(seg.getAttribute('data-variant')));
  });

  // Keyboard: Space / ArrowRight = next step
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      stepForward();
    } else if (e.key === 'r' || e.key === 'R') {
      reset();
    } else if (e.key === '1') {
      setVariant('v1');
    } else if (e.key === '2') {
      setVariant('v2');
    } else if (e.key === '3') {
      setVariant('v3');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
