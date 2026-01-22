import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Users, Shield, Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function UsersAndRoles() {
  const [activeTab, setActiveTab] = useState('users');

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2025-01-01',
      lastLogin: '2026-01-22',
    },
    {
      id: 2,
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      role: 'manager',
      status: 'active',
      joinDate: '2025-06-15',
      lastLogin: '2026-01-21',
    },
    {
      id: 3,
      name: 'محمود سالم',
      email: 'mahmoud@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2025-09-20',
      lastLogin: '2026-01-20',
    },
    {
      id: 4,
      name: 'ليلى حسن',
      email: 'layla@example.com',
      role: 'user',
      status: 'inactive',
      joinDate: '2025-12-01',
      lastLogin: '2026-01-10',
    },
  ]);

  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'مسؤول النظام',
      code: 'admin',
      description: 'صلاحيات كاملة على النظام',
      permissions: ['إدارة المستخدمين', 'إدارة البيانات', 'إدارة الإعدادات', 'عرض التقارير'],
      usersCount: 1,
    },
    {
      id: 2,
      name: 'مدير',
      code: 'manager',
      description: 'إدارة البيانات والمستخدمين',
      permissions: ['إدارة البيانات', 'عرض التقارير', 'إدارة المستخدمين'],
      usersCount: 1,
    },
    {
      id: 3,
      name: 'مستخدم عادي',
      code: 'user',
      description: 'عرض وإدخال البيانات',
      permissions: ['إدخال البيانات', 'عرض البيانات', 'تصدير التقارير'],
      usersCount: 2,
    },
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مسؤول';
      case 'manager':
        return 'مدير';
      case 'user':
        return 'مستخدم';
      default:
        return role;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8" />
              إدارة المستخدمين والأدوار
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة المستخدمين والصلاحيات والأدوار
            </p>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">المستخدمون</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">الأدوار</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب المستخدمين */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة المستخدمين</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة مستخدم جديد
              </Button>
            </div>

            {/* إحصائيات المستخدمين */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    إجمالي المستخدمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    مستخدمون نشطون
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    مسؤولون
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'admin').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    مديرون
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'manager').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* جدول المستخدمين */}
            <Card>
              <CardHeader>
                <CardTitle>المستخدمون</CardTitle>
                <CardDescription>جميع المستخدمين المسجلين في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">الاسم</th>
                        <th className="text-right py-3 px-4 font-medium">البريد الإلكتروني</th>
                        <th className="text-right py-3 px-4 font-medium">الدور</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">آخر دخول</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.lastLogin}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الأدوار */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة الأدوار</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة دور جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          {role.name}
                        </CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">الصلاحيات</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} className="bg-blue-100 text-blue-800">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{role.usersCount}</span> مستخدم
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
