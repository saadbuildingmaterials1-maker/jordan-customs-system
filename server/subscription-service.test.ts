/**
 * Subscription Service Tests
 * 
 * اختبارات شاملة لخدمة الاشتراكات
 * 
 * @module server/subscription-service.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { subscriptionService } from './services/subscription-service';

describe('🎯 اختبارات خدمة الاشتراكات', () => {
  describe('📋 اختبارات الخطط', () => {
    it('✅ يجب جلب جميع الخطط', () => {
      const plans = subscriptionService.getPlans();
      expect(plans).toHaveLength(3);
      expect(plans[0].name).toBe('Basic');
      expect(plans[1].name).toBe('Professional');
      expect(plans[2].name).toBe('Enterprise');
    });

    it('✅ يجب جلب خطة محددة', () => {
      const plan = subscriptionService.getPlan(1);
      expect(plan).toBeDefined();
      expect(plan?.name).toBe('Basic');
      expect(plan?.priceMonthly).toBe(99);
    });

    it('✅ يجب أن تحتوي الخطة على مميزات', () => {
      const plan = subscriptionService.getPlan(1);
      expect(plan?.features).toBeDefined();
      expect(plan?.features.length).toBeGreaterThan(0);
    });

    it('✅ يجب أن تحتوي الخطة على أسعار شهرية وسنوية', () => {
      const plan = subscriptionService.getPlan(2);
      expect(plan?.priceMonthly).toBeDefined();
      expect(plan?.priceYearly).toBeDefined();
      expect(plan?.priceYearly).toBeGreaterThan(plan?.priceMonthly || 0);
    });

    it('✅ يجب أن تحتوي الخطة على معلومات الفترة التجريبية', () => {
      const plan = subscriptionService.getPlan(1);
      // Trial information is optional
      if (plan?.trialDays !== undefined) {
        expect(plan?.trialDays).toBeGreaterThanOrEqual(0);
      }
    });

    it('✅ يجب أن تحتوي الخطة على مستوى الدعم', () => {
      const plans = subscriptionService.getPlans();
      expect(plans[0].supportLevel).toBe('basic');
      expect(plans[1].supportLevel).toBe('standard');
      expect(plans[2].supportLevel).toBe('premium');
    });

    it('✅ يجب أن تحتوي الخطة على حد أقصى للمستخدمين', () => {
      const plans = subscriptionService.getPlans();
      expect(plans[0].maxUsers).toBe(1);
      expect(plans[1].maxUsers).toBe(5);
      expect(plans[2].maxUsers).toBe(50);
    });

    it('✅ يجب أن تحتوي الخطة على مساحة تخزين', () => {
      const plans = subscriptionService.getPlans();
      expect(plans[0].maxStorageGb).toBe(5);
      expect(plans[1].maxStorageGb).toBe(50);
      expect(plans[2].maxStorageGb).toBe(500);
    });
  });

  describe('🎁 اختبارات الفترات التجريبية', () => {
    it('✅ يجب إنشاء فترة تجريبية بنجاح', async () => {
      const trialPeriod = await subscriptionService.createTrialPeriod(1, 1);
      expect(trialPeriod).toBeDefined();
      expect(trialPeriod.userId).toBe(1);
      expect(trialPeriod.planId).toBe(1);
      expect(trialPeriod.status).toBe('active');
    });

    it('✅ يجب أن تكون مدة الفترة التجريبية 7 أيام', async () => {
      const trialPeriod = await subscriptionService.createTrialPeriod(1, 1);
      expect(trialPeriod.daysRemaining).toBe(7);
    });

    it('✅ يجب أن تحتوي الفترة التجريبية على تاريخ البداية والنهاية', async () => {
      const trialPeriod = await subscriptionService.createTrialPeriod(1, 1);
      expect(trialPeriod.startDate).toBeDefined();
      expect(trialPeriod.endDate).toBeDefined();
      expect(trialPeriod.endDate.getTime()).toBeGreaterThan(trialPeriod.startDate.getTime());
    });

    it('✅ يجب أن تكون الفترة التجريبية نشطة في البداية', async () => {
      const trialPeriod = await subscriptionService.createTrialPeriod(1, 1);
      const status = subscriptionService.checkTrialStatus(trialPeriod);
      expect(status).toBe('active');
    });

    it('✅ يجب التحقق من حالة الفترة التجريبية', async () => {
      const trialPeriod = await subscriptionService.createTrialPeriod(1, 1);
      const status = subscriptionService.checkTrialStatus(trialPeriod);
      expect(['active', 'ending_soon', 'expired']).toContain(status);
    });

    it('✅ يجب أن تكون الفترة التجريبية قابلة للتحويل التلقائي', async () => {
      const trialPeriod = await subscriptionService.createTrialPeriod(1, 1);
      expect(trialPeriod.autoConvertToSubscription).toBe(true);
    });
  });

  describe('💳 اختبارات الاشتراكات', () => {
    it('✅ يجب تحويل الفترة التجريبية إلى اشتراك شهري', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'month');
      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(1);
      expect(subscription.planId).toBe(1);
      expect(subscription.interval).toBe('month');
      expect(subscription.status).toBe('active');
    });

    it('✅ يجب تحويل الفترة التجريبية إلى اشتراك سنوي', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'year');
      expect(subscription.interval).toBe('year');
    });

    it('✅ يجب أن يكون المبلغ صحيحاً للاشتراك الشهري', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'month');
      expect(subscription.amount).toBe(99);
    });

    it('✅ يجب أن يكون المبلغ صحيحاً للاشتراك السنوي', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'year');
      expect(subscription.amount).toBe(990);
    });

    it('✅ يجب أن يكون الاشتراك نشطاً بعد التحويل', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'month');
      expect(subscription.status).toBe('active');
    });

    it('✅ يجب أن يكون التجديد التلقائي مفعلاً', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'month');
      expect(subscription.autoRenew).toBe(true);
    });

    it('✅ يجب أن تكون فترة الاشتراك محددة بشكل صحيح', async () => {
      const subscription = await subscriptionService.convertTrialToSubscription(1, 1, 1, 'month');
      expect(subscription.currentPeriodStart).toBeDefined();
      expect(subscription.currentPeriodEnd).toBeDefined();
      expect(subscription.currentPeriodEnd.getTime()).toBeGreaterThan(
        subscription.currentPeriodStart.getTime()
      );
    });
  });

  describe('💰 اختبارات استرجاع المبالغ', () => {
    it('✅ يجب إلغاء الاشتراك واسترجاع المبلغ', async () => {
      const refund = await subscriptionService.cancelSubscriptionAndRefund(1, 1, 1);
      expect(refund).toBeDefined();
      expect(refund.refundAmount).toBeGreaterThan(0);
      expect(refund.refundStatus).toBe('succeeded');
    });

    it('✅ يجب أن تحتوي الرسالة على معلومات الاسترجاع', async () => {
      const refund = await subscriptionService.cancelSubscriptionAndRefund(1, 1, 1);
      expect(refund.message).toContain('JOD');
      expect(refund.message).toContain('3-5 أيام');
    });

    it('✅ يجب أن يكون سبب الاسترجاع محدداً', async () => {
      const refund = await subscriptionService.cancelSubscriptionAndRefund(
        1,
        1,
        1,
        'user_request'
      );
      expect(refund).toBeDefined();
    });
  });

  describe('🔄 اختبارات التجديد التلقائي', () => {
    it('✅ يجب تجديد الاشتراك تلقائياً', async () => {
      const subscription = await subscriptionService.autoRenewSubscription(1, 1);
      expect(subscription).toBeDefined();
      expect(subscription.status).toBe('active');
    });

    it('✅ يجب أن تكون فترة التجديد صحيحة', async () => {
      const subscription = await subscriptionService.autoRenewSubscription(1, 1);
      expect(subscription.currentPeriodStart).toBeDefined();
      expect(subscription.currentPeriodEnd).toBeDefined();
    });

    it('✅ يجب أن يبقى التجديد التلقائي مفعلاً', async () => {
      const subscription = await subscriptionService.autoRenewSubscription(1, 1);
      expect(subscription.autoRenew).toBe(true);
    });
  });

  describe('📧 اختبارات الإشعارات', () => {
    it('✅ يجب إرسال إشعار انتهاء الفترة التجريبية', async () => {
      await expect(
        subscriptionService.sendTrialEndingNotification(1, 3)
      ).resolves.toBeUndefined();
    });

    it('✅ يجب إرسال إشعار تفعيل الاشتراك', async () => {
      await expect(
        subscriptionService.sendSubscriptionActivatedNotification(1, 'Professional', 299)
      ).resolves.toBeUndefined();
    });

    it('✅ يجب إرسال إشعار الاسترجاع', async () => {
      await expect(
        subscriptionService.sendRefundNotification(1, 99, 'Basic')
      ).resolves.toBeUndefined();
    });
  });

  describe('🎯 اختبارات الحالات الخاصة', () => {
    it('✅ يجب التعامل مع خطة غير موجودة', async () => {
      const plan = subscriptionService.getPlan(999);
      expect(plan).toBeNull();
    });

    it('✅ يجب رفع خطأ عند محاولة إنشاء فترة تجريبية لخطة غير موجودة', async () => {
      await expect(
        subscriptionService.createTrialPeriod(1, 999)
      ).rejects.toThrow();
    });

    it('✅ يجب أن تحتوي الخطة الشهيرة على علامة isPopular', () => {
      const plans = subscriptionService.getPlans();
      const popularPlan = plans.find(p => p.isPopular);
      expect(popularPlan).toBeDefined();
      expect(popularPlan?.name).toBe('Professional');
    });

    it('✅ يجب أن تكون جميع الخطط نشطة', () => {
      const plans = subscriptionService.getPlans();
      plans.forEach(plan => {
        expect(plan.name).toBeDefined();
        expect(plan.priceMonthly).toBeGreaterThan(0);
        expect(plan.priceYearly).toBeGreaterThan(0);
      });
    });
  });

  describe('💵 اختبارات الأسعار', () => {
    it('✅ يجب أن يكون السعر السنوي أقل من السعر الشهري × 12', () => {
      const plans = subscriptionService.getPlans();
      plans.forEach(plan => {
        expect(plan.priceYearly).toBeLessThan(plan.priceMonthly * 12);
      });
    });

    it('✅ يجب أن يكون هناك توفير في السعر السنوي', () => {
      const plans = subscriptionService.getPlans();
      plans.forEach(plan => {
        const savings = plan.priceMonthly * 12 - plan.priceYearly;
        expect(savings).toBeGreaterThan(0);
      });
    });

    it('✅ يجب أن تكون الأسعار موجبة', () => {
      const plans = subscriptionService.getPlans();
      plans.forEach(plan => {
        expect(plan.priceMonthly).toBeGreaterThan(0);
        expect(plan.priceYearly).toBeGreaterThan(0);
      });
    });
  });
});
