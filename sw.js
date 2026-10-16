// Simple service worker: always tries the network first, falls back to the last saved copy when offline.
const C='oc-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{
    if(r&&r.status===200){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{})}
    return r;
  }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
});
