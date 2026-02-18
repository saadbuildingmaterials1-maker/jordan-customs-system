import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Archive,
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  RotateCcw,
  Settings,
  Calendar,
  FileText,
} from 'lucide-react';

interface BackupRecord {
  id: string;
  date: string;
  size: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  duration: string;
  itemsCount: number;
}

interface ArchivedData {
  id: string;
  name: string;
  date: string;
  size: string;
  itemsCount: number;
  status: 'archived' | 'restoring';
}

export default function ArchiveAndBackup() {
  const [backups, setBackups] = useState<BackupRecord[]>([
    {
      id: '1',
      date: '2026-02-18 03:00',
      size: '245 MB',
      type: 'auto',
      status: 'completed',
      duration: '12 دقيقة',
      itemsCount: 1250,
    },
    {
      id: '2',
      date: '2026-02-17 03:00',
      size: '238 MB',
      type: 'auto',
      status: 'completed',
      duration: '11 دقيقة',
      itemsCount: 1180,
    },
    {
      id: '3',
      date: '2026-02-16 14:30',
      size: '235 MB',
      type: 'manual',
      status: 'completed',
      duration: '10 دقيقة',
      itemsCount: 1150,
    },
    {
      id: '4',
      date: '2026-02-16 03:00',
      size: '232 MB',
      type: 'auto',
      status: 'completed',
      duration: '11 دقيقة',
      itemsCount: 1120,
    },
  ]);

  const [archivedData, setArchivedData] = useState<ArchivedData[]>([
    {
      id: '1',
      name: 'أرشيف يناير 2026',
      date: '2026-02-01',
      size: '128 MB',
      itemsCount: 450,
      status: 'archived',
    },
    {
      id: '2',
      name: 'أرشيف ديسمبر 2025',
      date: '2026-01-01',
      size: '156 MB',
      itemsCount: 520,
      status: 'archived',
    },
  ]);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newBackup: BackupRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ar-JO'),
      size: '246 MB',
      type: 'manual',
      status: 'completed',
      duration: '12 دقيقة',
      itemsCount: 1260,
    };
    
    setBackups([newBackup, ...backups]);
    setIsCreatingBackup(false);
  };

  const handleRestoreBackup = (id: string) => {
    alert(`جاري استعادة النسخة الاحتياطية: ${id}`);
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
  };

  const handleArchiveData = () => {
    alert('جاري أرشفة البيانات...');
  };

  const handleRestoreArchive = (id: string) => {
    setArchivedData(archivedData.map(a =>
      a.id === id ? { ...a, status: 'restoring' } : a
    ));
    setTimeout(() => {
      setArchivedData(archivedData.map(a =>
        a.id === id ? { ...a, status: 'archived' } : a
      ));
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'جاري المعالجة';
      case 'failed':
        return 'فشل';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            الأرشفة والنسخ الاحتياطية
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            إدارة النسخ الاحتياطية وأرشفة البيانات القديمة
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي النسخ الاحتياطية</p>
                <p className="text-3xl font-bold text-blue-600">{backups.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <HardDrive className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المساحة</p>
                <p className="text-3xl font-bold text-green-600">
                  {(backups.reduce((sum, b) => sum + parseInt(b.size), 0) / 1024).toFixed(1)} GB
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Archive className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">البيانات المؤرشفة</p>
                <p className="text-3xl font-bold text-purple-600">{archivedData.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">آخر نسخة</p>
                <p className="text-lg font-bold text-orange-600">
                  {backups[0]?.date.split(' ')[0] || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* النسخ الاحتياطية */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    النسخ الاحتياطية
                  </span>
                  <Button
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    className="gap-2"
                  >
                    {isCreatingBackup ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        إنشاء نسخة جديدة
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backups.map(backup => (
                    <div
                      key={backup.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(backup.status)}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                نسخة احتياطية - {backup.date}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {backup.itemsCount} عنصر • {backup.size} • {backup.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant={backup.type === 'auto' ? 'default' : 'outline'}>
                              {backup.type === 'auto' ? 'تلقائية' : 'يدوية'}
                            </Badge>
                            <Badge variant="outline">
                              {getStatusLabel(backup.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreBackup(backup.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBackup(backup.id)}
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

            {/* البيانات المؤرشفة */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  البيانات المؤرشفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {archivedData.map(archive => (
                    <div
                      key={archive.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {archive.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {archive.itemsCount} عنصر • {archive.size} • {archive.date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreArchive(archive.id)}
                            disabled={archive.status === 'restoring'}
                          >
                            {archive.status === 'restoring' ? (
                              <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الإعدادات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* النسخ الاحتياطية التلقائية */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    النسخ الاحتياطية التلقائية
                  </label>
                  <input
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                </div>

                {autoBackupEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                        التكرار
                      </label>
                      <select
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="hourly">كل ساعة</option>
                        <option value="daily">يومياً</option>
                        <option value="weekly">أسبوعياً</option>
                        <option value="monthly">شهرياً</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                        مدة الاحتفاظ (أيام)
                      </label>
                      <Input
                        type="number"
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* معلومات إضافية */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  معلومات النظام
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">المساحة المستخدمة:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(backups.reduce((sum, b) => sum + parseInt(b.size), 0) / 1024).toFixed(2)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">المساحة المتاحة:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      500 GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">نسبة الاستخدام:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {((backups.reduce((sum, b) => sum + parseInt(b.size), 0) / 1024) / 500 * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: يُنصح بتفعيل النسخ الاحتياطية التلقائية يومياً للحفاظ على البيانات. يمكنك استعادة أي نسخة احتياطية في أي وقت.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
