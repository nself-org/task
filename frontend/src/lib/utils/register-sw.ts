/**
 * Service Worker Registration
 *
 * Registers the service worker for PWA functionality including:
 * - Offline support
 * - Push notifications
 * - Background sync
 */

const DEBUG_SW =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_SW === 'true';

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    if (DEBUG_SW) console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    if (DEBUG_SW) console.log('[SW] Service Worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          if (DEBUG_SW) console.log('[SW] New version available - reload to update');

          // Optionally notify user
          if (confirm('New version available! Reload to update?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    // Auto-reload on controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (DEBUG_SW) console.log('[SW] Controller changed - reloading');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Unregister service worker (for debugging)
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
    if (DEBUG_SW) console.log('[SW] Service Worker unregistered');
  }
}

/**
 * Check if service worker is registered
 */
export async function isServiceWorkerRegistered() {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.getRegistration();
  return !!registration;
}
