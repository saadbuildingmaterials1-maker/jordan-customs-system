import { TRPCError } from '@trpc/server';

/**
 * خدمة الخرائط لتتبع الشحنات
 * Map Service for Shipment Tracking
 */

export interface RoutePoint {
  lat: number;
  lon: number;
  timestamp: Date;
  location: string;
  status: string;
}

export interface ShipmentRoute {
  trackingNumber: string;
  origin: {
    lat: number;
    lon: number;
    name: string;
  };
  destination: {
    lat: number;
    lon: number;
    name: string;
  };
  currentLocation: {
    lat: number;
    lon: number;
    name: string;
  };
  routePoints: RoutePoint[];
  totalDistance: number;
  estimatedTime: number;
  progress: number;
}

export interface Marker {
  id: string;
  lat: number;
  lon: number;
  title: string;
  description: string;
  type: 'origin' | 'destination' | 'current' | 'waypoint';
  icon?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ==================== الحصول على مسار الشحنة ====================

export async function getShipmentRoute(trackingNumber: string): Promise<ShipmentRoute> {
  try {
    // محاكاة بيانات المسار
    const mockRoute = generateMockRoute(trackingNumber);
    return mockRoute;
  } catch (error) {
    console.error('Error getting shipment route:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب مسار الشحنة',
    });
  }
}

// ==================== الحصول على نقاط المسار ====================

export async function getRoutePoints(trackingNumber: string): Promise<RoutePoint[]> {
  try {
    const route = await getShipmentRoute(trackingNumber);
    return route.routePoints;
  } catch (error) {
    console.error('Error getting route points:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب نقاط المسار',
    });
  }
}

// ==================== الحصول على علامات الخريطة ====================

export async function getMapMarkers(trackingNumber: string): Promise<Marker[]> {
  try {
    const route = await getShipmentRoute(trackingNumber);

    const markers: Marker[] = [
      {
        id: 'origin',
        lat: route.origin.lat,
        lon: route.origin.lon,
        title: 'نقطة الانطلاق',
        description: route.origin.name,
        type: 'origin',
        icon: '📦',
      },
      {
        id: 'destination',
        lat: route.destination.lat,
        lon: route.destination.lon,
        title: 'الوجهة النهائية',
        description: route.destination.name,
        type: 'destination',
        icon: '🎯',
      },
      {
        id: 'current',
        lat: route.currentLocation.lat,
        lon: route.currentLocation.lon,
        title: 'الموقع الحالي',
        description: route.currentLocation.name,
        type: 'current',
        icon: '📍',
      },
      ...route.routePoints.map((point, idx) => ({
        id: `waypoint_${idx}`,
        lat: point.lat,
        lon: point.lon,
        title: point.location,
        description: `${point.status} - ${point.timestamp.toLocaleString('ar-JO')}`,
        type: 'waypoint' as const,
        icon: '📌',
      })),
    ];

    return markers;
  } catch (error) {
    console.error('Error getting map markers:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب علامات الخريطة',
    });
  }
}

// ==================== حساب حدود الخريطة ====================

export async function calculateMapBounds(trackingNumber: string): Promise<MapBounds> {
  try {
    const route = await getShipmentRoute(trackingNumber);
    const allPoints = [
      route.origin,
      route.destination,
      route.currentLocation,
      ...route.routePoints,
    ];

    const lats = allPoints.map((p) => p.lat);
    const lons = allPoints.map((p) => p.lon);

    return {
      north: Math.max(...lats) + 0.1,
      south: Math.min(...lats) - 0.1,
      east: Math.max(...lons) + 0.1,
      west: Math.min(...lons) - 0.1,
    };
  } catch (error) {
    console.error('Error calculating map bounds:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في حساب حدود الخريطة',
    });
  }
}

// ==================== حساب المسافة بين نقطتين ====================

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومترات
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==================== الحصول على معلومات الموقع ====================

export async function getLocationInfo(lat: number, lon: number): Promise<{
  name: string;
  address: string;
  city: string;
  country: string;
}> {
  try {
    // محاكاة جلب معلومات الموقع من Reverse Geocoding
    const locations: Record<string, any> = {
      'amman': {
        name: 'عمّان',
        address: 'شارع الملكة رانيا',
        city: 'عمّان',
        country: 'الأردن',
      },
      'zarqa': {
        name: 'الزرقاء',
        address: 'وسط البلد',
        city: 'الزرقاء',
        country: 'الأردن',
      },
      'irbid': {
        name: 'إربد',
        address: 'وسط البلد',
        city: 'إربد',
        country: 'الأردن',
      },
    };

    // تحديد الموقع بناءً على الإحداثيات
    if (lat > 31.9 && lat < 32.0 && lon > 35.9 && lon < 36.0) {
      return locations['amman'];
    } else if (lat > 32.0 && lat < 32.1 && lon > 36.1 && lon < 36.3) {
      return locations['zarqa'];
    } else if (lat > 32.5 && lat < 32.6 && lon > 35.8 && lon < 35.9) {
      return locations['irbid'];
    }

    return {
      name: 'موقع غير معروف',
      address: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city: 'الأردن',
      country: 'الأردن',
    };
  } catch (error) {
    console.error('Error getting location info:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب معلومات الموقع',
    });
  }
}

// ==================== دوال مساعدة ====================

function generateMockRoute(trackingNumber: string): ShipmentRoute {
  const routePoints: RoutePoint[] = [
    {
      lat: 31.9454,
      lon: 35.9284,
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      location: 'عمّان - مركز الاستقبال',
      status: 'picked_up',
    },
    {
      lat: 32.0755,
      lon: 36.2084,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      location: 'الزرقاء - مركز الفرز',
      status: 'in_transit',
    },
    {
      lat: 32.2754,
      lon: 35.7347,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      location: 'جرش - نقطة توزيع',
      status: 'in_transit',
    },
    {
      lat: 32.5552,
      lon: 35.8456,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: 'إربد - مركز التوزيع المحلي',
      status: 'out_for_delivery',
    },
  ];

  const origin = { lat: 31.9454, lon: 35.9284, name: 'عمّان' };
  const destination = { lat: 32.5552, lon: 35.8456, name: 'إربد' };
  const currentLocation = routePoints[routePoints.length - 1];

  const totalDistance = calculateDistance(origin.lat, origin.lon, destination.lat, destination.lon);
  const estimatedTime = 4; // ساعات
  const progress = (routePoints.length / 5) * 100;

  return {
    trackingNumber,
    origin,
    destination,
    currentLocation: {
      lat: currentLocation.lat,
      lon: currentLocation.lon,
      name: currentLocation.location,
    },
    routePoints,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime,
    progress,
  };
}
