# خطة تصدير الكود للاستضافة المستقلة

## المهام المطلوبة

### 1. إزالة Manus Dependencies
- [ ] إزالة OAuth system واستبداله بـ JWT authentication
- [ ] إزالة analytics (VITE_ANALYTICS_*)
- [ ] إزالة Manus-specific env variables
- [ ] استبدال storage helpers بـ AWS S3 مباشر
- [ ] استبدال notification system بـ email notifications

### 2. إنشاء نظام تسجيل دخول مستقل
- [ ] إضافة bcrypt لتشفير كلمات المرور
- [ ] إنشاء /api/auth/register endpoint
- [ ] إنشاء /api/auth/login endpoint
- [ ] إنشاء /api/auth/logout endpoint
- [ ] استبدال OAuth callbacks بـ JWT tokens

### 3. تحديث Environment Variables
- [ ] إنشاء .env.example جديد
- [ ] إزالة OAUTH_* variables
- [ ] إضافة JWT_SECRET
- [ ] إضافة AWS_* variables للـ S3
- [ ] إضافة SMTP_* variables للإيميلات

### 4. إعداد ملفات النشر
- [ ] إنشاء Dockerfile
- [ ] إنشاء docker-compose.yml
- [ ] إنشاء vercel.json
- [ ] إنشاء netlify.toml
- [ ] تحديث README.md مع تعليمات النشر

## الاستضافات المقترحة

1. **VPS (Digital Ocean / Linode)**
   - كامل التحكم
   - يحتاج إعداد يدوي
   - تكلفة: $5-10/شهر

2. **Vercel**
   - سهل النشر
   - مجاني للمشاريع الصغيرة
   - يدعم Node.js

3. **Netlify**
   - سهل النشر
   - مجاني للمشاريع الصغيرة
   - يدعم Serverless Functions
