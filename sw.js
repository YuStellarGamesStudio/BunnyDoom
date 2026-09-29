// Production values are injected by tools/hash-assets.mjs.
const VERSION = '__BUNNY_VERSION__';
const PRECACHE = /* BUNNY_PRECACHE */ [];
const PREFIX = 'bunnydoom-';

self.addEventListener('install', (event) => {
  if (VERSION === '__BUNNY_VERSION__') return;
  // Do not force-activate during a battle. The browser switches after old clients close.
  event.waitUntil(caches.open(VERSION).then(async (cache) => {
    try {
      await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
    } catch (error) {
      await caches.delete(VERSION);
      throw error;
    }
  }));
});

self.addEventListener('activate', (event) => {
  if (VERSION === '__BUNNY_VERSION__') return;
  event.waitUntil((async () => {
    const keys = (await caches.keys()).filter((key) => key.startsWith(PREFIX));
    // Keep one prior release for pages loaded across the activation boundary.
    const previous = keys.filter((key) => key !== VERSION).at(-1);
    await Promise.all(keys.filter((key) => key !== VERSION && key !== previous).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (VERSION === '__BUNNY_VERSION__' || request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const current = await caches.open(VERSION);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok) return response;
      } catch { /* Exact entry fallback preserves language in the navigation URL. */ }
      return await current.match(new URL('index.html', self.registration.scope)) || new Response('Offline game not installed.', { status: 503 });
    }
    const hit = await current.match(request);
    if (hit) return hit;
    if (url.pathname.includes('/releases/')) {
      for (const key of await caches.keys()) {
        if (!key.startsWith(PREFIX) || key === VERSION) continue;
        const previous = await (await caches.open(key)).match(request);
        if (previous) return previous;
      }
    }
    try { return await fetch(request); }
    catch { return new Response('Resource unavailable offline.', { status: 504 }); }
  })());
});
