'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.pathname.startsWith('/chi-tieu')
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/chi-tieu/finance-sw.js', {
          scope: '/chi-tieu/',
        })
        .then((registration) => {
          console.log(
            '[PWA] Finance Service Worker registered successfully:',
            registration.scope
          )

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000) // Check every minute

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available, prompt user to reload
                  console.log('[PWA] New finance service worker available')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[PWA] Finance Service Worker registration failed:', error)
        })

      // Handle service worker controller changes
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  }, [])

  return null
}

