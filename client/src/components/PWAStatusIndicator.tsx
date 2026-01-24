import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';

export function PWAStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // التحقق من Service Worker Updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (isOnline && !hasUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline && (
        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <WifiOff className="w-4 h-4" />
          <span>أنت غير متصل بالإنترنت</span>
        </div>
      )}

      {hasUpdate && isOnline && (
        <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <AlertCircle className="w-4 h-4" />
          <span>نسخة جديدة متاحة</span>
          <button
            onClick={handleUpdate}
            className="mr-2 font-bold hover:underline"
          >
            تحديث الآن
          </button>
        </div>
      )}

      {isOnline && !hasUpdate && (
        <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <CheckCircle className="w-4 h-4" />
          <span>متصل بالإنترنت</span>
        </div>
      )}
    </div>
  );
}
