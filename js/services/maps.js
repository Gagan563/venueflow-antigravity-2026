/* ============================================
   VenueFlow Google Maps Service
   Venue map, heatmap overlay, navigation,
   POI markers, evacuation routes
   ============================================ */

const MapsService = {
  /** @type {google.maps.Map|null} */
  map: null,

  /** @type {Promise<boolean>|null} */
  _sdkPromise: null,

  /** @type {google.maps.visualization.HeatmapLayer|null} */
  heatmapLayer: null,

  /** @type {google.maps.Marker[]} */
  markers: [],

  /** @type {google.maps.DirectionsRenderer|null} */
  directionsRenderer: null,

  /** @type {boolean} */
  initialized: false,

  /** @type {google.maps.InfoWindow|null} */
  activeInfoWindow: null,

  /** @type {boolean} */
  heatmapVisible: true,

  /** @type {Function|null} */
  _crowdUnsubscribe: null,

  /**
   * Lazily load Google Maps when a runtime API key is available
   * @returns {Promise<boolean>}
   */
  loadGoogleMaps() {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve(true);
    }

    if (!Config.maps.apiKey) {
      return Promise.resolve(false);
    }

    if (this._sdkPromise) {
      return this._sdkPromise;
    }

    this._sdkPromise = new Promise(resolve => {
      const existing = document.querySelector('script[data-google-maps-sdk="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(typeof google !== 'undefined' && !!google.maps), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(Config.maps.apiKey)}&libraries=visualization,places`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsSdk = 'true';
      script.addEventListener('load', () => resolve(typeof google !== 'undefined' && !!google.maps), { once: true });
      script.addEventListener('error', () => resolve(false), { once: true });
      document.head.appendChild(script);
    });

    return this._sdkPromise;
  },

  /**
   * Initialize Google Maps
   * @param {string} containerId - Map container element ID
   */
  async init(containerId) {
    const container = DOM.$(containerId);
    if (!container) return;

    try {
      const sdkLoaded = await this.loadGoogleMaps();
      if (!sdkLoaded || typeof google === 'undefined' || !google.maps) {
        this._renderFallbackMap(container);
        return;
      }

      this.map = new google.maps.Map(container, {
        center: Config.maps.defaultCenter,
        zoom: Config.maps.defaultZoom,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: this._getMapStyles()
      });

      this.markers = [];
      this.activeInfoWindow = null;

      // Initialize heatmap
      this._initHeatmap();

      // Add POI markers
      this._addPOIMarkers();

      // Initialize directions renderer
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      this.heatmapVisible = true;
      this.initialized = true;
      console.log('✅ Google Maps initialized');

      // Subscribe to crowd zone updates
      if (this._crowdUnsubscribe) this._crowdUnsubscribe();
      this._crowdUnsubscribe = AppState.subscribe('crowdZones', (zones) => this._updateHeatmap(zones));

    } catch (error) {
      console.warn('⚠️ Google Maps init failed:', error.message);
      this._renderFallbackMap(container);
    }
  },

  /**
   * Initialize heatmap layer
   * @private
   */
  _initHeatmap() {
    if (!google.maps.visualization) return;

    const zones = AppState.get('crowdZones');
    const heatmapData = zones.map(z => ({
      location: new google.maps.LatLng(z.lat, z.lng),
      weight: z.weight
    }));

    this.heatmapLayer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: this.map,
      radius: 50,
      opacity: 0.7,
      gradient: [
        'rgba(0, 0, 0, 0)',
        'rgba(16, 185, 129, 0.4)',  // green
        'rgba(16, 185, 129, 0.6)',
        'rgba(245, 158, 11, 0.7)',  // yellow
        'rgba(249, 115, 22, 0.8)',  // orange
        'rgba(239, 68, 68, 0.9)',   // red
        'rgba(239, 68, 68, 1)'
      ]
    });
  },

  /**
   * Update heatmap data
   * @private
   * @param {Array} zones - Crowd zone data
   */
  _updateHeatmap(zones) {
    if (!this.heatmapLayer || !google.maps) return;

    const heatmapData = zones.map(z => ({
      location: new google.maps.LatLng(z.lat, z.lng),
      weight: z.weight
    }));

    this.heatmapLayer.setData(heatmapData);
  },

  /**
   * Add POI markers
   * @private
   */
  _addPOIMarkers() {
    Config.pois.forEach(poi => {
      const marker = new google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map: this.map,
        title: poi.name,
        label: {
          text: poi.icon,
          fontSize: '18px'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: this._getPoiColor(poi.type),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 16
        }
      });

      // Info window
      const queue = AppState.get('queues').find(q => q.id === poi.id);
      const infoContent = `
        <div style="color:#111;font-family:Inter,sans-serif;padding:4px;">
          <strong>${poi.icon} ${poi.name}</strong>
          ${queue ? `<br><span style="color:${Format.waitStatus(queue.waitMinutes)==='success'?'#10b981':Format.waitStatus(queue.waitMinutes)==='warning'?'#f59e0b':'#ef4444'}">Wait: ${Format.waitTime(queue.waitMinutes)}</span>` : ''}
          <br><button onclick="MapsService.navigateTo(${poi.lat},${poi.lng})" style="margin-top:6px;padding:4px 10px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">Navigate →</button>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({ content: infoContent });

      marker.addListener('click', () => {
        if (this.activeInfoWindow) this.activeInfoWindow.close();
        infoWindow.open(this.map, marker);
        this.activeInfoWindow = infoWindow;
      });

      this.markers.push(marker);
    });
  },

  /**
   * Get color for POI type
   * @private
   * @param {string} type
   * @returns {string}
   */
  _getPoiColor(type) {
    const colors = {
      gate: '#3b82f6',
      food: '#f97316',
      restroom: '#8b5cf6',
      medical: '#ef4444',
      info: '#06b6d4'
    };
    return colors[type] || '#64748b';
  },

  /**
   * Navigate to a destination using Google Directions
   * @param {number} destLat - Destination latitude
   * @param {number} destLng - Destination longitude
   */
  navigateTo(destLat, destLng) {
    if (!this.map || !google.maps) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route({
      origin: new google.maps.LatLng(Config.maps.defaultCenter.lat, Config.maps.defaultCenter.lng),
      destination: new google.maps.LatLng(destLat, destLng),
      travelMode: google.maps.TravelMode.WALKING
    }, (result, status) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
        
        const route = result.routes[0];
        if (route && route.legs[0]) {
          DOM.toast(`📍 ${Format.distance(route.legs[0].distance.value)} · ${route.legs[0].duration.text}`, 'info');
        }
      } else {
        DOM.toast('Navigation unavailable for this route', 'warning');
      }
    });
  },

  /**
   * Clear navigation route
   */
  clearNavigation() {
    if (this.directionsRenderer) {
      this.directionsRenderer.set('directions', null);
    }
  },

  /**
   * Show evacuation route
   * @param {string} gateId - Target gate ID
   */
  showEvacuationRoute(gateId) {
    const gate = Config.pois.find(p => p.id === gateId);
    if (gate) {
      this.navigateTo(gate.lat, gate.lng);
      DOM.toast('🚨 Evacuation route displayed', 'danger');
    }
  },

  /**
   * Toggle heatmap visibility
   * @param {boolean} visible
   */
  toggleHeatmap(visible) {
    this.heatmapVisible = visible;
    if (this.heatmapLayer) {
      this.heatmapLayer.setMap(visible ? this.map : null);
    }
  },

  /**
   * Focus the map on a specific location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} [zoom=18] - Target zoom level
   */
  focusOn(lat, lng, zoom = 18) {
    if (!this.map) return;

    this.map.panTo({ lat, lng });
    this.map.setZoom(zoom);
  },

  /**
   * Filter markers by type
   * @param {string|null} type - POI type or null for all
   */
  filterMarkers(type) {
    this.markers.forEach((marker, i) => {
      const poi = Config.pois[i];
      if (type === null || poi.type === type) {
        marker.setMap(this.map);
      } else {
        marker.setMap(null);
      }
    });
  },

  /**
   * Render fallback map when Google Maps is unavailable
   * @private
   * @param {Element} container
   */
  _renderFallbackMap(container) {
    this.initialized = false;

    const zones = AppState.get('crowdZones');
    const pois = Config.pois;

    container.innerHTML = `
      <div style="width:100%;height:100%;background:var(--bg-tertiary);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;">
        <!-- Stadium SVG representation -->
        <svg viewBox="0 0 300 200" width="280" height="180" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
          <!-- Stadium outline -->
          <ellipse cx="150" cy="100" rx="140" ry="90" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
          <ellipse cx="150" cy="100" rx="120" ry="75" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <ellipse cx="150" cy="100" rx="80" ry="50" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
          
          <!-- Field -->
          <rect x="90" y="70" width="120" height="60" rx="4" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.3)" stroke-width="0.5"/>
          <line x1="150" y1="70" x2="150" y2="130" stroke="rgba(16,185,129,0.3)" stroke-width="0.5"/>
          
          <!-- Crowd zones (simplified) -->
          ${zones.map((z, i) => {
            const x = 50 + (i % 5) * 50;
            const y = 40 + Math.floor(i / 5) * 50;
            const color = z.weight > 80 ? '#ef4444' : z.weight > 60 ? '#f59e0b' : '#10b981';
            return `<circle cx="${x}" cy="${y}" r="${8 + z.weight / 15}" fill="${color}" opacity="0.3">
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="${2 + Math.random() * 2}s" repeatCount="indefinite"/>
            </circle>`;
          }).join('')}
          
          <!-- POI icons -->
          ${pois.slice(0, 8).map((poi, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = 150 + Math.cos(angle) * 125;
            const y = 100 + Math.sin(angle) * 80;
            return `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" dominant-baseline="middle">${poi.icon}</text>`;
          }).join('')}
          
          <!-- Labels -->
          <text x="150" y="20" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8" font-family="Inter">NORTH</text>
          <text x="150" y="190" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8" font-family="Inter">SOUTH</text>
        </svg>
        
        <!-- Overlay info -->
        <div style="position:absolute;bottom:12px;left:12px;right:12px;">
          <div class="card card-compact" style="background:rgba(10,14,26,0.85);backdrop-filter:blur(10px);padding:8px 12px;">
            <div class="flex-between" style="font-size:var(--text-xs);">
              <span class="badge badge-live badge-info">LIVE MAP</span>
              <span class="text-tertiary">Interactive map requires Google Maps API</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Get dark map styles
   * @private
   * @returns {Array}
   */
  _getMapStyles() {
    return [
      { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#8b92a5' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ];
  }
};
