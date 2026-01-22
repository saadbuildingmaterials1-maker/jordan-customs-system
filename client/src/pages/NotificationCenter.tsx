import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function NotificationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isReadFilter, setIsReadFilter] = useState("all");

  // Mock data for notifications
  const mockNotifications = [
    {
      id: 1,
      type: "success",
      title: "تم حفظ البيان الجمركي",
      message: "تم حفظ البيان رقم 12345 بنجاح",
      createdAt: new Date(),
      isRead: false,
    },
    {
      id: 2,
      type: "error",
      title: "خطأ في الحذف",
      message: "فشل حذف الصنف بسبب خطأ في الاتصال",
      createdAt: new Date(Date.now() - 3600000),
      isRead: false,
    },
    {
      id: 3,
      type: "warning",
      title: "تحذير: انحراف مالي",
      message: "تم اكتشاف انحراف بنسبة 15% عن التوقع",
      createdAt: new Date(Date.now() - 7200000),
      isRead: true,
    },
    {
      id: 4,
      type: "info",
      title: "معلومة: تحديث النظام",
      message: "سيتم تحديث النظام في الساعة 12 صباحاً",
      createdAt: new Date(Date.now() - 86400000),
      isRead: true,
    },
  ];

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || notif.type === typeFilter;
      const matchesRead =
        isReadFilter === "all" ||
        (isReadFilter === "unread" && !notif.isRead) ||
        (isReadFilter === "read" && notif.isRead);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [searchTerm, typeFilter, isReadFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: mockNotifications.length,
      unread: mockNotifications.filter((n) => !n.isRead).length,
      success: mockNotifications.filter((n) => n.type === "success").length,
      error: mockNotifications.filter((n) => n.type === "error").length,
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `قبل ${minutes} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    if (days < 7) return `قبل ${days} يوم`;
    return date.toLocaleDateString("ar-JO");
  };

  const handleExportCSV = () => {
    const csv = [
      ["النوع", "العنوان", "الرسالة", "التاريخ", "الحالة"],
      ...filteredNotifications.map((n) => [
        n.type,
        n.title,
        n.message,
        new Date(n.createdAt).toLocaleString("ar-JO"),
        n.isRead ? "مقروء" : "غير مقروء",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `notifications-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مركز الإشعارات</h1>
        <p className="text-gray-600 mt-2">إدارة وعرض جميع إشعارات النظام</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-2">إجمالي الإشعارات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.unread}</p>
              <p className="text-sm text-gray-600 mt-2">غير مقروء</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.success}</p>
              <p className="text-sm text-gray-600 mt-2">نجاح</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.error}</p>
              <p className="text-sm text-gray-600 mt-2">أخطاء</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر والبحث</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700">البحث</label>
              <Input
                placeholder="ابحث عن الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700">النوع</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="info">معلومة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700">الحالة</label>
              <Select value={isReadFilter} onValueChange={setIsReadFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="unread">غير مقروء</SelectItem>
                  <SelectItem value="read">مقروء</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>الإشعارات ({filteredNotifications.length})</CardTitle>
          <CardDescription>
            {filteredNotifications.length === 0
              ? "لا توجد إشعارات"
              : `عرض ${filteredNotifications.length} من ${mockNotifications.length} إشعار`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد إشعارات تطابق معايير البحث</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    notif.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{notif.title}</h3>
                      <Badge className={getTypeColor(notif.type)}>{notif.type}</Badge>
                      {!notif.isRead && <Badge variant="secondary">جديد</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notif.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
