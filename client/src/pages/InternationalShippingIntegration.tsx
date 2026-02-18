import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Truck,
  Globe,
  Package,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  TrendingUp,
  Zap,
  Link2,
  Activity,
  BarChart3,
} from 'lucide-react';

interface ShippingProvider {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey: string;
  lastSync: string;
  shipmentsSync: number;
  successRate: number;
  avgDeliveryTime: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  provider: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  cost: string;
  estimatedDelivery: string;
  lastUpdate: string;
}

interface ShippingRate {
  id: string;
  provider: string;
  service: string;
  origin: string;
  destination: string;
  weight: string;
  cost: string;
  estimatedDays: number;
}

export default function InternationalShippingIntegration() {
  const [providers] = useState<ShippingProvider[]>([
    {
      id: '1',
      name: 'DHL Express',
      status: 'connected',
      apiKey: 'dhl_****_****_****',
      lastSync: '2026-02-18 15:00',
      shipmentsSync: 245,
      successRate: 98.5,
      avgDeliveryTime: '3-5 أيام',
    },
    {
      id: '2',
      name: 'FedEx International',
      status: 'connected',
      apiKey: 'fedex_****_****_****',
      lastSync: '2026-02-18 14:30',
      shipmentsSync: 189,
      successRate: 97.8,
      avgDeliveryTime: '4-7 أيام',
    },
    {
      id: '3',
      name: 'Aramex',
      status: 'connected',
      apiKey: 'aramex_****_****_****',
      lastSync: '2026-02-18 14:00',
      shipmentsSync: 156,
      successRate: 96.2,
      avgDeliveryTime: '2-4 أيام',
    },
  ]);

  const [shipments] = useState<Shipment[]>([
    {
      id: '1',
      trackingNumber: 'DHL123456789',
      provider: 'DHL Express',
      origin: 'عمّان، الأردن',
      destination: 'دبي، الإمارات',
      status: 'in-transit',
      cost: '85 JOD',
      estimatedDelivery: '2026-02-20',
      lastUpdate: '2026-02-18 14:00',
    },
    {
      id: '2',
      trackingNumber: 'FDX987654321',
      provider: 'FedEx International',
      origin: 'عمّان، الأردن',
      destination: 'الرياض، السعودية',
      status: 'delivered',
      cost: '65 JOD',
      estimatedDelivery: '2026-02-17',
      lastUpdate: '2026-02-17 10:30',
    },
    {
      id: '3',
      trackingNumber: 'ARM456789012',
      provider: 'Aramex',
      origin: 'عمّان، الأردن',
      destination: 'بيروت، لبنان',
      status: 'delayed',
      cost: '45 JOD',
      estimatedDelivery: '2026-02-19',
      lastUpdate: '2026-02-18 12:00',
    },
  ]);

  const [rates] = useState<ShippingRate[]>([
    {
      id: '1',
      provider: 'DHL Express',
      service: 'Express Worldwide',
      origin: 'عمّان',
      destination: 'دبي',
      weight: 'حتى 1 كغ',
      cost: '85 JOD',
      estimatedDays: 3,
    },
    {
      id: '2',
      provider: 'FedEx International',
      service: 'International Priority',
      origin: 'عمّان',
      destination: 'الرياض',
      weight: 'حتى 1 كغ',
      cost: '65 JOD',
      estimatedDays: 4,
    },
    {
      id: '3',
      provider: 'Aramex',
      service: 'Express',
      origin: 'عمّان',
      destination: 'بيروت',
      weight: 'حتى 1 كغ',
      cost: '45 JOD',
      estimatedDays: 2,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-transit':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'delayed':
      case 'error':
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      connected: '✓ متصل',
      disconnected: '✕ غير متصل',
      error: '⚠ خطأ',
      pending: '⏳ قيد الانتظار',
      'in-transit': '🚚 قيد التوصيل',
      delivered: '✓ تم التسليم',
      delayed: '⚠ متأخر',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="w-10 h-10 text-blue-600" />
              نظام التكامل مع خدمات الشحن الدولية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تكامل فوري مع DHL و FedEx و Aramex
            </p>
          </div>
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" />
            مزامنة الآن
          </Button>
        </div>

        {/* مزودو الخدمات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              مزودو خدمات الشحن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map(provider => (
                <div key={provider.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                    <Badge className={getStatusColor(provider.status)}>
                      {getStatusLabel(provider.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">المفتاح:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{provider.apiKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">آخر مزامنة:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{provider.lastSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الشحنات:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{provider.shipmentsSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">معدل النجاح:</span>
                      <span className="font-semibold text-green-600">{provider.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">متوسط التسليم:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{provider.avgDeliveryTime}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Settings className="w-4 h-4" />
                    الإعدادات
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الشحنات النشطة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              الشحنات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">رقم التتبع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المزود</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">من</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">إلى</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التكلفة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التسليم المتوقع</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(shipment => (
                    <tr key={shipment.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{shipment.trackingNumber}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.provider}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.origin}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.destination}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusLabel(shipment.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{shipment.cost}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.estimatedDelivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* أسعار الشحن */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              أسعار الشحن المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المزود</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الخدمة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">من</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">إلى</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الوزن</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">السعر</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الأيام</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(rate => (
                    <tr key={rate.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{rate.provider}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rate.service}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rate.origin}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rate.destination}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rate.weight}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{rate.cost}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rate.estimatedDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            🚚 نصيحة: تحقق من أسعار الشحن المختلفة واختر الخدمة الأنسب. المزامنة تتم تلقائياً كل ساعة. استخدم تتبع الشحنات للحصول على التحديثات الفورية.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
