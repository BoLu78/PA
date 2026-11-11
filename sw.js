const CACHE='pa-v1.14';
const FILES=[
  './','./index.html','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png',
  './fonts/ibm-plex-sans-latin-400-normal.woff2',
  './fonts/ibm-plex-sans-latin-500-normal.woff2',
  './fonts/ibm-plex-sans-latin-600-normal.woff2',
  './fonts/ibm-plex-mono-latin-500-normal.woff2',
  './fonts/source-serif-4-latin-opsz-normal.woff2'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));
  self.clients.claim();
});

/* Copia salvata prima: l'app si apre subito, anche in modalità aereo.
   Solo se c'è rete, aggiorna la copia in sottofondo (la versione nuova si vede alla riapertura). */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==self.location.origin)return;

  e.respondWith(caches.open(CACHE).then(async c=>{
    const cached=await c.match(e.request,{ignoreSearch:true})||
                 (e.request.mode==='navigate'?await c.match('./index.html'):undefined);
    const update=()=>fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res});
    if(cached){
      if(self.navigator.onLine)e.waitUntil(update().catch(()=>{}));
      return cached;
    }
    return update();
  }));
});
