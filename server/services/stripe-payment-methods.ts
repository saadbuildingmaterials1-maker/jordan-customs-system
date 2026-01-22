import Stripe from 'stripe';
import { getDb } from '../db';
import { payments } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

/**
 * إنشاء عنصر دفع Apple Pay
 */
export async function createApplePayPaymentMethod(options: {
  userId: number;
  token: string;
  email?: string;
}) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: options.token,
      },
      billing_details: {
        email: options.email,
      },
      metadata: {
        userId: options.userId.toString(),
        paymentMethodType: 'apple_pay',
      },
    });

    return paymentMethod;
  } catch (error) {
    console.error('خطأ في إنشاء Apple Pay:', error);
    throw error;
  }
}

/**
 * إنشاء عنصر دفع Google Pay
 */
export async function createGooglePayPaymentMethod(options: {
  userId: number;
  token: string;
  email?: string;
}) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: options.token,
      },
      billing_details: {
        email: options.email,
      },
      metadata: {
        userId: options.userId.toString(),
        paymentMethodType: 'google_pay',
      },
    });

    return paymentMethod;
  } catch (error) {
    console.error('خطأ في إنشاء Google Pay:', error);
    throw error;
  }
}

/**
 * إنشاء جلسة دفع باستخدام Apple Pay
 */
export async function createApplePayCheckoutSession(options: {
  userId: number;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: options.currency.toLowerCase(),
            product_data: {
              name: options.description,
            },
            unit_amount: Math.round(options.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      client_reference_id: options.userId.toString(),
      metadata: {
        userId: options.userId.toString(),
        customerEmail: options.customerEmail,
        customerName: options.customerName,
        paymentMethod: 'apple_pay',
      },
    });

    return session;
  } catch (error) {
    console.error('خطأ في إنشاء جلسة Apple Pay:', error);
    throw error;
  }
}

/**
 * إنشاء جلسة دفع باستخدام Google Pay
 */
export async function createGooglePayCheckoutSession(options: {
  userId: number;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: options.currency.toLowerCase(),
            product_data: {
              name: options.description,
            },
            unit_amount: Math.round(options.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      client_reference_id: options.userId.toString(),
      metadata: {
        userId: options.userId.toString(),
        customerEmail: options.customerEmail,
        customerName: options.customerName,
        paymentMethod: 'google_pay',
      },
    });

    return session;
  } catch (error) {
    console.error('خطأ في إنشاء جلسة Google Pay:', error);
    throw error;
  }
}

/**
 * جلب جميع طرق الدفع للمستخدم
 */
export async function getUserPaymentMethods(userId: number) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: `user_${userId}`,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('خطأ في جلب طرق الدفع:', error);
    return [];
  }
}

/**
 * حذف طريقة دفع
 */
export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    const result = await stripe.paymentMethods.detach(paymentMethodId);
    return result;
  } catch (error) {
    console.error('خطأ في حذف طريقة الدفع:', error);
    throw error;
  }
}

/**
 * تعيين طريقة دفع افتراضية
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return customer;
  } catch (error) {
    console.error('خطأ في تعيين طريقة الدفع الافتراضية:', error);
    throw error;
  }
}

/**
 * إنشاء دفعة باستخدام طريقة دفع محفوظة
 */
export async function createPaymentWithSavedMethod(options: {
  userId: number;
  paymentMethodId: string;
  amount: number;
  currency: string;
  description: string;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency.toLowerCase(),
      payment_method: options.paymentMethodId,
      confirm: true,
      description: options.description,
      metadata: {
        userId: options.userId.toString(),
      },
    });

    const db = await getDb();
    if (db) {
      await (db.insert(payments).values as any)({
        userId: options.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: options.amount,
        currency: options.currency,
        status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
        description: options.description,
        metadata: JSON.stringify(paymentIntent.metadata),
      });
    }

    return paymentIntent;
  } catch (error) {
    console.error('خطأ في إنشاء دفعة:', error);
    throw error;
  }
}

/**
 * تحديث طريقة الدفع
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  options: {
    billingDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  }
) {
  try {
    const paymentMethod = await stripe.paymentMethods.update(
      paymentMethodId,
      {
        billing_details: options.billingDetails,
      }
    );

    return paymentMethod;
  } catch (error) {
    console.error('خطأ في تحديث طريقة الدفع:', error);
    throw error;
  }
}
