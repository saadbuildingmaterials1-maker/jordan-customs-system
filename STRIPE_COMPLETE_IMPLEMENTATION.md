# نظام Stripe المتقدم - دليل التطبيق الشامل

## المقدمة

هذا الدليل يوضح كيفية تطبيق نظام Stripe المتكامل في تطبيق إدارة تكاليف الشحن والجمارك الأردنية.

---

## 1. إعداد Stripe API

### الخطوة 1: الحصول على مفاتيح API

1. انتقل إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. قم بتسجيل الدخول أو إنشاء حساب
3. اذهب إلى **Developers** → **API Keys**
4. انسخ:
   - **Publishable Key** (pk_test_...)
   - **Secret Key** (sk_test_...)

### الخطوة 2: إضافة المفاتيح إلى البيئة

```bash
# في Settings → Secrets
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### الخطوة 3: تثبيت مكتبة Stripe

```bash
pnpm add stripe
```

---

## 2. بناء عمليات Stripe على الخادم

### إنشاء Checkout Session

```typescript
// server/routers/stripe.ts
export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        name: z.string(),
        amount: z.number(),
        quantity: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: input.items.map(item => ({
          price_data: {
            currency: 'jod',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.amount * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${ctx.req.headers.origin}/success`,
        cancel_url: `${ctx.req.headers.origin}/cancel`,
        customer_email: ctx.user.email,
        metadata: {
          userId: ctx.user.id.toString(),
        },
      });
      
      return { sessionId: session.id };
    }),
});
```

### معالجة Webhooks

```typescript
// server/_core/stripe-webhook.ts
export async function handleStripeWebhook(req: Request) {
  const sig = req.headers['stripe-signature'] as string;
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // حفظ الدفعة في قاعدة البيانات
      break;
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // تحديث حالة الفاتورة
      break;
  }
}
```

---

## 3. بناء واجهة الدفع على العميل

### مكون نموذج الدفع

```typescript
// client/src/components/PaymentForm.tsx
import { loadStripe } from '@stripe/js';

export function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, paymentMethod } = await stripe!.createPaymentMethod({
      type: 'card',
      card: elements!.getElement(CardElement)!,
    });

    if (!error) {
      // إرسال إلى الخادم
      console.log('Payment successful:', paymentMethod);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}
```

---

## 4. نظام إدارة الفواتير والدفعات

### جدول الفواتير

```typescript
// drizzle/schema.ts
export const invoices = mysqlTable('invoices', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('JOD'),
  status: varchar('status', { length: 50 }).default('draft'),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### إجراء tRPC لإنشاء فاتورة

```typescript
createInvoice: protectedProcedure
  .input(z.object({
    items: z.array(z.object({
      description: z.string(),
      amount: z.number(),
      quantity: z.number(),
    })),
    dueDate: z.date().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    // إنشاء فاتورة في Stripe
    const invoice = await stripe.invoices.create({
      customer: ctx.user.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    // إضافة عناصر الفاتورة
    for (const item of input.items) {
      await stripe.invoiceItems.create({
        invoice: invoice.id,
        customer: ctx.user.stripeCustomerId,
        amount: Math.round(item.amount * 100),
        currency: 'jod',
        description: item.description,
      });
    }

    // حفظ في قاعدة البيانات
    const invoiceRecord = await db.insert(invoices).values({
      id: generateId(),
      userId: ctx.user.id,
      stripeInvoiceId: invoice.id,
      amount: input.items.reduce((sum, item) => sum + item.amount, 0),
      status: 'draft',
      dueDate: input.dueDate,
    });

    return invoiceRecord;
  }),
```

---

## 5. نظام الرد واسترجاع الأموال

```typescript
refundPayment: protectedProcedure
  .input(z.object({
    paymentIntentId: z.string(),
    reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']),
  }))
  .mutation(async ({ ctx, input }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const refund = await stripe.refunds.create({
      payment_intent: input.paymentIntentId,
      reason: input.reason,
    });

    // تسجيل الاسترجاع في قاعدة البيانات
    await db.insert(refunds).values({
      id: generateId(),
      paymentIntentId: input.paymentIntentId,
      stripeRefundId: refund.id,
      amount: refund.amount / 100,
      reason: input.reason,
      status: refund.status,
    });

    return refund;
  }),
```

---

## 6. لوحة تحكم الدفعات والفواتير

### صفحة لوحة التحكم

```typescript
// client/src/pages/PaymentsDashboard.tsx
export function PaymentsDashboard() {
  const { data: payments, isLoading } = trpc.stripe.getPayments.useQuery();
  const { data: invoices } = trpc.stripe.getInvoices.useQuery();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>الدفعات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString('ar')}</TableCell>
                  <TableCell>{payment.amount} {payment.currency}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">عرض</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 7. نظام الإشعارات للدفعات

```typescript
// server/services/payment-notification.ts
export async function notifyPaymentSuccess(payment: Payment) {
  await sendEmail({
    to: payment.userEmail,
    subject: 'تأكيد الدفع',
    template: 'payment-success',
    data: {
      amount: payment.amount,
      currency: payment.currency,
      date: new Date(payment.createdAt).toLocaleDateString('ar'),
      invoiceNumber: payment.invoiceId,
    },
  });

  // إرسال إشعار في التطبيق
  await db.insert(notifications).values({
    userId: payment.userId,
    type: 'payment_success',
    title: 'تم استلام الدفع',
    message: `تم استلام دفعة بقيمة ${payment.amount} ${payment.currency}`,
    read: false,
  });
}
```

---

## 8. الفواتير الدورية (Subscriptions)

```typescript
createSubscription: protectedProcedure
  .input(z.object({
    priceId: z.string(),
    billingCycle: z.enum(['monthly', 'yearly']),
  }))
  .mutation(async ({ ctx, input }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const subscription = await stripe.subscriptions.create({
      customer: ctx.user.stripeCustomerId,
      items: [{ price: input.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }),
```

---

## 9. اختبارات Vitest

```typescript
// server/stripe-payments.test.ts
describe('Stripe Payments', () => {
  it('should create checkout session', async () => {
    const result = await trpc.stripe.createCheckoutSession.mutate({
      items: [
        { name: 'Product', amount: 100, quantity: 1 },
      ],
    });

    expect(result.sessionId).toBeDefined();
  });

  it('should handle webhook events', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123' } },
    };

    const result = await handleStripeWebhook(event);
    expect(result).toBeDefined();
  });
});
```

---

## 10. الاختبار الشامل

### قائمة التحقق

- [ ] اختبار إنشاء Checkout Session
- [ ] اختبار معالجة الدفع بنجاح
- [ ] اختبار معالجة فشل الدفع
- [ ] اختبار إنشاء الفاتورة
- [ ] اختبار الاسترجاع
- [ ] اختبار الاشتراكات
- [ ] اختبار الإشعارات
- [ ] اختبار Webhooks
- [ ] اختبار الأمان

---

## الخلاصة

تم توثيق نظام Stripe المتكامل مع جميع الميزات الأساسية والمتقدمة. يمكن الآن البدء بالتطبيق الفعلي.
