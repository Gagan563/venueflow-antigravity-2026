/* ============================================
   VenueFlow Client-Side Router
   Hash-based SPA routing with view lifecycle
   ============================================ */

const Router = {
  /** @type {Object} View registry: name -> view object */
  views: {},

  /** @type {string} Current active view */
  currentView: 'home',

  /**
   * Initialize the router
   */
  init() {
    // Register all views
    this.views = {
      home: HomeView,
      map: MapView,
      queue: QueueView,
      concierge: ConciergeView,
      order: OrderView,
      events: EventsView,
      emergency: EmergencyView
    };

    // Listen for hash changes
    window.addEventListener('hashchange', () => this._onHashChange());

    // Handle initial route
    const initialView = window.location.hash.replace('#', '') || 'home';
    this.navigate(initialView, false);

    console.log('✅ Router initialized');
  },

  /**
   * Navigate to a view
   * @param {string} viewName - Name of the view to navigate to
   * @param {boolean} [updateHash=true] - Whether to update the URL hash
   */
  navigate(viewName, updateHash = true) {
    // Validate view exists
    if (!this.views[viewName]) {
      console.warn(`View '${viewName}' not found, falling back to home`);
      viewName = 'home';
    }

    // Skip if already on this view
    if (viewName === this.currentView && DOM.$(`#view-${viewName}`)?.innerHTML) {
      return;
    }

    // Destroy current view
    const currentViewObj = this.views[this.currentView];
    if (currentViewObj && typeof currentViewObj.destroy === 'function') {
      currentViewObj.destroy();
    }

    // Update state
    AppState.set('previousView', this.currentView);
    AppState.set('currentView', viewName);
    this.currentView = viewName;

    // Update URL hash
    if (updateHash) {
      window.location.hash = viewName === 'home' ? '' : viewName;
    }

    // Toggle view visibility
    DOM.$$('.view').forEach(v => v.classList.remove('active'));
    const viewEl = DOM.$(`#view-${viewName}`);
    if (viewEl) {
      viewEl.classList.add('active');
    }

    // Update bottom nav
    DOM.$$('.nav-item').forEach(nav => {
      const isActive = nav.dataset.view === viewName;
      nav.classList.toggle('active', isActive);
      nav.setAttribute('aria-selected', isActive);
    });

    // Render the view
    const targetView = this.views[viewName];
    if (targetView && typeof targetView.render === 'function') {
      targetView.render();
    }

    // Scroll to top
    const pageContainer = DOM.$('.page-container');
    if (pageContainer) {
      pageContainer.scrollTop = 0;
    }

    // Announce navigation for screen readers
    A11y.announce(`Navigated to ${viewName} page`);

    console.log(`📍 Route: ${viewName}`);
  },

  /**
   * Handle hash change event
   * @private
   */
  _onHashChange() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigate(hash, false);
  },

  /**
   * Go back to previous view
   */
  back() {
    const prev = AppState.get('previousView');
    if (prev) {
      this.navigate(prev);
    } else {
      this.navigate('home');
    }
  },

  /**
   * Get current view name
   * @returns {string}
   */
  getCurrentView() {
    return this.currentView;
  }
};
