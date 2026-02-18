import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  CreditCard,
  TrendingUp,
  DollarSign,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'pending';
  lastSync: string;
  syncStatus: 'synced' | 'syncing' | 'failed';
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  bankAccount: string;
}

export default function BankIntegration() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'البنك الأهلي الأردني',
      accountNumber: '1234567890',
      accountHolder: 'شركة الشحن الأردنية',
      balance: 150000,
      currency: 'JOD',
      status: 'active',
      lastSync: '2026-02-18 14:30:00',
      syncStatus: 'synced',
    },
    {
      id: '2',
      bankName: 'بنك الإسكان للتجارة والتمويل',
      accountNumber: '0987654321',
      accountHolder: 'شركة الشحن الأردنية',
      balance: 85000,
      currency: 'JOD',
      status: 'active',
      lastSync: '2026-02-18 14:25:00',
      syncStatus: 'synced',
    },
    {
      id: '3',
      bankName: 'بنك الأردن',
      accountNumber: '5555666677',
      accountHolder: 'شركة الشحن الأردنية',
      balance: 120000,
      currency: 'JOD',
      status: 'active',
      lastSync: '2026-02-18 14:20:00',
      syncStatus: 'synced',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2026-02-18',
      description: 'تحويل من العميل أحمد محمد',
      amount: 5000,
      type: 'deposit',
      status: 'completed',
      bankAccount: 'البنك الأهلي الأردني',
    },
    {
      id: '2',
      date: '2026-02-18',
      description: 'دفع رسوم الشحن لشركة DHL',
      amount: 2500,
      type: 'withdrawal',
      status: 'completed',
      bankAccount: 'بنك الإسكان للتجارة والتمويل',
    },
    {
      id: '3',
      date: '2026-02-18',
      description: 'تحويل بين الحسابات',
      amount: 10000,
      type: 'transfer',
      status: 'completed',
      bankAccount: 'بنك الأردن',
    },
  ]);

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
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
      case 'pending':
        return 'قيد الانتظار';
      default:
        return '';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'withdrawal':
        return 'سحب';
      case 'transfer':
        return 'تحويل';
      default:
        return '';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">نظام التكامل مع البنوك الأردنية</h1>
        <p className="text-gray-600 dark:text-gray-400">إدارة الحسابات البنكية والتحويلات المالية</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">الرصيد الإجمالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalBalance.toLocaleString('ar-JO')}</p>
                <p className="text-xs text-gray-500">دينار أردني</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الإيداعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{totalDeposits.toLocaleString('ar-JO')}</p>
                <p className="text-xs text-gray-500">دينار أردني</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي السحوبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{totalWithdrawals.toLocaleString('ar-JO')}</p>
                <p className="text-xs text-gray-500">دينار أردني</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500 rotate-180" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الحسابات البنكية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                الحسابات البنكية المتكاملة
              </CardTitle>
              <CardDescription>إدارة الحسابات البنكية والمزامنة الفورية</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة حساب
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{account.bankName}</h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(account.status)}
                        <Badge variant="outline" className="text-xs">{getStatusLabel(account.status)}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <p className="text-xs text-gray-500">رقم الحساب</p>
                        <p className="font-mono">{account.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">اسم صاحب الحساب</p>
                        <p>{account.accountHolder}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">الرصيد</p>
                        <p className="font-semibold text-lg">{account.balance.toLocaleString('ar-JO')} {account.currency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">آخر مزامنة</p>
                        <div className="flex items-center gap-1">
                          {getSyncStatusIcon(account.syncStatus)}
                          <span>{account.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* المعاملات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                المعاملات المالية الأخيرة
              </CardTitle>
              <CardDescription>سجل المعاملات والتحويلات المالية</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-2">التاريخ</th>
                  <th className="text-right py-2 px-2">الوصف</th>
                  <th className="text-right py-2 px-2">النوع</th>
                  <th className="text-right py-2 px-2">المبلغ</th>
                  <th className="text-right py-2 px-2">الحالة</th>
                  <th className="text-right py-2 px-2">البنك</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="py-2 px-2">{transaction.date}</td>
                    <td className="py-2 px-2">{transaction.description}</td>
                    <td className="py-2 px-2">
                      <Badge variant="outline">{getTransactionTypeLabel(transaction.type)}</Badge>
                    </td>
                    <td className="py-2 px-2 font-semibold">
                      <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString('ar-JO')}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <Badge className={getTransactionStatusColor(transaction.status)}>
                        {transaction.status === 'completed' ? 'مكتملة' : transaction.status === 'pending' ? 'قيد الانتظار' : 'فشلت'}
                      </Badge>
                    </td>
                    <td className="py-2 px-2">{transaction.bankAccount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* التنبيهات */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          تم مزامنة جميع الحسابات البنكية بنجاح. آخر مزامنة: 2026-02-18 14:30:00
        </AlertDescription>
      </Alert>
    </div>
  );
}
