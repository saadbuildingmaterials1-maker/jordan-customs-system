import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Star,
  Eye,
  Reply,
  Trash2,
  Edit,
  Send,
  Phone,
  Mail,
  FileText,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdDate: string;
  updatedDate: string;
  assignedTo: string;
  responses: number;
}

interface KnowledgeBase {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  lastUpdated: string;
  rating: number;
}

export default function TechnicalSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      ticketNumber: 'TKT-2026-001',
      title: 'مشكلة في تسجيل الدخول',
      description: 'لا أستطيع تسجيل الدخول إلى النظام باستخدام بيانات اعتماديي',
      status: 'in-progress',
      priority: 'high',
      category: 'Authentication',
      createdDate: '2026-02-18',
      updatedDate: '2026-02-18',
      assignedTo: 'أحمد محمد',
      responses: 3,
    },
    {
      id: '2',
      ticketNumber: 'TKT-2026-002',
      title: 'استفسار عن الفواتير',
      description: 'كيف يمكنني تصدير الفواتير بصيغة Excel؟',
      status: 'open',
      priority: 'medium',
      category: 'Invoicing',
      createdDate: '2026-02-17',
      updatedDate: '2026-02-18',
      assignedTo: 'فاطمة علي',
      responses: 1,
    },
    {
      id: '3',
      ticketNumber: 'TKT-2026-003',
      title: 'تقرير عن خطأ في الدفع',
      description: 'الدفع عبر HyperPay لا يعمل بشكل صحيح',
      status: 'resolved',
      priority: 'high',
      category: 'Payment',
      createdDate: '2026-02-16',
      updatedDate: '2026-02-17',
      assignedTo: 'محمود حسن',
      responses: 5,
    },
    {
      id: '4',
      ticketNumber: 'TKT-2026-004',
      title: 'طلب ميزة جديدة',
      description: 'هل يمكن إضافة خاصية البحث المتقدم؟',
      status: 'open',
      priority: 'low',
      category: 'Feature Request',
      createdDate: '2026-02-15',
      updatedDate: '2026-02-15',
      assignedTo: 'سارة أحمد',
      responses: 2,
    },
  ]);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([
    {
      id: '1',
      title: 'كيفية إنشاء فاتورة جديدة',
      category: 'Invoicing',
      views: 245,
      helpful: 198,
      lastUpdated: '2026-02-10',
      rating: 4.8,
    },
    {
      id: '2',
      title: 'شرح نظام الدفع والتحويلات',
      category: 'Payment',
      views: 189,
      helpful: 156,
      lastUpdated: '2026-02-12',
      rating: 4.6,
    },
    {
      id: '3',
      title: 'إدارة المستخدمين والصلاحيات',
      category: 'User Management',
      views: 156,
      helpful: 132,
      lastUpdated: '2026-02-08',
      rating: 4.7,
    },
    {
      id: '4',
      title: 'استكشاف الأخطاء الشائعة',
      category: 'Troubleshooting',
      views: 312,
      helpful: 278,
      lastUpdated: '2026-02-14',
      rating: 4.9,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'مفتوح';
      case 'in-progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'تم الحل';
      case 'closed':
        return 'مغلق';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return '';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return '';
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const avgResponseTime = '2.5 ساعة';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الدعم الفني والمساعدة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة تذاكر الدعم والمساعدة الذاتية والدردشة الحية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            تذكرة دعم جديدة
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي التذاكر</p>
                <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">مفتوحة</p>
                <p className="text-3xl font-bold text-yellow-600">{openTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">قيد المعالجة</p>
                <p className="text-3xl font-bold text-orange-600">{inProgressTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">تم حلها</p>
                <p className="text-3xl font-bold text-green-600">{resolvedTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط الوقت</p>
                <p className="text-2xl font-bold text-purple-600">{avgResponseTime}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة التذاكر */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                تذاكر الدعم
              </CardTitle>
              <input
                type="text"
                placeholder="ابحث عن تذكرة..."
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {ticket.ticketNumber}: {ticket.title}
                      </h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {ticket.description}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>الفئة: {ticket.category}</span>
                      <span>المسؤول: {ticket.assignedTo}</span>
                      <span>الردود: {ticket.responses}</span>
                      <span>تم التحديث: {ticket.updatedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Reply className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* قاعدة المعرفة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              قاعدة المعرفة الذاتية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {knowledgeBase.map(article => (
              <div
                key={article.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      الفئة: {article.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(article.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">المشاهدات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{article.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">مفيد</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{article.helpful}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">آخر تحديث</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{article.lastUpdated}</p>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="w-full gap-2">
                  <Eye className="w-4 h-4" />
                  اقرأ المقالة
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* قنوات الاتصال */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              قنوات الدعم والاتصال
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">الدردشة الحية</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                تحدث مع فريق الدعم الآن
              </p>
              <Button size="sm" className="w-full gap-2">
                <MessageSquare className="w-4 h-4" />
                ابدأ الدردشة
              </Button>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <Phone className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">الاتصال الهاتفي</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                +962 6 123 4567
              </p>
              <Button size="sm" className="w-full gap-2">
                <Phone className="w-4 h-4" />
                اتصل بنا
              </Button>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <Mail className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">البريد الإلكتروني</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                support@example.com
              </p>
              <Button size="sm" className="w-full gap-2">
                <Mail className="w-4 h-4" />
                أرسل بريداً
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: تحقق من قاعدة المعرفة الذاتية أولاً - فقد تجد الإجابة على سؤالك هناك. إذا لم تجد حلاً، فلا تتردد في فتح تذكرة دعم أو التواصل معنا مباشرة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
