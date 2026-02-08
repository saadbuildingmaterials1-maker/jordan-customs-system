import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, XCircle, Clock, Bell, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
}

interface PaymentLog {
  id: string;
  timestamp: string;
  type: "payment" | "subscription" | "refund" | "webhook";
  status: "success" | "failed" | "pending";
  amount?: number;
  description: string;
  details: Record<string, any>;
}

export function AdvancedNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "تم معالجة الدفع بنجاح",
      message: "تم استقبال دفعتك بقيمة 99 JOD",
      timestamp: new Date().toISOString(),
      read: false,
      action: "عرض الفاتورة",
    },
    {
      id: "2",
      type: "info",
      title: "تم تحديث الاشتراك",
      message: "تم ترقية اشتراكك إلى الخطة المتقدمة",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: "3",
      type: "warning",
      title: "فاتورة قادمة",
      message: "ستتم فاتورتك في 3 أيام",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
  ]);

  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([
    {
      id: "log_1",
      timestamp: new Date().toISOString(),
      type: "payment",
      status: "success",
      amount: 99,
      description: "دفع الاشتراك الشهري",
      details: {
        sessionId: "cs_test_123456",
        customerId: "cus_123456",
        planId: "professional",
      },
    },
    {
      id: "log_2",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "subscription",
      status: "success",
      description: "تحديث الاشتراك",
      details: {
        oldPlan: "basic",
        newPlan: "professional",
        upgradeAmount: 50,
      },
    },
    {
      id: "log_3",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      type: "webhook",
      status: "success",
      description: "استقبال webhook من Stripe",
      details: {
        eventType: "invoice.payment_succeeded",
        eventId: "evt_test_123456",
      },
    },
  ]);

  const [showDetails, setShowDetails] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "نجح";
      case "failed":
        return "فشل";
      case "pending":
        return "قيد الانتظار";
      default:
        return status;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ar-JO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      {/* الإشعارات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإشعارات
            </CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `لديك ${unreadCount} إشعارات جديدة` : "لا توجد إشعارات جديدة"}
            </CardDescription>
          </div>
          {notifications.length > 0 && (
            <Button
              onClick={handleClearAllNotifications}
              variant="ghost"
              size="sm"
            >
              حذف الكل
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد إشعارات</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg flex items-start gap-4 ${getNotificationBg(notification.type)} ${
                  !notification.read ? "border-l-4" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(notification.timestamp)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      onClick={() => handleMarkAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                    >
                      وسم كمقروء
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteNotification(notification.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* سجل الدفعات والحركات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحركات المالية</CardTitle>
          <CardDescription>
            جميع عمليات الدفع والاشتراكات والـ webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {log.status === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {log.status === "failed" && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {log.status === "pending" && (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {log.description}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {log.type === "payment" && "عملية دفع"}
                        {log.type === "subscription" && "تحديث الاشتراك"}
                        {log.type === "refund" && "استرجاع"}
                        {log.type === "webhook" && "استقبال webhook"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.amount && (
                      <p className="font-bold text-gray-900">
                        {log.amount} JOD
                      </p>
                    )}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
                      {getStatusLabel(log.status)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {formatDate(log.timestamp)}
                </p>
                <button
                  onClick={() =>
                    setShowDetails(showDetails === log.id ? null : log.id)
                  }
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showDetails === log.id ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                </button>
                {showDetails === log.id && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-sm font-mono text-gray-700">
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
