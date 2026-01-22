'use client';

import React, { useEffect, useState } from 'react';
import { useToast, type Toast } from '@/contexts/ToastContext';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        );
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        );
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 pointer-events-auto
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div
        className={`
          rounded-lg border shadow-lg overflow-hidden
          ${getBackgroundColor()}
        `}
      >
        {/* محتوى Toast */}
        <div className="p-4 flex gap-3">
          {/* الأيقونة */}
          <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>

          {/* النص */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${getTextColor()}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
                {toast.message}
              </p>
            )}

            {/* زر الإجراء */}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  handleClose();
                }}
                className={`
                  mt-2 text-sm font-medium underline
                  ${getTextColor()} hover:opacity-75 transition-opacity
                `}
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* زر الإغلاق */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors
              ${getTextColor()}
            `}
            aria-label="إغلاق الإشعار"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* شريط التقدم */}
        {toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-black/10">
            <div
              className={`h-full ${getProgressBarColor()} animate-shrink`}
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
