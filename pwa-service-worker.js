/* global workbox */
// eslint-disable-next-line
importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

const DEBUG = false;

if (workbox) {
	if (DEBUG) {
		// eslint-disable-next-line no-console
		console.log("Yay! Workbox is loaded 🎉");
	}
	/******************************************
	 * Workbox main configuration
	 ******************************************/
	workbox.setConfig({
		debug: DEBUG
	});
	workbox.core.skipWaiting();
	workbox.core.clientsClaim();
	/***** End *****/

	/******************************************
	 * Ressource forced cache
	 ******************************************/
	//workbox.precaching.precacheAndRoute(FILES_TO_CACHE);
	/***** End *****/

	/******************************************
	 * Register the default retention strategy
	 * NetworkFirst: First from the network then the cache if offline
	 * Max entries: 256
	 * Maxe ages: 1 week
	 * Statuses 0, 200, see opaque responses for more details
	 ******************************************/
	var defaultStrategy = new workbox.strategies.NetworkFirst({
		cacheName: "default-cache",
		plugins: [
			new workbox.expiration.Plugin({
				maxEntries: 256,
				maxAgeSeconds: 7 * 24 * 60 * 60,
				purgeOnQuotaError: true
			}),
			new workbox.cacheableResponse.Plugin({
				statuses: [0, 200]
			})
		]
	});
	workbox.routing.setDefaultHandler(
		(args) => {
			if (args.event.request.method === "GET") {
				return defaultStrategy.handle(args);
			}
			return fetch(args.event.request);
		}
	);
	/***** End *****/

	/******************************************
	 * Handle the display of the offline page
	 ******************************************/
	workbox.routing.registerRoute(
		new workbox.routing.NavigationRoute(({
			event
		}) => {
			return new workbox.strategies.NetworkOnly().handle({
					event
				})
				.catch(() => caches.match(OFFLINE_PAGE));
		}));

	// workbox.routing.setCatchHandler(({
	// 	event
	// }) => {
	// 	switch (event.request.destination) {
	// 	case "document":
	// 		return caches.match(OFFLINE_PAGE);
	// 	default:
	// 		return Response.error();
	// 	}
	// });
	/***** End *****/

	/******************************************
	 * Declare the differents cache strategy
	 ******************************************/
	workbox.routing.registerRoute(
		/\.js$/,
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: "js-cache"
		})
	);

	workbox.routing.registerRoute(
		/\.css$/,
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: "css-cache"
		})
	);

	workbox.routing.registerRoute(
		/\.(?:png|jpg|jpeg|svg|gif)$/,
		new workbox.strategies.CacheFirst({
			cacheName: "image-cache"
		})
	);
	/***** End *****/
} else {
	// eslint-disable-next-line no-console
	console.error("Boo! Workbox didn't load 😬");
}