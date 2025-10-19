// Service Worker para PWA
const CACHE_NAME = 'serviciosjt-v1';
const urlsToCache = [
  '/',
  '/offline.html',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Error al abrir cache:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Network First, fallback a cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta para guardarla en cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar con cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // Si es navegación, mostrar página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
