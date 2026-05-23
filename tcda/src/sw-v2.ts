/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
// clientsClaim from workbox-core is replaced by manual activate handler below
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Take control immediately on install — evicts any stale/old SW
self.addEventListener('install', () => self.skipWaiting())

// On activate: claim all clients, then navigate each window to force a fresh load
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  )
})

// Also handle explicit SKIP_WAITING messages from vite-plugin-pwa
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Always fetch HTML from network so index.html is never served stale from cache
registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: 'pages' })))

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title: string = data.title ?? 'TCDA'
  const body: string = data.body ?? ''
  const url: string = data.url ?? '/ja/collection'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon192.png',
      badge: '/icon192.png',
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url ?? '/ja/collection')
  )
})
