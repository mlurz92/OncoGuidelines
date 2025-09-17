const STATIC_CACHE_NAME = 'static-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/script.js',
    '/style.css',
    '/data/OncoGuidelines.json',
    '/manifest.json',
    '/data/logo_icon_192.png',
    '/data/logo_icon_512.png',
    '/icons/favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.pathname === '/data/OncoGuidelines.json') {
        event.respondWith(
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
    } else if (ASSETS_TO_CACHE.includes(requestUrl.pathname) || requestUrl.pathname.startsWith('/icons/') || requestUrl.pathname.startsWith('/data/')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});
