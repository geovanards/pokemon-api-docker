const CACHE = 'poke-api-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles.css',
  './app.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  });

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          new Response('Você está offline.', {
            headers: { 'Content-Type': 'text/plain' }
          })
        )
      );
    })
  );
});  