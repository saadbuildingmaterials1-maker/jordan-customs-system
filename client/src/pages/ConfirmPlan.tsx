import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  description: string;
}

export default function ConfirmPlan() {
  const [location, setLocation] = useLocation();
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get plan from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const planId = params.get('plan');
    const billingCycle = (params.get('cycle') as 'monthly' | 'yearly') || 'monthly';

    // Sample plan data
    const plans: Record<string, PlanDetails> = {
      basic: {
        id: 'basic',
        name: 'الخطة الأساسية',
        price: billingCycle === 'monthly' ? 99 : 990,
        billingCycle,
        features: [
          'إدارة تكاليف الشحن الأساسية',
          'تقارير شهرية',
          'دعم البريد الإلكتروني',
          'حتى 100 شحنة شهرية',
        ],
        description: 'مناسبة للشركات الصغيرة والناشئة',
      },
      professional: {
        id: 'professional',
        name: 'الخطة المهنية',
        price: billingCycle === 'monthly' ? 299 : 2990,
        billingCycle,
        features: [
          'إدارة متقدمة للتكاليف',
          'تقارير أسبوعية وشهرية',
          'دعم الأولوية',
          'حتى 1000 شحنة شهرية',
          'تحليلات متقدمة',
          'API مخصص',
        ],
        description: 'مناسبة للشركات المتوسطة',
      },
      enterprise: {
        id: 'enterprise',
        name: 'الخطة المؤسسية',
        price: billingCycle === 'monthly' ? 999 : 9990,
        billingCycle,
        features: [
          'إدارة شاملة للتكاليف والجمارك',
          'تقارير يومية وفورية',
          'دعم 24/7',
          'شحنات غير محدودة',
          'تحليلات متقدمة وذكية',
          'API مخصص مع SLA',
          'مدير حساب مخصص',
          'تكامل مع أنظمة ERP',
        ],
        description: 'مناسبة للمؤسسات الكبيرة',
      },
    };

    if (planId && plans[planId]) {
      setPlan(plans[planId]);
    }
  }, [location]);

  const handlePayment = async () => {
    if (!termsAccepted || !privacyAccepted) {
      setError('يجب قبول الشروط والأحكام');
      return;
    }

    if (!plan) {
      setError('لم يتم اختيار خطة');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      setTimeout(() => {
        window.open('https://checkout.stripe.com/pay/test', '_blank');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الدفع');
      console.error(err);
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">خطة غير محددة</h2>
            <p className="text-gray-400 mb-6">يرجى اختيار خطة اشتراكية أولاً</p>
            <Button onClick={() => setLocation('/subscription-plans')} className="w-full">
              العودة إلى الخطط
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const discountedPrice = plan.billingCycle === 'yearly' ? plan.price * 0.83 : plan.price;
  const savings = plan.billingCycle === 'yearly' ? plan.price - discountedPrice : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation('/subscription-plans')}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة إلى الخطط
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">تأكيد الخطة الاشتراكية</h1>
          <p className="text-gray-400">راجع تفاصيل الخطة والفاتورة قبل المتابعة للدفع</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Details */}
          <div className="lg:col-span-2">
            <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 mb-8 border border-blue-500/20">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{discountedPrice}</span>
                  <span className="text-gray-400">JOD</span>
                </div>
                <p className="text-gray-400 mb-3">
                  {plan.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}
                </p>
                {savings > 0 && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span>توفير {Math.round((savings / plan.price) * 100)}% عند الدفع السنوي</span>
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">المميزات المتضمنة</h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trial Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
                <p className="text-blue-300 text-sm">
                  ✨ يتضمن فترة تجريبية مجانية لمدة 7 أيام. لا حاجة لإدخال بيانات بطاقة ائتمان.
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4 mb-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <span className="text-gray-300 text-sm">
                    أوافق على <a href="#" className="text-blue-400 hover:underline">الشروط والأحكام</a>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <span className="text-gray-300 text-sm">
                    أوافق على <a href="#" className="text-blue-400 hover:underline">سياسة الخصوصية</a>
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-slate-800/50 border-slate-700 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6">ملخص الطلب</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                <div className="flex justify-between text-gray-300">
                  <span>{plan.name}</span>
                  <span>{plan.price} JOD</span>
                </div>
                {plan.billingCycle === 'yearly' && (
                  <>
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>خصم سنوي (17%)</span>
                      <span>-{savings.toFixed(2)} JOD</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-white font-semibold">الإجمالي</span>
                <span className="text-2xl font-bold text-white">{discountedPrice} JOD</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={!termsAccepted || !privacyAccepted || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'جاري المعالجة...' : 'الانتقال إلى الدفع'}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-4">
                آمن 100% - معالج بواسطة Stripe
              </p>

              {/* Money Back Guarantee */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-gray-400 mb-2">💰 ضمان استرجاع المبلغ</p>
                <p className="text-xs text-gray-300">
                  إذا لم تكن راضياً عن الخطة خلال 7 أيام، سنسترجع لك كامل المبلغ بدون أسئلة.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
