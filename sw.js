// Service worker: caches the app shell so the game works offline once installed.
const CACHE = 'doodle-jump-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.webmanifest',
  './js/main.js',
  './js/modules/config.js',
  './js/modules/world.js',
  './js/modules/render.js',
  './js/modules/input.js',
  './js/modules/audio.js',
  './js/modules/storage.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const NETWORK_TIMEOUT_MS = 3000;

// Network first (to get updates quickly) with a timeout, falling back to the cache on a slow or
// missing connection.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  let saved = Promise.resolve();
  // Clone before the page reads the body, then keep the worker alive until the copy is stored.
  const network = fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      saved = caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  });
  event.waitUntil(network.then(() => saved).catch(() => {}));
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS));
  event.respondWith(
    Promise.race([network.catch(() => null), timeout])
      .then((response) => response || caches.match(request))
      .then((response) => response || network),
  );
});
