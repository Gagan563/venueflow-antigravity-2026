/* ============================================
   VenueFlow Firebase Service 
   Real-time backend with Realtime Database
   Handles both live and simulated modes
   ============================================ */

const FirebaseService = {
  /** @type {Object|null} Firebase app instance */
  app: null,
  
  /** @type {Object|null} Firebase database reference */
  db: null,
  
  /** @type {boolean} Whether Firebase is initialized */
  initialized: false,

  /** @type {boolean} Whether using simulated mode */
  simulatedMode: true,

  /** @type {Array} Active listeners for cleanup */
  _listeners: [],

  /** @type {number[]} Active simulation/server interval IDs */
  _intervals: [],

  /** @type {number|null} Timeout used before falling back to simulation */
  _connectionTimeoutId: null,

  /** @type {boolean} Whether live Firebase mode is active */
  _liveModeReady: false,

  /**
   * Check whether the runtime has a usable Firebase configuration
   * @returns {boolean}
   */
  _hasLiveConfig() {
    return Boolean(Config.firebase.apiKey && Config.firebase.databaseURL && Config.firebase.projectId);
  },

  /**
   * Initialize Firebase
   * Falls back to simulated mode if Firebase is unavailable
   */
  init() {
    try {
      if (!this._hasLiveConfig()) {
        this._initSimulated();
        return;
      }

      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        this.app = firebase.apps && firebase.apps.length
          ? firebase.app()
          : firebase.initializeApp(Config.firebase);
        this.db = firebase.database();

        const connectionRef = this.db.ref('.info/connected');
        connectionRef.on('value', (snap) => {
          if (snap.val() === true) {
            this._activateLiveMode();
            return;
          }

          if (!this._liveModeReady) {
            console.log('Waiting for Firebase connection...');
          }
        });
        this._listeners.push({ ref: connectionRef, event: 'value' });
        this._startConnectionFallbackTimer();
        this.initialized = true;
        return;
        
        // Test connection with a read
        this.db.ref('.info/connected').on('value', (snap) => {
          if (snap.val() === true) {
            console.log('✅ Firebase connected (live)');
            this.simulatedMode = false;
            this._seedDatabaseIfEmpty();
            this._setupListeners();
          } else {
            console.log('📡 Firebase offline — using simulation');
            if (!this.simulatedMode) return;
            this._initSimulated();
          }
        });

        this.initialized = true;
      } else {
        this._initSimulated();
      }
    } catch (error) {
      console.warn('⚠️ Firebase init failed, using simulated mode:', error.message);
      this._initSimulated();
    }
  },

  /**
   * Start the timeout used before simulated mode is enabled
   * @private
   */
  _startConnectionFallbackTimer() {
    this._clearConnectionFallbackTimer();
    this._connectionTimeoutId = setTimeout(() => {
      if (!this._liveModeReady) {
        console.warn('Firebase connection timed out, using simulated mode');
        this._initSimulated();
      }
    }, 4000);
  },

  /**
   * Clear the pending connection timeout
   * @private
   */
  _clearConnectionFallbackTimer() {
    if (this._connectionTimeoutId) {
      clearTimeout(this._connectionTimeoutId);
      this._connectionTimeoutId = null;
    }
  },

  /**
   * Switch from simulated data to live Firebase listeners
   * @private
   */
  _activateLiveMode() {
    if (this._liveModeReady) return;

    this._clearConnectionFallbackTimer();
    this._liveModeReady = true;
    this.simulatedMode = false;
    AppState.stopSimulation();

    console.log('Firebase connected (live)');
    this._seedDatabaseIfEmpty();
    this._setupListeners();
  },

  /**
   * Seed Firebase database with initial data if empty
   * @private
   */
  async _seedDatabaseIfEmpty() {
    if (!this.db) return;

    try {
      const snapshot = await this.db.ref('queues').once('value');
      if (snapshot.exists()) {
        console.log('📦 Firebase data exists — syncing');
        return;
      }

      console.log('🌱 Seeding Firebase database...');

      // Write initial queue data
      const queues = {};
      AppState.get('queues').forEach(q => { queues[q.id] = q; });
      await this.db.ref('queues').set(queues);

      // Write crowd data
      await this.db.ref('crowd').set({
        attendance: AppState.get('currentAttendance'),
        density: AppState.get('overallCrowdDensity'),
        zones: AppState.get('crowdZones'),
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });

      // Write venue metadata
      await this.db.ref('venue').set({
        name: Config.venue.name,
        event: Config.venue.currentEvent,
        capacity: Config.venue.capacity,
        eventTime: Config.venue.eventTime,
        status: 'live'
      });

      // Start server-side simulation of changing data
      this._startServerSimulation();

      console.log('✅ Firebase database seeded');
    } catch (error) {
      console.warn('Seed failed:', error.message);
    }
  },

  /**
   * Start simulating data changes in Firebase
   * This pushes updates to Firebase so all connected clients see them
   * @private
   */
  _startServerSimulation() {
    if (!this.db) return;

    // Update queue data every 10 seconds
    const queueInterval = setInterval(async () => {
      try {
        const snapshot = await this.db.ref('queues').once('value');
        const queues = snapshot.val();
        if (!queues) return;

        const updates = {};
        Object.entries(queues).forEach(([key, q]) => {
          const change = (Math.random() - 0.45) * 4;
          const newWait = Math.max(1, Math.min(30, q.waitMinutes + change));
          const newCapacity = Math.max(10, Math.min(100, q.capacity + (Math.random() - 0.5) * 10));
          
          let trend = 'stable';
          if (newWait > q.waitMinutes + 1) trend = 'rising';
          else if (newWait < q.waitMinutes - 1) trend = 'falling';

          updates[`${key}/waitMinutes`] = Math.round(newWait);
          updates[`${key}/capacity`] = Math.round(newCapacity);
          updates[`${key}/trend`] = trend;
        });

        await this.db.ref('queues').update(updates);
      } catch (e) { /* silent */ }
    }, 10000);
    this._intervals.push(queueInterval);

    // Update crowd data every 30 seconds
    const crowdInterval = setInterval(async () => {
      try {
        const snapshot = await this.db.ref('crowd').once('value');
        const crowd = snapshot.val();
        if (!crowd) return;

        const change = Math.floor((Math.random() - 0.3) * 500);
        const newAttendance = Math.max(50000, Math.min(Config.venue.capacity, (crowd.attendance || 68450) + change));
        
        await this.db.ref('crowd').update({
          attendance: newAttendance,
          density: Math.round((newAttendance / Config.venue.capacity) * 100),
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
      } catch (e) { /* silent */ }
    }, 30000);
    this._intervals.push(crowdInterval);
  },

  /**
   * Initialize simulated real-time data
   * @private
   */
  _initSimulated() {
    this._clearConnectionFallbackTimer();
    this._liveModeReady = false;
    this.simulatedMode = true;
    this.initialized = true;
    console.log('📡 Using simulated real-time data');
    
    // Start state simulation
    AppState.startSimulation();
  },

  /**
   * Set up real-time database listeners
   * @private
   */
  _setupListeners() {
    if (!this.db) return;

    // Listen for queue updates
    const queuesRef = this.db.ref('queues');
    queuesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const queuesArray = Object.values(data);
        if (queuesArray.length > 0) {
          AppState.set('queues', queuesArray);
        }
      }
    });
    this._listeners.push({ ref: queuesRef, event: 'value' });

    // Listen for crowd data
    const crowdRef = this.db.ref('crowd');
    crowdRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.attendance) AppState.set('currentAttendance', data.attendance);
        if (data.density) AppState.set('overallCrowdDensity', data.density);
        if (data.zones) AppState.set('crowdZones', data.zones);
      }
    });
    this._listeners.push({ ref: crowdRef, event: 'value' });

    // Listen for order updates
    const ordersRef = this.db.ref('orders');
    ordersRef.on('child_changed', (snapshot) => {
      const order = snapshot.val();
      if (order && order.status === 'ready') {
        DOM.toast(`🎉 Order ${order.id} is ready for pickup!`, 'success', 5000);
        A11y.announce(`Order ${order.id} is ready for pickup.`);
      }
    });
    this._listeners.push({ ref: ordersRef, event: 'child_changed' });

    // Listen for notifications
    const notifRef = this.db.ref('notifications');
    notifRef.on('child_added', (snapshot) => {
      const notif = snapshot.val();
      if (notif && notif.time > Date.now() - 5000) { // Only recent
        const current = AppState.get('notifications');
        if (!current.find(n => n.id === notif.id)) {
          AppState.set('notifications', [notif, ...current]);
          DOM.toast(notif.message, notif.type === 'alert' ? 'warning' : 'info');
        }
      }
    });
    this._listeners.push({ ref: notifRef, event: 'child_added' });
  },

  /**
   * Write data to Firebase
   * @param {string} path - Database path
   * @param {*} data - Data to write
   */
  async write(path, data) {
    if (this.simulatedMode) {
      console.log(`[Simulated] Write to ${path}:`, data);
      return;
    }
    
    try {
      await this.db.ref(path).set(data);
    } catch (error) {
      console.error('Firebase write error:', error);
    }
  },

  /**
   * Push data to a Firebase list
   * @param {string} path - Database path
   * @param {*} data - Data to push
   * @returns {string|null} Push key
   */
  async push(path, data) {
    if (this.simulatedMode) {
      console.log(`[Simulated] Push to ${path}:`, data);
      return `sim-${Date.now()}`;
    }
    
    try {
      const ref = await this.db.ref(path).push(data);
      return ref.key;
    } catch (error) {
      console.error('Firebase push error:', error);
      return null;
    }
  },

  /**
   * Read data once from Firebase
   * @param {string} path - Database path
   * @returns {*}
   */
  async read(path) {
    if (this.simulatedMode) return null;
    
    try {
      const snapshot = await this.db.ref(path).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Firebase read error:', error);
      return null;
    }
  },

  /**
   * Place an order (writes to Firebase and tracks locally)
   * @param {Object} order - Order object from AppState.placeOrder()
   */
  async saveOrder(order) {
    if (!order) return;
    
    const orderData = {
      ...order,
      userId: `user-${Config.venue.userSeat.section}-${Config.venue.userSeat.row}`,
      seat: Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat),
      createdAt: Date.now()
    };

    await this.push('orders', orderData);
    
    // Send confirmation notification
    this.sendNotification(
      `Order ${order.id} Confirmed`,
      `Your order will be ready in ~${Math.round((order.estimatedPickup - Date.now()) / 60000)} min at ${order.vendor}`
    );
  },

  /**
   * Send an SOS alert to Firebase
   * @param {Object} location - User location info
   */
  async sendSOS(location) {
    const alert = {
      type: 'sos',
      location,
      timestamp: Date.now(),
      status: 'active',
      userId: `user-${Config.venue.userSeat.section}-${Config.venue.userSeat.row}`
    };

    const key = await this.push('sos-alerts', alert);
    
    this.sendNotification(
      '🚨 SOS Alert Sent',
      'Stadium security has been notified and is on the way to your location.'
    );

    return key;
  },

  /**
   * Submit an issue report
   * @param {string} type - Report type
   * @param {string} description - Issue description
   */
  async submitReport(type, description = '') {
    const report = {
      type,
      description,
      location: Format.seat(Config.venue.userSeat.section, Config.venue.userSeat.row, Config.venue.userSeat.seat),
      timestamp: Date.now(),
      status: 'submitted'
    };

    await this.push('reports', report);
  },

  /**
   * Send a push notification (local + Firebase)
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  sendNotification(title, message) {
    const notif = {
      id: `n-${Date.now()}`,
      title,
      message,
      time: Date.now(),
      read: false,
      type: 'info'
    };

    const current = AppState.get('notifications');
    AppState.set('notifications', [notif, ...current]);
    
    // Push to Firebase for multi-device sync
    if (!this.simulatedMode && this.db) {
      this.db.ref('notifications').push(notif).catch(() => {});
    }

    // Update badge count
    const unread = AppState.get('notifications').filter(n => !n.read).length;
    const badge = DOM.$('#notif-count');
    if (badge) {
      badge.textContent = unread;
      badge.classList.toggle('hidden', unread === 0);
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    // Browser notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/manifest.json' });
    }
  },

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  },

  /**
   * Clean up listeners
   */
  destroy() {
    this._listeners.forEach(({ ref, event }) => {
      ref.off(event);
    });
    this._listeners = [];
    this._clearConnectionFallbackTimer();
    this._liveModeReady = false;
    this._intervals.forEach(interval => clearInterval(interval));
    this._intervals = [];
    AppState.stopSimulation();
  }
};
