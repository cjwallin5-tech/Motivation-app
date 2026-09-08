// Runtime-only caching — nothing is precached at build time, since Vite's JS/CSS filenames are
// content-hashed and change every build, so a static precache list would go stale immediately.
// Instead: prefer the network (so an online visit always gets the latest build), and remember
// whatever succeeds so an offline visit can fall back to the last-seen copy of each file.
const CACHE_NAME = 'motivation-app-shell-v1'
// The directory sw.js itself lives in — same directory as index.html, whatever the deploy path.
// A GET on this URL is what an offline app-shell launch needs served back from cache.
const APP_SHELL_URL = new URL('.', self.location).href

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === 'navigate') {
          const shell = await caches.match(APP_SHELL_URL)
          if (shell) return shell
        }
        return Response.error()
      }),
  )
})
