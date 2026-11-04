// sw.js — Service Worker cho Quản Lý Chi Tiêu PWA
// Version 1.0 — Chiến lược: network-first cho HTML, cache-first cho static assets
// Nhiệm vụ: Đủ điều kiện cài PWA + chạy offline sau lần truy cập đầu tiên

const CACHE_VERSION = 'expense-tracker-v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// Cài đặt: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => {
        // Nếu thiếu 1 file icon nào đó, vẫn cài được nhưng không có icon dự phòng
        // Tránh fail toàn bộ install
        return Promise.resolve();
      }))
      .then(() => self.skipWaiting())
  );
});

// Kích hoạt: xoá cache cũ
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

// Fetch handler — điều kiện bắt buộc để Android Chrome kích hoạt install prompt
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Chỉ xử lý GET — bỏ qua POST/PUT/...
  if (req.method !== 'GET') return;

  // Bỏ qua request cross-origin (analytics, CDN ngoài, v.v.)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first → cache fallback khi offline
  // Đảm bảo user luôn nhận bản index.html mới khi có mạng
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

  // Static assets (manifest, icon, css, js): cache-first + revalidate ngầm
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

// Cho phép trang gửi message để kích hoạt SW mới ngay (dùng khi cần)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});