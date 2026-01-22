import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getDb } from '../db';
import { payments, stripeInvoices, refunds, subscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * معالج webhook Stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('خطأ في التحقق من التوقيع:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // معالجة أحداث الاختبار
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  const db = await getDb();
  if (!db) {
    console.error('قاعدة البيانات غير متاحة');
    return res.status(500).json({ error: 'Database unavailable' });
  }

  try {
    switch (event.type) {
      /**
       * حدث نجاح الدفع
       */
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment succeeded:', paymentIntent.id);

        const charges = (paymentIntent as any).charges?.data || [];
        if (charges.length > 0) {
          const charge = charges[0];

          await db
            .update(payments)
            .set({
              status: 'succeeded',
              stripeChargeId: charge.id,
              paidAt: new Date(),
              cardBrand: (charge.payment_method_details as any)?.card?.brand,
              cardLast4: (charge.payment_method_details as any)?.card?.last4,
            })
            .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
        }
        break;
      }

      /**
       * حدث فشل الدفع
       */
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', paymentIntent.id);

        await db
          .update(payments)
          .set({
            status: 'failed',
            failedAt: new Date(),
            description: `فشل الدفع: ${paymentIntent.last_payment_error?.message}`,
          })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
        break;
      }

      /**
       * حدث إلغاء الدفع
       */
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('🚫 Payment canceled:', paymentIntent.id);

        await db
          .update(payments)
          .set({
            status: 'canceled',
          })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
        break;
      }

      /**
       * حدث نجاح الفاتورة
       */
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Invoice paid:', invoice.id);

        await db
          .update(stripeInvoices)
          .set({
            status: 'paid',
            paidAt: new Date(),
          })
          .where(eq(stripeInvoices.stripeInvoiceId, invoice.id));
        break;
      }

      /**
       * حدث فشل الفاتورة
       */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('❌ Invoice payment failed:', invoice.id);

        await db
          .update(stripeInvoices)
          .set({
            status: 'uncollectible',
          })
          .where(eq(stripeInvoices.stripeInvoiceId, invoice.id));
        break;
      }

      /**
       * حدث إرسال الفاتورة
       */
      case 'invoice.sent': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('📧 Invoice sent:', invoice.id);

        await db
          .update(stripeInvoices)
          .set({
            status: 'open',
          })
          .where(eq(stripeInvoices.stripeInvoiceId, invoice.id));
        break;
      }

      /**
       * حدث استرجاع الأموال
       */
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('💰 Charge refunded:', charge.id);

        const payment = await (db.query as any).payments.findFirst({
          where: eq(payments.stripeChargeId, charge.id),
        });

        if (payment) {
          await db
            .update(payments)
            .set({
              status: 'refunded',
              refundedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));
        }
        break;
      }

      /**
       * حدث إنشاء الاشتراك
       */
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription created:', subscription.id);
        break;
      }

      /**
       * حدث تحديث الاشتراك
       */
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);

        const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
        const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

        const startDateStr = currentPeriodStart.toISOString().split('T')[0];
        const endDateStr = currentPeriodEnd.toISOString().split('T')[0];

        await db
          .update(subscriptions)
          .set({
            status: mapSubscriptionStatus(subscription.status),
            currentPeriodStart: startDateStr as any,
            currentPeriodEnd: endDateStr as any,
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      /**
       * حدث إلغاء الاشتراك
       */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription canceled:', subscription.id);

        await db
          .update(subscriptions)
          .set({
            status: 'canceled',
            canceledAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      /**
       * حدث تنبيه الاشتراك
       */
      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('📢 Upcoming invoice:', invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('خطأ في معالجة الحدث:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * دالة مساعدة لتحويل حالة الاشتراك
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
