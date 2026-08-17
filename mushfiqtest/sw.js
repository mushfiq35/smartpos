const CACHE_NAME = 'muttaki-hajj-v1';

self.addEventListener('install', event => {
  // শুধু main HTML cache করো — icon optional
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.add('/smartpos/muttakihajj/').catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Firebase/Google — সবসময় network
  if(event.request.url.includes('firestore') ||
     event.request.url.includes('firebase') ||
     event.request.url.includes('googleapis') ||
     event.request.url.includes('gstatic')){
    return;
  }
  // বাকি সব: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if(res.ok){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
