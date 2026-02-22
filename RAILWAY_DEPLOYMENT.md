# دليل النشر على Railway.app (مجاني ومستقل)

## لماذا Railway؟
- ✅ **مجاني 100%** (500 ساعة تشغيل شهرياً)
- ✅ **مستقل تماماً** عن Manus
- ✅ **يدعم Docker** و MySQL
- ✅ **SSL مجاني** تلقائياً
- ✅ **يمكن ربط النطاق** mp3-app.com

---

## الخطوات (5 دقائق فقط)

### 1. إنشاء حساب Railway

1. افتح https://railway.app
2. اضغط **"Login"**
3. سجل دخول عبر **GitHub**
4. وافق على الأذونات

### 2. إنشاء مشروع جديد

1. اضغط **"New Project"**
2. اختر **"Deploy from GitHub repo"**
3. اختر repository: **jordan-customs-system**
4. Railway سيكتشف تلقائياً أنه Docker project

### 3. إضافة قاعدة بيانات MySQL

1. في نفس المشروع، اضغط **"+ New"**
2. اختر **"Database"** → **"MySQL"**
3. انتظر حتى يتم إنشاء القاعدة

### 4. ربط المتغيرات البيئية

1. اضغط على service التطبيق (jordan-customs-system)
2. انتقل إلى **"Variables"**
3. أضف المتغيرات التالية:

```
DATABASE_URL=${{MySQL.DATABASE_URL}}
JWT_SECRET=<generate_random_string_here>
NODE_ENV=production
PORT=3000
```

**لتوليد JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 5. النشر

1. اضغط **"Deploy"** (سيبدأ تلقائياً)
2. انتظر 2-3 دقائق
3. ستحصل على URL مثل: `jordan-customs-system-production.up.railway.app`

### 6. ربط النطاق mp3-app.com

#### في Railway:
1. اضغط على service التطبيق
2. انتقل إلى **"Settings"** → **"Domains"**
3. اضغط **"Custom Domain"**
4. أدخل: `mp3-app.com`
5. ستظهر لك تعليمات DNS

#### في Namecheap (أو مسجل النطاق):
1. سجل دخول إلى Namecheap
2. انتقل إلى **Domain List** → **Manage** (للنطاق mp3-app.com)
3. اضغط **"Advanced DNS"**
4. أضف السجلات التالية:

**A Record:**
- Type: `A Record`
- Host: `@`
- Value: `<IP من Railway>`
- TTL: `Automatic`

**CNAME Record:**
- Type: `CNAME Record`
- Host: `www`
- Value: `<domain من Railway>`
- TTL: `Automatic`

5. احفظ التغييرات
6. انتظر 15-30 دقيقة لانتشار DNS

### 7. تفعيل SSL (تلقائي)

Railway يفعّل SSL تلقائياً بمجرد ربط النطاق. لا حاجة لأي إعدادات إضافية!

---

## التحقق من النشر

1. افتح https://mp3-app.com
2. يجب أن ترى الصفحة الرئيسية
3. سجل دخول للتأكد من عمل قاعدة البيانات

---

## إنشاء أول مستخدم Admin

### الطريقة 1: عبر Railway Console

1. في Railway، اضغط على MySQL database
2. اضغط **"Connect"** → **"MySQL CLI"**
3. نفذ:

```sql
USE railway;

-- توليد password hash (استخدم bcrypt online tool)
-- Password: admin123
-- Hash: $2b$10$rZ5qH8Qz9X...

INSERT INTO users (email, password, name, role, created_at)
VALUES (
  'admin@mp3-app.com',
  '$2b$10$rZ5qH8Qz9X...',  -- استبدل بالـ hash الحقيقي
  'المدير',
  'admin',
  NOW()
);
```

### الطريقة 2: عبر صفحة التسجيل

1. افتح https://mp3-app.com
2. سجل كمستخدم عادي
3. في Railway MySQL CLI، غيّر role:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## الصيانة

### عرض Logs:
1. في Railway، اضغط على service
2. انتقل إلى **"Deployments"**
3. اضغط على آخر deployment
4. ستظهر logs مباشرة

### إعادة النشر:
1. فقط اعمل `git push` للـ repository
2. Railway سيعيد النشر تلقائياً

### النسخ الاحتياطي:
1. في Railway MySQL، اضغط **"Data"**
2. اضغط **"Export"**
3. احفظ الملف

---

## التكلفة

**الخطة المجانية:**
- 500 ساعة تشغيل شهرياً
- 512MB RAM
- 1GB Storage
- كافية لمشروع صغير-متوسط

**للترقية:**
- $5/شهر للخطة المدفوعة
- موارد أكثر وساعات غير محدودة

---

## استكشاف الأخطاء

### التطبيق لا يعمل:
1. تحقق من Logs في Railway
2. تأكد من DATABASE_URL صحيح
3. تأكد من JWT_SECRET موجود

### قاعدة البيانات لا تتصل:
1. تحقق من أن MySQL service يعمل
2. تأكد من DATABASE_URL في Variables
3. أعد نشر التطبيق

### النطاق لا يعمل:
1. تحقق من DNS في Namecheap
2. انتظر 30 دقيقة لانتشار DNS
3. استخدم https://dnschecker.org للتحقق

---

## الدعم

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: في repository المشروع

---

**ملاحظة:** Railway أفضل من Render لأنه أسهل في الإعداد ويدعم Docker Compose بشكل أفضل.
