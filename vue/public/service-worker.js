// service-worker.js — cachea los archivos de la app para que funcione
// sin internet una vez que se cargó por primera vez (ya todo es local).
// Solo se registra en producción (ver main.ts).
const CACHE = 'saludasist-v2';

self.addEventListener('install', (evento) => {
  // skipWaiting: si hay una versión nueva del service worker, toma el
  // control de inmediato en vez de esperar a que se cierren todas las
  // pestañas abiertas (eso podía hacer que una actualización tardara
  // en verse reflejada).
  self.skipWaiting();
  evento.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/'])));
});

self.addEventListener('activate', (evento) => {
  // Borra cachés de versiones anteriores, para no acumular archivos viejos.
  evento.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(nombres.filter(n => n !== CACHE).map(n => caches.delete(n)))
    ).then(() => self.clients.claim()) // toma control de las pestañas ya abiertas
  );
});

// Estrategia simple: si hay red, usarla y guardar copia; si no hay red, usar la copia guardada.
self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    fetch(evento.request)
      .then(respuesta => {
        const copia = respuesta.clone();
        caches.open(CACHE).then(cache => cache.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request))
  );
});
