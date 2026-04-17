/* ============================================
   VenueFlow App Bootstrap
   Main application initialization
   ============================================ */

const App = {
  /** @type {boolean} */
  initialized: false,

  /** @type {Function[]} */
  _stateUnsubscribers: [],

  /**
   * Initialize the entire application
   */
  async init() {
    console.log('VenueFlow - Smart Stadium Experience');
    console.log('-'.repeat(40));

    try {
      A11y.init();
      console.log('Accessibility initialized');

      FirebaseService.init();
      console.log('Firebase initialized');

      Router.init();
      console.log('Router initialized');

      this._bindGlobalEvents();
      this._bindStateObservers();
      this._updateNotificationBadge();
      this._registerServiceWorker();

      setTimeout(() => {
        DOM.toast('Welcome to VenueFlow! Enjoy the match.', 'success', 4000);
      }, 1000);

      this.initialized = true;
      console.log('-'.repeat(40));
      console.log('VenueFlow ready');
    } catch (error) {
      console.error('App initialization failed:', error);
      DOM.toast('Failed to initialize. Please refresh.', 'danger');
    }
  },

  /**
   * Bind global event listeners
   * @private
   */
  _bindGlobalEvents() {
    DOM.$$('.nav-item').forEach(navItem => {
      navItem.addEventListener('click', event => {
        const view = navItem.dataset.view;
        if (view) {
          DOM.ripple(event);
          Router.navigate(view);
        }
      });
    });

    DOM.$('#btn-notifications')?.addEventListener('click', () => this._showNotifications());
    DOM.$('#btn-settings')?.addEventListener('click', () => this._showSettings());

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        DOM.$('#cart-modal')?.classList.add('hidden');
        DOM.$('#a11y-panel')?.remove();
        DOM.$('#notif-panel')?.remove();
        DOM.$('#settings-panel')?.remove();
      }

      if (!event.ctrlKey && !event.altKey && !event.metaKey) {
        const views = ['home', 'map', 'queue', 'concierge', 'order', 'events', 'emergency', 'wallet'];
        const num = parseInt(event.key, 10);
        const tagName = document.activeElement?.tagName;

        if (num >= 1 && num <= views.length && tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
          Router.navigate(views[num - 1]);
        }
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const currentView = Router.views[Router.currentView];
        if (currentView && typeof currentView.render === 'function') {
          currentView.render();
        }
      }
    });

    window.addEventListener('online', () => {
      DOM.toast('Back online!', 'success');
    });

    window.addEventListener('offline', () => {
      DOM.toast('You are offline. Some features may be limited.', 'warning');
    });
  },

  /**
   * Observe global state used by the app shell
   * @private
   */
  _bindStateObservers() {
    this._stateUnsubscribers.forEach(unsubscribe => unsubscribe());
    this._stateUnsubscribers = [
      AppState.subscribe('notifications', () => this._updateNotificationBadge())
    ];
  },

  /**
   * Update the notification badge count
   * @private
   */
  _updateNotificationBadge() {
    const badge = DOM.$('#notif-count');
    if (!badge) return;

    const unread = AppState.get('notifications').filter(notification => !notification.read).length;
    badge.textContent = unread.toString();
    badge.classList.toggle('hidden', unread === 0);
    badge.style.display = unread > 0 ? 'flex' : 'none';
  },

  /**
   * Show notifications panel
   * @private
   */
  _showNotifications() {
    const existing = DOM.$('#notif-panel');
    if (existing) {
      existing.remove();
      return;
    }

    const notifications = AppState.get('notifications');
    const panel = DOM.create('div', {
      id: 'notif-panel',
      className: 'glass-cyber rounded-[1.5rem] border border-white/10 text-white',
      role: 'dialog',
      'aria-label': 'Notifications',
      style: {
        position: 'fixed',
        top: '68px',
        right: '12px',
        left: '12px',
        maxWidth: '420px',
        margin: '0 auto',
        zIndex: '1000',
        maxHeight: '420px',
        overflowY: 'auto',
        padding: '16px'
      }
    });

    panel.innerHTML = `
      <div class="flex items-center justify-between gap-4 mb-4">
        <h3 class="font-headline font-black text-sm uppercase tracking-[0.18em]">Notifications</h3>
        <button class="rounded-full bg-zinc-900 border border-white/10 px-3 py-2 text-[10px] font-headline font-black uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors" id="btn-mark-all-read">
          Mark all read
        </button>
      </div>
      <div class="space-y-2">
        ${notifications.length === 0 ? `
          <div class="rounded-[1.25rem] bg-black/50 border border-white/5 p-5 text-center">
            <p class="font-headline font-black text-xs uppercase tracking-[0.18em] text-white mb-2">No notifications</p>
            <p class="text-zinc-500 text-sm">You are all caught up.</p>
          </div>
        ` : notifications.slice(0, 10).map(notification => `
          <div class="rounded-[1.25rem] border ${notification.read ? 'border-white/5 opacity-70' : 'border-primary/20 bg-primary/5'} p-4">
            <div class="flex items-center justify-between gap-3 mb-1">
              <span class="font-headline font-black text-xs uppercase tracking-[0.12em]">${notification.title}</span>
              <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.16em]">${Format.relativeTime(notification.time)}</span>
            </div>
            <p class="text-sm text-zinc-300">${notification.message}</p>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(panel);

    DOM.$('#btn-mark-all-read', panel)?.addEventListener('click', () => {
      AppState.markAllNotificationsRead();
      panel.remove();
      DOM.toast('All notifications marked as read', 'info');
    });

    setTimeout(() => {
      const handler = event => {
        if (!panel.contains(event.target) && !event.target.closest('#btn-notifications')) {
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
    if (existing) {
      existing.remove();
      return;
    }

    const preferences = AppState.get('preferences');
    const panel = DOM.create('div', {
      id: 'settings-panel',
      className: 'glass-cyber rounded-[1.5rem] border border-white/10 text-white',
      role: 'dialog',
      'aria-label': 'Settings',
      style: {
        position: 'fixed',
        top: '68px',
        right: '12px',
        width: '300px',
        zIndex: '1000',
        padding: '16px'
      }
    });

    panel.innerHTML = `
      <h3 class="font-headline font-black text-sm uppercase tracking-[0.18em] mb-4">Settings</h3>
      <div class="space-y-3">
        <label class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/50 border border-white/5 px-4 py-3 cursor-pointer">
          <span class="text-sm">Push Notifications</span>
          <span class="flex items-center gap-2">
            <input type="checkbox" ${preferences.notificationsEnabled ? 'checked' : ''} id="setting-push">
            <span class="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">On</span>
          </span>
        </label>
        <label class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/50 border border-white/5 px-4 py-3 cursor-pointer">
          <span class="text-sm">Sound Effects</span>
          <span class="flex items-center gap-2">
            <input type="checkbox" ${preferences.soundEnabled ? 'checked' : ''} id="setting-sound">
            <span class="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">On</span>
          </span>
        </label>
        <label class="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/50 border border-white/5 px-4 py-3 cursor-pointer">
          <span class="text-sm">Auto-refresh Data</span>
          <span class="flex items-center gap-2">
            <input type="checkbox" ${preferences.autoRefresh ? 'checked' : ''} id="setting-refresh">
            <span class="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">On</span>
          </span>
        </label>
        <div class="rounded-[1.25rem] bg-black/40 border border-white/5 px-4 py-3 text-xs text-zinc-400 text-center">
          VenueFlow v1.0.0
          <br>Powered by Google services and local fallbacks
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    DOM.$('#setting-push', panel)?.addEventListener('change', async event => {
      AppState.updatePreferences({ notificationsEnabled: event.target.checked });
      if (event.target.checked) {
        await FirebaseService.requestNotificationPermission();
      }
    });

    DOM.$('#setting-sound', panel)?.addEventListener('change', event => {
      AppState.updatePreferences({ soundEnabled: event.target.checked });
    });

    DOM.$('#setting-refresh', panel)?.addEventListener('change', event => {
      AppState.updatePreferences({ autoRefresh: event.target.checked });
    });

    setTimeout(() => {
      const handler = event => {
        if (!panel.contains(event.target) && !event.target.closest('#btn-settings')) {
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
        console.log('Service Worker registered:', registration.scope);
      } catch (error) {
        console.warn('Service Worker registration failed:', error.message);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
