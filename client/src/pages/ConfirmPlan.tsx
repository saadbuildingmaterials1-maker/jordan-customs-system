import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface PlanDetails {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  description: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

export default function ConfirmPlan() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get plan from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const planId = params.get('planId');
    const billingPeriod = (params.get('billingPeriod') as 'monthly' | 'yearly') || 'monthly';

    // Sample plan data with Stripe IDs
    const plans: Record<string, PlanDetails> = {
      basic: {
        id: 'basic',
        name: 'الخطة الأساسية',
        monthlyPrice: 99,
        yearlyPrice: 990,
        billingCycle: billingPeriod,
        features: [
          'إدارة البيانات الجمركية',
          'تقارير أساسية',
          'دعم فني عبر البريد',
          'نسخ احتياطية يومية',
        ],
        description: 'للشركات الناشئة والصغيرة',
        stripeProductId: 'prod_basic_plan',
        stripePriceId: billingPeriod === 'monthly' ? 'price_basic_monthly' : 'price_basic_yearly',
      },
      professional: {
        id: 'professional',
        name: 'الخطة المهنية',
        monthlyPrice: 299,
        yearlyPrice: 2990,
        billingCycle: billingPeriod,
        features: [
          'إدارة البيانات الجمركية',
          'تقارير متقدمة',
          'دعم الأولوية',
          'نسخ احتياطية يومية',
          'تحليلات متقدمة',
          'API الوصول',
        ],
        description: 'للشركات المتوسطة والمتنامية',
        stripeProductId: 'prod_professional_plan',
        stripePriceId: billingPeriod === 'monthly' ? 'price_professional_monthly' : 'price_professional_yearly',
      },
      enterprise: {
        id: 'enterprise',
        name: 'الخطة المؤسسية',
        monthlyPrice: 999,
        yearlyPrice: 9990,
        billingCycle: billingPeriod,
        features: [
          'إدارة البيانات الجمركية',
          'تقارير متقدمة',
          'دعم 24/7',
          'نسخ احتياطية يومية',
          'تحليلات متقدمة',
          'API الوصول',
          'دعم فني 24/7',
          'مستخدمين غير محدودين',
        ],
        description: 'للشركات الكبيرة والمؤسسات',
        stripeProductId: 'prod_enterprise_plan',
        stripePriceId: billingPeriod === 'monthly' ? 'price_enterprise_monthly' : 'price_enterprise_yearly',
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

    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // إنشاء جلسة دفع Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: plan.billingCycle,
          amount: plan.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
          currency: 'JOD',
          successUrl: `${window.location.origin}/subscription-success?planId=${plan.id}`,
          cancelUrl: `${window.location.origin}/subscription-plans`,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء جلسة الدفع');
      }

      const data = await response.json();

      // إعادة التوجيه إلى Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError('فشل في الحصول على رابط الدفع');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الدفع');
      console.error('Payment error:', err);
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">خطة غير محددة</h2>
            <p className="text-muted-foreground mb-6">يرجى اختيار خطة اشتراكية أولاً</p>
            <Button onClick={() => setLocation('/subscription-plans')} className="w-full">
              العودة إلى الخطط
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const price = plan.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const savings = plan.billingCycle === 'yearly' ? Math.round((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation('/subscription-plans')}
            className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة إلى الخطط
          </button>
          <h1 className="text-4xl font-bold mb-2">تأكيد الخطة الاشتراكية</h1>
          <p className="text-muted-foreground">راجع تفاصيل الخطة والفاتورة قبل المتابعة للدفع</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Details */}
          <div className="lg:col-span-2">
            <Card className="p-8 mb-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-8 border border-primary/20">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{price}</span>
                  <span className="text-muted-foreground">JOD</span>
                </div>
                <p className="text-muted-foreground mb-3">
                  {plan.billingCycle === 'monthly' ? 'في الشهر' : 'في السنة'}
                </p>
                {savings > 0 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>توفير {savings}% عند الدفع السنوي</span>
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">المميزات المتضمنة</h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trial Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                <p className="text-blue-700 dark:text-blue-400 text-sm">
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
                  <span className="text-foreground text-sm">
                    أوافق على <a href="/terms" className="text-primary hover:underline">الشروط والأحكام</a>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <span className="text-foreground text-sm">
                    أوافق على <a href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</a>
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-6">ملخص الطلب</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground">
                  <span>{plan.name}</span>
                  <span>{price} JOD</span>
                </div>
                {plan.billingCycle === 'yearly' && (
                  <>
                    <div className="flex justify-between text-green-600 dark:text-green-400 text-sm">
                      <span>خصم سنوي ({savings}%)</span>
                      <span>-{(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(2)} JOD</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-semibold">الإجمالي</span>
                <span className="text-2xl font-bold">{price} JOD</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={!termsAccepted || !privacyAccepted || isLoading}
                className="w-full text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  'الانتقال إلى الدفع'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                آمن 100% - معالج بواسطة Stripe
              </p>

              {/* Money Back Guarantee */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">💰 ضمان استرجاع المبلغ</p>
                <p className="text-xs text-foreground">
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
