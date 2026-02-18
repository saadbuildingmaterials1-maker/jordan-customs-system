/**
 * Advanced Payment System
 * 
 * نظام الدفع المتقدم (Stripe و HyperPay)
 * 
 * @module ./client/src/pages/AdvancedPaymentSystem
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Smartphone, CheckCircle2, AlertCircle, DollarSign, TrendingUp } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  method: "stripe" | "hyperpay";
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
}

export default function AdvancedPaymentSystem() {
  const [activeTab, setActiveTab] = useState("stripe");
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TXN001",
      amount: 150,
      currency: "JOD",
      method: "stripe",
      status: "completed",
      date: "2026-02-18 10:30",
      description: "شحنة دولية - رسوم جمركية",
    },
    {
      id: "TXN002",
      amount: 75,
      currency: "JOD",
      method: "hyperpay",
      status: "completed",
      date: "2026-02-18 09:15",
      description: "خدمة شحن محلي",
    },
    {
      id: "TXN003",
      amount: 200,
      currency: "JOD",
      method: "stripe",
      status: "pending",
      date: "2026-02-18 08:00",
      description: "رسوم تأمين الشحنة",
    },
  ]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || !cardNumber || !expiryDate || !cvv) {
        alert("يرجى ملء جميع الحقول");
        setLoading(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTransaction: Transaction = {
        id: `TXN${Date.now()}`,
        amount: parseFloat(amount),
        currency: "JOD",
        method: activeTab as "stripe" | "hyperpay",
        status: "completed",
        date: new Date().toLocaleString("ar-JO"),
        description: "دفع جديد",
      };

      setTransactions([newTransaction, ...transactions]);
      setAmount("");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("حدث خطأ في معالجة الدفع");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">نظام الدفع المتقدم</h1>
          <p className="text-slate-300">معالجة آمنة للمدفوعات عبر Stripe و HyperPay</p>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-white">{totalRevenue} JOD</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">عدد المعاملات</p>
                  <p className="text-2xl font-bold text-white">{transactions.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">معدل النجاح</p>
                  <p className="text-2xl font-bold text-white">100%</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">إجراء دفع جديد</CardTitle>
            <CardDescription className="text-slate-400">
              اختر طريقة الدفع وأدخل بيانات الدفع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-700/50 border-slate-600 mb-6">
                <TabsTrigger value="stripe" className="text-slate-200">
                  <CreditCard className="w-4 h-4 ml-2" />
                  Stripe
                </TabsTrigger>
                <TabsTrigger value="hyperpay" className="text-slate-200">
                  <Smartphone className="w-4 h-4 ml-2" />
                  HyperPay
                </TabsTrigger>
              </TabsList>

              {/* Stripe Payment */}
              <TabsContent value="stripe" className="space-y-4">
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">المبلغ (JOD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">رقم البطاقة</label>
                    <Input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      maxLength={19}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">تاريخ الانتهاء</label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">CVV</label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {success && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        تم معالجة الدفع بنجاح
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    {loading ? "جاري المعالجة..." : "دفع عبر Stripe"}
                  </Button>
                </form>
              </TabsContent>

              {/* HyperPay Payment */}
              <TabsContent value="hyperpay" className="space-y-4">
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">المبلغ (JOD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">رقم الهاتف</label>
                    <Input
                      type="tel"
                      placeholder="+962791234567"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">رمز التحقق</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      dir="ltr"
                    />
                  </div>

                  {success && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        تم معالجة الدفع بنجاح
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {loading ? "جاري المعالجة..." : "دفع عبر HyperPay"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">سجل المعاملات</CardTitle>
            <CardDescription className="text-slate-400">
              جميع المعاملات المالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200">{txn.description}</span>
                      <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                        {txn.method === "stripe" ? "Stripe" : "HyperPay"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{txn.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-white">{txn.amount}</span>
                      <span className="text-sm text-slate-400">{txn.currency}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(txn.status)}`}>
                      {getStatusIcon(txn.status)}
                      <span className="text-xs font-medium">
                        {txn.status === "completed" ? "مكتمل" : txn.status === "pending" ? "معلق" : "فشل"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{txn.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
