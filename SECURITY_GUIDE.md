# دليل الأمان الشامل - نظام إدارة تكاليف الشحن والجمارك الأردنية

## نظرة عامة

يتضمن النظام طبقات أمان متعددة لحماية البيانات والمستخدمين من الهجمات الشائعة.

## 1. Helmet - حماية رؤوس HTTP

### الميزات المفعلة:
- **Content Security Policy (CSP)**: يمنع حقن الأكواد الضارة
- **HSTS**: يفرض استخدام HTTPS
- **X-Frame-Options**: يمنع Clickjacking
- **X-Content-Type-Options**: يمنع MIME type sniffing
- **Referrer Policy**: يتحكم في معلومات الإحالة

### الاستخدام:
```typescript
import helmet from 'helmet';
app.use(helmet(helmetOptions));
```

## 2. CORS - التحكم في الأصول المسموحة

### الإعدادات:
- السماح فقط بالأصول المعروفة
- تفعيل الـ credentials
- السماح بـ HTTP methods المحددة

### الأصول المسموحة:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `FRONTEND_URL` (من متغيرات البيئة)

## 3. Rate Limiting - حماية من الهجمات المتكررة

### أنواع Rate Limiters:

#### 1. General Limiter
- **الحد**: 100 طلب / 15 دقيقة
- **الاستخدام**: جميع الطلبات
- **الهدف**: حماية عامة

```typescript
app.use(generalLimiter);
```

#### 2. Auth Limiter
- **الحد**: 5 محاولات / 15 دقيقة
- **الاستخدام**: عمليات المصادقة
- **الهدف**: حماية من كسر كلمات المرور

```typescript
app.use('/api/oauth', authLimiter);
```

#### 3. API Limiter
- **الحد**: 30 طلب / دقيقة
- **الاستخدام**: عمليات tRPC
- **الهدف**: حماية العمليات الحساسة

```typescript
app.use('/api/trpc', apiLimiter);
```

## 4. Input Sanitization - تنظيف البيانات المدخلة

### الإجراءات:
- إزالة الأحرف الخطرة (`<>\"'` )
- تحديد الحد الأقصى للطول (1000 حرف للـ query، 10000 للـ body)
- تنظيف البيانات المتداخلة

### مثال:
```typescript
// تنظيف تلقائي للـ query و body
app.use(sanitizeInput);
```

## 5. Security Headers - رؤوس الأمان الإضافية

### الرؤوس المضافة:
- `Cache-Control: no-store`: منع تخزين البيانات الحساسة
- `X-Content-Type-Options: nosniff`: منع MIME sniffing
- `X-XSS-Protection: 1; mode=block`: تفعيل XSS Protection
- `X-Frame-Options: DENY`: منع Clickjacking
- `Strict-Transport-Security`: فرض HTTPS (في الإنتاج)

## 6. Request Validation - التحقق من صحة الطلبات

### الفحوصات:
- التحقق من `Content-Type` الصحيح
- تسجيل الطلبات غير الصحيحة
- منع الطلبات بدون `User-Agent`

## 7. Request Logging - تسجيل الطلبات المريبة

### ما يتم تسجيله:
- الطلبات بدون `User-Agent`
- طلبات POST بدون `Referer`
- الطلبات بحجم كبير جداً (> 50MB)
- الطلبات الفاشلة (في الإنتاج)

## 8. Database Security - أمان قاعدة البيانات

### الميزات:
- **Foreign Keys مع Cascade**: حذف البيانات المرتبطة تلقائياً
- **Indexes**: تحسين الأداء والأمان
- **Prepared Statements**: منع SQL Injection (عبر Drizzle ORM)

### مثال:
```typescript
userId: int("userId").notNull()
  .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
```

## 9. Authentication - المصادقة الآمنة

### الطريقة:
- OAuth 2.0 عبر Manus
- Session Cookies مع HttpOnly و Secure flags
- JWT Tokens للعمليات الحساسة

### الاستخدام:
```typescript
// حماية الإجراءات
protectedProcedure
  .input(z.object({ /* ... */ }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user متاح فقط للمستخدمين المصرح لهم
  })
```

## 10. Authorization - التفويض

### الأدوار:
- **admin**: وصول كامل
- **user**: وصول محدود

### الاستخدام:
```typescript
adminProcedure
  .mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    // العملية الحساسة
  })
```

## 11. Environment Variables - متغيرات البيئة

### المتغيرات الحساسة:
- `JWT_SECRET`: سر التوقيع
- `DATABASE_URL`: رابط قاعدة البيانات
- `OAUTH_SERVER_URL`: خادم OAuth
- `VITE_FRONTEND_FORGE_API_KEY`: مفتاح API للواجهة الأمامية

### الممارسات الآمنة:
- لا تخزن المفاتيح في الكود
- استخدم متغيرات البيئة فقط
- لا تسجل المفاتيح الحساسة

## 12. HTTPS - البروتوكول الآمن

### الإعدادات:
- فرض HTTPS في الإنتاج
- HSTS مع `max-age=31536000`
- تحديث شهادات SSL تلقائياً

## 13. Best Practices - أفضل الممارسات

### للمطورين:
1. **استخدم protectedProcedure** للعمليات الحساسة
2. **تحقق من الصلاحيات** دائماً
3. **استخدم Zod** للتحقق من البيانات
4. **لا تسجل البيانات الحساسة**
5. **استخدم HTTPS** دائماً

### للمسؤولين:
1. **حدّث النظام** بانتظام
2. **راقب السجلات** للأنشطة المريبة
3. **استخدم كلمات مرور قوية**
4. **فعّل المصادقة الثنائية** عند الإمكان
5. **عمل نسخ احتياطية** منتظمة

## 14. Troubleshooting - استكشاف الأخطاء

### مشكلة: "Too many requests"
**الحل**: انتظر 15 دقيقة أو استخدم IP مختلفة

### مشكلة: "CORS policy violation"
**الحل**: أضف الأصل إلى `corsOptions` في `security-middleware.ts`

### مشكلة: "Invalid Content-Type"
**الحل**: تأكد من إرسال `Content-Type: application/json`

### مشكلة: "Forbidden"
**الحل**: تحقق من أن المستخدم لديه الصلاحيات المطلوبة

## 15. الامتثال والمعايير

- **OWASP Top 10**: حماية من أكثر 10 ثغرات شيوعاً
- **GDPR**: حماية بيانات المستخدمين
- **PCI DSS**: معايير أمان الدفع (عند استخدام Stripe)

## 16. الدعم والإبلاغ عن الثغرات

إذا وجدت ثغرة أمنية:
1. **لا تنشرها علناً**
2. **أبلغ الفريق** بسرية
3. **قدم تفاصيل كاملة** عن الثغرة
4. **انتظر الإصلاح** قبل الإفصاح

---

**آخر تحديث**: يناير 2026
**الإصدار**: 1.0.0
