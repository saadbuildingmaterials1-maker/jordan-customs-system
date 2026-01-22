import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, Zap, Gift } from 'lucide-react';

interface FloatingNotification {
  id: number;
  title: string;
  message: string;
  type: 'update' | 'offer' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  duration?: number; // بالميلي ثانية
}

interface FloatingNotificationsProps {
  notifications?: FloatingNotification[];
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'update':
      return <Zap className="w-5 h-5" />;
    case 'offer':
      return <Gift className="w-5 h-5" />;
    case 'alert':
    case 'warning':
      return <AlertCircle className="w-5 h-5" />;
    case 'success':
      return <CheckCircle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

const getNotificationStyles = (type: string) => {
  const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    update: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    },
    offer: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600'
    },
    alert: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: 'text-yellow-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    }
  };
  return styles[type] || styles.info;
};

export default function FloatingNotifications({ notifications = [] }: FloatingNotificationsProps) {
  const [displayedNotifications, setDisplayedNotifications] = useState<FloatingNotification[]>(notifications);

  useEffect(() => {
    setDisplayedNotifications(notifications);

    // إزالة الإشعارات تلقائياً بعد المدة المحددة
    const timers = notifications.map(notification => {
      const duration = notification.duration || 5000;
      return setTimeout(() => {
        setDisplayedNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, duration);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [notifications]);

  const handleClose = (id: number) => {
    setDisplayedNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (displayedNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {displayedNotifications.map(notification => {
        const styles = getNotificationStyles(notification.type);
        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 animate-slide-in-right`}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-grow">
                <h4 className={`font-semibold ${styles.text} mb-1`}>{notification.title}</h4>
                <p className={`text-sm ${styles.text} opacity-90`}>{notification.message}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => handleClose(notification.id)}
                className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className={`h-1 ${styles.border} mt-3 rounded-full overflow-hidden`}>
              <div
                className={`h-full ${
                  notification.type === 'update'
                    ? 'bg-blue-600'
                    : notification.type === 'offer'
                    ? 'bg-green-600'
                    : notification.type === 'alert' || notification.type === 'warning'
                    ? 'bg-red-600'
                    : notification.type === 'success'
                    ? 'bg-green-600'
                    : 'bg-blue-600'
                } animate-progress`}
                style={{
                  animation: `progress ${(notification.duration || 5000) / 1000}s linear forwards`
                }}
              ></div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}
