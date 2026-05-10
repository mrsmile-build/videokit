/* coi-serviceworker v0.1.7 - https://github.com/gzuidhof/coi-serviceworker */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  if(e.request.cache==="only-if-cached"&&e.request.mode!=="same-origin")return;
  e.respondWith(e.request.mode==="navigate"?
    fetch(e.request).then(r=>{if(!r.ok)throw new Error("Bad response");const h=new Headers(r.headers);h.set("Cross-Origin-Opener-Policy","same-origin");h.set("Cross-Origin-Embedder-Policy","require-corp");return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h})}).catch(()=>caches.match(e.request)):
    fetch(e.request).then(r=>{const h=new Headers(r.headers);h.set("Cross-Origin-Resource-Policy","cross-origin");return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h})})
  );
});
