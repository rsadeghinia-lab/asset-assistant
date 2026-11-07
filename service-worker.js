/* University Asset Assistant — GitHub Pages release, 2026-11-07. Offline shell only; no inventory data cached. */
const CACHE_NAME = 'university-assets-shell-v2.11.0-hide-unseen-plates';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('university-assets-shell-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // Only cache known static application resources, not arbitrary site responses.
  const path = url.pathname;
  const isShell = APP_SHELL.some(p => new URL(p, self.registration.scope).pathname === path);
  if (isShell) event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
