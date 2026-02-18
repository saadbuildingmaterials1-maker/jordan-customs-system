# دمج Stripe - دليل المطورين

## نظرة عامة

تم دمج بوابة الدفع Stripe بالكامل في نظام إدارة تكاليف الشحن والجمارك الأردنية. يوفر هذا الدمج:

- ✅ معالجة الدفعات الآمنة
- ✅ إدارة الفواتير
- ✅ نظام الاشتراكات الدورية
- ✅ استرجاع الأموال
- ✅ معالجة الأحداث عبر Webhooks
- ✅ لوحة تحكم إدارة الدفعات

## البنية الهندسية

### جداول قاعدة البيانات

```
payments              - سجل الدفعات
stripe_invoices       - الفواتير من Stripe
refunds              - المبالغ المسترجعة
subscriptions        - الاشتراكات الدورية
subscription_invoices - فواتير الاشتراكات
```

### الملفات الرئيسية

```
server/
├── services/
│   └── stripe-service.ts        # خدمة Stripe الأساسية
├── routers/
│   └── stripe.ts               # عمليات tRPC لـ Stripe
├── webhooks/
│   └── stripe-webhook.ts       # معالج Webhooks
└── stripe.test.ts              # الاختبارات

client/
└── src/pages/
    └── PaymentsManagement.tsx   # لوحة إدارة الدفعات
```

## الميزات المتاحة

### 1. إنشاء جلسة دفع (Checkout Session)

```typescript
const session = await trpc.stripe.createCheckoutSession.mutate({
  declarationId: 123,
  amount: 100,
  currency: 'JOD',
  description: 'دفع الرسوم الجمركية',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel',
});

// فتح الجلسة في نافذة جديدة
window.open(session.url, '_blank');
```

### 2. إنشاء نية دفع (Payment Intent)

```typescript
const paymentIntent = await trpc.stripe.createPaymentIntent.mutate({
  amount: 50,
  currency: 'JOD',
  description: 'دفع إضافي',
});

// استخدام clientSecret مع Stripe Elements
```

### 3. جلب الدفعات

```typescript
const payments = await trpc.stripe.getPayments.query();
// يرجع جميع دفعات المستخدم الحالي
```

### 4. إنشاء استرجاع (Refund)

```typescript
const refund = await trpc.stripe.createRefund.mutate({
  paymentId: 1,
  chargeId: 'ch_1234567890',
  amount: 50,
  reason: 'requested_by_customer',
  notes: 'طلب من العميل',
});
```

### 5. إدارة الاشتراكات

```typescript
// إنشاء اشتراك
const subscription = await trpc.stripe.createSubscription.mutate({
  customerId: 'cus_123',
  priceId: 'price_123',
  planName: 'Premium',
});

// إلغاء الاشتراك
await trpc.stripe.cancelSubscription.mutate({
  subscriptionId: 'sub_123',
  cancelAtPeriodEnd: true, // إلغاء في نهاية الفترة
});
```

## معالجة الأحداث (Webhooks)

يتم معالجة الأحداث التالية تلقائياً:

| الحدث | الإجراء |
|------|--------|
| `payment_intent.succeeded` | تحديث حالة الدفع إلى "نجح" |
| `payment_intent.payment_failed` | تحديث حالة الدفع إلى "فشل" |
| `payment_intent.canceled` | تحديث حالة الدفع إلى "ملغى" |
| `invoice.paid` | تحديث حالة الفاتورة إلى "مدفوعة" |
| `invoice.payment_failed` | تحديث حالة الفاتورة إلى "غير قابلة للتحصيل" |
| `charge.refunded` | تحديث حالة الدفع إلى "مسترجع" |
| `customer.subscription.updated` | تحديث بيانات الاشتراك |
| `customer.subscription.deleted` | تحديث حالة الاشتراك إلى "ملغى" |

### إعداد Webhook

1. اذهب إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. انتقل إلى **Developers → Webhooks**
3. أضف نقطة نهاية جديدة:
   - **URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events**: اختر الأحداث المطلوبة

## متغيرات البيئة

```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## الاختبار

### بطاقات الاختبار

| الحالة | رقم البطاقة | الشهر/السنة | CVC |
|-------|-----------|-----------|-----|
| نجح | 4242 4242 4242 4242 | أي تاريخ مستقبلي | أي 3 أرقام |
| فشل | 4000 0000 0000 0002 | أي تاريخ مستقبلي | أي 3 أرقام |
| متطلب مصادقة | 4000 0025 0000 3155 | أي تاريخ مستقبلي | أي 3 أرقام |

### تشغيل الاختبارات

```bash
pnpm test stripe.test.ts
```

## الأمان

### أفضل الممارسات

1. **لا تخزن بيانات البطاقة**: استخدم معرفات Stripe فقط
2. **تحقق من التوقيع**: تحقق من توقيع Webhook قبل المعالجة
3. **استخدم HTTPS**: تأكد من استخدام HTTPS في جميع الاتصالات
4. **حماية المفاتيح**: لا تعرض المفاتيح السرية في الكود
5. **التحقق من الجانب الخادم**: تحقق دائماً من الدفعات على الخادم

## استكشاف الأخطاء

### الخطأ: "Invalid API Key"

تأكد من أن `STRIPE_SECRET_KEY` صحيح وفي متغيرات البيئة.

### الخطأ: "Webhook signature verification failed"

تأكد من أن `STRIPE_WEBHOOK_SECRET` صحيح وأن الطلب يحتوي على رأس `stripe-signature`.

### الخطأ: "Customer not found"

تأكد من أن معرف العميل موجود في Stripe قبل استخدامه.

## الموارد الإضافية

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

## الدعم

للمساعدة في حل المشاكل:

1. تحقق من [Stripe Dashboard](https://dashboard.stripe.com/logs)
2. راجع سجلات الخادم
3. استخدم [Stripe CLI](https://stripe.com/docs/stripe-cli) للاختبار المحلي

## التطوير المستقبلي

- [ ] دعم الدفع عبر Apple Pay و Google Pay
- [ ] نظام الفواتير المتكرر
- [ ] تقارير الدفعات المتقدمة
- [ ] تكامل مع أنظمة المحاسبة
- [ ] دعم العملات المتعددة المتقدم
