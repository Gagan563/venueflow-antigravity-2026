/* ============================================
   VenueFlow State Management
   Reactive state store with subscriber pattern
   ============================================ */

const AppState = {
  /** @private Internal state */
  _state: {
    // Navigation
    currentView: 'home',
    previousView: null,

    // Venue
    currentAttendance: 68450,
    overallCrowdDensity: 72,

    // Queue data (real-time)
    queues: [
      { id: 'food-1', name: 'Desi Dhaba', type: 'food', waitMinutes: 12, trend: 'rising', capacity: 85, icon: '🍛' },
      { id: 'food-2', name: 'Chaat Corner', type: 'food', waitMinutes: 8, trend: 'stable', capacity: 60, icon: '🥘' },
      { id: 'food-3', name: 'Pizza Point', type: 'food', waitMinutes: 18, trend: 'rising', capacity: 92, icon: '🍕' },
      { id: 'food-4', name: 'Biryani House', type: 'food', waitMinutes: 5, trend: 'falling', capacity: 40, icon: '🍚' },
      { id: 'food-5', name: 'Lassi Bar', type: 'food', waitMinutes: 15, trend: 'rising', capacity: 78, icon: '🥛' },
      { id: 'rest-1', name: 'Restrooms (Sec 110)', type: 'restroom', waitMinutes: 7, trend: 'stable', capacity: 65, icon: '🚻' },
      { id: 'rest-2', name: 'Restrooms (Sec 130)', type: 'restroom', waitMinutes: 3, trend: 'falling', capacity: 30, icon: '🚻' },
      { id: 'rest-3', name: 'Restrooms (Sec 220)', type: 'restroom', waitMinutes: 10, trend: 'rising', capacity: 75, icon: '🚻' },
      { id: 'rest-4', name: 'Restrooms (Sec 310)', type: 'restroom', waitMinutes: 2, trend: 'stable', capacity: 20, icon: '🚻' },
      { id: 'gate-a', name: 'Gate A Exit', type: 'gate', waitMinutes: 4, trend: 'stable', capacity: 35, icon: '🚪' },
      { id: 'gate-b', name: 'Gate B Exit', type: 'gate', waitMinutes: 6, trend: 'rising', capacity: 50, icon: '🚪' },
      { id: 'gate-c', name: 'Gate C Exit', type: 'gate', waitMinutes: 8, trend: 'rising', capacity: 62, icon: '🚪' },
      { id: 'gate-d', name: 'Gate D Exit', type: 'gate', waitMinutes: 3, trend: 'falling', capacity: 28, icon: '🚪' }
    ],

    // Crowd zones for heatmap
    crowdZones: [
      { lat: 23.0930, lng: 72.5970, weight: 85 },
      { lat: 23.0932, lng: 72.5978, weight: 72 },
      { lat: 23.0928, lng: 72.5982, weight: 90 },
      { lat: 23.0925, lng: 72.5985, weight: 65 },
      { lat: 23.0920, lng: 72.5980, weight: 78 },
      { lat: 23.0918, lng: 72.5974, weight: 55 },
      { lat: 23.0922, lng: 72.5968, weight: 60 },
      { lat: 23.0935, lng: 72.5975, weight: 88 },
      { lat: 23.0938, lng: 72.5970, weight: 70 },
      { lat: 23.0916, lng: 72.5965, weight: 45 },
      { lat: 23.0924, lng: 72.5962, weight: 50 },
      { lat: 23.0928, lng: 72.5988, weight: 95 },
      { lat: 23.0934, lng: 72.5982, weight: 82 }
    ],

    // Orders
    cart: [],
    activeOrders: [],
    orderHistory: [],

    // Wallet
    wallet: {
      paymentMethods: [
        {
          id: 'pm-1',
          brand: 'VISA',
          label: 'Personal Node 01',
          last4: '4421',
          expMonth: '08',
          expYear: '29',
          default: true
        }
      ],
      listings: []
    },

    // Concierge
    chatHistory: [],
    isChatLoading: false,

    // Notifications
    notifications: [
      { id: 'n1', title: 'Welcome!', message: 'Enjoy the match at Narendra Modi Stadium! 🏏', time: Date.now() - 300000, read: false, type: 'info' },
      { id: 'n2', title: 'Low Wait Alert', message: 'Biryani House has only 5 min wait right now 🍚', time: Date.now() - 900000, read: false, type: 'tip' },
      { id: 'n3', title: 'Gate Update', message: 'Gate A is the fastest entry point currently', time: Date.now() - 1800000, read: true, type: 'info' }
    ],

    // User preferences
    preferences: {
      favoriteVendors: [],
      dietaryRestrictions: [],
      notificationsEnabled: true,
      soundEnabled: true,
      autoRefresh: true
    }
  },

  /** @private Subscribers map: key -> callback[] */
  _subscribers: {},

  /** @private Global listeners */
  _globalSubscribers: [],

  /** @private Active simulation interval IDs */
  _simulationIntervals: [],

  /**
   * Get current state value
   * @param {string} key - State key (dot notation supported)
   * @returns {*}
   */
  get(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this._state);
  },

  /**
   * Set state value and notify subscribers
   * @param {string} key - State key
   * @param {*} value - New value
   */
  set(key, value) {
    const keys = key.split('.');
    let obj = this._state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }

    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;

    // Notify key-specific subscribers
    if (this._subscribers[key]) {
      this._subscribers[key].forEach(cb => {
        try { cb(value, oldValue, key); } catch (e) { console.error('State subscriber error:', e); }
      });
    }

    // Notify global subscribers
    this._globalSubscribers.forEach(cb => {
      try { cb(key, value, oldValue); } catch (e) { console.error('Global subscriber error:', e); }
    });
  },

  /**
   * Subscribe to state changes for a specific key
   * @param {string} key - State key to watch
   * @param {Function} callback - Callback(newValue, oldValue, key)
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._subscribers[key]) this._subscribers[key] = [];
    this._subscribers[key].push(callback);
    
    return () => {
      this._subscribers[key] = this._subscribers[key].filter(cb => cb !== callback);
    };
  },

  /**
   * Subscribe to all state changes
   * @param {Function} callback - Callback(key, newValue, oldValue)
   * @returns {Function} Unsubscribe function
   */
  subscribeAll(callback) {
    this._globalSubscribers.push(callback);
    return () => {
      this._globalSubscribers = this._globalSubscribers.filter(cb => cb !== callback);
    };
  },

  /**
   * Update state partially (merge)
   * @param {string} key - State key
   * @param {Object} partial - Partial update
   */
  merge(key, partial) {
    const current = this.get(key);
    if (typeof current === 'object' && !Array.isArray(current)) {
      this.set(key, { ...current, ...partial });
    } else {
      this.set(key, partial);
    }
  },

  /**
   * Update user preferences
   * @param {Object} partial - Partial preference update
   */
  updatePreferences(partial) {
    this.merge('preferences', partial);
  },

  /**
   * Mark every notification as read
   */
  markAllNotificationsRead() {
    const notifications = this.get('notifications').map(notification => ({
      ...notification,
      read: true
    }));
    this.set('notifications', notifications);
  },

  /**
   * Add a payment method to the wallet
   * @param {Object} paymentMethod - Payment method details
   * @returns {Object}
   */
  addPaymentMethod(paymentMethod) {
    const methods = [...this.get('wallet.paymentMethods')];
    const shouldBeDefault = paymentMethod.default || methods.length === 0;

    const nextMethods = methods.map(method => ({
      ...method,
      default: shouldBeDefault ? false : method.default
    }));

    const createdMethod = {
      id: paymentMethod.id || `pm-${Date.now().toString(36)}`,
      brand: (paymentMethod.brand || 'CARD').toUpperCase(),
      label: paymentMethod.label || 'VenueFlow Wallet',
      last4: String(paymentMethod.last4 || '').slice(-4),
      expMonth: String(paymentMethod.expMonth || '').padStart(2, '0'),
      expYear: String(paymentMethod.expYear || '').slice(-2),
      default: shouldBeDefault
    };

    nextMethods.push(createdMethod);
    this.set('wallet.paymentMethods', nextMethods);
    return createdMethod;
  },

  /**
   * Set the default wallet payment method
   * @param {string} paymentMethodId - Payment method ID
   */
  setDefaultPaymentMethod(paymentMethodId) {
    const methods = this.get('wallet.paymentMethods').map(method => ({
      ...method,
      default: method.id === paymentMethodId
    }));
    this.set('wallet.paymentMethods', methods);
  },

  /**
   * Get the default payment method
   * @returns {Object|null}
   */
  getDefaultPaymentMethod() {
    return this.get('wallet.paymentMethods').find(method => method.default) || null;
  },

  /**
   * Add a new ticket marketplace listing
   * @param {Object} listing - Listing details
   * @returns {Object}
   */
  addTicketListing(listing) {
    const createdListing = {
      id: listing.id || `list-${Date.now().toString(36)}`,
      createdAt: listing.createdAt || Date.now(),
      status: listing.status || 'listed',
      ...listing
    };

    this.set('wallet.listings', [createdListing, ...this.get('wallet.listings')]);
    return createdListing;
  },

  // ── Cart Operations ──
  
  /**
   * Add item to cart
   * @param {Object} item - Menu item
   */
  addToCart(item) {
    const cart = [...this.get('cart')];
    const existing = cart.find(i => i.id === item.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    
    this.set('cart', cart);
    DOM.toast(`${item.emoji} ${item.name} added to cart`, 'success');
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Item ID
   */
  removeFromCart(itemId) {
    const cart = this.get('cart').filter(i => i.id !== itemId);
    this.set('cart', cart);
  },

  /**
   * Update item quantity in cart
   * @param {string} itemId - Item ID
   * @param {number} quantity - New quantity
   */
  updateCartQuantity(itemId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }
    
    const cart = [...this.get('cart')];
    const item = cart.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.set('cart', cart);
    }
  },

  /**
   * Get cart total
   * @returns {number}
   */
  getCartTotal() {
    return this.get('cart').reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  /**
   * Get cart item count
   * @returns {number}
   */
  getCartCount() {
    return this.get('cart').reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Place order from cart
   * @returns {Object} The new order
   */
  placeOrder() {
    const cart = this.get('cart');
    if (cart.length === 0) return null;

    const order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: [...cart],
      total: this.getCartTotal(),
      status: 'preparing',
      placedAt: Date.now(),
      estimatedPickup: Date.now() + (Math.max(...cart.map(i => i.prepTime)) * 60000),
      vendor: cart[0].vendor
    };

    const orders = [...this.get('activeOrders'), order];
    this.set('activeOrders', orders);
    this.set('cart', []);
    
    // Simulate order progress
    this._simulateOrderProgress(order.id);
    
    return order;
  },

  /**
   * Simulate order status updates
   * @private
   * @param {string} orderId
   */
  _simulateOrderProgress(orderId) {
    const statuses = ['preparing', 'ready', 'completed'];
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step >= statuses.length) {
        clearInterval(interval);
        // Move to history
        const active = this.get('activeOrders');
        const order = active.find(o => o.id === orderId);
        if (order) {
          order.status = 'completed';
          this.set('activeOrders', active.filter(o => o.id !== orderId));
          this.set('orderHistory', [...this.get('orderHistory'), order]);
        }
        return;
      }

      const active = this.get('activeOrders').map(o => {
        if (o.id === orderId) {
          o.status = statuses[step];
          if (statuses[step] === 'ready') {
            DOM.toast(`🎉 Order ${orderId} is ready for pickup!`, 'success', 5000);
          }
        }
        return o;
      });
      this.set('activeOrders', active);
    }, 15000); // Every 15 seconds
  },

  // ── Simulation ──

  /**
   * Start real-time simulation of crowd and queue data
   */
  startSimulation() {
    if (this._simulationIntervals.length > 0) return;

    // Simulate queue updates every 10 seconds
    const queueInterval = setInterval(() => {
      const queues = this.get('queues').map(q => {
        const change = (Math.random() - 0.45) * 4; // slight bias towards increasing
        const newWait = Math.max(1, Math.min(30, q.waitMinutes + change));
        const newCapacity = Math.max(10, Math.min(100, q.capacity + (Math.random() - 0.5) * 10));
        
        let trend = 'stable';
        if (newWait > q.waitMinutes + 1) trend = 'rising';
        else if (newWait < q.waitMinutes - 1) trend = 'falling';
        
        return { ...q, waitMinutes: Math.round(newWait), capacity: Math.round(newCapacity), trend };
      });
      this.set('queues', queues);
    }, 10000);
    this._simulationIntervals.push(queueInterval);

    // Simulate attendance changes every 30 seconds
    const attendanceInterval = setInterval(() => {
      const current = this.get('currentAttendance');
      const change = Math.floor((Math.random() - 0.3) * 500);
      const newAttendance = Math.max(50000, Math.min(Config.venue.capacity, current + change));
      this.set('currentAttendance', newAttendance);
      this.set('overallCrowdDensity', Math.round((newAttendance / Config.venue.capacity) * 100));
    }, 30000);
    this._simulationIntervals.push(attendanceInterval);

    // Simulate crowd zone shifts every 15 seconds
    const crowdInterval = setInterval(() => {
      const zones = this.get('crowdZones').map(z => ({
        ...z,
        weight: Math.max(20, Math.min(100, z.weight + (Math.random() - 0.5) * 15))
      }));
      this.set('crowdZones', zones);
    }, 15000);
    this._simulationIntervals.push(crowdInterval);
  },

  /**
   * Stop simulated real-time updates
   */
  stopSimulation() {
    this._simulationIntervals.forEach(interval => clearInterval(interval));
    this._simulationIntervals = [];
  }
};
