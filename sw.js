/* ============================================
   VenueFlow Service Worker
   Caching strategy for offline support
   ============================================ */

const CACHE_NAME = 'venueflow-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/animations.css',
  '/js/utils/dom.js',
  '/js/utils/format.js',
  '/js/utils/accessibility.js',
  '/js/config.js',
  '/js/state.js',
  '/js/services/firebase.js',
  '/js/services/maps.js',
  '/js/services/gemini.js',
  '/js/services/calendar.js',
  '/js/views/home.js',
  '/js/views/map.js',
  '/js/views/queue.js',
  '/js/views/concierge.js',
  '/js/views/order.js',
  '/js/views/events.js',
  '/js/views/emergency.js',
  '/js/views/wallet.js',
  '/js/router.js',
  '/js/app.js',
  '/manifest.json'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => {
        console.warn('[SW] Cache addAll failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external API requests (let them go to network only)
  if (request.url.includes('googleapis.com') || 
      request.url.includes('gstatic.com') ||
      request.url.includes('firebaseio.com') ||
      request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(request)
      .then(response => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and offline, return offline page for navigation
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
