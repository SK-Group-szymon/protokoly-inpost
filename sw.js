// sw.js - cache offline. Zmień VERSION przy każdej aktualizacji plików, żeby telefon pobrał nowe.
const VERSION = "protokolant-v1";
const LOCAL = [
  "./", "./index.html", "./app.js", "./ulepszenia.js", "./style.css",
  "./szablon.pdf", "./blok_podpisu.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(LOCAL.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// pliki lokalne i biblioteki z CDN: najpierw sieć (świeże), a bez zasięgu - z cache
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const kopia = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, kopia));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
