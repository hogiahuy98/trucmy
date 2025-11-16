// Service Worker for /an-gi PWA
// Only caches routes under /an-gi

const CACHE_NAME = 'angi-cache-v1'
const SCOPE = '/an-gi'

// Install event - cache initial resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching initial resources')
      return cache.addAll([
        SCOPE,
        `${SCOPE}/`,
        // Add other critical resources if needed
      ])
    })
  )
  self.skipWaiting() // Activate immediately
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  return self.clients.claim() // Take control of all pages
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Only handle requests within /an-gi scope
  if (url.pathname.startsWith(SCOPE)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-GET requests or non-successful responses
          if (
            event.request.method !== 'GET' ||
            !response || 
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }
          
          // Clone the response
          const responseToCache = response.clone()
          
          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          
          return response
        }).catch(() => {
          // If fetch fails, return offline page if available
          if (event.request.destination === 'document') {
            return caches.match(`${SCOPE}/`)
          }
        })
      })
    )
  }
  // For requests outside /an-gi scope, just fetch normally (don't intercept)
})

