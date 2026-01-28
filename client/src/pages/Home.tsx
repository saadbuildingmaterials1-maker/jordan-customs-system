import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, FileText, TrendingUp, DollarSign, Download, Smartphone, Monitor } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">نظام إدارة تكاليف الشحن والجمارك الأردنية</h1>
          <p className="text-blue-100">إدارة شاملة للبيانات الجمركية والشحنات والتكاليف</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">مرحباً بك</h2>
            <p className="text-blue-800 mb-6">
              استخدم هذا النظام لإدارة جميع عمليات الشحن والجمارك بكفاءة عالية
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => navigate("/declarations/new")} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-5 h-5" />
                نموذج بسيط
              </Button>
              <Button onClick={() => navigate("/declarations/new/advanced")} className="gap-2" variant="outline">
                <Plus className="w-5 h-5" />
                نموذج متقدم
              </Button>
              <Button onClick={() => navigate("/download")} className="gap-2 bg-green-600 hover:bg-green-700">
                <Download className="w-5 h-5" />
                تحميل للكمبيوتر
              </Button>
            </div>
          </div>
        </div>

        {/* Download Apps Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">تحميل التطبيقات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Monitor className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-lg">تطبيق الويب</h4>
              </div>
              <p className="text-gray-600 mb-4">استخدم التطبيق مباشرة من المتصفح</p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>فتح الآن</Button>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-lg">تطبيق الهاتف</h4>
              </div>
              <p className="text-gray-600 mb-4">حمّل التطبيق على iOS أو Android</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.open('https://apps.apple.com/app/jordan-customs', '_blank')}>iOS</Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open('https://play.google.com/store/apps/details?id=com.jordancustoms', '_blank')}>Android</Button>
              </div>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-6 h-6 text-purple-600" />
                <h4 className="font-semibold text-lg">تطبيق سطح المكتب</h4>
              </div>
              <p className="text-gray-600 mb-4">حمّل التطبيق لـ Windows أو Mac أو Linux</p>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate("/download")}>
                <Download className="w-4 h-4 mr-2" />
                تحميل
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-lg">البيانات الجمركية</h3>
            </div>
            <p className="text-gray-600 mb-4">إدارة شاملة للبيانات الجمركية مع حساب الرسوم والضرائب تلقائياً</p>
            <Button onClick={() => navigate("/declarations")} variant="outline" className="w-full">
              عرض البيانات
            </Button>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-lg">التقارير والتحليلات</h3>
            </div>
            <p className="text-gray-600 mb-4">تقارير شاملة مع رسوم بيانية متقدمة وتحليل البيانات</p>
            <Button onClick={() => navigate("/reports")} variant="outline" className="w-full">
              عرض التقارير
            </Button>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-lg">الدفع والفواتير</h3>
            </div>
            <p className="text-gray-600 mb-4">نظام دفع متكامل مع Stripe وإدارة الفواتير</p>
            <Button onClick={() => navigate("/payments")} variant="outline" className="w-full">
              إدارة الدفعات
            </Button>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold text-lg">لوحة التحكم</h3>
            </div>
            <p className="text-gray-600 mb-4">لوحة تحكم ذكية مع رسوم بيانية وإحصائيات فورية</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
              فتح لوحة التحكم
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <p className="text-gray-600">إجمالي البيانات</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-gray-600">الدفعات الناجحة</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">0</div>
            <p className="text-gray-600">الدفعات المعلقة</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">0</div>
            <p className="text-gray-600">التقارير</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-6 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
