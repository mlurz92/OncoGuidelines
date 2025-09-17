const STATIC_CACHE_NAME = 'static-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';

const APP_SHELL_FILES = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './data/logo.svg',
    './data/logo-192.png',
    './data/logo-512.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.addAll(APP_SHELL_FILES);
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
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith('OncoGuidelines.json')) {
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
    } else if (APP_SHELL_FILES.some(file => url.pathname.endsWith(file.substring(1)))) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    } else {
        event.respondWith(
             caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request).then(fetchRes => {
                        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                            cache.put(event.request.url, fetchRes.clone());
                            return fetchRes;
                        })
                    });
                }).catch(() => {
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('./index.html');
                    }
                })
        );
    }
});
