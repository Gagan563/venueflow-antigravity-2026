/* ============================================
   VenueFlow Food Pre-Order View
   Browse menu, add to cart, place orders
   ============================================ */

const OrderView = {
  /** @type {string} Active category filter */
  _activeCategory: 'all',

  /**
   * Render the order view
   */
  render() {
    const container = DOM.$('#view-order');
    if (!container) return;

    const cart = AppState.get('cart');
    const cartCount = AppState.getCartCount();
    const cartTotal = AppState.getCartTotal();
    const activeOrders = AppState.get('activeOrders');
    const menu = Config.menu;

    container.innerHTML = `
      <div class="page-header animate-fade-in-up">
        <h1 class="page-title">🍔 Order Food & Drinks</h1>
        <p class="page-desc">Skip the line — order from your seat</p>
      </div>

      <!-- Active Orders Banner -->
      ${activeOrders.length > 0 ? `
        <div class="card animate-fade-in-up" style="background: var(--gradient-success); border: none; margin-bottom: var(--space-4);">
          ${activeOrders.map(order => `
            <div class="flex-between" style="color: white;">
              <div>
                <div class="font-semibold">${order.id}</div>
                <div style="font-size: var(--text-xs); opacity: 0.8;">${order.items.map(i => i.emoji).join(' ')} ${order.items.length} items</div>
              </div>
              <div class="text-right">
                <span class="badge" style="background: rgba(255,255,255,0.2); color: white;">
                  ${order.status === 'preparing' ? '👨‍🍳 Preparing' : order.status === 'ready' ? '🎉 Ready!' : '✅ Done'}
                </span>
              </div>
            </div>
          `).join('<div class="divider" style="background: rgba(255,255,255,0.2);"></div>')}
        </div>
      ` : ''}

      <!-- Category Tabs -->
      <div class="flex-row animate-fade-in-up" style="margin-bottom: var(--space-4); overflow-x: auto; gap: var(--space-2); animation-delay: 100ms;" role="tablist">
        <button class="chip chip-active" data-category="all" role="tab" id="category-all">🍽️ All</button>
        <button class="chip" data-category="food" role="tab" id="category-food">🍔 Food</button>
        <button class="chip" data-category="drink" role="tab" id="category-drink">🥤 Drinks</button>
        <button class="chip" data-category="snack" role="tab" id="category-snack">🍿 Snacks</button>
        <button class="chip" data-category="popular" role="tab" id="category-popular">⭐ Popular</button>
      </div>

      <!-- Menu Grid -->
      <div class="flex-col stagger-children" id="menu-list" role="list" aria-label="Menu items">
        ${this._renderMenuItems(menu)}
      </div>

      <!-- Cart Bar (fixed at bottom) -->
      ${cartCount > 0 ? `
        <div id="cart-bar" class="card animate-slide-up" style="
          position: fixed;
          bottom: calc(var(--bottom-nav-height) + var(--space-3));
          left: 50%;
          transform: translateX(-50%);
          width: calc(var(--max-width) - var(--space-8));
          max-width: calc(100vw - var(--space-8));
          background: var(--gradient-brand);
          border: none;
          z-index: var(--z-sticky);
          padding: var(--space-4);
          cursor: pointer;
        ">
          <div class="flex-between" style="color: white;">
            <div class="flex-row gap-4">
              <span class="badge" style="background: rgba(255,255,255,0.2); color: white; font-size: var(--text-sm);">${cartCount}</span>
              <span class="font-semibold">View Cart</span>
            </div>
            <span class="font-mono font-bold">${Format.currency(cartTotal)}</span>
          </div>
        </div>
      ` : ''}

      <!-- Cart Modal (hidden by default) -->
      <div id="cart-modal" style="display: none;">
        ${this._renderCartModal()}
      </div>
    `;

    this._bindEvents(container);
    this._subscribeToUpdates();
  },

  /**
   * Render menu items
   * @private
   */
  _renderMenuItems(menu) {
    let filtered = menu;
    
    if (this._activeCategory === 'popular') {
      filtered = menu.filter(m => m.popular);
    } else if (this._activeCategory !== 'all') {
      filtered = menu.filter(m => m.category === this._activeCategory);
    }

    return filtered.map((item, i) => {
      const cart = AppState.get('cart');
      const inCart = cart.find(c => c.id === item.id);

      return `
        <div class="card card-compact menu-item animate-fade-in-up" style="animation-delay: ${i * 40}ms;" role="listitem" aria-label="${item.name}, ${Format.currency(item.price)}">
          <div class="menu-icon" style="background: var(--glass-bg); font-size: var(--text-2xl);">
            ${item.emoji}
          </div>
          <div class="menu-details">
            <div class="menu-title">${item.name}</div>
            <div class="menu-subtitle">${item.vendor} · ~${item.prepTime} min</div>
            ${item.popular ? '<span class="badge badge-warning" style="margin-top: 4px;">⭐ Popular</span>' : ''}
          </div>
          <div class="flex-col gap-2" style="align-items: flex-end;">
            <div class="menu-price">${Format.currency(item.price)}</div>
            ${inCart ? `
              <div class="counter">
                <button class="counter-btn" data-item-id="${item.id}" data-action="decrease" aria-label="Decrease quantity">−</button>
                <span class="counter-value">${inCart.quantity}</span>
                <button class="counter-btn" data-item-id="${item.id}" data-action="increase" aria-label="Increase quantity">+</button>
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" data-add-item="${item.id}" aria-label="Add ${item.name} to cart">
                + Add
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render the cart modal
   * @private
   */
  _renderCartModal() {
    const cart = AppState.get('cart');
    const total = AppState.getCartTotal();

    if (cart.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">Your cart is empty</div>
          <div class="empty-desc">Add items from the menu to place an order</div>
        </div>
      `;
    }

    const maxPrepTime = Math.max(...cart.map(i => i.prepTime));

    return `
      <div style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: var(--z-modal);
        display: flex;
        align-items: flex-end;
        justify-content: center;
      " id="cart-overlay">
        <div style="
          width: 100%;
          max-width: var(--max-width);
          background: var(--bg-secondary);
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
          padding: var(--space-6);
          max-height: 80vh;
          overflow-y: auto;
          animation: slide-up 0.3s ease-out;
        " role="dialog" aria-label="Shopping Cart">
          <!-- Cart Header -->
          <div class="flex-between" style="margin-bottom: var(--space-5);">
            <h2 style="font-size: var(--text-xl);">🛒 Your Cart</h2>
            <button class="btn btn-ghost btn-sm" id="btn-close-cart" aria-label="Close cart">✕</button>
          </div>

          <!-- Cart Items -->
          <div class="flex-col gap-2" style="margin-bottom: var(--space-5);">
            ${cart.map(item => `
              <div class="flex-between card card-compact">
                <div class="flex-row gap-4">
                  <span style="font-size: var(--text-xl);">${item.emoji}</span>
                  <div>
                    <div class="font-medium text-sm">${item.name}</div>
                    <div class="text-xs text-tertiary">${Format.currency(item.price)} each</div>
                  </div>
                </div>
                <div class="flex-row gap-4">
                  <div class="counter">
                    <button class="counter-btn" data-cart-item="${item.id}" data-action="decrease" aria-label="Decrease">−</button>
                    <span class="counter-value">${item.quantity}</span>
                    <button class="counter-btn" data-cart-item="${item.id}" data-action="increase" aria-label="Increase">+</button>
                  </div>
                  <span class="font-mono font-semibold" style="min-width: 60px; text-align: right;">
                    ${Format.currency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Summary -->
          <div class="divider"></div>
          <div class="flex-between" style="margin-bottom: var(--space-2);">
            <span class="text-secondary">Estimated prep time</span>
            <span class="font-mono">~${maxPrepTime} min</span>
          </div>
          <div class="flex-between" style="margin-bottom: var(--space-5);">
            <span class="font-semibold text-lg">Total</span>
            <span class="font-mono font-bold text-lg" style="color: var(--accent-orange);">${Format.currency(total)}</span>
          </div>

          <!-- Place Order -->
          <button class="btn btn-primary btn-lg btn-full" id="btn-place-order" aria-label="Place order for ${Format.currency(total)}">
            🎉 Place Order · ${Format.currency(total)}
          </button>
          
          <p class="text-center text-xs text-tertiary" style="margin-top: var(--space-3);">
            📍 Pickup at ${cart[0]?.vendor || 'nearest vendor'} · ${Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat)}
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Bind events
   * @private
   */
  _bindEvents(container) {
    // Category filter
    DOM.$$('.chip[data-category]', container).forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.$$('.chip[data-category]', container).forEach(c => c.classList.remove('chip-active'));
        chip.classList.add('chip-active');
        this._activeCategory = chip.dataset.category;
        const list = DOM.$('#menu-list', container);
        if (list) list.innerHTML = this._renderMenuItems(Config.menu);
        this._bindMenuActions(container);
      });
    });

    // Initial menu action binding
    this._bindMenuActions(container);

    // Cart bar click
    this._bindCartBar(container);
  },

  /**
   * Bind menu item add/quantity actions
   * @private
   */
  _bindMenuActions(container) {
    // Add to cart buttons
    DOM.$$('[data-add-item]', container).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.addItem;
        const item = Config.menu.find(m => m.id === itemId);
        if (item) {
          AppState.addToCart(item);
          this.render(); // Re-render to show counter
        }
      });
    });

    // Quantity buttons (in menu)
    DOM.$$('[data-item-id]', container).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.itemId;
        const action = btn.dataset.action;
        const cart = AppState.get('cart');
        const item = cart.find(i => i.id === itemId);
        
        if (item) {
          const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
          AppState.updateCartQuantity(itemId, newQty);
          this.render();
        }
      });
    });
  },

  /**
   * Bind cart bar and modal events
   * @private
   */
  _bindCartBar(container) {
    const cartBar = DOM.$('#cart-bar', container);
    const cartModal = DOM.$('#cart-modal', container);

    if (cartBar && cartModal) {
      cartBar.addEventListener('click', () => {
        cartModal.innerHTML = this._renderCartModal();
        cartModal.style.display = 'block';

        // Bind modal events
        const closeBtn = DOM.$('#btn-close-cart');
        const overlay = DOM.$('#cart-overlay');
        const placeOrderBtn = DOM.$('#btn-place-order');

        if (closeBtn) closeBtn.addEventListener('click', () => cartModal.style.display = 'none');
        if (overlay) overlay.addEventListener('click', (e) => {
          if (e.target === overlay) cartModal.style.display = 'none';
        });

        if (placeOrderBtn) {
          placeOrderBtn.addEventListener('click', () => {
            const order = AppState.placeOrder();
            if (order) {
              cartModal.style.display = 'none';
              // Save to Firebase backend
              FirebaseService.saveOrder(order);
              DOM.toast(`🎉 Order ${order.id} placed! Pick up in ~${Math.round((order.estimatedPickup - Date.now()) / 60000)} min`, 'success', 5000);
              A11y.announce(`Order placed successfully. Order ID: ${order.id}`);
              this.render();
            }
          });
        }

        // Cart quantity buttons (in modal)
        DOM.$$('[data-cart-item]').forEach(btn => {
          btn.addEventListener('click', () => {
            const itemId = btn.dataset.cartItem;
            const action = btn.dataset.action;
            const cart = AppState.get('cart');
            const item = cart.find(i => i.id === itemId);
            
            if (item) {
              const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
              AppState.updateCartQuantity(itemId, newQty);
              cartModal.innerHTML = this._renderCartModal();
              this._bindCartBar(container); // Rebind
            }
          });
        });
      });
    }
  },

  /**
   * Subscribe to state changes
   * @private
   */
  _subscribeToUpdates() {
    AppState.subscribe('cart', () => {
      // Re-render is handled by add/remove methods directly
    });

    AppState.subscribe('activeOrders', () => {
      // Re-render to show order status
      this.render();
    });
  },

  /**
   * Cleanup
   */
  destroy() {
    // Close any open modal
    const modal = DOM.$('#cart-modal');
    if (modal) modal.style.display = 'none';
  }
};
