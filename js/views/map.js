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

  /** @type {string} Current search query */
  _searchQuery: '',

  /** @type {boolean} Heatmap toggle state */
  _heatmapVisible: true,

  /** @type {Function[]} */
  _unsubscribeFns: [],

  /** @type {SpeechRecognition|null} */
  _recognition: null,

  /**
   * Render the map view
   */
  render() {
    const container = DOM.$('#view-map');
    if (!container) return;

    const density = AppState.get('overallCrowdDensity');
    const crowdInfo = Format.crowdLevel(density);
    const attendance = AppState.get('currentAttendance');
    const filteredPois = this._getFilteredPois();

    container.innerHTML = `
      <div class="relative h-screen w-full flex flex-col overflow-hidden pt-16">
        <div class="absolute inset-0 bg-black">
          <div class="w-full h-full opacity-40 mix-blend-screen heat-map-overlay absolute inset-0 z-10 pointer-events-none"></div>
          <div id="venue-map-container" class="w-full h-full absolute inset-0 z-0">
            <img alt="Stadium Blueprint" class="w-full h-full object-cover grayscale brightness-[0.3] contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApS-cBLMgM35-shkNBYh_HxHFnrwFUR9QQzRq3RecSkd3PlRjPPN8dJRALm-VZncxAcTVnJkSyEz8ypeR6ui_VzIulbkWKt1u6vvQlIWnqJNKIGMRAyFJbB0Gbp9lJeB7TpGjlYb4RLdX-Gx7138hIT4j1AeRqv6c_gnWInJbUHgn7WX9XNuyjvRO9nIX9W-zf5Za0HOrLBxfbF39lEzlKcuB5ZuCpSvmUGB1-x1lwtE356HFnd6W6vopiT5abCbLkNdb4IP_1Anip">
          </div>
        </div>

        <div class="absolute top-6 inset-x-4 z-20 flex flex-col gap-4">
          <div class="glass-cyber rounded-[1.75rem] px-5 py-4 flex items-center gap-3 border-fuchsia-500/20">
            <span class="material-symbols-outlined text-secondary">search</span>
            <input class="bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-500 flex-grow font-headline text-sm outline-none" id="map-search-input" placeholder="Search food, gates, restrooms, medical..." type="text" value="${DOM.escapeHTML(this._searchQuery)}">
            <button class="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 flex items-center justify-center hover:text-white transition-colors" id="btn-map-voice" aria-label="Search with voice">
              <span class="material-symbols-outlined text-zinc-500">mic</span>
            </button>
          </div>

          <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            ${this._renderFilterChip('all', 'bolt', 'All')}
            ${this._renderFilterChip('food', 'fastfood', 'Food')}
            ${this._renderFilterChip('restroom', 'wc', 'Restrooms')}
            ${this._renderFilterChip('gate', 'logout', 'Gates')}
            ${this._renderFilterChip('medical', 'medical_services', 'Medical')}
          </div>
        </div>

        <div class="absolute right-4 top-[24%] flex flex-col gap-3 z-20">
          <button class="w-12 h-12 glass-cyber rounded-full flex items-center justify-center ${this._heatmapVisible ? 'text-primary border-primary/30' : 'text-zinc-400 border-zinc-700'} hover:bg-zinc-900 transition-all" id="btn-map-layers" aria-label="Toggle heatmap">
            <span class="material-symbols-outlined">layers</span>
          </button>
          <button class="w-12 h-12 glass-cyber rounded-full flex items-center justify-center text-white border-zinc-700 hover:text-secondary transition-all" id="btn-map-center" aria-label="Center on my location">
            <span class="material-symbols-outlined">gps_fixed</span>
          </button>
          <label class="glass-cyber rounded-2xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-300 flex items-center gap-2 border border-white/10 cursor-pointer">
            <input class="accent-fuchsia-500" id="toggle-heatmap" type="checkbox" ${this._heatmapVisible ? 'checked' : ''}>
            Heat
          </label>
        </div>

        <div class="absolute bottom-24 left-0 w-full z-30 pointer-events-auto">
          <div class="bg-zinc-950/92 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-primary/20 mx-4 space-y-4">
            <div class="flex justify-between items-start gap-4">
              <div>
                <span class="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.18em] font-headline">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Live map
                </span>
                <h2 class="text-2xl font-black italic tracking-tighter text-white font-headline leading-none mt-3">
                  Venue<span class="text-primary text-neon-fuchsia">_Radar</span>
                </h2>
                <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.18em] mt-2" id="map-result-count">${filteredPois.length} results</p>
              </div>
              <div class="text-right">
                <div class="text-fuchsia-500 font-black text-3xl font-headline tracking-tighter leading-none" id="map-density">${density}%</div>
                <div class="text-[9px] font-bold uppercase tracking-[0.18em]" style="color:${crowdInfo.color};">${crowdInfo.label}</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="glass-cyber rounded-2xl p-4 border-white/5">
                <p class="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.16em]">Attendance</p>
                <p class="font-headline font-black text-xl text-white mt-1" id="map-attendance">${Format.compactNumber(attendance)}</p>
              </div>
              <div class="glass-cyber rounded-2xl p-4 border-white/5">
                <p class="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.16em]">Heatmap</p>
                <p class="font-headline font-black text-xl ${this._heatmapVisible ? 'text-primary' : 'text-zinc-400'} mt-1" id="map-heatmap-status">${this._heatmapVisible ? 'ON' : 'OFF'}</p>
              </div>
            </div>

            <div class="space-y-3 max-h-[42vh] overflow-y-auto pr-1 no-scrollbar" id="map-poi-list">
              ${this._renderPOIList(filteredPois)}
            </div>
          </div>
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
    setTimeout(async () => {
      await MapsService.init('#venue-map-container');
      this._mapInitialized = true;
      MapsService.toggleHeatmap(this._heatmapVisible);
      MapsService.filterMarkers(this._activeFilter);
    }, 300);
  },

  /**
   * Render a filter chip
   * @param {string} filter - Filter name
   * @param {string} icon - Material icon
   * @param {string} label - Chip label
   * @returns {string}
   * @private
   */
  _renderFilterChip(filter, icon, label) {
    const isActive = (filter === 'all' && this._activeFilter === null) || this._activeFilter === filter;
    const activeClass = isActive
      ? 'bg-primary text-black shadow-[0_0_20px_rgba(191,0,255,0.4)]'
      : 'glass-cyber text-white border-zinc-700/50 hover:bg-zinc-800/80';

    return `
      <button class="flex items-center gap-2 px-5 py-2.5 rounded-full font-headline font-bold text-xs whitespace-nowrap transition-colors active:scale-95 ${activeClass}" data-filter="${filter}">
        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">${icon}</span>
        ${label}
      </button>
    `;
  },

  /**
   * Resolve filtered POIs from the active search and chip state
   * @returns {Array}
   * @private
   */
  _getFilteredPois() {
    const normalizedQuery = this._searchQuery.trim().toLowerCase();

    return Config.pois.filter(poi => {
      const matchesFilter = this._activeFilter === null || poi.type === this._activeFilter;
      const matchesQuery = !normalizedQuery
        || poi.name.toLowerCase().includes(normalizedQuery)
        || poi.type.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  },

  /**
   * Render POI list
   * @param {Array} pois - Points of interest to show
   * @returns {string}
   * @private
   */
  _renderPOIList(pois) {
    const queues = AppState.get('queues');

    if (pois.length === 0) {
      return `
        <div class="glass-cyber rounded-2xl p-4 border-white/5 text-center">
          <p class="font-headline font-black text-sm uppercase tracking-[0.18em] text-white mb-2">No matches</p>
          <p class="text-zinc-400 text-xs">Try another keyword or clear the filters to see every live point of interest.</p>
        </div>
      `;
    }

    return pois.map(poi => {
      const queue = queues.find(item => item.id === poi.id);
      const waitTone = queue ? Format.waitStatus(queue.waitMinutes) : 'success';
      const waitClass = waitTone === 'success' ? 'text-emerald-500' : waitTone === 'warning' ? 'text-orange-400' : 'text-red-500';

      return `
        <button class="w-full text-left glass-cyber rounded-[1.5rem] p-4 border-white/5 hover:bg-zinc-900 transition-colors" data-poi-lat="${poi.lat}" data-poi-lng="${poi.lng}" data-poi-name="${DOM.escapeHTML(poi.name)}">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-xl shrink-0">
              ${poi.icon}
            </div>
            <div class="flex-grow min-w-0">
              <div class="flex items-start justify-between gap-3 mb-1">
                <div>
                  <p class="font-headline font-black text-sm uppercase tracking-tight text-white">${poi.name}</p>
                  <p class="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">${poi.type}</p>
                </div>
                <span class="material-symbols-outlined text-zinc-500 shrink-0">arrow_forward</span>
              </div>
              <div class="flex items-center justify-between gap-3 mt-3">
                <span class="text-[10px] font-bold uppercase tracking-[0.16em] ${waitClass}">
                  ${queue ? `${Format.waitTime(queue.waitMinutes)} wait` : 'Route available'}
                </span>
                <span class="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.16em]">
                  ${queue ? `${queue.capacity}% load` : 'tap to route'}
                </span>
              </div>
            </div>
          </div>
        </button>
      `;
    }).join('');
  },

  /**
   * Update the filtered list UI
   * @private
   */
  _updatePoiResults() {
    const list = DOM.$('#map-poi-list');
    const count = DOM.$('#map-result-count');
    const pois = this._getFilteredPois();

    if (list) {
      list.innerHTML = this._renderPOIList(pois);
      this._bindPoiActions(list.parentElement || document);
    }

    if (count) {
      count.textContent = `${pois.length} result${pois.length === 1 ? '' : 's'}`;
    }

    MapsService.filterMarkers(this._activeFilter);
  },

  /**
   * Start voice search if supported
   * @private
   */
  _startVoiceSearch() {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      DOM.toast('Voice search is not supported in this browser', 'info');
      return;
    }

    if (this._recognition) {
      this._recognition.stop();
      this._recognition = null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', event => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      this._searchQuery = transcript;
      const input = DOM.$('#map-search-input');
      if (input) input.value = transcript;
      this._updatePoiResults();
    });

    recognition.addEventListener('end', () => {
      this._recognition = null;
    });

    recognition.start();
    this._recognition = recognition;
    DOM.toast('Listening for a destination...', 'info');
  },

  /**
   * Center the map on the user seat cluster
   * @private
   */
  _centerMap() {
    MapsService.focusOn(Config.maps.defaultCenter.lat, Config.maps.defaultCenter.lng, Config.maps.defaultZoom + 1);
    DOM.toast(`Centered on Section ${Config.venue.userSeat.section}`, 'success');
  },

  /**
   * Bind POI card actions
   * @param {Element} parent - Parent container
   * @private
   */
  _bindPoiActions(parent) {
    DOM.$$('[data-poi-lat]', parent).forEach(item => {
      item.addEventListener('click', () => {
        const lat = Number(item.dataset.poiLat);
        const lng = Number(item.dataset.poiLng);
        MapsService.focusOn(lat, lng);
        MapsService.navigateTo(lat, lng);
      });
    });
  },

  /**
   * Bind event listeners
   * @param {Element} container - View container
   * @private
   */
  _bindEvents(container) {
    DOM.$$('[data-filter]', container).forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;
        this._activeFilter = filter === 'all' ? null : filter;
        this.render();
      });
    });

    const searchInput = DOM.$('#map-search-input', container);
    if (searchInput) {
      const onSearch = DOM.debounce(() => {
        this._searchQuery = searchInput.value;
        this._updatePoiResults();
      }, 120);

      searchInput.addEventListener('input', onSearch);
    }

    DOM.$('#btn-map-voice', container)?.addEventListener('click', () => this._startVoiceSearch());

    DOM.$('#btn-map-layers', container)?.addEventListener('click', () => {
      this._heatmapVisible = !this._heatmapVisible;
      const checkbox = DOM.$('#toggle-heatmap');
      if (checkbox) checkbox.checked = this._heatmapVisible;
      MapsService.toggleHeatmap(this._heatmapVisible);

      const status = DOM.$('#map-heatmap-status');
      if (status) {
        status.textContent = this._heatmapVisible ? 'ON' : 'OFF';
        status.className = `font-headline font-black text-xl mt-1 ${this._heatmapVisible ? 'text-primary' : 'text-zinc-400'}`;
      }

      DOM.toast(`Heatmap ${this._heatmapVisible ? 'enabled' : 'disabled'}`, 'info');
    });

    DOM.$('#btn-map-center', container)?.addEventListener('click', () => this._centerMap());

    DOM.$('#toggle-heatmap', container)?.addEventListener('change', event => {
      this._heatmapVisible = event.target.checked;
      MapsService.toggleHeatmap(this._heatmapVisible);
      const status = DOM.$('#map-heatmap-status');
      if (status) {
        status.textContent = this._heatmapVisible ? 'ON' : 'OFF';
        status.className = `font-headline font-black text-xl mt-1 ${this._heatmapVisible ? 'text-primary' : 'text-zinc-400'}`;
      }
    });

    this._bindPoiActions(container);
  },

  /**
   * Subscribe to live data updates
   * @private
   */
  _subscribeToUpdates() {
    this._unsubscribe();

    this._unsubscribeFns = [
      AppState.subscribe('overallCrowdDensity', value => {
        const density = DOM.$('#map-density');
        if (density) {
          density.textContent = `${value}%`;
          density.style.color = Format.crowdLevel(value).color;
        }
      }),
      AppState.subscribe('currentAttendance', value => {
        const attendance = DOM.$('#map-attendance');
        if (attendance) attendance.textContent = Format.compactNumber(value);
      }),
      AppState.subscribe('queues', () => {
        this._updatePoiResults();
      })
    ];
  },

  /**
   * Clear state subscriptions
   * @private
   */
  _unsubscribe() {
    this._unsubscribeFns.forEach(unsubscribe => unsubscribe());
    this._unsubscribeFns = [];
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this._recognition) {
      this._recognition.stop();
      this._recognition = null;
    }

    this._unsubscribe();
    MapsService.clearNavigation();
  }
};
