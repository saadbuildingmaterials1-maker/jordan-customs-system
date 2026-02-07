/**
 * AlertsPanel Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/AlertsPanel
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

export interface Alert {
  id: string;
  ruleId: string;
  type: "variance" | "threshold" | "anomaly" | "trend";
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  currentValue: number;
  expectedValue: number;
  variance: number;
  variancePercentage: number;
  recommendation: string;
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "acknowledged";
}

interface AlertsPanelProps {
  alerts: Alert[];
  onStatusChange?: (alertId: string, status: "active" | "resolved" | "acknowledged") => void;
}

export default function AlertsPanel({ alerts, onStatusChange }: AlertsPanelProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "low":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "acknowledged":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTrendIcon = (variance: number) => {
    return variance > 0 ? (
      <TrendingUp className="w-4 h-4 text-red-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-green-500" />
    );
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const acknowledgedAlerts = alerts.filter((a) => a.status === "acknowledged");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  const renderAlertItem = (alert: Alert) => (
    <div
      key={alert.id}
      className={`border rounded-lg p-4 mb-3 cursor-pointer transition-all ${
        expandedAlert === alert.id ? "bg-gray-50 border-blue-500" : "hover:bg-gray-50"
      }`}
      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          {getSeverityIcon(alert.severity)}
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{alert.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getSeverityBadgeColor(alert.severity)}>
            {alert.severity === "high"
              ? "عالية"
              : alert.severity === "medium"
                ? "متوسطة"
                : "منخفضة"}
          </Badge>
          {getStatusIcon(alert.status)}
        </div>
      </div>

      {expandedAlert === alert.id && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {/* تفاصيل القيم */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">القيمة الحالية</p>
              <p className="font-semibold">
                {alert.currentValue.toLocaleString("ar-JO", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">القيمة المتوقعة</p>
              <p className="font-semibold">
                {alert.expectedValue.toLocaleString("ar-JO", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-xs text-gray-600">الانحراف</p>
              <div className="flex items-center gap-1">
                {getTrendIcon(alert.variance)}
                <p className="font-semibold">{alert.variancePercentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* التوصية */}
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-xs text-gray-600 mb-1">التوصية الذكية:</p>
            <p className="text-sm text-gray-800">{alert.recommendation}</p>
          </div>

          {/* معلومات إضافية */}
          <div className="text-xs text-gray-500">
            <p>النوع: {alert.type}</p>
            <p>الوقت: {new Date(alert.createdAt).toLocaleString("ar-JO")}</p>
          </div>

          {/* أزرار الإجراء */}
          {alert.status === "active" && onStatusChange && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(alert.id, "acknowledged");
                }}
              >
                تم الاطلاع
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(alert.id, "resolved");
                }}
              >
                تم الحل
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          نظام التنبيهات الذكية
        </CardTitle>
        <CardDescription>
          كشف الانحرافات المالية وإرسال إشعارات فورية مع توصيات ذكية
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">لا توجد تنبيهات حالياً</p>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                نشطة ({activeAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="acknowledged">
                مطلعة ({acknowledgedAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                محلولة ({resolvedAlerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {activeAlerts.length === 0 ? (
                <p className="text-center text-gray-600 py-4">لا توجد تنبيهات نشطة</p>
              ) : (
                <div>{activeAlerts.map(renderAlertItem)}</div>
              )}
            </TabsContent>

            <TabsContent value="acknowledged" className="mt-4">
              {acknowledgedAlerts.length === 0 ? (
                <p className="text-center text-gray-600 py-4">لا توجد تنبيهات مطلعة</p>
              ) : (
                <div>{acknowledgedAlerts.map(renderAlertItem)}</div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              {resolvedAlerts.length === 0 ? (
                <p className="text-center text-gray-600 py-4">لا توجد تنبيهات محلولة</p>
              ) : (
                <div>{resolvedAlerts.map(renderAlertItem)}</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
