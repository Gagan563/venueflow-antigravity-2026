/* ============================================
   VenueFlow Food Pre-Order View
   Browse menu, add to cart, place orders
   ============================================ */

const OrderView = {
  /** @type {string} Active category filter */
  _activeCategory: 'all',

  /** @type {Function[]} */
  _unsubscribeFns: [],

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
      <div class="relative min-h-screen pt-24 pb-32 space-y-6 flex flex-col px-4 sm:px-6 w-full max-w-md mx-auto">
        <!-- Header Section -->
        <div class="glass-cyber rounded-[2.5rem] p-6 border-fuchsia-500/20">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase font-headline">CRAVE<span class="text-secondary text-neon-cyan">_LIST</span></h1>
              <p class="text-zinc-500 font-bold text-[10px] tracking-widest uppercase mt-1">FAST_TRACK_LANE_ACTIVE</p>
            </div>
            <div class="bg-primary/20 text-primary border border-primary/30 w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(191,0,255,0.3)]">
              <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">fastfood</span>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-zinc-900 border border-white/5 rounded-2xl p-4">
            <span class="material-symbols-outlined text-zinc-500">storefront</span>
            <div class="flex-grow">
              <p class="font-black text-xs uppercase tracking-tight">DELIVERY_NODE</p>
              <p class="text-[10px] text-zinc-500 font-bold">${Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat)}</p>
            </div>
            <button class="text-secondary font-black text-[10px] tracking-widest uppercase text-neon-cyan active:scale-95 transition-transform" id="btn-edit-seat">VIEW</button>
          </div>
        </div>

        <!-- Categories -->
        <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-2 -mx-2">
          <button class="flex items-center justify-center shrink-0 w-20 h-24 rounded-3xl bg-primary text-black flex-col gap-2 shadow-[0_0_20px_rgba(191,0,255,0.3)] active:scale-95 transition-transform" data-category="all">
            <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
            <span class="font-black text-[10px] uppercase tracking-widest font-headline">HOT</span>
          </button>
          <button class="flex items-center justify-center shrink-0 w-20 h-24 rounded-3xl glass-cyber text-zinc-500 hover:text-white border-zinc-800 flex-col gap-2 active:scale-95 transition-all" data-category="food">
            <span class="material-symbols-outlined text-3xl">lunch_dining</span>
            <span class="font-black text-[10px] uppercase tracking-widest font-headline">MAINS</span>
          </button>
          <button class="flex items-center justify-center shrink-0 w-20 h-24 rounded-3xl glass-cyber text-zinc-500 hover:text-white border-zinc-800 flex-col gap-2 active:scale-95 transition-all" data-category="drink">
            <span class="material-symbols-outlined text-3xl">local_bar</span>
            <span class="font-black text-[10px] uppercase tracking-widest font-headline">LIQUIDS</span>
          </button>
          <button class="flex items-center justify-center shrink-0 w-20 h-24 rounded-3xl glass-cyber text-zinc-500 hover:text-white border-zinc-800 flex-col gap-2 active:scale-95 transition-all" data-category="snack">
            <span class="material-symbols-outlined text-3xl">icecream</span>
            <span class="font-black text-[10px] uppercase tracking-widest font-headline">SWEETS</span>
          </button>
        </div>

        <!-- Menu Grid -->
        <div class="space-y-4" id="menu-list" role="list">
          ${this._renderMenuItems(menu)}
        </div>

        <!-- Cart Floating Action -->
        ${cartCount > 0 ? `
          <div id="cart-bar" class="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40 animate-fade-in-up cursor-pointer active:scale-95 transition-transform">
            <div class="kinetic-gradient p-1 rounded-full shadow-[0_0_30px_rgba(191,0,255,0.4)]">
              <div class="bg-black rounded-full px-6 py-4 flex justify-between items-center relative overflow-hidden">
                <div class="absolute inset-0 bg-primary/10"></div>
                <div class="flex items-center gap-3 relative z-10">
                  <div class="relative">
                    <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">local_mall</span>
                    <span class="absolute -top-2 -right-2 bg-secondary text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">${cartCount}</span>
                  </div>
                  <span class="font-black uppercase tracking-widest text-white text-xs">VIEW_CART</span>
                </div>
                <span class="font-headline font-black text-lg text-primary text-neon-fuchsia relative z-10">${Format.currency(cartTotal)}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Cart Modal -->
        <div id="cart-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center hidden">
          ${this._renderCartModal()}
        </div>
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
        <div class="glass-cyber rounded-[2rem] p-4 flex gap-4 border-fuchsia-500/10 group hover:border-fuchsia-500/40 transition-colors animate-fade-in-up" style="animation-delay: ${i * 40}ms;">
          <div class="w-24 h-24 rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden flex items-center justify-center shrink-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <span class="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">${item.emoji}</span>
          </div>
          <div class="flex-grow flex flex-col justify-between py-1">
            <div>
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-black text-white font-headline leading-tight pr-2 uppercase truncate" style="max-width: 140px;">${item.name}</h3>
                <span class="text-secondary font-black text-lg text-neon-cyan leading-none tracking-tighter shrink-0">${Format.currency(item.price)}</span>
              </div>
              <p class="text-[10px] text-zinc-500 font-bold uppercase truncate">${item.vendor} // ~${item.prepTime} MIN</p>
            </div>
            <div class="flex justify-between items-end">
              ${item.popular ? '<span class="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-[4px] text-[8px] font-black tracking-widest uppercase">POPULAR</span>' : '<span></span>'}

              ${inCart ? `
                <div class="flex items-center gap-3 bg-zinc-900 rounded-full border border-zinc-700 px-1 py-1">
                  <button class="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:text-white" data-item-id="${item.id}" data-action="decrease"><span class="material-symbols-outlined text-[16px]">remove</span></button>
                  <span class="font-black text-white font-headline text-xs w-4 text-center">${inCart.quantity}</span>
                  <button class="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center hover:bg-fuchsia-400" data-item-id="${item.id}" data-action="increase"><span class="material-symbols-outlined text-[16px]">add</span></button>
                </div>
              ` : `
                <button class="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary hover:text-black transition-colors active:scale-90" data-add-item="${item.id}">
                  <span class="material-symbols-outlined text-sm font-bold">add</span>
                </button>
              `}
            </div>
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
        <div class="glass-cyber rounded-[2.5rem] p-8 w-full max-w-sm border-fuchsia-500/20 text-center animate-fade-in-up">
          <div class="text-6xl mb-4 opacity-50 filter grayscale">🛒</div>
          <h2 class="font-headline font-black text-2xl text-white tracking-widest uppercase mb-2">CART_EMPTY</h2>
          <p class="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-6">AWAITING_INPUT_COMMANDS</p>
          <button class="bg-zinc-800 text-white rounded-full py-3 px-6 font-headline font-black text-xs tracking-widest uppercase border border-zinc-700 hover:bg-zinc-700 w-full" id="btn-close-cart">
            RETURN_TO_HUB
          </button>
        </div>
      `;
    }

    const maxPrepTime = Math.max(...cart.map(i => i.prepTime));

    return `
      <div class="glass-cyber rounded-t-[2.5rem] w-full max-w-md bg-zinc-950/95 border-t-2 border-fuchsia-500/30 p-6 shadow-[0_-20px_40px_rgba(191,0,255,0.15)] animate-slide-up flex flex-col max-h-[85vh]">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 class="font-headline font-black text-3xl italic tracking-tighter uppercase text-white">CHECKOUT<span class="text-secondary text-neon-cyan">_NODE</span></h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#BF00FF]"></span>
              <p class="text-zinc-500 text-[9px] font-bold tracking-[0.2em] uppercase">SECURE_LINK_ACTIVATED</p>
            </div>
          </div>
          <button class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white" id="btn-close-cart">
            <span class="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>

        <!-- Scrollable Items Area -->
        <div class="flex-col gap-4 overflow-y-auto w-full no-scrollbar mb-6 flex-grow pb-4 px-1" style="mask-image: linear-gradient(to bottom, black 90%, transparent 100%);">
          ${cart.map(item => `
            <div class="bg-zinc-900/50 rounded-[1.5rem] p-3 flex gap-3 border border-white/5 relative overflow-hidden">
              <div class="w-16 h-16 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                <span class="text-2xl">${item.emoji}</span>
              </div>
              <div class="flex-grow flex flex-col justify-between">
                <div class="flex justify-between items-start">
                  <h3 class="font-black text-white font-headline text-sm uppercase max-w-[120px] truncate">${item.name}</h3>
                  <span class="font-black text-secondary text-neon-cyan tracking-tighter">${Format.currency(item.price * item.quantity)}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">${Format.currency(item.price)} EA</span>

                  <div class="flex items-center gap-2 bg-black rounded-full border border-white/10 px-1 py-1">
                    <button class="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center" data-cart-item="${item.id}" data-action="decrease"><span class="material-symbols-outlined text-[12px]">remove</span></button>
                    <span class="font-black text-white font-headline text-[10px] w-3 text-center">${item.quantity}</span>
                    <button class="w-5 h-5 rounded-full bg-zinc-800 text-primary flex items-center justify-center" data-cart-item="${item.id}" data-action="increase"><span class="material-symbols-outlined text-[12px]">add</span></button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer / Checkout -->
        <div class="shrink-0 space-y-4">
          <div class="bg-black rounded-2xl p-4 border border-zinc-800">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">EST. PREP TIME</span>
              <span class="font-black text-white text-xs font-headline">~${maxPrepTime} MIN</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">PICKUP NODE</span>
              <span class="font-black text-white text-xs font-headline uppercase truncate w-32 text-right">${cart[0]?.vendor || 'NEAREST'}</span>
            </div>
            <div class="h-px w-full bg-zinc-800 mb-4"></div>
            <div class="flex justify-between items-end">
              <span class="font-black text-zinc-300 font-headline uppercase tracking-widest text-sm">TOTAL</span>
              <span class="font-black text-primary text-neon-fuchsia tracking-tighter text-2xl leading-none">${Format.currency(total)}</span>
            </div>
          </div>

          <button class="w-full bg-primary text-black rounded-full py-4 font-headline font-black tracking-[0.2em] uppercase neon-pulse-fuchsia active:scale-95 transition-transform flex items-center justify-center gap-2" id="btn-place-order">
            <span class="material-symbols-outlined text-sm font-bold">check_circle</span>
            AUTHORIZE_TRANSACTION
          </button>
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
    DOM.$$('[data-category]', container).forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.$$('[data-category]', container).forEach(c => {
          c.classList.remove('bg-primary', 'text-black', 'shadow-[0_0_20px_rgba(191,0,255,0.3)]');
          c.classList.add('glass-cyber', 'text-zinc-500');
        });
        chip.classList.remove('glass-cyber', 'text-zinc-500');
        chip.classList.add('bg-primary', 'text-black', 'shadow-[0_0_20px_rgba(191,0,255,0.3)]');
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

    DOM.$('#btn-edit-seat', container)?.addEventListener('click', () => Router.navigate('wallet'));
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
        cartModal.classList.remove('hidden');
        this._bindCartModalEvents(cartModal, container);
      });
    }
  },

  /**
   * Bind events inside the open cart modal
   * @param {Element} cartModal - Cart modal element
   * @param {Element} container - View container
   * @private
   */
  _bindCartModalEvents(cartModal, container) {
    const closeBtn = DOM.$('#btn-close-cart', cartModal);
    const placeOrderBtn = DOM.$('#btn-place-order', cartModal);

    if (closeBtn) closeBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

    cartModal.addEventListener('click', (event) => {
      if (event.target === cartModal) {
        cartModal.classList.add('hidden');
      }
    }, { once: true });

    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        const order = AppState.placeOrder();
        if (order) {
          cartModal.classList.add('hidden');
          FirebaseService.saveOrder(order);
          DOM.toast(`Order ${order.id} placed! Pick up in ~${Math.round((order.estimatedPickup - Date.now()) / 60000)} min`, 'success', 5000);
          A11y.announce(`Order placed successfully. Order ID: ${order.id}`);
          this.render();
        }
      });
    }

    DOM.$$('[data-cart-item]', cartModal).forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.cartItem;
        const action = button.dataset.action;
        const cart = AppState.get('cart');
        const item = cart.find(entry => entry.id === itemId);

        if (item) {
          const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
          AppState.updateCartQuantity(itemId, newQty);
          cartModal.innerHTML = this._renderCartModal();
          this._bindCartModalEvents(cartModal, container);

          if (AppState.get('cart').length === 0) {
            const cartBar = DOM.$('#cart-bar', container);
            if (cartBar) cartBar.remove();
          }
        }
      });
    });
  },

  /**
   * Subscribe to state changes
   * @private
   */
  _subscribeToUpdates() {
    this._unsubscribeFns.forEach(unsubscribe => unsubscribe());
    this._unsubscribeFns = [
      AppState.subscribe('activeOrders', () => {
        this.render();
      })
    ];
  },

  /**
   * Cleanup
   */
  destroy() {
    // Close any open modal
    const modal = DOM.$('#cart-modal');
    if (modal) modal.classList.add('hidden');
    this._unsubscribeFns.forEach(unsubscribe => unsubscribe());
    this._unsubscribeFns = [];
  }
};
