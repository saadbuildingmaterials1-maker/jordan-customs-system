import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Shield,
  User,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function TeamAndRoles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+962791234567',
      role: 'admin',
      status: 'active',
      joinDate: '2025-01-01',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '+962791234568',
      role: 'manager',
      status: 'active',
      joinDate: '2025-06-15',
    },
    {
      id: '3',
      name: 'محمود حسن',
      email: 'mahmoud@example.com',
      phone: '+962791234569',
      role: 'operator',
      status: 'active',
      joinDate: '2025-09-20',
    },
    {
      id: '4',
      name: 'سارة خالد',
      email: 'sarah@example.com',
      phone: '+962791234570',
      role: 'viewer',
      status: 'inactive',
      joinDate: '2025-11-10',
    },
  ]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      admin: { label: 'مسؤول', color: 'bg-red-100 text-red-800 hover:bg-red-100' },
      manager: { label: 'مدير', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      operator: { label: 'مشغل', color: 'bg-green-100 text-green-800 hover:bg-green-100' },
      viewer: { label: 'مشاهد', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
    };
    const config = roleConfig[role] || { label: role, color: '' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <UserCheck className="w-3 h-3 mr-1" />
        نشط
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <UserX className="w-3 h-3 mr-1" />
        غير نشط
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة الفريق والأدوار
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة أعضاء الفريق والصلاحيات
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة عضو جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأعضاء</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">عضو</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نشطون</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter(m => m.status === 'active').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">عضو نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مسؤولون</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter(m => m.role === 'admin').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">مسؤول</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مديرون</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter(m => m.role === 'manager').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">مدير</p>
            </CardContent>
          </Card>
        </div>

        {/* الفلاتر والبحث */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="ابحث عن اسم أو بريد إلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأدوار</SelectItem>
              <SelectItem value="admin">مسؤول</SelectItem>
              <SelectItem value="manager">مدير</SelectItem>
              <SelectItem value="operator">مشغل</SelectItem>
              <SelectItem value="viewer">مشاهد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* جدول الأعضاء */}
        <Card>
          <CardHeader>
            <CardTitle>أعضاء الفريق</CardTitle>
            <CardDescription>
              {filteredMembers.length} عضو
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">الاسم</th>
                    <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4">الهاتف</th>
                    <th className="text-right py-3 px-4">الدور</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">تاريخ الانضمام</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-semibold">{member.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {member.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {member.phone}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(member.role)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="py-3 px-4">{member.joinDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="تعديل"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-600 dark:text-gray-400">
                        لا يوجد أعضاء يطابقون البحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* الأدوار والصلاحيات */}
        <Card>
          <CardHeader>
            <CardTitle>الأدوار والصلاحيات</CardTitle>
            <CardDescription>
              تفاصيل الأدوار المختلفة والصلاحيات المرتبطة بها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  role: 'مسؤول',
                  color: 'red',
                  permissions: ['إدارة كاملة للنظام', 'إدارة الفريق', 'إدارة الفواتير', 'إدارة الدفع'],
                },
                {
                  role: 'مدير',
                  color: 'blue',
                  permissions: ['عرض التقارير', 'إدارة الفواتير', 'إدارة الطلبات', 'عرض الإحصائيات'],
                },
                {
                  role: 'مشغل',
                  color: 'green',
                  permissions: ['إنشاء الفواتير', 'معالجة الدفع', 'عرض الطلبات', 'تحديث الحالات'],
                },
                {
                  role: 'مشاهد',
                  color: 'gray',
                  permissions: ['عرض الفواتير', 'عرض التقارير', 'عرض الإحصائيات', 'لا يمكن التعديل'],
                },
              ].map((roleInfo, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 border-${roleInfo.color}-200 dark:border-${roleInfo.color}-800 bg-${roleInfo.color}-50 dark:bg-${roleInfo.color}-900/20`}
                >
                  <h3 className={`font-semibold text-${roleInfo.color}-900 dark:text-${roleInfo.color}-100 mb-3`}>
                    {roleInfo.role}
                  </h3>
                  <ul className="space-y-2">
                    {roleInfo.permissions.map((perm, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className={`w-2 h-2 bg-${roleInfo.color}-600 rounded-full`}></span>
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            يمكنك إضافة أعضاء جدد وتعديل أدوارهم وصلاحياتهم من هذه الصفحة. تأكد من تعيين الأدوار المناسبة لكل عضو.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
