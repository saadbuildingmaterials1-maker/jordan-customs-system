import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { Plus, FileText, TrendingUp, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: declarations, isLoading } = trpc.customs.listDeclarations.useQuery();

  const stats = [
    {
      label: "إجمالي البيانات الجمركية",
      value: declarations?.length || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "البيانات المخلصة",
      value: declarations?.filter((d) => d.status === "cleared").length || 0,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "البيانات قيد المراجعة",
      value:
        declarations?.filter((d) => d.status === "submitted" || d.status === "approved")
          .length || 0,
      icon: FileText,
      color: "text-yellow-600",
    },
  ];

  const recentDeclarations = declarations?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="card-elegant bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title">مرحباً، {user?.name || "مستخدم"}</h1>
              <p className="section-subtitle">
                نظام إدارة تكاليف الشحن والجمارك الأردنية
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => navigate("/declarations/new")}
                className="btn-primary gap-2"
              >
                <Plus className="w-5 h-5" />
                نموذج بسيط
              </Button>
              <Button
                onClick={() => navigate("/declarations/new/advanced")}
                className="gap-2"
                variant="outline"
              >
                <Plus className="w-5 h-5" />
                نموذج متقدم (كامل التفاصيل)
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
                <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Declarations */}
        <div className="card-elegant">
          <h2 className="text-xl font-bold mb-4 text-foreground">آخر البيانات الجمركية</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentDeclarations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-elegant">
                <thead>
                  <tr>
                    <th>رقم البيان</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>التكلفة الكلية</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeclarations.map((declaration) => (
                    <tr key={declaration.id}>
                      <td className="font-semibold">{declaration.declarationNumber}</td>
                      <td>
                        {new Date(declaration.registrationDate).toLocaleDateString("ar-JO")}
                      </td>
                      <td>
                        <span
                          className={`badge-${declaration.status}`}
                        >
                          {declaration.status === "draft" && "مسودة"}
                          {declaration.status === "submitted" && "مرسلة"}
                          {declaration.status === "approved" && "موافق عليها"}
                          {declaration.status === "cleared" && "مخلصة"}
                        </span>
                      </td>
                      <td className="text-accent font-semibold">
                        {Number(declaration.totalLandedCost).toLocaleString("ar-JO", {
                          style: "currency",
                          currency: "JOD",
                          minimumFractionDigits: 3,
                        })}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/declarations/${declaration.id}`)}
                        >
                          عرض
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا توجد بيانات جمركية حتى الآن</p>
              <Button
                onClick={() => navigate("/declarations/new")}
                className="btn-primary"
              >
                إنشاء بيان جمركي جديد
              </Button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-elegant hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">إدارة البيانات الجمركية</h3>
                <p className="text-sm text-muted-foreground">
                  عرض وتعديل وحذف البيانات الجمركية
                </p>
              </div>
            </div>
          </div>

          <div className="card-elegant hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">التقارير والتحليلات</h3>
                <p className="text-sm text-muted-foreground">
                  عرض التقارير والإحصائيات المالية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
