import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, Ship, FileText, DollarSign, TrendingUp, Clock, Users, AlertCircle, ArrowUpRight, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  // Mock data
  const stats = {
    totalContainers: 24,
    activeShipments: 12,
    customsDeclarations: 18,
    totalCosts: 245680500, // in fils
    monthlyGrowth: 12,
    totalSuppliers: 15,
    activeSuppliers: 12,
  };

  const recentContainers = [
    { 
      number: "EMIV CHNXIN006881", 
      status: "customs_clearance", 
      eta: "2025-12-14",
      progress: 85,
      location: "جمرك العقبة"
    },
    { 
      number: "MAEU 1234567890", 
      status: "in_transit", 
      eta: "2025-12-20",
      progress: 60,
      location: "المحيط الهندي"
    },
    { 
      number: "MSCU 9876543210", 
      status: "arrived", 
      eta: "2025-12-10",
      progress: 100,
      location: "ميناء العقبة"
    },
  ];

  const recentDeclarations = [
    {
      number: "89430",
      date: "2025-12-14",
      value: 20100000,
      fees: 3928350,
      status: "approved"
    },
    {
      number: "89429",
      date: "2025-12-13",
      value: 15500000,
      fees: 3025000,
      status: "under_review"
    },
    {
      number: "89428",
      date: "2025-12-12",
      value: 18200000,
      fees: 3556000,
      status: "approved"
    }
  ];

  const monthlyStats = [
    { month: "يناير", containers: 18, cost: 180000000 },
    { month: "فبراير", containers: 22, cost: 215000000 },
    { month: "مارس", containers: 20, cost: 195000000 },
    { month: "أبريل", containers: 25, cost: 245000000 },
    { month: "مايو", containers: 28, cost: 275000000 },
    { month: "يونيو", containers: 24, cost: 245680500 },
  ];

  const alerts = [
    {
      type: "warning",
      message: "3 بيانات جمركية تحتاج إلى مراجعة",
      time: "منذ ساعتين"
    },
    {
      type: "info",
      message: "حاوية EMIV CHNXIN006881 وصلت إلى جمرك العقبة",
      time: "منذ 5 ساعات"
    }
  ];

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      "customs_clearance": "التخليص الجمركي",
      "in_transit": "في الطريق",
      "arrived": "وصلت",
      "approved": "معتمد",
      "under_review": "قيد المراجعة",
      "draft": "مسودة"
    };
    return texts[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "customs_clearance": "text-orange-600",
      "in_transit": "text-purple-600",
      "arrived": "text-green-600",
      "approved": "text-green-600",
      "under_review": "text-orange-600",
      "draft": "text-gray-600"
    };
    return colors[status] || "text-gray-600";
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "customs_clearance": "bg-orange-500",
      "in_transit": "bg-purple-500",
      "arrived": "bg-green-500",
      "approved": "bg-green-500",
      "under_review": "bg-orange-500",
      "draft": "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const maxCost = Math.max(...monthlyStats.map(s => s.cost));

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-2">
          نظرة عامة شاملة على الحاويات والشحنات والبيانات الجمركية
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                alert.type === 'warning' 
                  ? 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800' 
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
              }`}
            >
              <AlertCircle className={`h-5 w-5 mt-0.5 ${
                alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm text-muted-foreground mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحاويات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContainers}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +3 من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
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

        <Card className="hover:shadow-lg transition-shadow">
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

        <Card className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التكاليف</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats.totalCosts / 1000).toLocaleString()} د.أ
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +{stats.monthlyGrowth}% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Monthly Costs Chart */}
        <Card>
          <CardHeader>
            <CardTitle>التكاليف الشهرية</CardTitle>
            <CardDescription>
              تطور التكاليف خلال الأشهر الستة الماضية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stat.month}</span>
                    <span className="text-muted-foreground">
                      {(stat.cost / 1000).toLocaleString()} د.أ
                    </span>
                  </div>
                  <Progress 
                    value={(stat.cost / maxCost) * 100} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stat.containers} حاوية</span>
                    <span>{((stat.cost / maxCost) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>إحصائيات الموردين</CardTitle>
                <CardDescription>
                  نظرة عامة على الموردين النشطين
                </CardDescription>
              </div>
              <Link href="/suppliers">
                <Button variant="outline" size="sm">
                  عرض الكل
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الموردين</p>
                    <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">
                  {stats.activeSuppliers} نشط
                </Badge>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">المبلغ الإجمالي</p>
                    <p className="text-sm text-muted-foreground">جميع المعاملات</p>
                  </div>
                  <p className="text-xl font-bold">85,000 د.أ</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">المبلغ المدفوع</p>
                    <p className="text-sm text-muted-foreground">65% من الإجمالي</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">55,000 د.أ</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <div>
                    <p className="font-medium text-orange-700 dark:text-orange-400">المبلغ المتبقي</p>
                    <p className="text-sm text-muted-foreground">35% من الإجمالي</p>
                  </div>
                  <p className="text-xl font-bold text-orange-600">30,000 د.أ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Containers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الحاويات الأخيرة</CardTitle>
                <CardDescription>
                  آخر الحاويات التي تم تتبعها
                </CardDescription>
              </div>
              <Link href="/container-tracking">
                <Button variant="outline" size="sm">
                  عرض الكل
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContainers.map((container, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
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
                    <Badge className={`${getStatusBadge(container.status)} text-white`}>
                      {container.progress}%
                    </Badge>
                  </div>
                  <div className="mr-13">
                    <Progress value={container.progress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {container.eta}
                      </span>
                      <span>{container.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Declarations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>البيانات الجمركية الأخيرة</CardTitle>
                <CardDescription>
                  آخر البيانات المسجلة
                </CardDescription>
              </div>
              <Link href="/customs-declaration">
                <Button variant="outline" size="sm">
                  عرض الكل
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeclarations.map((declaration, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">بيان رقم {declaration.number}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {declaration.date}
                      </p>
                    </div>
                    <Badge className={`${getStatusBadge(declaration.status)} text-white`}>
                      {getStatusText(declaration.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="p-2 rounded bg-muted">
                      <p className="text-xs text-muted-foreground">قيمة البضاعة</p>
                      <p className="font-semibold">{(declaration.value / 1000).toFixed(3)} د.أ</p>
                    </div>
                    <div className="p-2 rounded bg-blue-50 dark:bg-blue-950">
                      <p className="text-xs text-muted-foreground">الرسوم</p>
                      <p className="font-semibold text-blue-600">{(declaration.fees / 1000).toFixed(3)} د.أ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
