import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { Plus, Download, Smartphone, Monitor } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: declarations } = trpc.customs.listDeclarations.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8">
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
      </div>
    </DashboardLayout>
  );
}
