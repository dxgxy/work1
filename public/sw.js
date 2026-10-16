const VERSION = "ci-buddy-shell-v2";
const STATIC = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg", "/templates/wordbook.csv", "/templates/wordbook.txt", "/templates/wordbook.json", "/templates/format.html"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(STATIC)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("ci-buddy-shell-") && key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !(event.request.mode === "navigate" || STATIC.includes(url.pathname) || url.pathname.startsWith("/assets/"))) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) { const clone = response.clone(); event.waitUntil(caches.open(VERSION).then((cache) => cache.put(event.request, clone))); }
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === "navigate" ? await caches.match("/index.html") : undefined) || Response.error()));
});
