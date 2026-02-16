// Service Worker متقدم لحل مشكلة SPA fallback
const CACHE_NAME = 'app-cache-v1';
const ASSET_CACHE = 'assets-cache-v1';

// الملفات الثابتة التي يجب حفظها
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/robots.txt'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSET_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تخطي الطلبات غير GET
  if (request.method !== 'GET') {
    return;
  }

  // معالجة طلبات الملفات الثابتة
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // التحقق من أن الاستجابة صحيحة
            if (!response || response.status !== 200 || response.type === 'error') {
              console.warn('[SW] Invalid response for:', url.pathname);
              return response;
            }

            // التحقق من نوع المحتوى
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
              // هذا خطأ - ملف JS يُعاد كـ HTML
              console.error('[SW] Asset returned as HTML:', url.pathname, contentType);
              
              // محاولة الحصول على نسخة مخزنة
              return cache.match(request).then((cached) => {
                if (cached) {
                  console.log('[SW] Using cached version:', url.pathname);
                  return cached;
                }
                return response;
              });
            }

            // حفظ النسخة الصحيحة في الـ cache
            const responseToCache = response.clone();
            cache.put(request, responseToCache).catch(err => {
              console.warn('[SW] Failed to cache:', url.pathname, err);
            });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch error:', url.pathname, error);
            // محاولة الحصول على نسخة مخزنة
            return cache.match(request).then((cached) => {
              if (cached) {
                console.log('[SW] Using cached version after error:', url.pathname);
                return cached;
              }
              throw error;
            });
          });
      })
    );
    return;
  }

  // معالجة طلبات الصفحات (SPA)
  if (url.pathname === '/' || !url.pathname.includes('.')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request).then((cached) => {
              return cached || cache.match('/index.html');
            });
          });
      })
    );
    return;
  }

  // معالجة الملفات الأخرى
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (response && response.status === 200) {
          caches.open(ASSET_CACHE).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      });
    })
  );
});

// معالجة الرسائل من العملاء
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
