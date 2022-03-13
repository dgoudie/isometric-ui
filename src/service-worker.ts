/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { cacheNames, clientsClaim } from 'workbox-core';

import { ExpirationPlugin } from 'workbox-expiration';
import { PrecacheController } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

const precacheController = new PrecacheController();
precacheController.precache(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
const shouldBeRoutedToIndexHtml = (request: Request, url: URL) => {
    if (url.pathname === '/index.html') {
        return true;
    }

    if (request.mode !== 'navigate') {
        return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith('/_')) {
        return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
        return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (shouldBeRoutedToIndexHtml(request, url)) {
        fetch(request, { mode: 'no-cors' }).then((fetchResponse) => {
            if (fetchResponse.redirected) {
                event.respondWith(fetchResponse);
            } else {
                const cacheKey = precacheController.getCacheKeyForURL(
                    process.env.PUBLIC_URL + '/index.html'
                );
                if (!!cacheKey) {
                    //@ts-ignore
                    event.respondWith(caches.match(cacheKey));
                }
            }
        });
    } else {
        const cacheKey = precacheController.getCacheKeyForURL(
            event.request.url
        );
        if (!!cacheKey) {
            //@ts-ignore
            event.respondWith(caches.match(cacheKey));
        }
    }
});

registerRoute(
    ({ url, sameOrigin }) => sameOrigin && url.pathname === '/api/exercises',
    new NetworkFirst({
        cacheName: 'exercise',
        plugins: [new ExpirationPlugin({ maxEntries: 1 })],
    })
);

registerRoute(
    ({ url, sameOrigin }) =>
        sameOrigin && url.pathname.startsWith('/api/exercise/'),
    new NetworkFirst({
        cacheName: 'exercises',
        plugins: [new ExpirationPlugin({ maxEntries: 50 })],
    })
);

registerRoute(
    ({ url }) => url.host === 'fonts.gstatic.com',
    new StaleWhileRevalidate({
        cacheName: 'google_fonts',
        plugins: [new ExpirationPlugin({ maxEntries: 10 })],
    })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Any other custom service worker logic can go here.
