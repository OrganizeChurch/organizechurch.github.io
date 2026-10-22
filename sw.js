// Simple service worker: always tries the network first, falls back to the last saved copy when offline.
const C='oc-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==C).map(n=>caches.delete(n)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{
    if(r&&r.status===200){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{})}
    return r;
  }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
});
