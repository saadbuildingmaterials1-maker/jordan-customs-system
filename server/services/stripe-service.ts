import Stripe from 'stripe';
import { getDb } from '../db';
import { payments, stripeInvoices, refunds, subscriptions, subscriptionInvoices } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// تهيئة Stripe - التحقق من المفتاح السري
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('⚠️ تحذير: مفتاح Stripe السري غير مضبوط. سيتم تعطيل عمليات الدفع.');
}

const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
  apiVersion: '2024-12-15' as any,
});

/**
 * إنشاء جلسة دفع Checkout
 */
export async function createCheckoutSession(options: {
  userId: number;
  declarationId?: number;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
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
              description: `دفع الرسوم الجمركية والمصاريف`,
            },
            unit_amount: Math.round(options.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: options.customerEmail,
      client_reference_id: options.userId.toString(),
      metadata: {
        userId: options.userId.toString(),
        declarationId: options.declarationId?.toString() || '',
        customerName: options.customerName,
        ...options.metadata,
      },
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      allow_promotion_codes: true,
    });

    return session;
  } catch (error) {
    console.error('خطأ في إنشاء جلسة الدفع:', error);
    throw error;
  }
}

/**
 * إنشاء نية دفع (Payment Intent)
 */
export async function createPaymentIntent(options: {
  userId: number;
  declarationId?: number;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency.toLowerCase(),
      description: options.description,
      receipt_email: options.customerEmail,
      metadata: {
        userId: options.userId.toString(),
        declarationId: options.declarationId?.toString() || '',
        ...options.metadata,
      },
    });

    const db = await getDb();
    if (db) {
      await (db.insert(payments).values as any)({
        userId: options.userId,
        declarationId: options.declarationId || undefined,
        stripePaymentIntentId: paymentIntent.id,
        amount: options.amount,
        currency: options.currency,
        status: 'pending',
        description: options.description,
        metadata: JSON.stringify(paymentIntent.metadata),
      });
    }

    return paymentIntent;
  } catch (error) {
    console.error('خطأ في إنشاء نية الدفع:', error);
    throw error;
  }
}

/**
 * جلب تفاصيل الدفع
 */
export async function getPaymentDetails(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('خطأ في جلب تفاصيل الدفع:', error);
    throw error;
  }
}

/**
 * تحديث حالة الدفع بعد النجاح
 */
export async function updatePaymentSuccess(paymentIntentId: string, chargeId: string) {
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    const db = await getDb();

    if (db) {
      await db
        .update(payments)
        .set({
          status: 'succeeded',
          stripeChargeId: chargeId,
          paidAt: new Date(),
          cardBrand: (charge.payment_method_details as any)?.card?.brand,
          cardLast4: (charge.payment_method_details as any)?.card?.last4,
        })
        .where(eq(payments.stripePaymentIntentId, paymentIntentId));
    }

    return charge;
  } catch (error) {
    console.error('خطأ في تحديث حالة الدفع:', error);
    throw error;
  }
}

/**
 * تحديث حالة الدفع عند الفشل
 */
export async function updatePaymentFailed(paymentIntentId: string, errorMessage: string) {
  try {
    const db = await getDb();
    if (db) {
      await db
        .update(payments)
        .set({
          status: 'failed',
          failedAt: new Date(),
          description: `فشل الدفع: ${errorMessage}`,
        })
        .where(eq(payments.stripePaymentIntentId, paymentIntentId));
    }
  } catch (error) {
    console.error('خطأ في تحديث حالة الفشل:', error);
    throw error;
  }
}

/**
 * إنشاء استرجاع (Refund)
 */
export async function createRefund(options: {
  paymentId: number;
  userId: number;
  chargeId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  notes?: string;
}) {
  try {
    const refund = await stripe.refunds.create({
      charge: options.chargeId,
      amount: options.amount ? Math.round(options.amount * 100) : undefined,
      reason: options.reason,
      metadata: {
        userId: options.userId.toString(),
        paymentId: options.paymentId.toString(),
      },
    });

    const db = await getDb();
    if (!db) throw new Error('قاعدة البيانات غير متاحة');

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeChargeId, options.chargeId))
      .limit(1)
      .then((rows) => rows[0]);

    if (payment) {
      await (db.insert(refunds).values as any)({
        paymentId: options.paymentId,
        userId: options.userId,
        stripeRefundId: refund.id,
        stripeChargeId: options.chargeId,
        amount: (refund.amount || 0) / 100,
        currency: payment.currency,
        status: (refund.status === 'succeeded' ? 'succeeded' : refund.status === 'failed' ? 'failed' : refund.status === 'canceled' ? 'canceled' : 'pending') as 'pending' | 'succeeded' | 'failed' | 'canceled',
        reason: options.reason,
        notes: options.notes,
        refundedAt: refund.created ? new Date(refund.created * 1000) : undefined,
      });

      await db
        .update(payments)
        .set({
          status: 'refunded',
          refundedAt: new Date(),
        })
        .where(eq(payments.id, options.paymentId));
    }

    return refund;
  } catch (error) {
    console.error('خطأ في إنشاء الاسترجاع:', error);
    throw error;
  }
}

/**
 * إنشاء فاتورة (Invoice)
 */
export async function createInvoice(options: {
  userId: number;
  paymentId?: number;
  customerId: string;
  description: string;
  amount: number;
  currency: string;
  dueDate?: Date;
  metadata?: Record<string, string>;
}) {
  try {
    const invoice = await stripe.invoices.create({
      customer: options.customerId,
      description: options.description,
      metadata: {
        userId: options.userId.toString(),
        paymentId: options.paymentId?.toString() || '',
        ...options.metadata,
      },
      due_date: options.dueDate ? Math.floor(options.dueDate.getTime() / 1000) : undefined,
    });

    await stripe.invoiceItems.create({
      customer: options.customerId,
      invoice: invoice.id,
      amount: Math.round(options.amount * 100),
      currency: options.currency.toLowerCase(),
      description: options.description,
    });

    const db = await getDb();
    if (db) {
      await (db.insert(stripeInvoices).values as any)({
        userId: options.userId,
        paymentId: options.paymentId || undefined,
        stripeInvoiceId: invoice.id,
        stripeCustomerId: options.customerId,
        invoiceNumber: invoice.number || '',
        amount: options.amount,
        currency: options.currency,
        status: 'draft',
        description: options.description,
        pdfUrl: (invoice as any).pdf || undefined,
        hostedInvoiceUrl: (invoice as any).hosted_invoice_url || undefined,
        dueDate: options.dueDate || undefined,
      });
    }

    return invoice;
  } catch (error) {
    console.error('خطأ في إنشاء الفاتورة:', error);
    throw error;
  }
}

/**
 * إرسال الفاتورة
 */
export async function sendInvoice(invoiceId: string) {
  try {
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    const db = await getDb();

    if (db) {
      await db
        .update(stripeInvoices)
        .set({
          status: 'open',
        })
        .where(eq(stripeInvoices.stripeInvoiceId, invoiceId));
    }

    return invoice;
  } catch (error) {
    console.error('خطأ في إرسال الفاتورة:', error);
    throw error;
  }
}

/**
 * إنشاء عميل (Customer)
 */
export async function createCustomer(options: {
  userId: number;
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const customer = await stripe.customers.create({
      email: options.email,
      name: options.name,
      phone: options.phone,
      metadata: {
        userId: options.userId.toString(),
        ...options.metadata,
      },
    });

    return customer;
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error);
    throw error;
  }
}

/**
 * إنشاء اشتراك (Subscription)
 */
export async function createSubscription(options: {
  userId: number;
  customerId: string;
  priceId: string;
  planName: string;
  metadata?: Record<string, string>;
}) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: options.customerId,
      items: [
        {
          price: options.priceId,
        },
      ],
      metadata: {
        userId: options.userId.toString(),
        planName: options.planName,
        ...options.metadata,
      },
    });

    const price = await stripe.prices.retrieve(options.priceId);
    const db = await getDb();

    if (!db) throw new Error('قاعدة البيانات غير متاحة');

    const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    
    const startDateStr = currentPeriodStart.toISOString().split('T')[0];
    const endDateStr = currentPeriodEnd.toISOString().split('T')[0];

    await (db.insert(subscriptions).values as any)({
      userId: options.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: options.customerId,
      stripePriceId: options.priceId,
      planName: options.planName,
      amount: (price.unit_amount || 0) / 100,
      currency: price.currency.toUpperCase(),
      interval: (price.recurring?.interval || 'month') as 'day' | 'week' | 'month' | 'year',
      status: mapSubscriptionStatus(subscription.status),
      currentPeriodStart: startDateStr as any,
      currentPeriodEnd: endDateStr as any,
    });

    return subscription;
  } catch (error) {
    console.error('خطأ في إنشاء الاشتراك:', error);
    throw error;
  }
}

/**
 * إلغاء الاشتراك
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = false) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    if (!cancelAtPeriodEnd) {
      await (stripe.subscriptions as any).del(subscriptionId);
    }

    const db = await getDb();
    if (db) {
      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
          canceledAt: new Date(),
          cancelAtPeriodEnd,
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    }

    return subscription;
  } catch (error) {
    console.error('خطأ في إلغاء الاشتراك:', error);
    throw error;
  }
}

/**
 * جلب الدفعات للمستخدم
 */
export async function getUserPayments(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const userPayments = await (db.query as any).payments.findMany({
      where: eq(payments.userId, userId),
    });

    return userPayments;
  } catch (error) {
    console.error('خطأ في جلب الدفعات:', error);
    return [];
  }
}

/**
 * جلب الفواتير للمستخدم
 */
export async function getUserInvoices(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const userInvoices = await (db.query as any).stripeInvoices.findMany({
      where: eq(stripeInvoices.userId, userId),
    });

    return userInvoices;
  } catch (error) {
    console.error('خطأ في جلب الفواتير:', error);
    return [];
  }
}

/**
 * جلب الاشتراكات للمستخدم
 */
export async function getUserSubscriptions(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const userSubscriptions = await (db.query as any).subscriptions.findMany({
      where: eq(subscriptions.userId, userId),
    });

    return userSubscriptions;
  } catch (error) {
    console.error('خطأ في جلب الاشتراكات:', error);
    return [];
  }
}

/**
 * دالة مساعدة لتحويل حالة الاشتراك من Stripe
 */
function mapSubscriptionStatus(status: string): 'active' | 'past_due' | 'canceled' | 'unpaid' {
  switch (status) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    default:
      return 'unpaid';
  }
}

export default stripe;
