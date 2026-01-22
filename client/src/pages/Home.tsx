import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { Plus, FileText, TrendingUp, DollarSign, Download, Smartphone, Monitor } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: declarations, isLoading } = trpc.customs.listDeclarations.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="card-elegant bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title">مرحبا، {user?.name || "مستخدم"}</h1>
              <p className="section-subtitle">نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => navigate("/declarations/new")} className="btn-primary gap-2">
                <Plus className="w-5 h-5" />
                نموذج بسيط
              </Button>
              <Button onClick={() => navigate("/declarations/new/advanced")} className="gap-2" variant="outline">
                <Plus className="w-5 h-5" />
                نموذج متقدم
              </Button>
              <Button onClick={() => window.open('https://releases.jordancustoms.com/download', '_blank')} className="gap-2 bg-green-600 hover:bg-green-700">
                <Download className="w-5 h-5" />
                تحميل للكمبيوتر
              </Button>
            </div>
          </div>
        </div>

        {/* Download Apps Section */}
        <div className="card-elegant">
          <h2 className="section-title mb-6">تحميل التطبيقات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Monitor className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold">تطبيق الويب</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">استخدم التطبيق مباشرة من المتصفح</p>
              <Button variant="outline" className="w-full" size="sm">فتح الآن</Button>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold">تطبيق الهاتف</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">حمّل التطبيق على iOS أو Android</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm" onClick={() => window.open('https://apps.apple.com/app/jordan-customs', '_blank')}>iOS</Button>
                <Button variant="outline" className="flex-1" size="sm" onClick={() => window.open('https://play.google.com/store/apps/details?id=com.jordancustoms', '_blank')}>Android</Button>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold">تطبيق سطح المكتب</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">حمّل التطبيق لـ Windows أو Mac أو Linux</p>
              <Button className="w-full bg-green-600 hover:bg-green-700" size="sm" onClick={() => window.open('https://releases.jordancustoms.com/download', '_blank')}>
                <Download className="w-4 h-4 mr-2" />
                تحميل
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elegant">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-lg">البيانات الجمركية</h3>
            </div>
            <p className="text-slate-600 mb-4">إدارة شاملة للبيانات الجمركية مع حساب الرسوم والضرائب تلقائياً</p>
            <Button onClick={() => navigate("/declarations")} variant="outline" className="w-full">
              عرض البيانات
            </Button>
          </div>

          <div className="card-elegant">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-lg">التقارير والتحليلات</h3>
            </div>
            <p className="text-slate-600 mb-4">تقارير شاملة مع رسوم بيانية متقدمة وتحليل البيانات</p>
            <Button onClick={() => navigate("/reports")} variant="outline" className="w-full">
              عرض التقارير
            </Button>
          </div>

          <div className="card-elegant">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-lg">الدفع والفواتير</h3>
            </div>
            <p className="text-slate-600 mb-4">نظام دفع متكامل مع Stripe وإدارة الفواتير</p>
            <Button onClick={() => navigate("/payments")} variant="outline" className="w-full">
              إدارة الدفعات
            </Button>
          </div>

          <div className="card-elegant">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold text-lg">لوحة التحكم</h3>
            </div>
            <p className="text-slate-600 mb-4">لوحة تحكم ذكية مع رسوم بيانية وإحصائيات فورية</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
              فتح لوحة التحكم
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {declarations && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-blue-600">{declarations.length}</div>
              <p className="text-slate-600">إجمالي البيانات</p>
            </div>
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-slate-600">الدفعات الناجحة</p>
            </div>
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <p className="text-slate-600">الدفعات المعلقة</p>
            </div>
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <p className="text-slate-600">التقارير</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
