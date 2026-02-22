# دليل إضافة Stripe للمدفوعات

هذا الدليل يشرح كيفية إضافة نظام الدفع Stripe إلى التطبيق لتحويل التجربة المجانية 7 أيام إلى اشتراكات مدفوعة.

## المتطلبات الأساسية

1. حساب Stripe نشط (https://stripe.com)
2. مفاتيح API من Stripe Dashboard
3. التطبيق منشور ويعمل على mp3-app.com

## الخطوة 1: إنشاء حساب Stripe

1. انتقل إلى https://stripe.com
2. اضغط "Sign up"
3. أكمل التسجيل وتفعيل الحساب
4. أكمل KYC (Know Your Customer) للحصول على مفاتيح الإنتاج

## الخطوة 2: الحصول على API Keys

### مفاتيح الاختبار (Test Mode):

1. سجل دخول إلى Stripe Dashboard
2. تأكد من أنك في "Test mode" (زر في الأعلى)
3. انتقل إلى: Developers → API keys
4. انسخ:
   - **Publishable key** (يبدأ بـ `pk_test_...`)
   - **Secret key** (اضغط "Reveal test key" ثم انسخ `sk_test_...`)

### مفاتيح الإنتاج (Live Mode):

1. بعد إكمال KYC والتفعيل
2. غيّر إلى "Live mode"
3. انتقل إلى: Developers → API keys
4. انسخ:
   - **Publishable key** (يبدأ بـ `pk_live_...`)
   - **Secret key** (اضغط "Reveal live key" ثم انسخ `sk_live_...`)

## الخطوة 3: إضافة المفاتيح للتطبيق

### الطريقة 1: عبر Management UI (موصى بها)

1. افتح Management UI للمشروع
2. انتقل إلى: Settings → Payment
3. أدخل المفاتيح:
   - **Stripe Secret Key**: `sk_test_...` أو `sk_live_...`
   - **Stripe Publishable Key**: `pk_test_...` أو `pk_live_...`
4. احفظ التغييرات

### الطريقة 2: عبر متغيرات البيئة

أضف المفاتيح كمتغيرات بيئة في Docker أو VPS.

## الخطوة 4: إنشاء المنتجات والأسعار في Stripe

1. في Stripe Dashboard، انتقل إلى: Products
2. اضغط "+ Add product"
3. أنشئ المنتجات التالية:

### الخطة الأساسية (Basic Plan):

- **Name**: الخطة الأساسية
- **Description**: للشركات الصغيرة - حتى 50 شحنة شهرياً
- **Pricing**:
  - شهري: $29/month
  - سنوي: $290/year (خصم 17%)

### الخطة الاحترافية (Professional Plan):

- **Name**: الخطة الاحترافية
- **Description**: للشركات المتوسطة - حتى 200 شحنة شهرياً
- **Pricing**:
  - شهري: $79/month
  - سنوي: $790/year (خصم 17%)

### الخطة المؤسسية (Enterprise Plan):

- **Name**: الخطة المؤسسية
- **Description**: للشركات الكبيرة - شحنات غير محدودة
- **Pricing**:
  - شهري: $199/month
  - سنوي: $1990/year (خصم 17%)

4. احفظ **Price ID** لكل خطة (يبدأ بـ `price_...`)

## الخطوة 5: الاختبار

### اختبار الدفع:

استخدم بطاقة الاختبار:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: أي تاريخ مستقبلي (مثال: 12/25)
- **CVC**: أي 3 أرقام (مثال: 123)
- **ZIP**: أي رمز بريدي

## الخطوة 6: التفعيل في الإنتاج

1. غيّر المفاتيح من Test إلى Live
2. حدّث Webhook URL في Stripe
3. اختبر بمبلغ صغير ($0.50 الحد الأدنى)
4. استخدم كود خصم 99% للاختبار

## استكشاف الأخطاء

### المشكلة: Webhook لا يعمل

**الحل:**
- تحقق من Webhook logs في Stripe Dashboard
- تحقق من STRIPE_WEBHOOK_SECRET
- تحقق من أن الـ endpoint مسجل بشكل صحيح

### المشكلة: الدفع يفشل

**الحل:**
- تحقق من STRIPE_SECRET_KEY
- تحقق من Price IDs
- تحقق من logs: `docker-compose logs -f app`

## الدعم

- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Support: https://support.stripe.com

---

**ملاحظة:** بعد إضافة Stripe، سيتمكن المستخدمون من الترقية من التجربة المجانية 7 أيام إلى اشتراك مدفوع.
