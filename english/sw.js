// הכתבה באנגלית – יקי אוזן | service worker (רק לתיקייה /english/)
// כל עדכון של המילים: להעלות את המספר כדי שכולם יקבלו את הגרסה החדשה
const VERSION = "v6";
const CACHE = "yu-eng-" + VERSION;
const SHELL = ["./", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("yu-eng-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// דף: קודם רשת (כדי לקבל מילים חדשות), ובלי אינטרנט – מהמטמון
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./", cp)); return r; })
      .catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
