const STATIC_CACHE_NAME = 'avocadosign-static-cache-v1';
const DATA_CACHE_NAME = 'avocadosign-data-cache-v1';

const assetsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/core/data_processor.js',
    '/js/core/t2_criteria_manager.js',
    '/js/core/study_criteria_manager.js',
    '/js/services/statistics_service.js',
    '/js/services/brute_force_manager.js',
    '/js/services/export_service.js',
    '/js/services/publication_service.js',
    '/js/services/publication_service/publication_helpers.js',
    '/js/services/publication_service/generators/title_page_generator.js',
    '/js/services/publication_service/generators/abstract_generator.js',
    '/js/services/publication_service/generators/introduction_generator.js',
    '/js/services/publication_service/generators/methods_generator.js',
    '/js/services/publication_service/generators/results_generator.js',
    '/js/services/publication_service/generators/discussion_generator.js',
    '/js/services/publication_service/generators/references_generator.js',
    '/js/services/publication_service/generators/stard_generator.js',
    '/js/ui/components/ui_components.js',
    '/js/ui/components/table_renderer.js',
    '/js/ui/components/chart_renderer.js',
    '/js/ui/components/flowchart_renderer.js',
    '/js/ui/tabs/data_tab.js',
    '/js/ui/tabs/analysis_tab.js',
    '/js/ui/tabs/statistics_tab.js',
    '/js/ui/tabs/comparison_tab.js',
    '/js/ui/tabs/insights_tab.js',
    '/js/ui/tabs/publication_tab.js',
    '/js/ui/tabs/export_tab.js',
    '/js/ui/ui_manager.js',
    '/js/app/state.js',
    '/js/app/main.js',
    '/js/ui/event_manager.js',
    '/workers/brute_force_worker.js',
    '/data/data.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js',
    'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js',
    'https://unpkg.com/tippy.js@6',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/icons/favicon.svg',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.addAll(assetsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.pathname.endsWith('/data/data.js')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(request).then(response => {
                return response || fetch(request).then(networkResponse => {
                    return caches.open(STATIC_CACHE_NAME).then(cache => {
                        if (request.method === 'GET' && !url.protocol.startsWith('chrome-extension')) {
                             cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            }).catch(() => {
                if (url.pathname.endsWith('.html')) {
                    return caches.match('/index.html');
                }
            })
        );
    }
});
