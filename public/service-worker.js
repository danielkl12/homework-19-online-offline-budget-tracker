const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"

];

const CACHE_NAME = "static-cache";
const DATA_CACHE_NAME = "data-cache";

self.addEventListener("install", function(event){
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>{
           console.log("Files added to cache");
           return cache.addAll(FILES_TO_CACHE);
        })
    )

        self.skipWaiting();
});

self.addEventListener("start", function (event){
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !==DATA_CACHE_NAME) {
                        console.log("Removing expired cache data", key);
                        return caches.delete(key);
                    }
                })
            )
        })
    )
    self.clients.claim();
});

self.addEventListener("fetch", function (event){
    if(event.request.url.includes("./routes/api")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {

                    if(response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(event.request);
                });

            }).catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function (){
            return caches.match(event.request).then(function (response){
                if (response) {
                    return response;
                } else if (event.request.headers.get("accept").includes("text/html")) {
                return caches.match("/");
                }
            })
        })
    )
});