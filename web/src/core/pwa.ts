/**
 * STARK // English Singularity HUD - Progressive Web App Registration
 * Handles Service Worker lifecycle, offline readiness telemetry, and background updates.
 */

export interface PWAUpdateEventDetail {
  registration: ServiceWorkerRegistration;
}

export function registerServiceWorker(): void {
  // Boundary check: Zero console errors on unsupported browsers or file:// desktop runtime
  if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Telemetry
        if (registration.active) {
          console.log('[PWA] Service Worker active. Offline shell online.');
        }

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('[PWA] New version ready for activation.');
                window.dispatchEvent(
                  new CustomEvent<PWAUpdateEventDetail>('pwa-update-available', {
                    detail: { registration }
                  })
                );
              } else {
                // Initial precache complete
                console.log('[PWA] Initial offline shell precached successfully.');
              }
            }
          });
        });
      })
      .catch((error) => {
        // Graceful handling without breaking runtime
        console.warn('[PWA] Service Worker registration deferred:', error);
      });

    // Handle seamless controller switch
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
