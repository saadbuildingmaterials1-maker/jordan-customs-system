/**
 * Alerts Component
 * نظام التنبيهات المتقدم
 * 
 * الميزات:
 * - إنشاء تنبيهات ذكية
 * - نظام القواعد (Rules)
 * - نظام الإجراءات (Actions)
 * - جدولة التنبيهات
 * - دعم اللغة العربية (RTL)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Edit2, Trash2, Clock, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  condition: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'تنبيه الشحنات المتأخرة',
      description: 'تنبيه عند تأخر الشحنة أكثر من 24 ساعة',
      type: 'warning',
      priority: 'high',
      condition: 'delay > 24h',
      action: 'send_email',
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      triggerCount: 12,
    },
    {
      id: '2',
      title: 'تنبيه الرسوم الجمركية العالية',
      description: 'تنبيه عند تجاوز الرسوم الجمركية 5000 دينار',
      type: 'error',
      priority: 'critical',
      condition: 'customs_fee > 5000',
      action: 'send_sms',
      isActive: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000),
      triggerCount: 8,
    },
    {
      id: '3',
      title: 'تنبيه الفحص الجمركي',
      description: 'تنبيه عند بدء الفحص الجمركي',
      type: 'info',
      priority: 'medium',
      condition: 'inspection_started',
      action: 'send_notification',
      isActive: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      triggerCount: 5,
    },
  ]);

  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    type: 'warning' as const,
    priority: 'medium' as const,
    condition: '',
    action: 'send_email' as const,
  });

  const handleAddAlert = () => {
    if (newAlert.title && newAlert.condition) {
      const alert: Alert = {
        id: Date.now().toString(),
        ...newAlert,
        isActive: true,
        createdAt: new Date(),
        triggerCount: 0,
      };
      setAlerts([alert, ...alerts]);
      setNewAlert({
        title: '',
        description: '',
        type: 'warning',
        priority: 'medium',
        condition: '',
        action: 'send_email',
      });
      setShowNewAlert(false);
    }
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'warning':
        return 'تحذير';
      case 'error':
        return 'خطأ';
      case 'success':
        return 'نجاح';
      case 'info':
        return 'معلومة';
      default:
        return 'تنبيه';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'حرجة';
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'غير محددة';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'send_email':
        return 'إرسال بريد إلكتروني';
      case 'send_sms':
        return 'إرسال رسالة نصية';
      case 'send_notification':
        return 'إرسال إشعار';
      case 'create_ticket':
        return 'إنشاء تذكرة';
      default:
        return 'إجراء';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">نظام التنبيهات المتقدم</h1>
            <p className="text-muted-foreground mt-2">إدارة التنبيهات والقواعس والإجراءات</p>
          </div>
          <Button onClick={() => setShowNewAlert(!showNewAlert)} size="lg">
            <Plus size={20} className="ml-2" />
            تنبيه جديد
          </Button>
        </div>

        {/* New Alert Form */}
        {showNewAlert && (
          <Card className="p-6 border-border bg-muted/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">إنشاء تنبيه جديد</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="عنوان التنبيه"
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              />
              <select
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="warning">تحذير</option>
                <option value="error">خطأ</option>
                <option value="info">معلومة</option>
                <option value="success">نجاح</option>
              </select>
              <Input
                placeholder="الوصف"
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              />
              <select
                value={newAlert.priority}
                onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value as any })}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="critical">حرجة</option>
              </select>
              <Input
                placeholder="الشرط (مثال: delay > 24h)"
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                className="md:col-span-2"
              />
              <select
                value={newAlert.action}
                onChange={(e) => setNewAlert({ ...newAlert, action: e.target.value as any })}
                className="px-3 py-2 border border-input rounded-md bg-background md:col-span-2"
              >
                <option value="send_email">إرسال بريد إلكتروني</option>
                <option value="send_sms">إرسال رسالة نصية</option>
                <option value="send_notification">إرسال إشعار</option>
                <option value="create_ticket">إنشاء تذكرة</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddAlert}>
                إنشاء التنبيه
              </Button>
            </div>
          </Card>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <Card 
                key={alert.id} 
                className={`p-6 border-l-4 transition-all ${
                  alert.isActive 
                    ? 'border-l-blue-500 hover:shadow-md' 
                    : 'border-l-gray-300 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getTypeIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{alert.title}</h3>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {getPriorityLabel(alert.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(alert.type)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{alert.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">الشرط:</p>
                          <p className="font-mono text-foreground">{alert.condition}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">الإجراء:</p>
                          <p className="text-foreground">{getActionLabel(alert.action)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">عدد التفعيلات:</p>
                          <p className="text-foreground font-semibold">{alert.triggerCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">آخر تفعيل:</p>
                          <p className="text-foreground">
                            {alert.lastTriggered 
                              ? alert.lastTriggered.toLocaleString('ar-JO')
                              : 'لم يتم التفعيل بعد'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={alert.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleAlert(alert.id)}
                    >
                      <Clock size={16} className="ml-2" />
                      {alert.isActive ? 'مفعل' : 'معطل'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center border-border">
              <Bell size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">لا توجد تنبيهات حالياً</p>
              <p className="text-muted-foreground text-sm mt-2">أنشئ تنبيهاً جديداً للبدء</p>
            </Card>
          )}
        </div>

        {/* Statistics */}
        <Card className="p-6 border-border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات التنبيهات</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{alerts.length}</p>
              <p className="text-muted-foreground">إجمالي التنبيهات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {alerts.filter(a => a.isActive).length}
              </p>
              <p className="text-muted-foreground">تنبيهات مفعلة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {alerts.filter(a => a.priority === 'critical').length}
              </p>
              <p className="text-muted-foreground">تنبيهات حرجة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {alerts.reduce((acc, a) => acc + a.triggerCount, 0)}
              </p>
              <p className="text-muted-foreground">إجمالي التفعيلات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {alerts.filter(a => a.lastTriggered).length}
              </p>
              <p className="text-muted-foreground">تنبيهات نشطة</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
