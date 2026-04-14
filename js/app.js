/* ============================================
   VenueFlow App Bootstrap
   Main application initialization
   ============================================ */

const App = {
  /** @type {boolean} */
  initialized: false,

  /**
   * Initialize the entire application
   */
  async init() {
    console.log('🏟️ VenueFlow — Smart Stadium Experience');
    console.log('━'.repeat(40));

    try {
      // 1. Initialize accessibility features
      A11y.init();
      console.log('♿ Accessibility initialized');

      // 2. Initialize Firebase (real-time data)
      FirebaseService.init();
      console.log('🔥 Firebase initialized');

      // 3. Initialize router and views
      Router.init();
      console.log('🗺️ Router initialized');

      // 4. Bind global event listeners
      this._bindGlobalEvents();

      // 5. Register service worker for PWA
      this._registerServiceWorker();

      // 6. Show welcome toast
      setTimeout(() => {
        DOM.toast('Welcome to VenueFlow! 🏟️ Enjoy the game!', 'success', 4000);
      }, 1000);

      this.initialized = true;
      console.log('━'.repeat(40));
      console.log('✅ VenueFlow ready!');

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      DOM.toast('Failed to initialize. Please refresh.', 'danger');
    }
  },

  /**
   * Bind global event listeners
   * @private
   */
  _bindGlobalEvents() {
    // Bottom navigation
    DOM.$$('.nav-item').forEach(navItem => {
      navItem.addEventListener('click', (e) => {
        DOM.ripple(e);
        const view = navItem.dataset.view;
        if (view) Router.navigate(view);
      });
    });

    // Notification button
    const notifBtn = DOM.$('#btn-notifications');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => this._showNotifications());
    }

    // Settings button
    const settingsBtn = DOM.$('#btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this._showSettings());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        const modal = DOM.$('#cart-modal');
        if (modal) modal.style.display = 'none';
        
        const a11yPanel = DOM.$('#a11y-panel');
        if (a11yPanel) a11yPanel.remove();
        
        const notifPanel = DOM.$('#notif-panel');
        if (notifPanel) notifPanel.remove();
      }

      // Number keys for quick navigation (1-6)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        const views = ['home', 'map', 'queue', 'concierge', 'order', 'emergency'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          Router.navigate(views[num - 1]);
        }
      }
    });

    // Handle visibility change (pause/resume simulation)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('⏸️ App backgrounded');
      } else {
        console.log('▶️ App foregrounded');
        // Re-render current view to refresh data
        const currentView = Router.views[Router.currentView];
        if (currentView && typeof currentView.render === 'function') {
          currentView.render();
        }
      }
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      DOM.toast('✅ Back online!', 'success');
    });

    window.addEventListener('offline', () => {
      DOM.toast('📡 You are offline. Some features may be limited.', 'warning');
    });

    // Add ripple to all buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn && !btn.closest('.nav-item')) {
        DOM.ripple(e);
      }
    });
  },

  /**
   * Show notifications panel
   * @private
   */
  _showNotifications() {
    const existing = DOM.$('#notif-panel');
    if (existing) { existing.remove(); return; }

    const notifications = AppState.get('notifications');

    const panel = DOM.create('div', {
      id: 'notif-panel',
      className: 'card',
      role: 'dialog',
      'aria-label': 'Notifications',
      style: {
        position: 'fixed',
        top: '60px',
        right: '12px',
        left: '12px',
        maxWidth: 'calc(var(--max-width) - 24px)',
        margin: '0 auto',
        zIndex: '1000',
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '16px'
      }
    });

    panel.innerHTML = `
      <div class="flex-between" style="margin-bottom: var(--space-4);">
        <h3 style="font-size: var(--text-md);">🔔 Notifications</h3>
        <button class="btn btn-ghost btn-sm" id="btn-mark-all-read">Mark all read</button>
      </div>
      <div class="flex-col gap-2">
        ${notifications.length === 0 ? `
          <div class="empty-state" style="padding: var(--space-6);">
            <span class="empty-icon">🔔</span>
            <span class="empty-title">No notifications</span>
          </div>
        ` : notifications.slice(0, 10).map(n => `
          <div class="card card-compact ${n.read ? '' : 'hover-lift'}" style="${n.read ? 'opacity: 0.6;' : 'border-left: 3px solid var(--accent-blue);'}">
            <div class="flex-between" style="margin-bottom: 4px;">
              <span class="font-semibold text-sm">${n.title}</span>
              <span class="text-xs text-tertiary">${Format.relativeTime(n.time)}</span>
            </div>
            <p class="text-sm text-secondary">${n.message}</p>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(panel);

    // Mark all read
    DOM.$('#btn-mark-all-read', panel)?.addEventListener('click', () => {
      const updated = notifications.map(n => ({ ...n, read: true }));
      AppState.set('notifications', updated);
      const badge = DOM.$('#notif-count');
      if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
      panel.remove();
      DOM.toast('All notifications marked as read', 'info');
    });

    // Close on outside click
    setTimeout(() => {
      const handler = (e) => {
        if (!panel.contains(e.target) && e.target !== DOM.$('#btn-notifications')) {
          panel.remove();
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }, 10);
  },

  /**
   * Show settings panel
   * @private
   */
  _showSettings() {
    const existing = DOM.$('#settings-panel');
    if (existing) { existing.remove(); return; }

    const panel = DOM.create('div', {
      id: 'settings-panel',
      className: 'card',
      role: 'dialog',
      'aria-label': 'Settings',
      style: {
        position: 'fixed',
        top: '60px',
        right: '12px',
        zIndex: '1000',
        width: '280px',
        padding: '16px'
      }
    });

    panel.innerHTML = `
      <h3 style="font-size: var(--text-md); margin-bottom: var(--space-4);">⚙️ Settings</h3>
      <div class="flex-col gap-4">
        <div class="flex-between">
          <span class="text-sm">Push Notifications</span>
          <label class="toggle">
            <input type="checkbox" checked id="setting-push">
            <span class="toggle-track"></span>
            <span class="toggle-thumb"></span>
          </label>
        </div>
        <div class="flex-between">
          <span class="text-sm">Sound Effects</span>
          <label class="toggle">
            <input type="checkbox" checked id="setting-sound">
            <span class="toggle-track"></span>
            <span class="toggle-thumb"></span>
          </label>
        </div>
        <div class="flex-between">
          <span class="text-sm">Auto-refresh Data</span>
          <label class="toggle">
            <input type="checkbox" checked id="setting-refresh">
            <span class="toggle-track"></span>
            <span class="toggle-thumb"></span>
          </label>
        </div>
        <div class="divider"></div>
        <div class="text-xs text-tertiary text-center">
          VenueFlow v1.0.0 · Built with ❤️
          <br>Powered by Google Services
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Close on outside click
    setTimeout(() => {
      const handler = (e) => {
        if (!panel.contains(e.target) && e.target !== DOM.$('#btn-settings')) {
          panel.remove();
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }, 10);
  },

  /**
   * Register service worker
   * @private
   */
  async _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('sw.js');
        console.log('📦 Service Worker registered:', registration.scope);
      } catch (error) {
        console.warn('Service Worker registration failed:', error.message);
      }
    }
  }
};

// ── Start the app when DOM is ready ──
document.addEventListener('DOMContentLoaded', () => App.init());
