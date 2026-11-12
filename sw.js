// sw.js — V1.5
// Fix: Tăng CACHE_VERSION lên v2.4.0 để xóa triệt để cache lỗi icon trên điện thoại.
// Bắt buộc tăng CACHE_VERSION mỗi khi sửa code HTML/CSS/JS.

const CACHE_VERSION = 'expense-tracker-v2.4.0'; // [FIX] Tăng phiên bản

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',

  // CSS
  './css/theme.css',
  './css/app.css',

  // JS modules
  './js/main.js',
  './js/core.js',
  './js/dashboard.js',
  './js/expenses.js',
  './js/reports.js',
  './js/settings.js',
  './js/sync.js',
  './js/crypto.js',

  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

function offlineResponse() {
  return new Response('Offline — nội dung chưa được cache.', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

/* ==================================================================
   INSTALL — precache app shell
   ================================================================== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        return cache.addAll(APP_SHELL).catch((err) => {
          console.warn('Precache warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

/* ==================================================================
   ACTIVATE — xoá cache cũ
   ================================================================== */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ==================================================================
   FETCH — network-first cho HTML/JS/CSS, cache-first cho static
   ================================================================== */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first → cache fallback → index.html → 503
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            if (!req.url.includes('code=')) {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
            }
          }
          return res;
        })
        .catch(() =>
          caches.match(req)
            .then((cached) => cached || caches.match('./index.html'))
        )
        .then((res) => res || offlineResponse())
    );
    return;
  }

  // JS/CSS modules: network-first
  const isCode = /\.(js|css|mjs)$/.test(url.pathname);
  if (isCode) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || offlineResponse())
        )
    );
    return;
  }

  // Static assets: cache-first + revalidate ngầm
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => null);

      if (cached) {
        networkFetch.catch(() => {});
        return cached;
      }

      return networkFetch.then((res) => res || offlineResponse());
    })
  );
});

/* ==================================================================
   MESSAGE — cho phép trang trigger SW update
   ================================================================== */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
