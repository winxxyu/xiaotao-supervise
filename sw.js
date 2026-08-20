/* 小桃监督 Service Worker —— 缓存应用外壳与 pdf.js，首次加载后离线可用 */
const CACHE = 'xiaotao-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.png',
  './icon.svg',
  './pdf.min.js',
  './pdf.worker.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(resp => {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return resp;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
