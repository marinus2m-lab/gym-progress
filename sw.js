const CACHE='gym-progress-cache-v4-0-0';
const APP_VERSION='4.0.0';
const ASSETS=['./','./index.html','./app.js?v=4.0.0','./cloud.js?v=4.0.0','./manifest.webmanifest','./icon.png','./icon-180.png','./icon-192.png','./icon-512.png','./fox-mark.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gym-progress-cache-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();if(event.data?.type==='GET_VERSION')event.ports?.[0]?.postMessage({version:APP_VERSION})});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{})}return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))))});
