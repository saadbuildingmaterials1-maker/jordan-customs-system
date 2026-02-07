/**
 * UsersManagement Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/UsersManagement
 */
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Search, Shield, User, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const roleLabels = {
  admin: 'مدير النظام',
  manager: 'مدير',
  user: 'مستخدم',
  viewer: 'عارض فقط',
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2025-01-01',
      lastLogin: '2026-01-24',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      role: 'manager',
      status: 'active',
      createdAt: '2025-06-15',
      lastLogin: '2026-01-23',
    },
    {
      id: '3',
      name: 'محمود حسن',
      email: 'mahmoud@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2025-09-20',
      lastLogin: '2026-01-22',
    },
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as const,
  });

  const filteredUsers = users.filter(user =>
    user.name.includes(searchQuery) || user.email.includes(searchQuery)
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'user' });
    setIsAddingUser(false);
    toast.success('تم إضافة المستخدم بنجاح');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== id));
      toast.success('تم حذف المستخدم بنجاح');
    }
  };

  const handleUpdateRole = (id: string, newRole: User['role']) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    toast.success('تم تحديث الدور بنجاح');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              إدارة المستخدمين والأدوار
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة المستخدمين والصلاحيات والأدوار في النظام
            </p>
          </div>
          <Button onClick={() => setIsAddingUser(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إضافة مستخدم جديد
          </Button>
        </div>

        {/* شريط البحث */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول المستخدمين */}
        <Card>
          <CardHeader>
            <CardTitle>المستخدمون النشطون ({filteredUsers.length})</CardTitle>
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
                    <th className="text-right py-3 px-4 font-medium">تاريخ الإنشاء</th>
                    <th className="text-right py-3 px-4 font-medium">آخر دخول</th>
                    <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <Mail className="w-4 h-4 inline ml-2" />
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as User['role'])}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}
                        >
                          <option value="admin">{roleLabels.admin}</option>
                          <option value="manager">{roleLabels.manager}</option>
                          <option value="user">{roleLabels.user}</option>
                          <option value="viewer">{roleLabels.viewer}</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 inline ml-2" />
                        {user.createdAt}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {user.lastLogin || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditingUser(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">المديرون</p>
                <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">المستخدمون النشطون</p>
                <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">غير النشطين</p>
                <p className="text-3xl font-bold text-red-600">{users.filter(u => u.status === 'inactive').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog إضافة مستخدم */}
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المستخدم الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="الاسم"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <Input
                placeholder="البريد الإلكتروني"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="user">{roleLabels.user}</option>
                <option value="manager">{roleLabels.manager}</option>
                <option value="admin">{roleLabels.admin}</option>
                <option value="viewer">{roleLabels.viewer}</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddUser} className="flex-1">
                  إضافة
                </Button>
                <Button variant="outline" onClick={() => setIsAddingUser(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
