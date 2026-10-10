const CACHE_NAME = "sip-pinaras-public-v2";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", "/pengaduan", OFFLINE_URL, "/manifest.webmanifest", "/icon-192.svg", "/icon-512.svg"])));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/warga") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/login") || url.pathname.startsWith("/petugas") || url.searchParams.has("_rsc")) return;

    if (request.mode === "navigate") {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
        return;
    }

    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
        if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
    })));
});
