# دليل ربط النطاق mp3-app.com

هذا الدليل يشرح كيفية ربط نطاقك mp3-app.com بالخادم (VPS) الخاص بك.

## المتطلبات الأساسية

- نطاق mp3-app.com (مسجل ومملوك لك)
- خادم VPS مع عنوان IP ثابت
- وصول إلى لوحة تحكم النطاق (Namecheap, GoDaddy, إلخ)

## الخطوة 1: الحصول على عنوان IP الخادم

```bash
# على الخادم، قم بتشغيل:
curl ifconfig.me

# أو
hostname -I | awk '{print $1}'
```

احفظ عنوان IP (مثال: 123.45.67.89)

## الخطوة 2: إعداد سجلات DNS

### إذا كنت تستخدم Namecheap:

1. **تسجيل الدخول إلى Namecheap**
   - انتقل إلى https://www.namecheap.com
   - سجل دخول إلى حسابك

2. **الانتقال إلى إدارة النطاق**
   - من Dashboard، اختر "Domain List"
   - اضغط على "Manage" بجانب mp3-app.com

3. **إعداد DNS Records**
   - اختر "Advanced DNS" tab
   - احذف أي سجلات قديمة (Parking Page)
   
4. **إضافة السجلات التالية:**

   **A Record للنطاق الرئيسي:**
   ```
   Type: A Record
   Host: @
   Value: [عنوان IP خادمك]
   TTL: Automatic
   ```

   **A Record للـ www:**
   ```
   Type: A Record
   Host: www
   Value: [عنوان IP خادمك]
   TTL: Automatic
   ```

   **أو استخدم CNAME للـ www:**
   ```
   Type: CNAME Record
   Host: www
   Value: mp3-app.com
   TTL: Automatic
   ```

### إذا كنت تستخدم GoDaddy:

1. تسجيل الدخول إلى GoDaddy
2. انتقل إلى "My Products" → "Domains"
3. اضغط على "DNS" بجانب النطاق
4. أضف السجلات:
   - Type: A, Name: @, Value: [IP]
   - Type: A, Name: www, Value: [IP]

### إذا كنت تستخدم Cloudflare:

1. أضف النطاق إلى Cloudflare
2. غيّر Nameservers في مسجل النطاق إلى Cloudflare
3. أضف السجلات:
   - Type: A, Name: @, Content: [IP], Proxy: ON
   - Type: A, Name: www, Content: [IP], Proxy: ON

## الخطوة 3: انتظار انتشار DNS

- **الوقت المتوقع:** 5 دقائق إلى 48 ساعة
- **عادةً:** 15-30 دقيقة

### التحقق من انتشار DNS:

```bash
# Linux/Mac
dig mp3-app.com +short
dig www.mp3-app.com +short

# أو استخدم أدوات أونلاين:
# https://dnschecker.org
# https://www.whatsmydns.net
```

## الخطوة 4: تفعيل SSL (HTTPS)

بعد انتشار DNS، قم بتشغيل:

```bash
# على الخادم
sudo certbot --nginx -d mp3-app.com -d www.mp3-app.com
```

اتبع التعليمات:
1. أدخل بريدك الإلكتروني
2. وافق على شروط الخدمة (Y)
3. اختر ما إذا كنت تريد مشاركة بريدك (Y/N)
4. اختر "2" لإعادة توجيه HTTP إلى HTTPS

## الخطوة 5: التحقق من عمل الموقع

```bash
# اختبار HTTP (سيتم إعادة التوجيه إلى HTTPS)
curl -I http://mp3-app.com

# اختبار HTTPS
curl -I https://mp3-app.com
```

افتح المتصفح وانتقل إلى:
- https://mp3-app.com
- https://www.mp3-app.com

## الخطوة 6: تجديد SSL التلقائي

Certbot يضيف cron job تلقائياً للتجديد. للتحقق:

```bash
# اختبار التجديد
sudo certbot renew --dry-run

# عرض cron jobs
sudo crontab -l
```

## استكشاف الأخطاء

### المشكلة: DNS لم ينتشر بعد

**الحل:**
```bash
# تحقق من DNS
nslookup mp3-app.com
nslookup www.mp3-app.com

# انتظر 15-30 دقيقة وحاول مرة أخرى
```

### المشكلة: Certbot يفشل في الحصول على شهادة

**الأسباب المحتملة:**
1. DNS لم ينتشر بعد - انتظر أكثر
2. Firewall يحجب المنفذ 80 - تحقق من ufw
3. Nginx لا يعمل - تحقق من الحالة

**الحلول:**
```bash
# تحقق من Nginx
sudo systemctl status nginx

# تحقق من Firewall
sudo ufw status

# تحقق من المنافذ
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### المشكلة: الموقع لا يعمل بعد ربط النطاق

**الحل:**
```bash
# تحقق من logs
docker-compose logs -f app
sudo tail -f /var/log/nginx/mp3-app.com.error.log

# تحقق من Nginx config
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx

# إعادة تشغيل التطبيق
docker-compose restart app
```

## نصائح إضافية

1. **استخدم Cloudflare** (اختياري):
   - حماية DDoS مجانية
   - CDN عالمي
   - SSL مجاني
   - Cache للملفات الثابتة

2. **مراقبة SSL:**
   - تحقق من تاريخ انتهاء الصلاحية
   - Certbot يجدد تلقائياً قبل 30 يوم

3. **Backup DNS:**
   - احتفظ بنسخة من إعدادات DNS
   - وثّق جميع السجلات

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من logs: `docker-compose logs -f`
2. تحقق من Nginx: `sudo nginx -t`
3. تحقق من DNS: `dig mp3-app.com +short`
4. تحقق من SSL: `sudo certbot certificates`

---

**ملاحظة:** بعد ربط النطاق بنجاح، سيظهر موقعك على https://mp3-app.com فقط بدون أي نطاقات خارجية.
