import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmad@customs.jo',
      phone: '+962791234567',
      role: 'admin',
      status: 'active',
      joinDate: '2025-01-15',
      lastLogin: '2026-02-18 10:30',
      permissions: ['create_invoice', 'edit_invoice', 'delete_invoice', 'view_reports', 'manage_users'],
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@customs.jo',
      phone: '+962792345678',
      role: 'manager',
      status: 'active',
      joinDate: '2025-02-20',
      lastLogin: '2026-02-18 09:15',
      permissions: ['create_invoice', 'edit_invoice', 'view_reports'],
    },
    {
      id: '3',
      name: 'محمود حسن',
      email: 'mahmoud@customs.jo',
      phone: '+962793456789',
      role: 'operator',
      status: 'active',
      joinDate: '2025-03-10',
      lastLogin: '2026-02-17 14:45',
      permissions: ['create_invoice', 'view_reports'],
    },
    {
      id: '4',
      name: 'سارة يوسف',
      email: 'sarah@customs.jo',
      phone: '+962794567890',
      role: 'viewer',
      status: 'inactive',
      joinDate: '2025-04-05',
      lastLogin: '2026-02-10 11:20',
      permissions: ['view_reports'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const permissions: Permission[] = [
    { id: '1', name: 'إنشاء فاتورة', description: 'إنشاء فواتير جديدة' },
    { id: '2', name: 'تعديل فاتورة', description: 'تعديل الفواتير الموجودة' },
    { id: '3', name: 'حذف فاتورة', description: 'حذف الفواتير' },
    { id: '4', name: 'عرض التقارير', description: 'عرض التقارير والإحصائيات' },
    { id: '5', name: 'إدارة المستخدمين', description: 'إضافة وتعديل وحذف المستخدمين' },
    { id: '6', name: 'إدارة الإعدادات', description: 'تغيير إعدادات النظام' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مسؤول';
      case 'manager':
        return 'مدير';
      case 'operator':
        return 'مشغل';
      case 'viewer':
        return 'مشاهد';
      default:
        return '';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'operator':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <Unlock className="w-5 h-5 text-gray-500" />;
      case 'suspended':
        return <Lock className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'suspended':
        return 'معلق';
      default:
        return '';
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'active' ? 'inactive' : 'active',
        };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة المستخدمين
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة المستخدمين والصلاحيات والأدوار
            </p>
          </div>
          <Button onClick={() => setShowAddUser(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة مستخدم جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">نشطون</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">مسؤولون</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Lock className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">معلقون</p>
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* قائمة المستخدمين */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>المستخدمون</CardTitle>
                <CardDescription>
                  {filteredUsers.length} مستخدم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث والفلترة */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="ابحث عن مستخدم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="all">جميع الأدوار</option>
                      <option value="admin">مسؤول</option>
                      <option value="manager">مدير</option>
                      <option value="operator">مشغل</option>
                      <option value="viewer">مشاهد</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                      <option value="suspended">معلق</option>
                    </select>
                  </div>
                </div>

                {/* قائمة المستخدمين */}
                <div className="space-y-3">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(user.status)}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {user.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center mt-2">
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            <Badge variant="outline">
                              {getStatusLabel(user.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(user.id);
                            }}
                          >
                            {user.status === 'active' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل المستخدم */}
          <div>
            {selectedUser ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الهاتف</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedUser.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الدور</p>
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الحالة</p>
                    <Badge variant="outline">
                      {getStatusLabel(selectedUser.status)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">تاريخ الانضمام</p>
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4" />
                      {selectedUser.joinDate}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">آخر دخول</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedUser.lastLogin}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      الصلاحيات
                    </p>
                    <div className="space-y-1">
                      {selectedUser.permissions.map((perm, idx) => (
                        <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                          ✓ {perm}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر مستخدماً لعرض التفاصيل
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
            💡 نصيحة: يمكنك تعديل صلاحيات المستخدمين وتفعيل/تعطيل حساباتهم من هنا. تأكد من إعطاء الصلاحيات المناسبة لكل مستخدم.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
