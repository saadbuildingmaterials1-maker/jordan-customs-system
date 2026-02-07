/**
 * Stripe Checkout Handler
 * 
 * معالج إنشاء جلسات الدفع بـ Stripe
 * 
 * @module server/stripe-checkout
 */

import Stripe from 'stripe';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('⚠️ تحذير: مفتاح Stripe السري غير مضبوط.');
}

const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
  apiVersion: '2024-12-15' as any,
});

/**
 * خريطة الخطط
 */
const PLANS_MAP: Record<string, { name: string; features: string[] }> = {
  basic: {
    name: 'الخطة الأساسية',
    features: [
      'إدارة البيانات الجمركية',
      'تقارير أساسية',
      'دعم فني عبر البريد',
      'نسخ احتياطية يومية',
    ],
  },
  professional: {
    name: 'الخطة المهنية',
    features: [
      'إدارة البيانات الجمركية',
      'تقارير متقدمة',
      'دعم الأولوية',
      'نسخ احتياطية يومية',
      'تحليلات متقدمة',
      'API الوصول',
    ],
  },
  enterprise: {
    name: 'الخطة المؤسسية',
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
  },
};

/**
 * إنشاء جلسة دفع Stripe
 */
export async function createCheckoutSession(req: AuthenticatedRequest, res: Response) {
  try {
    const { planId, billingCycle, amount, currency, successUrl, cancelUrl } = req.body;

    // التحقق من البيانات
    if (!planId || !billingCycle || !amount || !currency) {
      return res.status(400).json({
        error: 'بيانات غير كاملة',
        message: 'يرجى توفير planId و billingCycle و amount و currency',
      });
    }

    if (!PLANS_MAP[planId]) {
      return res.status(400).json({
        error: 'خطة غير صحيحة',
        message: `الخطة ${planId} غير موجودة`,
      });
    }

    const plan = PLANS_MAP[planId];

    console.log(`📋 جاري إنشاء جلسة دفع لـ ${plan.name}`);
    console.log(`💳 المبلغ: ${amount} ${currency}`);
    console.log(`📅 فترة الفاتورة: ${billingCycle}`);

    // إنشاء جلسة Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: `${plan.name} - ${billingCycle === 'monthly' ? 'شهري' : 'سنوي'}`,
              images: [],
            },
            unit_amount: Math.round(amount * 100), // تحويل إلى فلس
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription-success?planId=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription-plans`,
      customer_email: req.user?.email || undefined,
      metadata: {
        planId,
        billingCycle,
        userId: req.user?.id?.toString() || 'unknown',
      },
      allow_promotion_codes: true,
    });

    console.log(`✅ تم إنشاء جلسة دفع: ${session.id}`);

    // إرجاع رابط الدفع
    return res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('❌ خطأ في إنشاء جلسة الدفع:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: 'خطأ في Stripe',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'خطأ داخلي',
      message: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
    });
  }
}

/**
 * التحقق من حالة الجلسة
 */
export async function getCheckoutSession(req: AuthenticatedRequest, res: Response) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: 'معرّف الجلسة مطلوب',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.json({
      success: true,
      session: {
        id: session.id,
        status: session.payment_status,
        customerEmail: session.customer_email,
        metadata: session.metadata,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب معلومات الجلسة:', error);

    return res.status(500).json({
      error: 'خطأ في جلب معلومات الجلسة',
      message: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
    });
  }
}

/**
 * معالجة نجاح الدفع
 */
export async function handlePaymentSuccess(req: AuthenticatedRequest, res: Response) {
  try {
    const { sessionId, planId } = req.body;

    if (!sessionId || !planId) {
      return res.status(400).json({
        error: 'بيانات غير كاملة',
      });
    }

    // التحقق من الجلسة مع Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        error: 'الدفع لم يتم بنجاح',
      });
    }

    console.log(`✅ تم التحقق من الدفع بنجاح للخطة ${planId}`);

    return res.json({
      success: true,
      message: 'تم تفعيل الاشتراك بنجاح',
    });
  } catch (error) {
    console.error('❌ خطأ في معالجة نجاح الدفع:', error);

    return res.status(500).json({
      error: 'خطأ في معالجة الدفع',
      message: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
    });
  }
}
