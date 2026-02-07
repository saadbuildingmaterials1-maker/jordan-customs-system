/**
 * service-worker-register
 * 
 * @module ./client/src/lib/service-worker-register
 */
// تسجيل Service Worker للتطبيق

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);

        // البحث عن تحديثات كل 60 ثانية
        setInterval(() => {
          registration.update();
        }, 60000);

        // الاستماع للتحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // تحديث جديد متاح
                console.log('New version available! Please refresh.');
                // يمكن إظهار إشعار للمستخدم هنا
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// دالة لإجبار تحديث Service Worker
export function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  }
}

// دالة للتحقق من الاتصال بالإنترنت
export function isOnline(): boolean {
  return navigator.onLine;
}

// الاستماع لتغييرات الاتصال بالإنترنت
export function onOnlineStatusChange(callback: (isOnline: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}
