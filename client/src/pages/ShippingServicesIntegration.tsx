import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Package,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  Wifi,
  WifiOff,
  Send,
  Download,
  Map,
} from 'lucide-react';

interface ShippingProvider {
  id: string;
  name: string;
  company: string;
  status: 'connected' | 'disconnected' | 'error';
  shipments: number;
  avgDeliveryTime: number;
  successRate: number;
  lastSync: string;
  apiKey: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  provider: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'failed';
  origin: string;
  destination: string;
  weight: number;
  cost: number;
  estimatedDelivery: string;
  lastUpdate: string;
}

interface DeliveryRoute {
  id: string;
  provider: string;
  route: string;
  distance: number;
  estimatedTime: number;
  cost: number;
  availability: boolean;
}

export default function ShippingServicesIntegration() {
  const [providers] = useState<ShippingProvider[]>([
    {
      id: '1',
      name: 'DHL',
      company: 'DHL Express',
      status: 'connected',
      shipments: 450,
      avgDeliveryTime: 2.5,
      successRate: 98.5,
      lastSync: '2026-02-18 14:30',
      apiKey: 'dhl_api_***************************',
    },
    {
      id: '2',
      name: 'FedEx',
      company: 'FedEx International',
      status: 'connected',
      shipments: 320,
      avgDeliveryTime: 3.2,
      successRate: 97.8,
      lastSync: '2026-02-18 14:28',
      apiKey: 'fedex_api_***************************',
    },
    {
      id: '3',
      name: 'Aramex',
      company: 'Aramex Middle East',
      status: 'connected',
      shipments: 580,
      avgDeliveryTime: 2.1,
      successRate: 99.2,
      lastSync: '2026-02-18 14:25',
      apiKey: 'aramex_api_***************************',
    },
  ]);

  const [shipments] = useState<Shipment[]>([
    {
      id: '1',
      trackingNumber: 'DHL123456789',
      provider: 'DHL',
      status: 'in-transit',
      origin: 'عمّان',
      destination: 'الزرقاء',
      weight: 5.2,
      cost: 25.50,
      estimatedDelivery: '2026-02-19',
      lastUpdate: '2026-02-18 14:35',
    },
    {
      id: '2',
      trackingNumber: 'FDX987654321',
      provider: 'FedEx',
      status: 'delivered',
      origin: 'عمّان',
      destination: 'إربد',
      weight: 3.8,
      cost: 35.00,
      estimatedDelivery: '2026-02-18',
      lastUpdate: '2026-02-18 12:00',
    },
    {
      id: '3',
      trackingNumber: 'ARM456789123',
      provider: 'Aramex',
      status: 'pending',
      origin: 'عمّان',
      destination: 'معان',
      weight: 8.5,
      cost: 45.75,
      estimatedDelivery: '2026-02-20',
      lastUpdate: '2026-02-18 10:15',
    },
  ]);

  const [routes] = useState<DeliveryRoute[]>([
    {
      id: '1',
      provider: 'DHL',
      route: 'عمّان - الزرقاء',
      distance: 35,
      estimatedTime: 2,
      cost: 25.50,
      availability: true,
    },
    {
      id: '2',
      provider: 'FedEx',
      route: 'عمّان - إربد',
      distance: 85,
      estimatedTime: 3,
      cost: 35.00,
      availability: true,
    },
    {
      id: '3',
      provider: 'Aramex',
      route: 'عمّان - معان',
      distance: 240,
      estimatedTime: 4,
      cost: 45.75,
      availability: true,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-transit':
      case 'pending':
        return <Activity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      connected: 'متصل',
      disconnected: 'غير متصل',
      error: 'خطأ',
      'in-transit': 'قيد النقل',
      delivered: 'تم التسليم',
      delayed: 'متأخر',
      failed: 'فشل',
      pending: 'قيد الانتظار',
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
              نظام التكامل مع خدمات الشحن الحقيقية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة التكاملات مع شركات الشحن الأردنية والعالمية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            مزود جديد
          </Button>
        </div>

        {/* مزودي الخدمات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              مزودي خدمات الشحن المتكاملين
            </CardTitle>
            <CardDescription>
              إدارة التكاملات مع شركات الشحن الحقيقية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providers.map(provider => (
              <div key={provider.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {provider.name}
                      </h3>
                      <Badge className={getStatusColor(provider.status)}>
                        {getStatusIcon(provider.status)}
                        <span className="ml-1">{getStatusLabel(provider.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      الشركة: {provider.company}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الشحنات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{provider.shipments}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">متوسط الوقت</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{provider.avgDeliveryTime} يوم</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">معدل النجاح</p>
                    <p className="font-semibold text-green-600">{provider.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">آخر مزامنة</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{provider.lastSync}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                    مزامنة الآن
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    اختبار
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                </div>
              </div>
            ))}
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
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">من - إلى</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التسليم المتوقع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الوزن</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التكلفة</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(shipment => (
                    <tr key={shipment.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs">{shipment.trackingNumber}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.provider}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.origin} - {shipment.destination}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1">{getStatusLabel(shipment.status)}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.estimatedDelivery}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{shipment.weight} كغ</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{shipment.cost.toFixed(2)} JOD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* مسارات التسليم */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              مسارات التسليم المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routes.map(route => (
                <div key={route.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{route.provider}</h3>
                    {route.availability ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        متاح
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        غير متاح
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{route.route}</p>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">المسافة:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{route.distance} كم</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الوقت المتوقع:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{route.estimatedTime} ساعات</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">التكلفة:</span>
                      <span className="font-semibold text-green-600">{route.cost.toFixed(2)} JOD</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full gap-1">
                    <Send className="w-4 h-4" />
                    استخدام هذا المسار
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            🚚 نصيحة: استخدم التكاملات مع خدمات الشحن الحقيقية لتحديث حالات الشحنات تلقائياً. اختر المزود الأنسب حسب المسافة والتكلفة والسرعة المطلوبة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
