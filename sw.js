// sw.js — V1.1 (modular structure)
// Cập nhật cache cho cấu trúc file mới (tách css/ và js/)
// Bắt buộc tăng CACHE_VERSION để trình duyệt xoá cache cũ

const CACHE_VERSION = 'expense-tracker-v2.0.0';

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
  './js/categories.js',
  './js/reports.js',
  './js/settings.js',

  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

/* ==================================================================
   INSTALL — precache app shell
   ================================================================== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        // addAll fail nếu bất kỳ file nào 404 → catch để SW vẫn cài được
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

  // Chỉ xử lý GET
  if (req.method !== 'GET') return;

  // Bỏ qua cross-origin
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first → cache fallback khi offline
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // JS/CSS modules: network-first (luôn cập nhật khi có mạng, fallback cache khi offline)
  // Lý do: file JS/CSS thay đổi thường xuyên khi dev; cache-first sẽ giữ bản cũ
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
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static assets (manifest, icon): cache-first + revalidate ngầm
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
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* ==================================================================
   MESSAGE — cho phép trang trigger SW update
   ================================================================== */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});