# 📋 دليل النشر والتطوير

## 🎯 نظرة عامة

هذا الدليل يشرح كيفية نشر التطبيق على بيئات مختلفة (Staging و Production).

---

## 📦 المتطلبات

- Docker و Docker Compose
- Node.js 22+
- pnpm
- MySQL 8.0+
- Redis 7+
- Nginx (اختياري - للـ Reverse Proxy)

---

## 🏗️ البنية

```
├── .env.staging          # متغيرات بيئة Staging
├── .env.production       # متغيرات بيئة Production
├── Dockerfile            # صورة Docker
├── docker-compose.yml    # تكوين Docker Compose
├── nginx/
│   ├── nginx.conf        # تكوين Nginx
│   └── ssl/              # شهادات SSL
└── scripts/
    ├── deploy.sh         # سكريبت النشر
    └── health-check.sh   # فحص الصحة
```

---

## 🚀 البدء السريع

### 1. إعداد البيئة

```bash
# نسخ ملفات البيئة
cp .env.staging.example .env.staging
cp .env.production.example .env.production

# تحديث متغيرات البيئة
nano .env.staging
nano .env.production
```

### 2. بناء وتشغيل Staging

```bash
# بناء الصورة
docker build -t customs-system:staging .

# تشغيل البيئة
docker-compose up -d app-staging db-staging redis-staging

# فحص الحالة
docker-compose logs -f app-staging
```

### 3. بناء وتشغيل Production

```bash
# بناء الصورة
docker build -t customs-system:production .

# تشغيل البيئة
docker-compose up -d app-production db-production redis-production nginx

# فحص الحالة
docker-compose logs -f app-production
```

---

## 🔧 سكريبت النشر

### الاستخدام

```bash
# نشر إلى Staging
./scripts/deploy.sh staging v1.0.0

# نشر إلى Production
./scripts/deploy.sh production v1.0.0
```

### الخطوات التي يقوم بها السكريبت

1. ✅ تحميل متغيرات البيئة
2. ✅ بناء صورة Docker
3. ✅ دفع الصورة إلى Registry
4. ✅ نشر التطبيق باستخدام Docker Compose
5. ✅ تشغيل ترحيلات قاعدة البيانات
6. ✅ فحص صحة التطبيق

---

## 🗄️ قاعدة البيانات

### ترحيل البيانات

```bash
# Staging
docker-compose exec app-staging pnpm db:push

# Production
docker-compose exec app-production pnpm db:push
```

### النسخ الاحتياطية

```bash
# إنشاء نسخة احتياطية
docker-compose exec db-production mysqldump -u root -p customs_prod > backup.sql

# استعادة من نسخة احتياطية
docker-compose exec -T db-production mysql -u root -p customs_prod < backup.sql
```

---

## 🔒 الأمان

### شهادات SSL

```bash
# إنشاء شهادات SSL (للتطوير فقط)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/staging.key \
  -out nginx/ssl/staging.crt

# للإنتاج، استخدم Let's Encrypt
certbot certonly --standalone -d customs-system.example.com
```

### متغيرات البيئة الحساسة

- ✅ لا تضع مفاتيح سرية في ملفات التحكم في الإصدار
- ✅ استخدم Docker Secrets أو متغيرات البيئة
- ✅ قم بتدوير المفاتيح بانتظام

---

## 📊 المراقبة والسجلات

### عرض السجلات

```bash
# Staging
docker-compose logs -f app-staging

# Production
docker-compose logs -f app-production

# جميع الخدمات
docker-compose logs -f
```

### فحص الحالة

```bash
# Staging
curl http://localhost:3001/health

# Production
curl https://customs-system.example.com/health
```

---

## 🔄 التحديثات والترقيات

### تحديث التطبيق

```bash
# سحب أحدث الكود
git pull origin main

# بناء صورة جديدة
docker build -t customs-system:v1.1.0 .

# نشر إلى Staging أولاً
./scripts/deploy.sh staging v1.1.0

# بعد الاختبار، نشر إلى Production
./scripts/deploy.sh production v1.1.0
```

### الرجوع إلى نسخة سابقة

```bash
# استخدام صورة سابقة
docker-compose up -d app-production --force-recreate \
  -e IMAGE_TAG=v1.0.0
```

---

## 🧪 الاختبار

### اختبارات الوحدة

```bash
docker-compose exec app-staging pnpm test
```

### اختبارات التكامل

```bash
docker-compose exec app-staging pnpm test:integration
```

### اختبارات الأداء

```bash
docker-compose exec app-staging pnpm test:performance
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: التطبيق لا يبدأ

```bash
# فحص السجلات
docker-compose logs app-staging

# فحص الموارد
docker stats

# إعادة التشغيل
docker-compose restart app-staging
```

### المشكلة: قاعدة البيانات لا تتصل

```bash
# فحص اتصال قاعدة البيانات
docker-compose exec app-staging \
  mysql -h db-staging -u staging_user -p customs_staging -e "SELECT 1"

# فحص السجلات
docker-compose logs db-staging
```

### المشكلة: مشاكل الأداء

```bash
# فحص استخدام الموارد
docker stats

# فحص الاستعلامات البطيئة
docker-compose exec db-staging \
  mysql -u root -p -e "SHOW PROCESSLIST"
```

---

## 📝 قائمة التحقق قبل النشر

- [ ] تم اختبار جميع الميزات في Staging
- [ ] تم تشغيل جميع الاختبارات بنجاح
- [ ] تم فحص الأداء والأمان
- [ ] تم إنشاء نسخة احتياطية من قاعدة البيانات
- [ ] تم تحديث متغيرات البيئة للإنتاج
- [ ] تم إعداد شهادات SSL
- [ ] تم إعداد نظام المراقبة والسجلات
- [ ] تم توثيق التغييرات

---

## 🔗 الموارد المفيدة

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Redis Documentation](https://redis.io/documentation)

---

**آخر تحديث:** 24 يناير 2026  
**الإصدار:** 1.0.0
