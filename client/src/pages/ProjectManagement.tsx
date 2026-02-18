import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamSize: number;
  manager: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'تطوير نظام إدارة الجمارك',
      description: 'تطوير نظام متكامل لإدارة عمليات الجمارك',
      status: 'active',
      progress: 75,
      startDate: '2025-10-01',
      endDate: '2026-06-30',
      budget: 50000,
      spent: 35000,
      teamSize: 8,
      manager: 'أحمد محمد',
      priority: 'high',
    },
    {
      id: '2',
      name: 'تحديث قاعدة البيانات',
      description: 'ترقية وتحديث نظام قاعدة البيانات',
      status: 'active',
      progress: 45,
      startDate: '2026-01-15',
      endDate: '2026-05-15',
      budget: 25000,
      spent: 12000,
      teamSize: 5,
      manager: 'فاطمة علي',
      priority: 'medium',
    },
    {
      id: '3',
      name: 'تدريب الموظفين',
      description: 'برنامج تدريب شامل للموظفين الجدد',
      status: 'completed',
      progress: 100,
      startDate: '2025-12-01',
      endDate: '2026-01-31',
      budget: 15000,
      spent: 15000,
      teamSize: 3,
      manager: 'محمود حسن',
      priority: 'medium',
    },
    {
      id: '4',
      name: 'تحسين الأمان السيبراني',
      description: 'تعزيز إجراءات الأمان والحماية',
      status: 'on-hold',
      progress: 20,
      startDate: '2026-02-01',
      endDate: '2026-08-31',
      budget: 40000,
      spent: 5000,
      teamSize: 6,
      manager: 'سارة يوسف',
      priority: 'high',
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'on-hold':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'on-hold':
        return 'معلق';
      case 'cancelled':
        return 'ملغى';
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

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة المشاريع والعقود
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة المشاريع والعقود والميزانيات
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Briefcase className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المشاريع</p>
                <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">نشطة</p>
                <p className="text-3xl font-bold text-green-600">{activeProjects}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الميزانية</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${(totalBudget / 1000).toFixed(0)}K
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">المنفق</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${(totalSpent / 1000).toFixed(0)}K
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة المشاريع */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  المشاريع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(project.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {project.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* شريط التقدم */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">التقدم</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* المعلومات */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex gap-2">
                        <Badge variant="outline">{getStatusLabel(project.status)}</Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {getPriorityLabel(project.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.teamSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${project.spent}K / ${project.budget}K
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل المشروع */}
          <div>
            {selectedProject ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedProject.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الحالة</p>
                    <Badge variant="outline">
                      {getStatusLabel(selectedProject.status)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الأولوية</p>
                    <Badge className={getPriorityColor(selectedProject.priority)}>
                      {getPriorityLabel(selectedProject.priority)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">التقدم</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {selectedProject.progress}%
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      التواريخ
                    </p>
                    <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                      <p>البداية: {selectedProject.startDate}</p>
                      <p>النهاية: {selectedProject.endDate}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      الميزانية
                    </p>
                    <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                      <p>الإجمالي: ${selectedProject.budget}K</p>
                      <p>المنفق: ${selectedProject.spent}K</p>
                      <p>المتبقي: ${selectedProject.budget - selectedProject.spent}K</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      مدير المشروع
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedProject.manager}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">حجم الفريق</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedProject.teamSize} أشخاص
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر مشروعاً لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: راقب تقدم المشاريع والميزانيات بانتظام. تأكد من عدم تجاوز الميزانية المخصصة لكل مشروع.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
