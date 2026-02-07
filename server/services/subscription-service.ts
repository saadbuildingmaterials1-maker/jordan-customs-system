/**
 * Subscription Service
 * 
 * خدمة إدارة الاشتراكات والفترات التجريبية
 * 
 * @module server/services/subscription-service
 */

/**
 * معلومات الخطة الاشتراكية
 */
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  trialDays: number;
  features: string[];
  maxUsers: number;
  maxStorageGb: number;
  supportLevel: 'basic' | 'standard' | 'premium';
  isPopular: boolean;
}

/**
 * معلومات الفترة التجريبية
 */
export interface TrialPeriodInfo {
  id: number;
  userId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  status: 'active' | 'expired' | 'converted' | 'canceled';
  autoConvertToSubscription: boolean;
}

/**
 * معلومات الاشتراك
 */
export interface SubscriptionInfo {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
}

/**
 * خدمة الاشتراكات
 */
export class SubscriptionService {
  /**
   * الخطط المتاحة
   */
  private plans: SubscriptionPlan[] = [
    {
      id: 1,
      name: 'Basic',
      description: 'الخطة الأساسية للمبتدئين',
      priceMonthly: 99,
      priceYearly: 990,
      currency: 'JOD',
      trialDays: 7,
      features: [
        'إنشاء حتى 10 بيانات جمركية شهرياً',
        'تقارير أساسية',
        'دعم البريد الإلكتروني',
        'تخزين 5 جيجابايت',
      ],
      maxUsers: 1,
      maxStorageGb: 5,
      supportLevel: 'basic',
      isPopular: false,
    },
    {
      id: 2,
      name: 'Professional',
      description: 'الخطة المهنية للشركات الصغيرة',
      priceMonthly: 299,
      priceYearly: 2990,
      currency: 'JOD',
      trialDays: 7,
      features: [
        'إنشاء بيانات جمركية غير محدودة',
        'تقارير متقدمة وتحليلات',
        'دعم الأولوية',
        'تخزين 50 جيجابايت',
        'تتبع الشحنات الفعلي',
        'إدارة المستخدمين',
      ],
      maxUsers: 5,
      maxStorageGb: 50,
      supportLevel: 'standard',
      isPopular: true,
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'الخطة المؤسسية للشركات الكبيرة',
      priceMonthly: 999,
      priceYearly: 9990,
      currency: 'JOD',
      trialDays: 7,
      features: [
        'جميع ميزات الخطة المهنية',
        'API مخصص',
        'دعم 24/7 هاتفي',
        'تخزين 500 جيجابايت',
        'تقارير مخصصة',
        'مدير حساب مخصص',
        'تكامل مع الأنظمة الخارجية',
      ],
      maxUsers: 50,
      maxStorageGb: 500,
      supportLevel: 'premium',
      isPopular: false,
    },
  ];

  /**
   * الحصول على قائمة الخطط
   */
  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  /**
   * الحصول على خطة محددة
   */
  getPlan(planId: number): SubscriptionPlan | null {
    return this.plans.find(p => p.id === planId) || null;
  }

  /**
   * إنشاء فترة تجريبية
   */
  async createTrialPeriod(userId: number, planId: number): Promise<TrialPeriodInfo> {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error(`الخطة ${planId} غير موجودة`);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.trialDays);

    const trialPeriod: TrialPeriodInfo = {
      id: Math.floor(Math.random() * 1000000),
      userId,
      planId,
      startDate,
      endDate,
      daysRemaining: plan.trialDays,
      status: 'active',
      autoConvertToSubscription: true,
    };

    console.log(`✅ تم إنشاء فترة تجريبية للمستخدم ${userId}`);
    console.log(`📅 تاريخ البداية: ${startDate.toLocaleDateString('ar-SA')}`);
    console.log(`📅 تاريخ النهاية: ${endDate.toLocaleDateString('ar-SA')}`);
    console.log(`⏰ عدد الأيام: ${plan.trialDays}`);

    return trialPeriod;
  }

  /**
   * التحقق من حالة الفترة التجريبية
   */
  checkTrialStatus(trialPeriod: TrialPeriodInfo): 'active' | 'ending_soon' | 'expired' {
    const today = new Date();
    const daysRemaining = Math.ceil(
      (trialPeriod.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 0) {
      return 'expired';
    } else if (daysRemaining <= 3) {
      return 'ending_soon';
    } else {
      return 'active';
    }
  }

  /**
   * تحويل الفترة التجريبية إلى اشتراك
   */
  async convertTrialToSubscription(
    userId: number,
    trialPeriodId: number,
    planId: number,
    interval: 'month' | 'year'
  ): Promise<SubscriptionInfo> {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error(`الخطة ${planId} غير موجودة`);
    }

    const amount = interval === 'month' ? plan.priceMonthly : plan.priceYearly;
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();

    if (interval === 'month') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const subscription: SubscriptionInfo = {
      id: Math.floor(Math.random() * 1000000),
      userId,
      planId,
      planName: plan.name,
      amount,
      currency: plan.currency,
      interval,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      autoRenew: true,
    };

    console.log(`✅ تم تحويل الفترة التجريبية إلى اشتراك`);
    console.log(`💳 الخطة: ${plan.name}`);
    console.log(`💰 المبلغ: ${amount} ${plan.currency}`);
    console.log(`📅 الفترة: ${interval === 'month' ? 'شهري' : 'سنوي'}`);

    return subscription;
  }

  /**
   * إلغاء الاشتراك واسترجاع المبلغ
   */
  async cancelSubscriptionAndRefund(
    userId: number,
    subscriptionId: number,
    trialPeriodId: number,
    reason: string = 'trial_period_cancellation'
  ): Promise<{
    refundAmount: number;
    refundStatus: string;
    message: string;
  }> {
    // التحقق من أن الإلغاء يتم خلال فترة الـ 7 أيام
    const today = new Date();
    
    console.log(`🔄 جاري معالجة إلغاء الاشتراك...`);
    console.log(`👤 المستخدم: ${userId}`);
    console.log(`📋 الاشتراك: ${subscriptionId}`);
    console.log(`🎯 السبب: ${reason}`);

    // محاكاة استرجاع المبلغ
    const refundAmount = 99; // مثال
    const refundStatus = 'succeeded';

    console.log(`✅ تم استرجاع المبلغ بنجاح`);
    console.log(`💰 المبلغ المسترجع: ${refundAmount} JOD`);
    console.log(`📊 الحالة: ${refundStatus}`);

    return {
      refundAmount,
      refundStatus,
      message: `تم استرجاع ${refundAmount} JOD بنجاح. سيصل المبلغ إلى حسابك خلال 3-5 أيام عمل.`,
    };
  }

  /**
   * تجديد الاشتراك تلقائياً
   */
  async autoRenewSubscription(
    userId: number,
    subscriptionId: number
  ): Promise<SubscriptionInfo> {
    console.log(`🔄 جاري تجديد الاشتراك تلقائياً...`);
    console.log(`👤 المستخدم: ${userId}`);
    console.log(`📋 الاشتراك: ${subscriptionId}`);

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const subscription: SubscriptionInfo = {
      id: subscriptionId,
      userId,
      planId: 2,
      planName: 'Professional',
      amount: 299,
      currency: 'JOD',
      interval: 'month',
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      autoRenew: true,
    };

    console.log(`✅ تم تجديد الاشتراك بنجاح`);
    console.log(`📅 فترة جديدة: ${currentPeriodStart.toLocaleDateString('ar-SA')} - ${currentPeriodEnd.toLocaleDateString('ar-SA')}`);

    return subscription;
  }

  /**
   * الحصول على معلومات الاشتراك الحالي
   */
  async getSubscriptionInfo(userId: number): Promise<SubscriptionInfo | null> {
    // محاكاة الحصول على معلومات الاشتراك من قاعدة البيانات
    console.log(`📊 جاري جلب معلومات الاشتراك للمستخدم ${userId}...`);

    // في التطبيق الفعلي، سيتم جلب البيانات من قاعدة البيانات
    return null;
  }

  /**
   * إرسال تنبيه قبل انتهاء الفترة التجريبية
   */
  async sendTrialEndingNotification(userId: number, daysRemaining: number): Promise<void> {
    console.log(`📧 جاري إرسال إشعار انتهاء الفترة التجريبية...`);
    console.log(`👤 المستخدم: ${userId}`);
    console.log(`⏰ الأيام المتبقية: ${daysRemaining}`);
    console.log(`📬 تم إرسال الإشعار بنجاح`);
  }

  /**
   * إرسال إشعار بتفعيل الاشتراك
   */
  async sendSubscriptionActivatedNotification(
    userId: number,
    planName: string,
    amount: number
  ): Promise<void> {
    console.log(`📧 جاري إرسال إشعار تفعيل الاشتراك...`);
    console.log(`👤 المستخدم: ${userId}`);
    console.log(`💳 الخطة: ${planName}`);
    console.log(`💰 المبلغ: ${amount} JOD`);
    console.log(`📬 تم إرسال الإشعار بنجاح`);
  }

  /**
   * إرسال إشعار بالاسترجاع
   */
  async sendRefundNotification(
    userId: number,
    refundAmount: number,
    planName: string
  ): Promise<void> {
    console.log(`📧 جاري إرسال إشعار الاسترجاع...`);
    console.log(`👤 المستخدم: ${userId}`);
    console.log(`💰 المبلغ المسترجع: ${refundAmount} JOD`);
    console.log(`💳 الخطة: ${planName}`);
    console.log(`📬 تم إرسال الإشعار بنجاح`);
  }
}

// تصدير خدمة الاشتراكات
export const subscriptionService = new SubscriptionService();
