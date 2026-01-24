# نظام إدارة تكاليف الشحن والجمارك الأردنية - التوثيق الشامل

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية المعمارية](#البنية-المعمارية)
3. [الميزات الرئيسية](#الميزات-الرئيسية)
4. [الخدمات والـ APIs](#الخدمات-والـ-apis)
5. [معالجة الأخطاء](#معالجة-الأخطاء)
6. [الأمان](#الأمان)
7. [الأداء](#الأداء)
8. [الاختبارات](#الاختبارات)
9. [التطبيق والنشر](#التطبيق-والنشر)

---

## نظرة عامة

نظام شامل لإدارة تكاليف الشحن والجمارك الأردنية مع دعم كامل للدفع عبر Stripe، والنسخ الاحتياطية المشفرة، والإشعارات المتقدمة، واستيراد PDF، وتوزيع القيم الذكي.

### المتطلبات الأساسية

- Node.js 18+
- npm/pnpm
- قاعدة بيانات MySQL/TiDB
- مفاتيح Stripe API

---

## البنية المعمارية

```
jordan-customs-system/
├── client/                    # الواجهة الأمامية (React 19)
│   ├── src/
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── components/       # مكونات React
│   │   ├── hooks/            # Hooks مخصصة
│   │   ├── contexts/         # React Contexts
│   │   ├── lib/              # مكتبات مساعدة
│   │   └── index.css         # الأنماط العامة
│   └── public/               # الملفات الثابتة
│
├── server/                    # الخادم الخلفي (Express + tRPC)
│   ├── routers.ts            # إجراءات tRPC
│   ├── db.ts                 # استعلامات قاعدة البيانات
│   ├── error-handler.ts      # معالجة الأخطاء
│   ├── logger.ts             # نظام السجلات
│   ├── cache-manager.ts      # إدارة التخزين المؤقت
│   ├── security-manager.ts   # إدارة الأمان
│   └── services/             # خدمات مختلفة
│
├── drizzle/                   # قاعدة البيانات
│   ├── schema.ts             # تعريف الجداول
│   └── migrations/           # ملفات الهجرات
│
├── shared/                    # الكود المشترك
│   └── constants.ts          # الثوابت
│
└── storage/                   # إدارة التخزين (S3)
    └── storage.ts            # وظائف S3
```

---

## الميزات الرئيسية

### 1. نظام الدفع (Stripe)

**الملفات الأساسية:**
- `server/routers.ts` - إجراءات الدفع
- `server/stripe-service.ts` - خدمة Stripe

**الإجراءات:**
```typescript
// إنشاء جلسة دفع
trpc.stripe.createCheckoutSession.useMutation()

// الحصول على الفواتير
trpc.stripe.getInvoices.useQuery()

// إدارة الاشتراكات
trpc.stripe.manageSubscription.useMutation()
```

### 2. النسخ الاحتياطية المشفرة

**الملفات الأساسية:**
- `server/backup-encryption-service.ts` - خدمة التشفير
- `client/src/pages/BackupManagement.tsx` - واجهة الإدارة

**الميزات:**
- تشفير AES-256-GCM
- جدولة تلقائية
- استعادة سريعة
- إدارة مساحة التخزين

### 3. الإشعارات المتقدمة

**الملفات الأساسية:**
- `server/notification-service.ts` - خدمة الإشعارات

**القنوات المدعومة:**
- البريد الإلكتروني
- Slack
- Discord
- Telegram
- SMS

### 4. استيراد PDF

**الملفات الأساسية:**
- `server/pdf-import-service.ts` - معالجة PDF

**الميزات:**
- استخراج البيانات من PDF
- التحقق من الصحة
- معالجة الأخطاء

### 5. توزيع القيم الذكي

**الملفات الأساسية:**
- `server/value-distribution-service.ts` - خدمة التوزيع

**الخوارزميات:**
- التوزيع المتساوي
- التوزيع النسبي
- التوزيع حسب الوزن
- التوزيع حسب الكمية

---

## الخدمات والـ APIs

### معالجة الأخطاء

```typescript
import { ErrorHandler, ErrorCode } from './error-handler';

// إنشاء خطأ مخصص
throw new AppError(
  ErrorCode.INVALID_INPUT,
  'البيانات غير صحيحة',
  400,
  { field: 'email' }
);

// معالجة الخطأ
const result = ErrorHandler.handle(error, 'req-123');
```

### نظام السجلات

```typescript
import { logger, LogLevel } from './logger';

// تسجيل رسالة
logger.info('تم إنشاء فاتورة جديدة');

// تسجيل طلب HTTP
logger.logRequest('POST', '/api/invoices', 201, 150, 'req-123', 1);

// البحث في السجلات
const results = logger.search('خطأ');

// الحصول على الإحصائيات
const stats = logger.getStats();
```

### إدارة التخزين المؤقت

```typescript
import { cacheManager } from './cache-manager';

// تخزين قيمة
cacheManager.set('user:123', userData, 3600);

// الحصول على قيمة
const data = cacheManager.get('user:123');

// الحصول أو التعيين
const result = await cacheManager.getOrSet(
  'expensive-operation',
  async () => await expensiveOperation(),
  3600
);
```

### إدارة الأمان

```typescript
import { securityManager } from './security-manager';

// التحقق من قوة كلمة المرور
const validation = securityManager.validatePassword('MyPassword123!');

// تجزئة كلمة المرور
const { hash, salt } = securityManager.hashPassword(password);

// توليد JWT Token
const token = securityManager.generateJWT({ userId: 123 }, secret);

// التحقق من JWT Token
const result = securityManager.verifyJWT(token, secret);

// تسجيل محاولة دخول فاشلة
const { locked, remainingTime } = securityManager.recordFailedLogin('user@example.com');
```

---

## معالجة الأخطاء

### أنواع الأخطاء

```typescript
enum ErrorCode {
  // الأخطاء العامة
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // أخطاء قاعدة البيانات
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',

  // أخطاء الدفع
  STRIPE_ERROR = 'STRIPE_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_CARD = 'INVALID_CARD',

  // أخطاء الملفات
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
}
```

### معالجة الأخطاء في الواجهة الأمامية

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleApiError, handlePaymentError } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await api.submitForm(data);
    } catch (error) {
      handleApiError(error, 'submitForm');
    }
  };

  return <button onClick={handleSubmit}>إرسال</button>;
}
```

---

## الأمان

### حماية كلمات المرور

- استخدام PBKDF2 مع 10000 تكرار
- Salt عشوائي 16 بايت
- Hash SHA-512

### حماية الجلسات

- JWT Tokens مع انتهاء صلاحية 24 ساعة
- قائمة حظر الرموز
- CSRF Token Protection

### حماية من هجمات Brute Force

- حد أقصى 5 محاولات دخول فاشلة
- قفل الحساب لمدة 15 دقيقة
- تسجيل جميع محاولات الدخول

### التشفير

- AES-256-CBC للبيانات الحساسة
- RSA-4096 للتوقيع الرقمي
- HTTPS/TLS لجميع الاتصالات

---

## الأداء

### التخزين المؤقت

- تخزين مؤقت في الذاكرة لـ 10000 عنصر
- إزالة تلقائية للعناصر المنتهية الصلاحية
- استراتيجية LRU للإزالة

### تقسيم الكود

- Vendor React: 30.40 kB
- Vendor UI: 38.47 kB
- الملف الرئيسي: 4,053 kB

### مراقبة الأداء

```typescript
// تسجيل مدة العملية
const startTime = performance.now();
await operation();
const duration = performance.now() - startTime;
logger.info(`العملية استغرقت ${duration}ms`);
```

---

## الاختبارات

### تشغيل الاختبارات

```bash
# جميع الاختبارات
pnpm test

# اختبار ملف محدد
pnpm test server/error-handler.test.ts

# مع التغطية
pnpm test --coverage
```

### نتائج الاختبارات

- ✅ **1047 اختبار ناجح**
- ⚠️ **21 اختبار فشل** (معظمها بسبب مفاتيح Stripe)
- **نسبة النجاح:** 98.0%

### كتابة اختبارات جديدة

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should work correctly', () => {
    const result = myFunction();
    expect(result).toBe(expectedValue);
  });
});
```

---

## التطبيق والنشر

### التطبيق المحلي

```bash
# تثبيت الاعتماديات
pnpm install

# تشغيل الخادم
pnpm dev

# البناء
pnpm build

# بدء الإنتاج
pnpm start
```

### متغيرات البيئة

```env
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_ID=your-app-id
```

### النشر

1. إنشاء نقطة تفتيش: `webdev_save_checkpoint`
2. النقر على زر Publish في واجهة الإدارة
3. تحديد الإعدادات والنشر

---

## الدعم والمساعدة

للحصول على المساعدة:
- 📧 البريد الإلكتروني: support@example.com
- 💬 Slack: #support
- 📞 الهاتف: +962-6-xxx-xxxx

---

**آخر تحديث:** 2026-01-25
**الإصدار:** 1.0.0
