/* ============================================
   VenueFlow Live Map View
   Interactive crowd density heatmap
   with POI markers and navigation
   ============================================ */

const MapView = {
  /** @type {boolean} Whether map has been initialized */
  _mapInitialized: false,

  /** @type {string|null} Currently active POI filter */
  _activeFilter: null,

  /**
   * Render the map view
   */
  render() {
    const container = DOM.$('#view-map');
    if (!container) return;

    const density = AppState.get('overallCrowdDensity');
    const crowdInfo = Format.crowdLevel(density);
    const attendance = AppState.get('currentAttendance');

    container.innerHTML = `
      <div class="page-header animate-fade-in-up">
        <h1 class="page-title">🗺️ Live Venue Map</h1>
        <p class="page-desc">Real-time crowd density & navigation</p>
      </div>

      <!-- Crowd Summary Bar -->
      <div class="card card-compact animate-fade-in-up" style="margin-bottom: var(--space-4); animation-delay: 100ms;">
        <div class="flex-between">
          <div class="flex-row gap-4">
            <div>
              <span class="text-xs text-tertiary">DENSITY</span>
              <div class="font-bold" style="color: ${crowdInfo.color};" id="map-density">${density}%</div>
            </div>
            <div class="divider" style="width: 1px; height: 32px; margin: 0;"></div>
            <div>
              <span class="text-xs text-tertiary">ATTENDANCE</span>
              <div class="font-bold" id="map-attendance">${Format.compactNumber(attendance)}</div>
            </div>
          </div>
          <span class="badge badge-live badge-${Format.waitStatus(density > 75 ? 20 : density > 50 ? 10 : 3)}">${crowdInfo.label}</span>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-container animate-scale-in" style="animation-delay: 200ms; height: 380px;" id="venue-map-container" role="img" aria-label="Interactive venue map showing crowd density">
        <div class="flex-center" style="height: 100%; background: var(--bg-tertiary);">
          <div class="spinner-lg"></div>
        </div>
      </div>

      <!-- Map Controls -->
      <div class="flex-row" style="margin: var(--space-4) 0; overflow-x: auto; gap: var(--space-2);" role="toolbar" aria-label="Map filter controls">
        <button class="chip chip-active" data-filter="all" id="filter-all">📍 All</button>
        <button class="chip" data-filter="food" id="filter-food">🍔 Food</button>
        <button class="chip" data-filter="restroom" id="filter-restroom">🚻 Restrooms</button>
        <button class="chip" data-filter="gate" id="filter-gate">🚪 Gates</button>
        <button class="chip" data-filter="medical" id="filter-medical">🏥 Medical</button>
      </div>

      <!-- Map Legend -->
      <div class="card card-compact animate-fade-in-up" style="animation-delay: 300ms;">
        <div class="section-title" style="font-size: var(--text-sm); margin-bottom: var(--space-3);">🎨 Crowd Density Legend</div>
        <div class="flex-between" style="gap: var(--space-2);">
          <div class="flex-col gap-1 flex-1" style="align-items: center;">
            <div style="width: 100%; height: 6px; border-radius: 3px; background: var(--success);"></div>
            <span class="text-xs text-tertiary">Low</span>
          </div>
          <div class="flex-col gap-1 flex-1" style="align-items: center;">
            <div style="width: 100%; height: 6px; border-radius: 3px; background: var(--warning);"></div>
            <span class="text-xs text-tertiary">Moderate</span>
          </div>
          <div class="flex-col gap-1 flex-1" style="align-items: center;">
            <div style="width: 100%; height: 6px; border-radius: 3px; background: var(--accent-orange);"></div>
            <span class="text-xs text-tertiary">High</span>
          </div>
          <div class="flex-col gap-1 flex-1" style="align-items: center;">
            <div style="width: 100%; height: 6px; border-radius: 3px; background: var(--danger);"></div>
            <span class="text-xs text-tertiary">Critical</span>
          </div>
        </div>
      </div>

      <!-- Nearby POIs -->
      <div class="section" style="margin-top: var(--space-5);">
        <div class="section-header">
          <h2 class="section-title">📍 Points of Interest</h2>
        </div>
        <div class="flex-col stagger-children" id="map-poi-list">
          ${this._renderPOIList()}
        </div>
      </div>

      <!-- Heatmap Toggle -->
      <div class="card card-compact" style="margin-top: var(--space-4);">
        <div class="flex-between">
          <div>
            <div class="font-medium text-sm">🌡️ Heatmap Overlay</div>
            <div class="text-xs text-tertiary">Toggle crowd density visualization</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="toggle-heatmap" checked>
            <span class="toggle-track"></span>
            <span class="toggle-thumb"></span>
          </label>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._initMap();
    this._subscribeToUpdates();
  },

  /**
   * Initialize the Google Map
   * @private
   */
  _initMap() {
    // Delay to ensure container is rendered
    setTimeout(() => {
      MapsService.init('#venue-map-container');
      this._mapInitialized = true;
    }, 300);
  },

  /**
   * Render POI list
   * @private
   * @returns {string}
   */
  _renderPOIList() {
    const queues = AppState.get('queues');
    
    return Config.pois.slice(0, 8).map(poi => {
      const queue = queues.find(q => q.id === poi.id);
      return `
        <div class="card card-compact flex-row animate-fade-in-up" style="gap: var(--space-3); cursor: pointer;" data-poi-lat="${poi.lat}" data-poi-lng="${poi.lng}">
          <div class="avatar" style="background: ${this._getPoiGradient(poi.type)}; font-size: var(--text-lg);">
            ${poi.icon}
          </div>
          <div style="flex: 1;">
            <div class="font-medium text-sm">${poi.name}</div>
            <div class="text-xs text-tertiary">${poi.type.charAt(0).toUpperCase() + poi.type.slice(1)}</div>
          </div>
          ${queue ? `
            <div class="text-right">
              <div class="font-mono font-bold text-sm" style="color: var(--${Format.waitStatus(queue.waitMinutes) === 'success' ? 'success' : Format.waitStatus(queue.waitMinutes) === 'warning' ? 'warning' : 'danger'});">
                ${queue.waitMinutes}m
              </div>
              <div class="text-xs text-tertiary">${queue.trend === 'rising' ? '📈' : queue.trend === 'falling' ? '📉' : '➡️'}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  /**
   * Get gradient for POI type
   * @private
   */
  _getPoiGradient(type) {
    const gradients = {
      gate: 'var(--gradient-brand)',
      food: 'linear-gradient(135deg, #f97316, #ef4444)',
      restroom: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
      medical: 'linear-gradient(135deg, #ef4444, #dc2626)',
      info: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
    };
    return gradients[type] || 'var(--gradient-brand)';
  },

  /**
   * Bind event listeners
   * @private
   */
  _bindEvents(container) {
    // Filter chips
    DOM.$$('.chip', container).forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.$$('.chip', container).forEach(c => c.classList.remove('chip-active'));
        chip.classList.add('chip-active');
        
        const filter = chip.dataset.filter;
        this._activeFilter = filter === 'all' ? null : filter;
        MapsService.filterMarkers(this._activeFilter);
      });
    });

    // Heatmap toggle
    const heatmapToggle = DOM.$('#toggle-heatmap', container);
    if (heatmapToggle) {
      heatmapToggle.addEventListener('change', (e) => {
        MapsService.toggleHeatmap(e.target.checked);
      });
    }

    // POI click to navigate
    DOM.$$('[data-poi-lat]', container).forEach(el => {
      el.addEventListener('click', () => {
        const lat = parseFloat(el.dataset.poiLat);
        const lng = parseFloat(el.dataset.poiLng);
        MapsService.navigateTo(lat, lng);
      });
    });
  },

  /**
   * Subscribe to live data updates
   * @private
   */
  _subscribeToUpdates() {
    AppState.subscribe('overallCrowdDensity', (val) => {
      const el = DOM.$('#map-density');
      if (el) {
        el.textContent = `${val}%`;
        el.style.color = Format.crowdLevel(val).color;
      }
    });

    AppState.subscribe('currentAttendance', (val) => {
      const el = DOM.$('#map-attendance');
      if (el) el.textContent = Format.compactNumber(val);
    });
  },

  /**
   * Cleanup
   */
  destroy() {
    MapsService.clearNavigation();
  }
};
