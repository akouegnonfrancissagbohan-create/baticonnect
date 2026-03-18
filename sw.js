// ============================================================
//  BATICONNECT — Service Worker (PWA)
//  Fichier : sw.js
//  Gère le cache et le mode hors ligne
// ============================================================

const CACHE_NAME    = 'baticonnect-v1';
const CACHE_OFFLINE = 'baticonnect-offline-v1';

// Fichiers à mettre en cache pour le mode hors ligne
const FILES_A_CACHER = [
  './',
  './index.html',
  './baticonnect-auth.html',
  './baticonnect-profils.html',
  './baticonnect-publication.html',
  './baticonnect-messagerie.html',
  './baticonnect-paiement.html',
  './baticonnect-suivi-chantier.html',
  './baticonnect-notation.html',
  './baticonnect-admin.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── INSTALLATION ──
self.addEventListener('install', event => {
  console.log('[BatiConnect SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[BatiConnect SW] Mise en cache des fichiers...');
      return cache.addAll(FILES_A_CACHER.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => console.log('[BatiConnect SW] Erreur cache:', err));
    })
  );
  self.skipWaiting();
});

// ── ACTIVATION ──
self.addEventListener('activate', event => {
  console.log('[BatiConnect SW] Activation...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== CACHE_OFFLINE)
          .map(name => {
            console.log('[BatiConnect SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ── INTERCEPTION DES REQUÊTES ──
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et les APIs externes
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('paydunya.com')) return;
  if (event.request.url.includes('resend.com')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then(reponseCache => {
      // Si en cache → retourner le cache
      if (reponseCache) {
        return reponseCache;
      }

      // Sinon → essayer le réseau
      return fetch(event.request).then(reponseReseau => {
        // Mettre en cache la nouvelle ressource
        if (reponseReseau && reponseReseau.status === 200) {
          const reponseClone = reponseReseau.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, reponseClone);
          });
        }
        return reponseReseau;
      }).catch(() => {
        // Hors ligne → page de fallback
        return caches.match('./index.html');
      });
    })
  );
});

// ── NOTIFICATIONS PUSH ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const titre   = data.titre   || 'BatiConnect';
  const message = data.message || 'Vous avez une nouvelle notification';
  const icon    = data.icon    || './icons/icon-192.png';
  const url     = data.url     || './index.html';

  event.waitUntil(
    self.registration.showNotification(titre, {
      body:    message,
      icon:    icon,
      badge:   './icons/icon-72.png',
      vibrate: [200, 100, 200],
      data:    { url },
      actions: [
        { action: 'ouvrir', title: 'Ouvrir' },
        { action: 'fermer', title: 'Fermer' }
      ]
    })
  );
});

// ── CLIC SUR NOTIFICATION ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'fermer') return;

  const url = event.notification.data?.url || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsList => {
      for (const client of clientsList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── SYNC EN ARRIÈRE-PLAN ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rapports') {
    event.waitUntil(syncRapportsEnAttente());
  }
});

async function syncRapportsEnAttente() {
  console.log('[BatiConnect SW] Synchronisation des rapports hors ligne...');
  // Les rapports créés hors ligne seront envoyés quand la connexion revient
}
