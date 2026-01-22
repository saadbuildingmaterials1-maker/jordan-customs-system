import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, Check, CheckAll, Search, Download, Filter } from "lucide-react";
import { formatArabicNumber } from "@/lib/formatting";

export default function NotificationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isReadFilter, setIsReadFilter] = useState<string>("all");

  // Queries
  const { data: notifications = [], isLoading, refetch } =
    trpc.notifications.getNotifications.useQuery({
      limit: 100,
      offset: 0,
    });

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery();

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteNotificationMutation = trpc.notifications.delete.useMutation();

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return (notifications || []).filter((notif: any) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || notif.type === typeFilter;
      const matchesRead =
        isReadFilter === "all" ||
        (isReadFilter === "read" ? notif.isRead : !notif.isRead);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, searchTerm, typeFilter, isReadFilter]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
      await refetch();
    } catch (error) {
      console.error("خطأ في تحديث الإشعار:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error("خطأ في تحديث الإشعارات:", error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;

    try {
      await deleteNotificationMutation.mutateAsync({ notificationId });
      await refetch();
    } catch (error) {
      console.error("خطأ في حذف الإشعار:", error);
    }
  };

  const handleExportCsv = () => {
    const headers = ["التاريخ", "النوع", "العنوان", "الرسالة", "الحالة"];
    const rows = filteredNotifications.map((notif: any) => [
      new Date(notif.createdAt).toLocaleString("ar-JO"),
      getTypeLabel(notif.type),
      notif.title,
      notif.message,
      notif.isRead ? "مقروء" : "غير مقروء",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `notifications-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      success: "✓",
      error: "✗",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[type] || "•";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      success: "نجاح",
      error: "خطأ",
      warning: "تحذير",
      info: "معلومة",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">مركز الإشعارات</h1>
            <p className="text-muted-foreground mt-1">
              إدارة وعرض جميع إشعارات النظام
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <CheckAll className="w-4 h-4" />
              تحديد الكل كمقروء
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">إجمالي الإشعارات</div>
            <div className="text-2xl font-bold mt-2">
              {formatArabicNumber(notifications.length)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">غير المقروءة</div>
            <div className="text-2xl font-bold mt-2 text-orange-600">
              {formatArabicNumber(unreadCount)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">النجاحات</div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              {formatArabicNumber(
                notifications.filter((n: any) => n.type === "success").length
              )}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">الأخطاء</div>
            <div className="text-2xl font-bold mt-2 text-red-600">
              {formatArabicNumber(
                notifications.filter((n: any) => n.type === "error").length
              )}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن إشعار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">جميع الأنواع</option>
              <option value="success">نجاح</option>
              <option value="error">خطأ</option>
              <option value="warning">تحذير</option>
              <option value="info">معلومة</option>
            </select>
            <select
              value={isReadFilter}
              onChange={(e) => setIsReadFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">جميع الحالات</option>
              <option value="unread">غير مقروء</option>
              <option value="read">مقروء</option>
            </select>
          </div>
        </Card>

        {/* Notifications Table */}
        <Card>
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              لا توجد إشعارات تطابق معايير البحث
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الرسالة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notif: any) => (
                  <TableRow
                    key={notif.id}
                    className={notif.isRead ? "opacity-60" : ""}
                  >
                    <TableCell className="text-right">
                      {new Date(notif.createdAt).toLocaleString("ar-JO")}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                          notif.type
                        )}`}
                      >
                        {getTypeIcon(notif.type)} {getTypeLabel(notif.type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {notif.title}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {notif.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          notif.isRead
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {notif.isRead ? "مقروء" : "غير مقروء"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {!notif.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            قراءة
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notif.id)}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
