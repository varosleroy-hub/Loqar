const CACHE_NAME = "loqar-v1";

// Fichiers à mettre en cache pour le fonctionnement hors-ligne
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/loqar-favicon.png",
  "/loqar-favicon.ico",
  "/manifest.json",
];

// Installation : mise en cache des assets statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch : Network first, cache en fallback
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes Supabase, Stripe ou API externes
  const url = new URL(event.request.url);
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("stripe.com") ||
    url.hostname.includes("sendgrid.net") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Pour les requêtes de navigation (HTML), network first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Pour les assets statiques, cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
