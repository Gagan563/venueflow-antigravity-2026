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
      { id: 'food-1', name: 'Gridiron Grill', type: 'food', waitMinutes: 12, trend: 'rising', capacity: 85, icon: '🍔' },
      { id: 'food-2', name: 'Stadium Sushi', type: 'food', waitMinutes: 8, trend: 'stable', capacity: 60, icon: '🍣' },
      { id: 'food-3', name: 'Pizza Corner', type: 'food', waitMinutes: 18, trend: 'rising', capacity: 92, icon: '🍕' },
      { id: 'food-4', name: 'Taco Stand', type: 'food', waitMinutes: 5, trend: 'falling', capacity: 40, icon: '🌮' },
      { id: 'food-5', name: 'Beer Garden', type: 'food', waitMinutes: 15, trend: 'rising', capacity: 78, icon: '🍺' },
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
      { lat: 40.8140, lng: -74.0755, weight: 85 },
      { lat: 40.8142, lng: -74.0748, weight: 72 },
      { lat: 40.8138, lng: -74.0740, weight: 90 },
      { lat: 40.8135, lng: -74.0735, weight: 65 },
      { lat: 40.8130, lng: -74.0738, weight: 78 },
      { lat: 40.8128, lng: -74.0745, weight: 55 },
      { lat: 40.8132, lng: -74.0752, weight: 60 },
      { lat: 40.8145, lng: -74.0742, weight: 88 },
      { lat: 40.8148, lng: -74.0750, weight: 70 },
      { lat: 40.8125, lng: -74.0755, weight: 45 },
      { lat: 40.8133, lng: -74.0760, weight: 50 },
      { lat: 40.8138, lng: -74.0728, weight: 95 },
      { lat: 40.8143, lng: -74.0733, weight: 82 }
    ],

    // Orders
    cart: [],
    activeOrders: [],
    orderHistory: [],

    // Concierge
    chatHistory: [],
    isChatLoading: false,

    // Notifications
    notifications: [
      { id: 'n1', title: 'Welcome!', message: 'Gates are now open. Enjoy the game! 🏈', time: Date.now() - 3600000, read: false, type: 'info' },
      { id: 'n2', title: 'Low Wait Alert', message: 'Taco Stand has only 5 min wait right now 🌮', time: Date.now() - 900000, read: false, type: 'tip' },
      { id: 'n3', title: 'Pre-Game Starting', message: 'The pre-game show begins at your section in 30 min', time: Date.now() - 600000, read: false, type: 'event' }
    ],

    // User preferences
    preferences: {
      favoriteVendors: [],
      dietaryRestrictions: [],
      notificationsEnabled: true
    }
  },

  /** @private Subscribers map: key -> callback[] */
  _subscribers: {},

  /** @private Global listeners */
  _globalSubscribers: [],

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
    // Simulate queue updates every 10 seconds
    setInterval(() => {
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

    // Simulate attendance changes every 30 seconds
    setInterval(() => {
      const current = this.get('currentAttendance');
      const change = Math.floor((Math.random() - 0.3) * 500);
      const newAttendance = Math.max(50000, Math.min(Config.venue.capacity, current + change));
      this.set('currentAttendance', newAttendance);
      this.set('overallCrowdDensity', Math.round((newAttendance / Config.venue.capacity) * 100));
    }, 30000);

    // Simulate crowd zone shifts every 15 seconds
    setInterval(() => {
      const zones = this.get('crowdZones').map(z => ({
        ...z,
        weight: Math.max(20, Math.min(100, z.weight + (Math.random() - 0.5) * 15))
      }));
      this.set('crowdZones', zones);
    }, 15000);
  }
};
