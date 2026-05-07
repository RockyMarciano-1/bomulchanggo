const CACHE_NAME = 'bogulchanggo-v3';
const ASSETS = [
  '/bogulchanggo/',
  '/bogulchanggo/index.html',
  '/bogulchanggo/manifest.json',
  '/bogulchanggo/icon-192.svg',
  '/bogulchanggo/icon-512.svg'
];

// 설치 — 캐시 등록
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 활성화 — 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 요청 처리 — 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', event => {
  // POST 요청은 캐시 처리 안 함
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
