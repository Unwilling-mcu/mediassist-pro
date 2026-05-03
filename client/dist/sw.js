// MediAssist Pro — Service Worker
// Handles offline caching, background sync, push notifications

const CACHE_NAME    = 'mediassist-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET and API calls
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/'))  return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/')))
  );
});

// Push notifications
self.addEventListener('push', (e) => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'MediAssist Pro', {
      body:    data.body    || 'You have a new health alert',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      tag:     data.tag     || 'mediassist',
      data:    data.url     || '/',
      actions: [
        { action:'open',    title:'Open App' },
        { action:'dismiss', title:'Dismiss'  },
      ],
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(clients.openWindow(e.notification.data || '/'));
});