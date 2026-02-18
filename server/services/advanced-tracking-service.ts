import { TRPCError } from '@trpc/server';

/**
 * خدمة التتبع المتقدمة
 * Advanced Tracking Service
 */

export interface RealTimeTrackingData {
  trackingNumber: string;
  status: string;
  location: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  description: string;
  estimatedDelivery: Date;
  lastUpdate: Date;
  updateHistory: Array<{
    status: string;
    location: string;
    timestamp: Date;
  }>;
}

export interface TrackingNotification {
  id: string;
  trackingNumber: string;
  type: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'failed';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ==================== تتبع الشحنة في الوقت الفعلي ====================

export async function getRealTimeTracking(trackingNumber: string): Promise<RealTimeTrackingData> {
  try {
    // محاكاة جلب البيانات من API شركة الشحن
    const mockData = generateRealTimeTrackingData(trackingNumber);
    return mockData;
  } catch (error) {
    console.error('Error getting real-time tracking:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب بيانات التتبع',
    });
  }
}

// ==================== الحصول على سجل التتبع الكامل ====================

export async function getTrackingHistory(trackingNumber: string) {
  try {
    const history = [
      {
        status: 'picked_up',
        location: 'عمّان - مركز الاستقبال',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        description: 'تم استلام الشحنة من المرسل',
      },
      {
        status: 'in_transit',
        location: 'الزرقاء - مركز الفرز',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        description: 'الشحنة في مركز الفرز الإقليمي',
      },
      {
        status: 'in_transit',
        location: 'إربد - مركز التوزيع',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        description: 'الشحنة في طريقها إلى المحطة المحلية',
      },
      {
        status: 'out_for_delivery',
        location: 'إربد - فريق التسليم',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'الشحنة مع فريق التسليم',
      },
    ];

    return {
      trackingNumber,
      totalEvents: history.length,
      history,
    };
  } catch (error) {
    console.error('Error getting tracking history:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب سجل التتبع',
    });
  }
}

// ==================== تنبيهات التتبع ====================

export async function getTrackingNotifications(userId: number, trackingNumber?: string) {
  try {
    const notifications: TrackingNotification[] = [
      {
        id: '1',
        trackingNumber: trackingNumber || 'TRK123456789',
        type: 'picked_up',
        title: 'تم استلام الشحنة',
        message: 'تم استلام شحنتك بنجاح من قبل شركة الشحن',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        read: true,
      },
      {
        id: '2',
        trackingNumber: trackingNumber || 'TRK123456789',
        type: 'in_transit',
        title: 'الشحنة في الطريق',
        message: 'شحنتك في طريقها إلى الوجهة النهائية',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
      },
      {
        id: '3',
        trackingNumber: trackingNumber || 'TRK123456789',
        type: 'out_for_delivery',
        title: 'الشحنة جاهزة للتسليم',
        message: 'شحنتك مع فريق التسليم وستصل اليوم',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
    ];

    return notifications;
  } catch (error) {
    console.error('Error getting tracking notifications:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب الإشعارات',
    });
  }
}

// ==================== حساب وقت التسليم المتوقع ====================

export async function estimateDeliveryTime(
  origin: string,
  destination: string,
  shippingMethod: string
): Promise<{
  estimatedDays: number;
  estimatedDate: Date;
  description: string;
}> {
  try {
    let days = 5; // افتراضي

    // حساب عدد الأيام حسب طريقة الشحن
    if (shippingMethod === 'express') {
      days = 1;
    } else if (shippingMethod === 'fast') {
      days = 2;
    } else if (shippingMethod === 'standard') {
      days = 5;
    } else if (shippingMethod === 'economy') {
      days = 7;
    }

    // تعديل حسب المسافة
    if (origin === destination) {
      days = Math.max(1, days - 2);
    } else if (
      (origin === 'JO' && destination === 'JO') ||
      (origin === 'AE' && destination === 'AE')
    ) {
      days = Math.max(1, days - 1);
    }

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);

    return {
      estimatedDays: days,
      estimatedDate,
      description: `التسليم المتوقع خلال ${days} أيام`,
    };
  } catch (error) {
    console.error('Error estimating delivery time:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في حساب وقت التسليم',
    });
  }
}

// ==================== تنبيهات التأخير ====================

export async function checkForDelays(trackingNumber: string) {
  try {
    // محاكاة التحقق من التأخيرات
    const isDelayed = Math.random() > 0.7; // 30% احتمالية تأخير

    if (isDelayed) {
      return {
        isDelayed: true,
        delayReason: 'تأخير في الجمارك',
        estimatedNewDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        message: 'تم تأخير الشحنة بسبب إجراءات جمركية. سيتم التسليم في غضون يومين',
      };
    }

    return {
      isDelayed: false,
      message: 'الشحنة تسير حسب الجدول الزمني المتوقع',
    };
  } catch (error) {
    console.error('Error checking for delays:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في التحقق من التأخيرات',
    });
  }
}

// ==================== إحصائيات التتبع ====================

export async function getTrackingStatistics(userId: number) {
  try {
    return {
      totalShipments: 156,
      deliveredShipments: 148,
      inTransitShipments: 5,
      failedShipments: 2,
      delayedShipments: 1,
      averageDeliveryTime: 4.2, // بالأيام
      onTimeDeliveryRate: 94.9, // بالنسبة المئوية
      topCarrier: 'أرامكس',
      topDestination: 'الإمارات العربية المتحدة',
    };
  } catch (error) {
    console.error('Error getting tracking statistics:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب الإحصائيات',
    });
  }
}

// ==================== دوال مساعدة ====================

function generateRealTimeTrackingData(trackingNumber: string): RealTimeTrackingData {
  const statuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const locations = [
    { name: 'عمّان', lat: 31.9454, lon: 35.9284 },
    { name: 'الزرقاء', lat: 32.0755, lon: 36.2084 },
    { name: 'إربد', lat: 32.5552, lon: 35.8456 },
    { name: 'جرش', lat: 32.2754, lon: 35.7347 },
  ];

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];

  const updateHistory = [
    {
      status: 'picked_up',
      location: 'عمّان',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
      status: 'in_transit',
      location: 'الزرقاء',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      status: 'in_transit',
      location: 'إربد',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  return {
    trackingNumber,
    status: randomStatus,
    location: randomLocation.name,
    latitude: randomLocation.lat,
    longitude: randomLocation.lon,
    timestamp: new Date(),
    description: `الشحنة في ${randomLocation.name}`,
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    lastUpdate: new Date(),
    updateHistory,
  };
}
