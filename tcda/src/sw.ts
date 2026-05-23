/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope

// Take control immediately on install — evicts any stale/old SW
self.addEventListener('install', () => self.skipWaiting())
clientsClaim()

// Also handle explicit SKIP_WAITING messages from vite-plugin-pwa
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

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
