/**
 * Home Page - Ultra Simple Version
 * 
 * صفحة الرئيسية - نسخة بسيطة جداً
 * 
 * @module ./client/src/pages/Home
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">نظام إدارة تكاليف الشحن والجمارك الأردنية</h1>
        <p className="text-lg text-gray-600 mb-8">منصة ذكية لإدارة الشحنات والتكاليف الجمركية</p>
        
        <div className="flex gap-4 mb-16">
          <Button onClick={() => navigate("/dashboard")}>الذهاب إلى لوحة التحكم</Button>
          <Button variant="outline" onClick={() => navigate("/about")}>حول النظام</Button>
          <Button variant="outline" onClick={() => navigate("/login")}>تسجيل الدخول</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">الإدارة</h3>
            <p className="text-gray-600">إدارة شاملة للشحنات والفواتير والتكاليف</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">التقارير</h3>
            <p className="text-gray-600">تقارير مفصلة وتحليلات متقدمة</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">الأمان</h3>
            <p className="text-gray-600">نظام أمان متقدم وحماية البيانات</p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">الميزات الرئيسية</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>إدارة الشحنات والجمارك</li>
            <li>نظام الفواتير والدفع</li>
            <li>التقارير والتحليلات</li>
            <li>إدارة المستخدمين والأدوار</li>
            <li>التكامل مع الأنظمة الخارجية</li>
            <li>نظام الإشعارات والتنبيهات</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
