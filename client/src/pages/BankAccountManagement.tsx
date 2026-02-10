/**
 * BankAccountManagement Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/BankAccountManagement
 */
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, Edit2, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BankAccount {
  id: number;
  accountName: string;
  ibanMasked: string;
  bankName: string;
  swiftCode?: string;
  accountType: string;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

interface BankTransaction {
  id: number;
  transactionId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  createdAt: Date;
}

export default function BankAccountManagement() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [formData, setFormData] = useState({
    accountName: '',
    iban: '',
    bankName: '',
    swiftCode: '',
    accountType: 'checking',
    currency: 'JOD',
  });

  // محاكاة جلب الحسابات
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // محاكاة البيانات
      const mockAccounts: BankAccount[] = [
        {
          id: 1,
          accountName: 'الحساب الرئيسي',
          ibanMasked: '****1249415101',
          bankName: 'البنك الأردني',
          swiftCode: 'UBSIJORX',
          accountType: 'business',
          currency: 'JOD',
          isDefault: true,
          isVerified: true,
          status: 'active',
          createdAt: new Date(),
        },
      ];
      setAccounts(mockAccounts);
    } catch (error) {
      logger.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // محاكاة إضافة حساب
      const newAccount: BankAccount = {
        id: accounts.length + 1,
        accountName: formData.accountName,
        ibanMasked: `****${formData.iban.slice(-4)}`,
        bankName: formData.bankName,
        swiftCode: formData.swiftCode,
        accountType: formData.accountType,
        currency: formData.currency,
        isDefault: false,
        isVerified: false,
        status: 'pending',
        createdAt: new Date(),
      };
      setAccounts([...accounts, newAccount]);
      setFormData({
        accountName: '',
        iban: '',
        bankName: '',
        swiftCode: '',
        accountType: 'checking',
        currency: 'JOD',
      });
      setShowAddDialog(false);
    } catch (error) {
      logger.error('Error adding account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async (accountId: number) => {
    setSelectedAccount(accountId);
    setShowVerifyDialog(true);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // محاكاة التحقق
      setAccounts(
        accounts.map((acc) =>
          acc.id === selectedAccount
            ? { ...acc, isVerified: true, status: 'active' }
            : acc
        )
      );
      setShowVerifyDialog(false);
      setVerificationCode('');
    } catch (error) {
      logger.error('Error verifying account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      try {
        setAccounts(accounts.filter((acc) => acc.id !== accountId));
      } catch (error) {
        logger.error('Error deleting account:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: 'نشط',
      pending: 'قيد الانتظار',
      verified: 'موثق',
      inactive: 'غير نشط',
      suspended: 'معلق',
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">إدارة الحسابات البنكية</h1>
            <p className="text-gray-600 mt-1">إدارة حساباتك البنكية بأمان وسهولة</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة حساب بنكي جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات حسابك البنكي بأمان
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <Label htmlFor="accountName">اسم الحساب</Label>
                  <Input
                    id="accountName"
                    placeholder="مثال: الحساب الرئيسي"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="iban">رقم IBAN</Label>
                  <Input
                    id="iban"
                    placeholder="JO59UBSI6600000660291249415101"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">اسم البنك</Label>
                  <Input
                    id="bankName"
                    placeholder="مثال: البنك الأردني"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="swiftCode">رمز SWIFT</Label>
                  <Input
                    id="swiftCode"
                    placeholder="UBSIJORX"
                    value={formData.swiftCode}
                    onChange={(e) =>
                      setFormData({ ...formData, swiftCode: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountType">نوع الحساب</Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, accountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">جاري</SelectItem>
                        <SelectItem value="savings">توفير</SelectItem>
                        <SelectItem value="business">تجاري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">العملة</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JOD">دينار أردني</SelectItem>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                        <SelectItem value="EUR">يورو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'جاري الإضافة...' : 'إضافة الحساب'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            بيانات حسابك البنكي محفوظة بشكل آمن باستخدام تشفير AES-256. لا نشارك بيانات حسابك مع أي جهة خارجية.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">الحسابات البنكية</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            {accounts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">لا توجد حسابات بنكية مضافة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {accounts.map((account) => (
                  <Card key={account.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {account.accountName}
                            {account.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                افتراضي
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>{account.bankName}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(account.status)}
                          <span className="text-sm font-medium">
                            {getStatusLabel(account.status)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">رقم IBAN</p>
                          <p className="font-mono font-bold">{account.ibanMasked}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">النوع</p>
                          <p className="font-medium">
                            {account.accountType === 'checking'
                              ? 'جاري'
                              : account.accountType === 'savings'
                              ? 'توفير'
                              : 'تجاري'}
                          </p>
                        </div>
                        {account.swiftCode && (
                          <div>
                            <p className="text-sm text-gray-600">رمز SWIFT</p>
                            <p className="font-mono">{account.swiftCode}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">العملة</p>
                          <p className="font-medium">{account.currency}</p>
                        </div>
                      </div>

                      {!account.isVerified && (
                        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            يجب التحقق من هذا الحساب قبل استخدامه
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        {!account.isVerified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyAccount(account.id)}
                          >
                            التحقق من الحساب
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المعاملات البنكية</CardTitle>
                <CardDescription>
                  سجل جميع المعاملات البنكية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  لا توجد معاملات حتى الآن
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>التحقق من الحساب البنكي</DialogTitle>
            <DialogDescription>
              أدخل رمز التحقق الذي تم إرساله إلى بريدك الإلكتروني
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">رمز التحقق</Label>
              <Input
                id="verificationCode"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تأكيد'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
