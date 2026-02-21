import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Ship, FileText, DollarSign, TrendingUp, Clock } from "lucide-react";

export default function Dashboard() {
  // Mock data
  const stats = {
    totalContainers: 24,
    activeShipments: 12,
    customsDeclarations: 18,
    totalCosts: 245680.50,
  };

  const recentContainers = [
    { number: "EMIV CHNXIN006881", status: "customs_clearance", eta: "2025-12-14" },
    { number: "MAEU 1234567890", status: "in_transit", eta: "2025-12-20" },
    { number: "MSCU 9876543210", status: "arrived", eta: "2025-12-10" },
  ];

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      "customs_clearance": "التخليص الجمركي",
      "in_transit": "في الطريق",
      "arrived": "وصلت",
    };
    return texts[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "customs_clearance": "text-orange-600",
      "in_transit": "text-purple-600",
      "arrived": "text-green-600",
    };
    return colors[status] || "text-gray-600";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-2">
          نظرة عامة على الحاويات والشحنات والبيانات الجمركية
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحاويات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContainers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +3 من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشحنات النشطة</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeShipments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              في الطريق أو قيد التخليص
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">البيانات الجمركية</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customsDeclarations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5 هذا الأسبوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التكاليف</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCosts.toLocaleString()} د.أ</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Containers */}
      <Card>
        <CardHeader>
          <CardTitle>الحاويات الأخيرة</CardTitle>
          <CardDescription>
            آخر الحاويات التي تم تتبعها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContainers.map((container, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{container.number}</p>
                    <p className={`text-sm ${getStatusColor(container.status)}`}>
                      {getStatusText(container.status)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {container.eta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
