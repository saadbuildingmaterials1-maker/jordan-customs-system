/**
 * Subscription Plans Page
 * صفحة الخطط الاشتراكية
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, Crown, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'الخطة الأساسية',
    description: 'للشركات الناشئة والصغيرة',
    monthlyPrice: 99,
    yearlyPrice: 990,
    icon: <Zap className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: [
      { name: 'إدارة البيانات الجمركية', included: true },
      { name: 'تقارير أساسية', included: true },
      { name: 'دعم فني عبر البريد', included: true },
      { name: 'نسخ احتياطية يومية', included: true },
      { name: 'تحليلات متقدمة', included: false },
      { name: 'API الوصول', included: false },
      { name: 'دعم فني 24/7', included: false },
      { name: 'مستخدمين غير محدودين', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'الخطة المهنية',
    description: 'للشركات المتوسطة والمتنامية',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    icon: <Crown className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      { name: 'إدارة البيانات الجمركية', included: true },
      { name: 'تقارير متقدمة', included: true },
      { name: 'دعم فني عبر الهاتف والبريد', included: true },
      { name: 'نسخ احتياطية يومية', included: true },
      { name: 'تحليلات متقدمة', included: true },
      { name: 'API الوصول', included: true },
      { name: 'دعم فني 24/7', included: false },
      { name: 'مستخدمين غير محدودين', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'الخطة المؤسسية',
    description: 'للشركات الكبيرة والمؤسسات',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    icon: <Briefcase className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    features: [
      { name: 'إدارة البيانات الجمركية', included: true },
      { name: 'تقارير متقدمة', included: true },
      { name: 'دعم فني عبر الهاتف والبريد', included: true },
      { name: 'نسخ احتياطية يومية', included: true },
      { name: 'تحليلات متقدمة', included: true },
      { name: 'API الوصول', included: true },
      { name: 'دعم فني 24/7', included: true },
      { name: 'مستخدمين غير محدودين', included: true },
    ],
  },
];

export default function SubscriptionPlans() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً لاختيار خطة');
      navigate('/login');
      return;
    }

    // الانتقال إلى صفحة تأكيد الخطة مع بيانات الخطة
    navigate(`/confirm-plan?planId=${plan.id}&billingPeriod=${billingPeriod}`);
  };

  const savings = Math.round((plans[1].monthlyPrice * 12 - plans[1].yearlyPrice) / (plans[1].monthlyPrice * 12) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 animate-fade-in">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center animate-slide-down">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">خطط الاشتراك</h1>
        <p className="text-lg text-muted-foreground mb-8 animate-fade-in delay-100">اختر الخطة المناسبة لاحتياجات عملك</p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            شهري
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-muted"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-primary transition ${
                billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            سنوي
          </span>
          {billingPeriod === 'yearly' && (
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
              توفير {savings}%
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground">الأكثر شهرة</Badge>
                </div>
              )}

              <Card className={`h-full flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 animate-fade-in ${
                plan.popular ? 'ring-2 ring-primary md:scale-105 shadow-lg' : ''
              }`} style={{ animationDelay: `${index * 100}ms`, transform: `perspective(1000px) rotateY(${index === 1 ? 0 : (index === 0 ? 3 : -3)}deg)` }}>
                  {/* Plan Header */}
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white transition-all duration-500 hover:shadow-xl`}>
                  <div className="flex items-center gap-3 mb-4">
                    {plan.icon}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-sm opacity-90">{plan.description}</p>
                </div>

                {/* Plan Content */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {billingPeriod === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                      </span>
                      <span className="text-muted-foreground">JOD</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {billingPeriod === 'monthly' ? 'في الشهر' : 'في الشهر (الدفع السنوي)'}
                    </p>
                  </div>

                  {/* Trial Period */}
                  <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      ✨ فترة تجريبية مجانية لمدة 7 أيام
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full mb-6 transition-all duration-500 transform hover:scale-110 active:scale-95 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-xl shadow-lg'
                        : 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-lg'
                    }`}
                  >
                    ابدأ الآن
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Guarantee */}
                <div className="border-t p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground text-center">
                    💰 ضمان استرجاع المبلغ خلال 7 أيام
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">أسئلة شائعة</h2>

          <div className="space-y-6">
            {[
              {
                q: 'هل يمكنني تغيير الخطة لاحقاً؟',
                a: 'نعم، يمكنك تغيير أو ترقية خطتك في أي وقت. سيتم حساب الفرق بناءً على الأيام المتبقية.',
              },
              {
                q: 'هل هناك عقد طويل الأجل؟',
                a: 'لا، جميع خططنا بدون عقد. يمكنك الإلغاء في أي وقت.',
              },
              {
                q: 'هل تقدمون دعم فني؟',
                a: 'نعم، جميع الخطط تتضمن دعم فني. الخطة المهنية والمؤسسية تتضمن دعم 24/7.',
              },
              {
                q: 'هل البيانات آمنة؟',
                a: 'نعم، جميع البيانات محمية بتشفير 256-bit وتتم نسخها احتياطياً يومياً.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-background p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
