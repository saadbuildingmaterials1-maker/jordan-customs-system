# دليل إعداد GitHub Actions

## نظرة عامة

تم إعداد ثلاثة workflows رئيسية لـ GitHub Actions:

### 1. Build Workflow (build.yml)
**الغرض:** بناء التطبيق على جميع الأنظمة (Linux, Windows, macOS)

**المشغلات:**
- Push إلى main أو develop
- Pull requests إلى main أو develop

**الخطوات:**
1. استخراج الكود
2. إعداد Node.js و pnpm
3. تثبيت المكتبات
4. فحص TypeScript
5. تشغيل الاختبارات
6. بناء التطبيق
7. بناء Electron
8. رفع الملفات المبنية

---

### 2. Test Workflow (test.yml)
**الغرض:** تشغيل الاختبارات والفحوصات

**المشغلات:**
- Push إلى main أو develop
- Pull requests إلى main أو develop

**الخطوات:**
1. إعداد MySQL للاختبارات
2. استخراج الكود
3. إعداد Node.js و pnpm
4. تثبيت المكتبات
5. إعداد قاعدة البيانات
6. فحص TypeScript
7. تشغيل الاختبارات
8. رفع تقرير التغطية إلى Codecov

---

### 3. Release Workflow (release.yml)
**الغرض:** إنشاء إصدار جديد ونشر التطبيق

**المشغلات:**
- Push tag جديد (مثل v1.0.0)

**الخطوات:**
1. إنشاء Release Notes تلقائية
2. إنشاء GitHub Release
3. بناء التطبيق على جميع الأنظمة
4. رفع الملفات المبنية إلى Release

---

## متغيرات البيئة المطلوبة

### Secrets المطلوبة

أضف هذه المتغيرات إلى GitHub Secrets:

```
GITHUB_TOKEN          # تلقائي من GitHub
DATABASE_URL          # رابط قاعدة البيانة
JWT_SECRET            # مفتاح JWT
STRIPE_SECRET_KEY     # مفتاح Stripe السري
STRIPE_PUBLISHABLE_KEY # مفتاح Stripe العام
SNYK_TOKEN            # مفتاح Snyk (اختياري)
```

### Variables المطلوبة

أضف هذه المتغيرات إلى GitHub Variables:

```
NODE_ENV              # production
APP_NAME              # نظام إدارة تكاليف الشحن والجمارك
```

---

## كيفية إضافة Secrets و Variables

### عبر GitHub UI:

1. اذهب إلى: `Settings` → `Secrets and variables` → `Actions`
2. اضغط `New repository secret` أو `New repository variable`
3. أدخل الاسم والقيمة
4. اضغط `Add secret` أو `Add variable`

### عبر GitHub CLI:

```bash
# إضافة Secret
gh secret set STRIPE_SECRET_KEY -b "sk_test_..."

# إضافة Variable
gh variable set NODE_ENV -b "production"

# عرض جميع Secrets
gh secret list

# عرض جميع Variables
gh variable list
```

---

## كيفية تشغيل Workflows يدويًا

### عبر GitHub UI:

1. اذهب إلى: `Actions`
2. اختر الـ workflow المطلوب
3. اضغط `Run workflow`
4. اختر الـ branch
5. اضغط `Run workflow`

### عبر GitHub CLI:

```bash
# تشغيل workflow معين
gh workflow run build.yml

# عرض حالة الـ workflows
gh run list

# عرض تفاصيل run معين
gh run view <run-id>

# عرض logs
gh run view <run-id> --log
```

---

## استكشاف الأخطاء

### الـ workflow فشل

1. اذهب إلى: `Actions` → اختر الـ workflow الفاشل
2. اضغط على الـ run الفاشل
3. اعرض logs لكل خطوة
4. ابحث عن الخطأ

### المشاكل الشائعة

**مشكلة:** `pnpm: command not found`
- **الحل:** تأكد من تثبيت pnpm قبل استخدامه

**مشكلة:** `Database connection failed`
- **الحل:** تأكد من إضافة `DATABASE_URL` إلى Secrets

**مشكلة:** `GITHUB_TOKEN not found`
- **الحل:** GITHUB_TOKEN يُضاف تلقائيًا، لا تحتاج لإضافته يدويًا

---

## أفضل الممارسات

1. **استخدم Secrets للبيانات الحساسة** - لا تضع مفاتيح API في الكود
2. **استخدم Variables للبيانات العامة** - مثل أسماء التطبيقات والإعدادات
3. **اختبر Workflows محليًا** - استخدم `act` لاختبار workflows محليًا
4. **راقب الـ workflows** - تحقق من الـ workflows بانتظام
5. **وثق التغييرات** - أضف تعليقات في الـ workflows

---

## أوامر مفيدة

```bash
# عرض جميع workflows
gh workflow list

# تفعيل workflow
gh workflow enable <workflow-id>

# تعطيل workflow
gh workflow disable <workflow-id>

# حذف workflow runs قديمة
gh run list --status completed --limit 100 | awk '{print $1}' | xargs -I {} gh run delete {}
```

---

## المراجع

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual)
- [Electron Builder Documentation](https://www.electron.build/)
