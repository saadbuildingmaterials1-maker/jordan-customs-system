import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Check, AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { smartAlertsService, AlertThreshold, Alert } from '@/services/smartAlertsService';

interface SmartAlertsComponentProps {
  data?: any[];
  onAlertReceived?: (alert: Alert) => void;
}

export default function SmartAlertsComponent({
  data = [],
  onAlertReceived
}: SmartAlertsComponentProps) {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    operator: 'greaterThan' as const,
    value: '',
    severity: 'medium' as const
  });

  // تحميل البيانات عند التحميل
  useEffect(() => {
    loadThresholds();
    loadAlerts();
    requestNotificationPermission();
  }, []);

  // تحديث عدد التنبيهات غير المقروءة
  useEffect(() => {
    const unread = alerts.filter(a => !a.read).length;
    setUnreadCount(unread);
  }, [alerts]);

  const loadThresholds = async () => {
    try {
      const t = await smartAlertsService.getThresholds();
      setThresholds(t);
    } catch (error) {
      console.error('فشل تحميل الحدود:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const a = await smartAlertsService.getAlerts();
      setAlerts(a);
    } catch (error) {
      console.error('فشل تحميل التنبيهات:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      await smartAlertsService.requestNotificationPermission();
    } catch (error) {
      console.error('فشل طلب إذن الإشعارات:', error);
    }
  };

  const handleAddThreshold = async () => {
    if (!formData.name.trim() || !formData.field.trim() || !formData.value.trim()) {
      alert('ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await smartAlertsService.addThreshold({
        name: formData.name,
        field: formData.field,
        operator: formData.operator,
        value: isNaN(Number(formData.value)) ? formData.value : Number(formData.value),
        severity: formData.severity,
        enabled: true
      });

      setFormData({
        name: '',
        field: '',
        operator: 'greaterThan',
        value: '',
        severity: 'medium'
      });
      setShowForm(false);
      await loadThresholds();
      alert('تم إضافة الحد بنجاح');
    } catch (error) {
      alert('فشل إضافة الحد');
    }
  };

  const handleDeleteThreshold = async (thresholdId: string) => {
    if (!confirm('هل تريد حذف هذا الحد؟')) return;

    try {
      await smartAlertsService.deleteThreshold(thresholdId);
      await loadThresholds();
      alert('تم حذف الحد بنجاح');
    } catch (error) {
      alert('فشل حذف الحد');
    }
  };

  const handleToggleThreshold = async (threshold: AlertThreshold) => {
    try {
      await smartAlertsService.updateThreshold(threshold.id, {
        enabled: !threshold.enabled
      });
      await loadThresholds();
    } catch (error) {
      alert('فشل تحديث الحد');
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await smartAlertsService.markAsRead(alertId);
      await loadAlerts();
    } catch (error) {
      alert('فشل تحديث التنبيه');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await smartAlertsService.markAllAsRead();
      await loadAlerts();
    } catch (error) {
      alert('فشل تحديث التنبيهات');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await smartAlertsService.deleteAlert(alertId);
      await loadAlerts();
    } catch (error) {
      alert('فشل حذف التنبيه');
    }
  };

  const handleStartMonitoring = () => {
    if (!isMonitoring) {
      smartAlertsService.startMonitoring(data, 30000); // كل 30 ثانية
      setIsMonitoring(true);
      alert('تم بدء المراقبة');
    } else {
      smartAlertsService.stopMonitoring();
      setIsMonitoring(false);
      alert('تم إيقاف المراقبة');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'مرتفع',
      critical: 'حرج'
    };
    return labels[severity] || severity;
  };

  return (
    <div className="space-y-6">
      {/* Header with Monitoring Control */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button
              onClick={handleStartMonitoring}
              variant={isMonitoring ? 'destructive' : 'default'}
            >
              <Bell className="w-4 h-4 ml-2" />
              {isMonitoring ? 'إيقاف المراقبة' : 'بدء المراقبة'}
            </Button>
            <div className="text-right">
              <CardTitle>التنبيهات الذكية</CardTitle>
              <CardDescription>إدارة الحدود والتنبيهات التلقائية</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Unread Alerts Count */}
      {unreadCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex justify-between items-center">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
            >
              <Check className="w-4 h-4 ml-2" />
              تحديد الكل كمقروء
            </Button>
            <div className="text-right">
              <p className="text-red-900 font-semibold">
                لديك {unreadCount} تنبيه غير مقروء
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Threshold Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">إضافة حد تنبيه جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="اسم الحد"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="اسم الحقل (مثل: price)"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              />
              <select
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value as any })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="greaterThan">أكبر من</option>
                <option value="lessThan">أقل من</option>
                <option value="equals">يساوي</option>
                <option value="notEquals">لا يساوي</option>
              </select>
              <Input
                placeholder="القيمة"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">مرتفع</option>
                <option value="critical">حرج</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddThreshold} className="flex-1">
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Threshold Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 ml-2" />
          إضافة حد تنبيه جديد
        </Button>
      )}

      {/* Active Thresholds */}
      {thresholds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">الحدود النشطة ({thresholds.filter(t => t.enabled).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {thresholds.map(threshold => (
                <div key={threshold.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <button
                    onClick={() => handleDeleteThreshold(threshold.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleThreshold(threshold)}
                    className={`px-3 py-1 rounded text-sm ${
                      threshold.enabled
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {threshold.enabled ? 'مفعل' : 'معطل'}
                  </button>
                  <div className="text-right flex-1">
                    <h4 className="font-semibold">{threshold.name}</h4>
                    <p className="text-sm text-gray-600">
                      {threshold.field} {threshold.operator} {threshold.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(threshold.severity)}
                    <span className="text-sm">{getSeverityLabel(threshold.severity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right">التنبيهات الأخيرة ({alerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 10).map(alert => (
                <div
                  key={alert.id}
                  className={`flex justify-between items-center p-3 rounded ${
                    alert.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-right flex-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString('ar-JO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <span className="text-sm">{getSeverityLabel(alert.severity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts Message */}
      {alerts.length === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center text-right">
            <p className="text-green-900">لا توجد تنبيهات حالياً. كل شيء يعمل بشكل طبيعي.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
