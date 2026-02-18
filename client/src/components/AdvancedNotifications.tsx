/**
 * Advanced Notifications Component
 * مكون الإشعارات المتقدمة
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AdvancedNotificationsProps {
  notifications?: Notification[];
  onNotificationRead?: (id: string) => void;
  onNotificationDismiss?: (id: string) => void;
  maxVisible?: number;
}

export function AdvancedNotifications({
  notifications = [],
  onNotificationRead,
  onNotificationDismiss,
  maxVisible = 3,
}: AdvancedNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxVisible));
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications, maxVisible]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleDismiss = (id: string) => {
    setVisibleNotifications(visibleNotifications.filter((n) => n.id !== id));
    onNotificationDismiss?.(id);
  };

  const handleRead = (id: string) => {
    onNotificationRead?.(id);
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-3 max-w-md z-50">
      {/* Notification Bell Badge */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          </div>
        </div>
      )}

      {/* Notifications Stack */}
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 border ${getBackgroundColor(notification.type)} animate-slide-in`}
        >
          <div className="flex gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{notification.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>

              {/* Action Button */}
              {notification.action && (
                <Button
                  onClick={notification.action.onClick}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mark as Read */}
          {!notification.read && (
            <button
              onClick={() => handleRead(notification.id)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2"
            >
              Mark as read
            </button>
          )}
        </Card>
      ))}

      {/* More Notifications Indicator */}
      {notifications.length > maxVisible && (
        <div className="text-center text-sm text-gray-600">
          +{notifications.length - maxVisible} more notifications
        </div>
      )}
    </div>
  );
}

export default AdvancedNotifications;
