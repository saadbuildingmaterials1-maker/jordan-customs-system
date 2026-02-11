# 💳 إعداد مفاتيح الدفع الحقيقية للإنتاج
# Production Payment Gateway Keys Setup Guide

**التاريخ:** 11 فبراير 2026  
**الإصدار:** 0d652629  
**الحالة:** جاهز للتفعيل الفوري

---

## 🔐 المرحلة 1: تفعيل Stripe Production Keys

### الخطوة 1: الحصول على المفاتيح من Stripe

```bash
# 1. اذهب إلى: https://dashboard.stripe.com/apikeys
# 2. تأكد من أنك في وضع Live (وليس Test)
# 3. انسخ المفاتيح التالية:

# Publishable Key (pk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX

# Secret Key (sk_live_...)
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX

# Webhook Secret (whsec_...)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
```

### الخطوة 2: إضافة المفاتيح إلى متغيرات البيئة

```bash
# في ملف .env.production
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX

# أو عبر Manus Platform
# اذهب إلى: Settings > Secrets
# أضف المفاتيح الثلاثة
```

### الخطوة 3: تفعيل Webhook في Stripe

```bash
# 1. اذهب إلى: https://dashboard.stripe.com/webhooks
# 2. اضغط على "Add endpoint"
# 3. أدخل الرابط:
https://mp3-app.com/api/webhooks/stripe

# 4. اختر الأحداث التالية:
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

# 5. انسخ Webhook Secret وأضفه إلى STRIPE_WEBHOOK_SECRET
```

### الخطوة 4: اختبار Stripe Production

```bash
# اختبار الاتصال
curl -X POST https://mp3-app.com/api/payments/stripe/test \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "description": "Test Payment - Stripe Production"
  }'

# يجب أن تحصل على استجابة ناجحة مع payment_intent_id
```

### الخطوة 5: تفعيل Stripe في التطبيق

```typescript
// client/src/services/stripePaymentService.ts
const stripeConfig = {
  apiKey: process.env.STRIPE_SECRET_KEY, // sk_live_...
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY, // pk_live_...
  mode: 'production', // تغيير من 'test' إلى 'production'
  
  // إعدادات الإنتاج
  apiVersion: '2024-01-01',
  timeout: 30000,
  maxNetworkRetries: 3,
  
  // العملات المدعومة
  supportedCurrencies: ['USD', 'EUR', 'JOD', 'AED', 'SAR'],
  
  // إعدادات الاشتراكات
  subscriptionEnabled: true,
  trialDays: 7
};
```

---

## 💰 المرحلة 2: تفعيل PayPal Production Keys

### الخطوة 1: الحصول على المفاتيح من PayPal

```bash
# 1. اذهب إلى: https://www.paypal.com/cgi-bin/customerprofileweb
# 2. اختر "API Signature" أو "API Certificate"
# 3. انسخ المفاتيح التالية:

# Client ID (AQD...)
PAYPAL_CLIENT_ID=AQDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Client Secret
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API Username (optional)
PAYPAL_API_USERNAME=your_api_username

# API Password (optional)
PAYPAL_API_PASSWORD=your_api_password

# API Signature (optional)
PAYPAL_API_SIGNATURE=your_api_signature
```

### الخطوة 2: إضافة المفاتيح إلى متغيرات البيئة

```bash
# في ملف .env.production
PAYPAL_CLIENT_ID=AQDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_MODE=live  # تغيير من 'sandbox' إلى 'live'

# أو عبر Manus Platform
# اذهب إلى: Settings > Secrets
# أضف المفاتيح
```

### الخطوة 3: تفعيل Webhook في PayPal

```bash
# 1. اذهب إلى: https://www.paypal.com/cgi-bin/customerprofileweb
# 2. اختر "Instant Payment Notification (IPN)"
# 3. أدخل الرابط:
https://mp3-app.com/api/webhooks/paypal

# 4. اختر الأحداث التالية:
- payment.capture.completed
- payment.capture.refunded
- billing.subscription.created
- billing.subscription.updated
- billing.subscription.cancelled
```

### الخطوة 4: اختبار PayPal Production

```bash
# اختبار الاتصال
curl -X POST https://mp3-app.com/api/payments/paypal/test \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "10.00",
    "currency": "USD",
    "description": "Test Payment - PayPal Production"
  }'

# يجب أن تحصل على استجابة ناجحة مع order_id
```

### الخطوة 5: تفعيل PayPal في التطبيق

```typescript
// client/src/services/paypalPaymentService.ts
const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID, // AQD...
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  mode: 'live', // تغيير من 'sandbox' إلى 'live'
  
  // إعدادات الإنتاج
  timeout: 30000,
  retries: 3,
  
  // العملات المدعومة
  supportedCurrencies: ['USD', 'EUR', 'JOD', 'AED', 'SAR'],
  
  // URLs الإنتاج
  returnUrl: 'https://mp3-app.com/payment/success',
  cancelUrl: 'https://mp3-app.com/payment/cancel'
};
```

---

## 🍎 المرحلة 3: تفعيل Apple Pay Production

### الخطوة 1: الحصول على Merchant ID

```bash
# 1. اذهب إلى: https://developer.apple.com/account/
# 2. اختر "Certificates, Identifiers & Profiles"
# 3. اختر "Identifiers"
# 4. اختر "Merchant IDs"
# 5. انسخ Merchant ID:

VITE_APPLE_PAY_MERCHANT_ID=merchant.com.mp3app
```

### الخطوة 2: إضافة المفتاح إلى متغيرات البيئة

```bash
# في ملف .env.production
VITE_APPLE_PAY_MERCHANT_ID=merchant.com.mp3app

# أو عبر Manus Platform
# اذهب إلى: Settings > Secrets
# أضف المفتاح
```

### الخطوة 3: تفعيل Apple Pay في التطبيق

```typescript
// client/src/services/applePayService.ts
const applePayConfig = {
  merchantIdentifier: process.env.VITE_APPLE_PAY_MERCHANT_ID,
  displayName: 'Jordan Customs System',
  
  // الشبكات المدعومة
  supportedNetworks: ['visa', 'masterCard', 'amex'],
  supportedCountries: ['US', 'GB', 'AE', 'JO', 'SA'],
  
  // القدرات
  capabilities: ['supports3DS', 'supportsEMV'],
  
  // العملات
  supportedCurrencies: ['USD', 'EUR', 'JOD', 'AED', 'SAR']
};
```

### الخطوة 4: اختبار Apple Pay Production

```bash
# اختبار الاتصال (يتطلب جهاز Apple)
curl -X POST https://mp3-app.com/api/payments/apple-pay/validate \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "...",
    "amount": "10.00",
    "currency": "USD"
  }'
```

---

## 🔄 المرحلة 4: تفعيل المفاتيح في التطبيق

### الخطوة 1: تحديث ملف البيئة

```bash
# .env.production
NODE_ENV=production
VITE_ENV=production

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=AQD...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Apple Pay
VITE_APPLE_PAY_MERCHANT_ID=merchant.com.mp3app

# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/jordan_customs_prod

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Domain
DOMAIN_NAME=mp3-app.com
```

### الخطوة 2: تحديث متغيرات البيئة في Manus Platform

```bash
# اذهب إلى: Management UI > Settings > Secrets
# أضف أو حدّث المفاتيح التالية:

1. STRIPE_PUBLISHABLE_KEY = pk_live_...
2. STRIPE_SECRET_KEY = sk_live_...
3. STRIPE_WEBHOOK_SECRET = whsec_...
4. PAYPAL_CLIENT_ID = AQD...
5. PAYPAL_CLIENT_SECRET = ...
6. PAYPAL_MODE = live
7. VITE_APPLE_PAY_MERCHANT_ID = merchant.com.mp3app
```

### الخطوة 3: إعادة بناء التطبيق

```bash
cd /home/ubuntu/jordan-customs-system

# تحديث الاعتماديات
pnpm install --prod

# بناء التطبيق
pnpm build

# تشغيل الاختبارات
pnpm test

# نشر على الإنتاج
pnpm deploy:production
```

---

## ✅ المرحلة 5: اختبار شامل للمفاتيح

### اختبار Stripe

```bash
# 1. اختبار الاتصال
curl -X GET https://mp3-app.com/api/payments/stripe/status \
  -H "Authorization: Bearer $AUTH_TOKEN"

# 2. اختبار إنشاء Payment Intent
curl -X POST https://mp3-app.com/api/payments/stripe/create-intent \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "description": "Test Payment"
  }'

# 3. اختبار Webhook
curl -X POST https://mp3-app.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=...,v1=..." \
  -d '{"type": "payment_intent.succeeded", ...}'
```

### اختبار PayPal

```bash
# 1. اختبار الاتصال
curl -X GET https://mp3-app.com/api/payments/paypal/status \
  -H "Authorization: Bearer $AUTH_TOKEN"

# 2. اختبار إنشاء Order
curl -X POST https://mp3-app.com/api/payments/paypal/create-order \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "10.00",
    "currency": "USD",
    "description": "Test Payment"
  }'

# 3. اختبار Webhook
curl -X POST https://mp3-app.com/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d 'txn_type=web_accept&payment_status=Completed&...'
```

### اختبار Apple Pay

```bash
# 1. اختبار الاتصال
curl -X GET https://mp3-app.com/api/payments/apple-pay/status \
  -H "Authorization: Bearer $AUTH_TOKEN"

# 2. اختبار التحقق من الرمز
curl -X POST https://mp3-app.com/api/payments/apple-pay/validate \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "...",
    "amount": "10.00",
    "currency": "USD"
  }'
```

---

## 🔒 معايير الأمان

### قائمة التحقق من الأمان

- [x] استخدام HTTPS فقط
- [x] عدم تخزين المفاتيح في الكود
- [x] استخدام متغيرات البيئة
- [x] تفعيل Webhook Signatures
- [x] التحقق من الرموز
- [x] تشفير البيانات الحساسة
- [x] Rate Limiting على API endpoints
- [x] Logging والمراقبة

### الممارسات الأمنية

```bash
# ❌ لا تفعل هذا:
STRIPE_SECRET_KEY=sk_live_... # في الكود
console.log(STRIPE_SECRET_KEY) # في السجلات

# ✅ افعل هذا:
const stripeKey = process.env.STRIPE_SECRET_KEY
// استخدم المتغير فقط
```

---

## 📊 المراقبة والتقارير

### مراقبة الدفع

```bash
# عرض جميع المدفوعات
curl -X GET https://mp3-app.com/api/payments/list \
  -H "Authorization: Bearer $AUTH_TOKEN"

# عرض تفاصيل المدفوعة
curl -X GET https://mp3-app.com/api/payments/123 \
  -H "Authorization: Bearer $AUTH_TOKEN"

# عرض الأخطاء
curl -X GET https://mp3-app.com/api/payments/errors \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### التقارير اليومية

```bash
# تقرير المدفوعات اليومي
curl -X GET https://mp3-app.com/api/reports/payments/daily \
  -H "Authorization: Bearer $AUTH_TOKEN"

# تقرير الإيرادات
curl -X GET https://mp3-app.com/api/reports/revenue \
  -H "Authorization: Bearer $AUTH_TOKEN"

# تقرير الأخطاء
curl -X GET https://mp3-app.com/api/reports/payment-errors \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## 🚀 الخطوات التالية

1. ✅ الحصول على مفاتيح Stripe Production
2. ✅ الحصول على مفاتيح PayPal Production
3. ✅ الحصول على Merchant ID من Apple
4. ✅ إضافة المفاتيح إلى متغيرات البيئة
5. ✅ تفعيل Webhooks
6. ✅ إعادة بناء التطبيق
7. ✅ اختبار شامل
8. ✅ نشر على الإنتاج

---

## 📞 الدعم والمساعدة

| الخدمة | البريد | الهاتف |
|--------|--------|--------|
| **دعم Stripe** | support@stripe.com | +1-888-252-0542 |
| **دعم PayPal** | support@paypal.com | +1-402-935-2050 |
| **دعم Apple** | support@apple.com | +1-800-MY-APPLE |

---

**تم الإعداد بواسطة:** فريق التطوير  
**التاريخ:** 11 فبراير 2026  
**الحالة:** جاهز للتفعيل الفوري
