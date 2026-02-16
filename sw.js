 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/sw.js b/sw.js
index 19f04e323cb4c1841d22b67a648d4b4934617c47..ef59061672c2eef00d36d3c4a119251bd721ea37 100644
--- a/sw.js
+++ b/sw.js
@@ -1,21 +1,39 @@
-self.addEventListener("install", e => {
-  e.waitUntil(
-    caches.open("lunch-menu-cache").then(cache => {
-      return cache.addAll([
-        "/",
-        "/index.html",
-        "/icon.png",
-        "/og_image.png",
-        "/manifest.json"
-      ]);
-    })
-  );
-});
-
-self.addEventListener("fetch", e => {
-  e.respondWith(
-    caches.match(e.request).then(response => {
-      return response || fetch(e.request);
-    })
-  );
-});
\ No newline at end of file
+const CACHE_NAME = 'homeworkout-pwa-v1';
+const ASSETS = [
+  './',
+  './index.html',
+  './manifest.json',
+  './icon.png',
+  './og_image.png'
+];
+
+self.addEventListener('install', (event) => {
+  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
+  self.skipWaiting();
+});
+
+self.addEventListener('activate', (event) => {
+  event.waitUntil(
+    caches.keys().then((keys) =>
+      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
+    )
+  );
+  self.clients.claim();
+});
+
+self.addEventListener('fetch', (event) => {
+  if (event.request.method !== 'GET') return;
+
+  event.respondWith(
+    caches.match(event.request).then((cached) => {
+      if (cached) return cached;
+      return fetch(event.request)
+        .then((response) => {
+          const copy = response.clone();
+          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
+          return response;
+        })
+        .catch(() => caches.match('./index.html'));
+    })
+  );
+});
 
EOF
)
