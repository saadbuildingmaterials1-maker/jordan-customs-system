import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Building,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  staff: number;
  status: 'active' | 'inactive';
  workingHours: string;
  coordinates: { lat: number; lng: number };
}

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      name: 'فرع عمّان الرئيسي',
      location: 'عمّان',
      address: 'شارع الملك حسين، عمّان',
      phone: '+962791234567',
      email: 'amman@customs.jo',
      manager: 'أحمد محمد',
      staff: 25,
      status: 'active',
      workingHours: '08:00 - 17:00',
      coordinates: { lat: 31.9454, lng: 35.9284 },
    },
    {
      id: '2',
      name: 'فرع العقبة',
      location: 'العقبة',
      address: 'ميناء العقبة، العقبة',
      phone: '+962792345678',
      email: 'aqaba@customs.jo',
      manager: 'فاطمة علي',
      staff: 18,
      status: 'active',
      workingHours: '07:00 - 18:00',
      coordinates: { lat: 29.5297, lng: 34.9414 },
    },
    {
      id: '3',
      name: 'فرع إربد',
      location: 'إربد',
      address: 'شارع الملك عبدالله، إربد',
      phone: '+962793456789',
      email: 'irbid@customs.jo',
      manager: 'محمود حسن',
      staff: 12,
      status: 'active',
      workingHours: '08:00 - 16:00',
      coordinates: { lat: 32.5546, lng: 35.8623 },
    },
    {
      id: '4',
      name: 'فرع الزرقاء',
      location: 'الزرقاء',
      address: 'منطقة الزرقاء الصناعية، الزرقاء',
      phone: '+962794567890',
      email: 'zarqa@customs.jo',
      manager: 'سارة يوسف',
      staff: 15,
      status: 'inactive',
      workingHours: '08:00 - 17:00',
      coordinates: { lat: 32.0751, lng: 36.1084 },
    },
  ]);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (branchId: string) => {
    setBranches(branches.map(b =>
      b.id === branchId
        ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
        : b
    ));
  };

  const handleDeleteBranch = (branchId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      setBranches(branches.filter(b => b.id !== branchId));
    }
  };

  const totalStaff = branches.reduce((sum, b) => sum + b.staff, 0);
  const activeBranches = branches.filter(b => b.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة الفروع والمواقع
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة فروع الجمارك والمواقع الجغرافية
            </p>
          </div>
          <Button onClick={() => setShowAddBranch(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة فرع جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Building className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الفروع</p>
                <p className="text-3xl font-bold text-blue-600">{branches.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">نشطة</p>
                <p className="text-3xl font-bold text-green-600">{activeBranches}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
                <p className="text-3xl font-bold text-purple-600">{totalStaff}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط الموظفين</p>
                <p className="text-3xl font-bold text-orange-600">
                  {(totalStaff / branches.length).toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الفروع */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  الفروع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن فرع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>

                <div className="space-y-3">
                  {filteredBranches.map(branch => (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {branch.name}
                            </h3>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {branch.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {branch.staff} موظف
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge
                              variant={branch.status === 'active' ? 'default' : 'outline'}
                            >
                              {branch.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(branch.id);
                            }}
                          >
                            {branch.status === 'active' ? '✓' : '✕'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBranch(branch);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBranch(branch.id);
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

          {/* تفاصيل الفرع */}
          <div>
            {selectedBranch ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedBranch.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الموقع</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">العنوان</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.address}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      الهاتف
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.email}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">المدير</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.manager}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">عدد الموظفين</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.staff} موظف
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      ساعات العمل
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBranch.workingHours}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الحالة</p>
                    <Badge
                      variant={selectedBranch.status === 'active' ? 'default' : 'outline'}
                    >
                      {selectedBranch.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر فرعاً لعرض التفاصيل
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
            💡 نصيحة: يمكنك إضافة فروع جديدة وتعديل معلومات الفروع الموجودة. تأكد من تحديث ساعات العمل والموظفين بانتظام.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
