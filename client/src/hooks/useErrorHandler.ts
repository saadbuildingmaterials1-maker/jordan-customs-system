/**
 * useErrorHandler Hook
 * 
 * React Hook مخصص
 * 
 * @module ./client/src/hooks/useErrorHandler
 */
import { useCallback } from 'react';
import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export function useErrorHandler() {
  const { addToast } = useToast();

  /**
   * معالجة الأخطاء من الـ API
   */
  const handleApiError = useCallback((error: any, context?: string) => {
    let errorMessage = 'حدث خطأ غير متوقع';
    let errorCode = 'UNKNOWN_ERROR';

    if (error?.response?.data) {
      const data = error.response.data as ApiError;
      errorMessage = data.message || errorMessage;
      errorCode = data.code || errorCode;

      // تسجيل الخطأ
      console.error(`[${context || 'API'}] Error:`, {
        code: errorCode,
        message: errorMessage,
        details: data.details,
        requestId: data.requestId,
      });
    } else if (error?.message) {
      errorMessage = error.message;
      console.error(`[${context || 'Error'}]`, error);
    }

    // عرض رسالة الخطأ
    addToast({
      type: 'error',
      title: 'خطأ',
      message: errorMessage,
      duration: 5000,
    });

    return {
      code: errorCode,
      message: errorMessage,
      details: error?.response?.data?.details,
    };
  }, [addToast]);

  /**
   * معالجة أخطاء التحقق من الصحة
   */
  const handleValidationError = useCallback((errors: Record<string, string>) => {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');

    addToast({
      type: 'error',
      title: 'خطأ في البيانات',
      message: errorMessages,
      duration: 5000,
    });

    return errors;
  }, [addToast]);

  /**
   * معالجة أخطاء المصادقة
   */
  const handleAuthError = useCallback(() => {
    addToast({
      type: 'error',
      title: 'خطأ في المصادقة',
      message: 'يجب تسجيل الدخول أولاً',
      duration: 5000,
    });

    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = '/login';
  }, [addToast]);

  /**
   * معالجة أخطاء الصلاحيات
   */
  const handlePermissionError = useCallback(() => {
    addToast({
      type: 'error',
      title: 'خطأ في الصلاحيات',
      message: 'ليس لديك صلاحيات كافية للقيام بهذه العملية',
      duration: 5000,
    });
  }, [addToast]);

  /**
   * معالجة أخطاء قاعدة البيانات
   */
  const handleDatabaseError = useCallback(() => {
    addToast({
      type: 'error',
      title: 'خطأ في قاعدة البيانات',
      message: 'حدث خطأ أثناء الوصول إلى البيانات',
      duration: 5000,
    });
  }, [addToast]);

  /**
   * معالجة أخطاء الدفع
   */
  const handlePaymentError = useCallback((error: any) => {
    let message = 'حدث خطأ في معالجة الدفع';

    if (error?.code === 'card_declined') {
      message = 'تم رفض البطاقة';
    } else if (error?.code === 'insufficient_funds') {
      message = 'رصيد غير كافي';
    } else if (error?.code === 'expired_card') {
      message = 'البطاقة منتهية الصلاحية';
    }

    addToast({
      type: 'error',
      title: 'خطأ في الدفع',
      message,
      duration: 5000,
    });
  }, [addToast]);

  /**
   * معالجة أخطاء الملفات
   */
  const handleFileError = useCallback((error: any) => {
    let message = 'حدث خطأ في رفع الملف';

    if (error?.code === 'FILE_SIZE_EXCEEDED') {
      message = 'حجم الملف كبير جداً';
    } else if (error?.code === 'INVALID_FILE_TYPE') {
      message = 'نوع الملف غير مدعوم';
    }

    addToast({
      type: 'error',
      title: 'خطأ في الملف',
      message,
      duration: 5000,
    });
  }, [addToast]);

  /**
   * معالجة أخطاء المهلة الزمنية
   */
  const handleTimeoutError = useCallback(() => {
    addToast({
      type: 'error',
      title: 'انتهت المهلة الزمنية',
      message: 'استغرقت العملية وقتاً طويلاً جداً',
      duration: 5000,
    });
  }, [addToast]);

  /**
   * معالجة أخطاء الخدمات الخارجية
   */
  const handleExternalServiceError = useCallback((serviceName: string) => {
    addToast({
      type: 'error',
      title: 'خطأ في الخدمة',
      message: `خدمة ${serviceName} غير متاحة حالياً`,
      duration: 5000,
    });
  }, [addToast]);

  return {
    handleApiError,
    handleValidationError,
    handleAuthError,
    handlePermissionError,
    handleDatabaseError,
    handlePaymentError,
    handleFileError,
    handleTimeoutError,
    handleExternalServiceError,
  };
}
