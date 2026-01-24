import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  FileText,
  Settings,
  Users,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user } = useAuth();

  // التحقق من أن المستخدم هو الإدارة
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">
                ليس لديك صلاحيات الوصول إلى لوحة التحكم الإدارية
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            لوحة التحكم الإدارية
          </h1>
          <p className="text-gray-600 mt-2">إدارة النظام والتحديثات والمستخدمين</p>
        </div>
      </div>

      {/* معلومات المالك والمطور */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <FileText className="h-5 w-5 text-blue-600" />
            معلومات التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-gray-600">المالك والمطور</p>
              <p className="text-lg font-bold">mp3</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-gray-600">البريد الإلكتروني</p>
              <p className="text-lg font-bold">saad.building.materials1@gmail.com</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-gray-600">إصدار التطبيق</p>
              <p className="text-lg font-bold">2.5.0</p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-gray-600">تاريخ الإطلاق</p>
              <p className="text-lg font-bold">24 يناير 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إدارة المستخدمين */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Users className="h-5 w-5 text-green-600" />
            إدارة المستخدمين والصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">إجمالي المستخدمين</p>
                <p className="text-sm text-gray-600">عدد المستخدمين المسجلين في النظام</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
          </div>
          <Button className="w-full" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            إدارة المستخدمين
          </Button>
        </CardContent>
      </Card>

      {/* إدارة النسخ الاحتياطية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Database className="h-5 w-5 text-purple-600" />
            النسخ الاحتياطية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <p className="font-semibold">آخر نسخة احتياطية</p>
                <p className="text-sm text-gray-600">22 يناير 2026 - 12:00 ص</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                ناجحة
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <p className="font-semibold">حالة النسخ الاحتياطي التلقائي</p>
                <p className="text-sm text-gray-600">النسخ الاحتياطية اليومية مفعلة</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="h-3 w-3 mr-1" />
                مفعل
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              نسخة احتياطية الآن
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              استعادة نسخة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* إدارة التحديثات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Lock className="h-5 w-5 text-orange-600" />
            إدارة التحديثات والتطويرات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <p className="font-semibold text-blue-900">التحكم الحصري في التحديثات</p>
            <p className="text-sm text-blue-700 mt-2">
              أنت فقط من يستطيع التحكم في جميع التحديثات والتطويرات على النظام. يمكنك:
            </p>
            <ul className="text-sm text-blue-700 mt-3 space-y-2 mr-4">
              <li>✓ الموافقة على التحديثات الجديدة</li>
              <li>✓ إدارة الإصدارات والإطلاقات</li>
              <li>✓ التحكم في الميزات الجديدة</li>
              <li>✓ إدارة الأمان والتحديثات الأمنية</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <p className="font-semibold">الإصدار الحالي</p>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                محدث
              </Badge>
            </div>
          </div>

          <Button className="w-full" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            إدارة التحديثات
          </Button>
        </CardContent>
      </Card>

      {/* سجل التدقيق */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <FileText className="h-5 w-5 text-red-600" />
            سجل التدقيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            يتم تسجيل جميع التغييرات والعمليات على النظام لأغراض الأمان والامتثال
          </p>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">إجمالي السجلات</p>
                <p className="text-sm text-gray-600">عدد العمليات المسجلة</p>
              </div>
              <p className="text-3xl font-bold text-red-600">0</p>
            </div>
          </div>

          <Button className="w-full" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            عرض سجل التدقيق الكامل
          </Button>
        </CardContent>
      </Card>

      {/* معلومات الأمان */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Lock className="h-5 w-5 text-yellow-600" />
            معلومات الأمان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>تشفير البيانات</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                مفعل
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>المصادقة الثنائية</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                مفعل
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>النسخ الاحتياطية المشفرة</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                مفعل
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>سجل التدقيق</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                مفعل
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
