import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import AlertsPanel from "@/components/AlertsPanel";
import { Plus, Edit2, Trash2, Bell, Settings } from "lucide-react";

// بيانات تجريبية للتنبيهات
const mockAlerts = [
  {
    id: "alert-1",
    ruleId: "variance-20",
    type: "variance" as const,
    severity: "high" as const,
    title: "انحراف الإيرادات 20%",
    message: "الإيرادات الفعلية أقل من المتوقع بنسبة 25%",
    currentValue: 75000,
    expectedValue: 100000,
    variance: -25000,
    variancePercentage: 25,
    recommendation: "يرجى مراجعة أسعار البيع والتحقق من حجم المبيعات",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "active" as const,
  },
  {
    id: "alert-2",
    ruleId: "threshold-customs",
    type: "threshold" as const,
    severity: "high" as const,
    title: "تجاوز الرسوم الجمركية",
    message: "الرسوم الجمركية تجاوزت 50,000 دينار",
    currentValue: 62000,
    expectedValue: 50000,
    variance: 12000,
    variancePercentage: 24,
    recommendation: "تحقق من تصنيف المنتجات الجمركي وقيم الفواتير",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: "active" as const,
  },
  {
    id: "alert-3",
    ruleId: "variance-15",
    type: "variance" as const,
    severity: "medium" as const,
    title: "انحراف المصاريف 15%",
    message: "المصاريف الفعلية أعلى من المتوقع بنسبة 18%",
    currentValue: 118000,
    expectedValue: 100000,
    variance: 18000,
    variancePercentage: 18,
    recommendation: "راجع تفاصيل المصاريف وحدد المصادر الرئيسية للزيادة",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    status: "acknowledged" as const,
  },
];

// بيانات تجريبية للقواعس
const mockRules = [
  {
    id: "variance-20",
    name: "انحراف الإيرادات 20%",
    type: "variance" as const,
    metric: "revenue",
    threshold: 20,
    severity: "high" as const,
    enabled: true,
    description: "تنبيه عند انحراف الإيرادات عن التوقع بأكثر من 20%",
  },
  {
    id: "variance-15",
    name: "انحراف المصاريف 15%",
    type: "variance" as const,
    metric: "expenses",
    threshold: 15,
    severity: "medium" as const,
    enabled: true,
    description: "تنبيه عند انحراف المصاريف عن التوقع بأكثر من 15%",
  },
  {
    id: "threshold-customs",
    name: "تجاوز الرسوم الجمركية",
    type: "threshold" as const,
    metric: "customsDuties",
    threshold: 50000,
    severity: "high" as const,
    enabled: true,
    description: "تنبيه عند تجاوز الرسوم الجمركية 50,000 دينار",
  },
  {
    id: "threshold-vat",
    name: "ضريبة المبيعات المرتفعة",
    type: "threshold" as const,
    metric: "vat",
    threshold: 30000,
    severity: "medium" as const,
    enabled: false,
    description: "تنبيه عند تجاوز ضريبة المبيعات 30,000 دينار",
  },
];

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<any[]>(mockAlerts);
  const [rules, setRules] = useState<any[]>(mockRules);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAlertStatusChange = (alertId: string, status: "active" | "resolved" | "acknowledged") => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: status,
              resolvedAt: status === "resolved" ? new Date() : undefined,
            }
          : alert
      )
    );
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.includes(searchTerm) ||
      rule.description.includes(searchTerm) ||
      rule.metric.includes(searchTerm)
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "variance":
        return "انحراف";
      case "threshold":
        return "حد أدنى";
      case "anomaly":
        return "شذوذ";
      case "trend":
        return "اتجاه";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التنبيهات</h1>
          <p className="text-gray-600 mt-1">نظام التنبيهات الذكية لكشف الانحرافات المالية</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          تنبيه جديد
        </Button>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="w-4 h-4" />
            التنبيهات ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="w-4 h-4" />
            القواعس ({rules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-6">
          <AlertsPanel alerts={alerts} onStatusChange={handleAlertStatusChange} />
        </TabsContent>

        <TabsContent value="rules" className="mt-6 space-y-4">
          {/* شريط البحث */}
          <div className="mb-4">
            <Input
              placeholder="ابحث عن القاعدة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* قائمة القواعس */}
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            rule.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : rule.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {rule.severity === "high"
                            ? "عالية"
                            : rule.severity === "medium"
                              ? "متوسطة"
                              : "منخفضة"}
                        </Badge>
                        <Badge variant="secondary">{getTypeLabel(rule.type)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">المقياس: </span>
                          <span className="font-semibold">{rule.metric}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">الحد: </span>
                          <span className="font-semibold">
                            {rule.threshold.toLocaleString("ar-JO")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">الحالة: </span>
                          <span
                            className={`font-semibold ${
                              rule.enabled ? "text-green-600" : "text-gray-600"
                            }`}
                          >
                            {rule.enabled ? "مفعلة" : "معطلة"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                      <Button size="sm" variant="ghost">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">لم يتم العثور على قواعس</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
