import { useEffect } from 'react';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export function useAnalytics() {
  // تتبع صفحة جديدة
  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        page_name: pageName,
        timestamp: new Date().toISOString(),
        ...properties,
      },
      timestamp: Date.now(),
    };

    // إرسال إلى Google Analytics إذا كان متاحاً
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_path: window.location.pathname,
      });
    }

    // تسجيل في localStorage للتحليل المحلي
    logEvent(event);
  };

  // تتبع حدث مخصص
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        timestamp: new Date().toISOString(),
        ...properties,
      },
      timestamp: Date.now(),
    };

    // إرسال إلى Google Analytics إذا كان متاحاً
    if (window.gtag) {
      window.gtag('event', eventName, properties || {});
    }

    // تسجيل في localStorage
    logEvent(event);
  };

  // تسجيل الأحداث في localStorage
  const logEvent = (event: AnalyticsEvent) => {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      
      // الاحتفاظ بآخر 100 حدث فقط
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  };

  // تتبع النقرات
  const trackClick = (elementName: string, elementType: string = 'button') => {
    trackEvent('click', {
      element_name: elementName,
      element_type: elementType,
    });
  };

  // تتبع الأخطاء
  const trackError = (errorName: string, errorMessage: string) => {
    trackEvent('error', {
      error_name: errorName,
      error_message: errorMessage,
    });
  };

  // تتبع الوقت المستغرق
  const trackTiming = (category: string, variable: string, time: number) => {
    trackEvent('timing', {
      category,
      variable,
      time,
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackClick,
    trackError,
    trackTiming,
  };
}

// توسيع نوع النافذة
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, properties?: any) => void;
  }
}
