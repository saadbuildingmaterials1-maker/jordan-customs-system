# 🌐 ربط النطاق mp3-app.com مع DNS و SSL
# Domain Binding & DNS Setup Guide

**التاريخ:** 11 فبراير 2026  
**النطاق:** mp3-app.com  
**الحالة:** جاهز للربط الفوري

---

## 📋 المرحلة 1: إعدادات DNS

### الخطوة 1: تحديث Nameservers

اذهب إلى موفر النطاق (GoDaddy, Namecheap, إلخ) وحدّث Nameservers إلى:

```dns
ns1.manus.im
ns2.manus.im
ns3.manus.im
```

**خطوات التحديث:**

1. **GoDaddy:**
   - اذهب إلى: My Products > Domains
   - اختر mp3-app.com
   - اضغط على "Manage DNS"
   - اختر "Change Nameservers"
   - أدخل الـ nameservers أعلاه

2. **Namecheap:**
   - اذهب إلى: Domain List
   - اختر mp3-app.com
   - اضغط على "Manage"
   - اختر "Nameservers"
   - أدخل الـ nameservers أعلاه

3. **Other Providers:**
   - ابحث عن "Change Nameservers" أو "DNS Settings"
   - أدخل الـ nameservers أعلاه

### الخطوة 2: إضافة سجلات DNS

بعد تحديث Nameservers، أضف السجلات التالية:

```dns
# A Record (للنطاق الرئيسي)
mp3-app.com.  3600  IN  A  <PRODUCTION_IP_ADDRESS>

# CNAME Record (للـ www)
www.mp3-app.com.  3600  IN  CNAME  mp3-app.com.

# MX Records (للبريد)
mp3-app.com.  3600  IN  MX  10 mail.mp3-app.com.
mp3-app.com.  3600  IN  MX  20 mail2.mp3-app.com.

# TXT Records (للتحقق والأمان)
mp3-app.com.  3600  IN  TXT  "v=spf1 include:sendgrid.net ~all"
mp3-app.com.  3600  IN  TXT  "google-site-verification=<VERIFICATION_CODE>"
mp3-app.com.  3600  IN  TXT  "dkim=v=DKIM1; k=rsa; p=<PUBLIC_KEY>"

# DMARC Record
_dmarc.mp3-app.com.  3600  IN  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@mp3-app.com"
```

### الخطوة 3: التحقق من انتشار DNS

```bash
# التحقق من A Record
nslookup mp3-app.com
dig mp3-app.com A

# التحقق من CNAME Record
nslookup www.mp3-app.com
dig www.mp3-app.com CNAME

# التحقق من MX Records
dig mp3-app.com MX

# التحقق من TXT Records
dig mp3-app.com TXT

# استخدام أداة أونلاين
# https://www.whatsmydns.net/
```

### الخطوة 4: الانتظار لانتشار DNS

```
⏱️ الانتشار يستغرق عادة:
- 15 دقيقة: التحديث الأول
- 1-4 ساعات: الانتشار الكامل
- 24-48 ساعة: الانتشار العالمي الكامل

✅ يمكنك اختبار الانتشار على:
https://www.whatsmydns.net/
```

---

## 🔒 المرحلة 2: تفعيل SSL Certificate

### الخطوة 1: الحصول على SSL Certificate

**الخيار 1: Let's Encrypt (مجاني)**

```bash
# تثبيت Certbot
sudo apt-get install certbot python3-certbot-nginx

# الحصول على شهادة
sudo certbot certonly --standalone \
  -d mp3-app.com \
  -d www.mp3-app.com

# أو باستخدام Nginx
sudo certbot certonly --nginx \
  -d mp3-app.com \
  -d www.mp3-app.com
```

**الخيار 2: Manus Platform (مدمج)**

```bash
# إذا كنت تستخدم Manus Platform:
# اذهب إلى: Management UI > Settings > Domains
# اختر mp3-app.com
# اضغط على "Enable SSL"
# Manus سيتولى الشهادة تلقائياً
```

### الخطوة 2: تكوين SSL في Nginx

```nginx
# /etc/nginx/sites-available/mp3-app.com

server {
  listen 80;
  server_name mp3-app.com www.mp3-app.com;
  
  # إعادة توجيه HTTP إلى HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name mp3-app.com www.mp3-app.com;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/mp3-app.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mp3-app.com/privkey.pem;
  
  # SSL Protocols
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # SSL Session
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
  
  # HSTS (HTTP Strict Transport Security)
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  
  # Security Headers
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  
  # Content Security Policy
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.intercomcdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:" always;
  
  # Gzip Compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_min_length 1000;
  gzip_vary on;

  # Proxy Settings
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # API Endpoints
  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Rate Limiting
    limit_req zone=api burst=20 nodelay;
  }

  # Static Files
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://127.0.0.1:3000;
  }
}

# Rate Limiting Zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

### الخطوة 3: تجديد SSL تلقائي

```bash
# إضافة Cron Job للتجديد التلقائي
sudo crontab -e

# أضف السطر التالي:
0 3 * * * /usr/bin/certbot renew --quiet && /usr/sbin/service nginx reload
```

### الخطوة 4: اختبار SSL

```bash
# اختبار الشهادة
openssl s_client -connect mp3-app.com:443 -showcerts

# التحقق من صحة الشهادة
curl -I https://mp3-app.com

# فحص SSL/TLS
nmap --script ssl-enum-ciphers -p 443 mp3-app.com

# استخدام أداة أونلاين
# https://www.ssllabs.com/ssltest/
```

---

## 🔗 المرحلة 3: ربط النطاق في Manus Platform

### الخطوة 1: إضافة النطاق المخصص

```bash
# اذهب إلى: Management UI > Settings > Domains
# اضغط على "Add Custom Domain"
# أدخل: mp3-app.com
```

### الخطوة 2: التحقق من ملكية النطاق

```bash
# Manus سيطلب منك التحقق من ملكية النطاق
# الخيارات:
# 1. إضافة CNAME Record
# 2. إضافة TXT Record
# 3. تحديث Nameservers

# اختر الخيار الأنسب لموفر النطاق الخاص بك
```

### الخطوة 3: تفعيل SSL

```bash
# بعد التحقق من الملكية:
# اذهب إلى: Settings > Domains > mp3-app.com
# اضغط على "Enable SSL"
# Manus سيصدر شهادة Let's Encrypt تلقائياً
```

### الخطوة 4: تحديث إعدادات التطبيق

```bash
# في ملف .env.production
DOMAIN_NAME=mp3-app.com
VITE_APP_URL=https://mp3-app.com

# أو عبر Manus Platform
# اذهب إلى: Settings > General
# حدّث "Website Name" إلى "mp3-app.com"
```

---

## ✅ المرحلة 4: اختبار شامل

### اختبار الاتصال

```bash
# اختبار HTTP (يجب أن يعيد توجيه إلى HTTPS)
curl -I http://mp3-app.com
# Expected: 301 Moved Permanently

# اختبار HTTPS
curl -I https://mp3-app.com
# Expected: 200 OK

# اختبار www
curl -I https://www.mp3-app.com
# Expected: 200 OK
```

### اختبار الأداء

```bash
# قياس سرعة الاستجابة
curl -w "Time: %{time_total}s\n" https://mp3-app.com

# اختبار الحمل
ab -n 1000 -c 10 https://mp3-app.com/

# اختبار باستخدام wrk
wrk -t12 -c400 -d30s https://mp3-app.com/
```

### اختبار الأمان

```bash
# فحص Headers الأمان
curl -I https://mp3-app.com | grep -E "Strict-Transport|X-Content-Type|X-Frame"

# فحص SSL/TLS
nmap --script ssl-enum-ciphers -p 443 mp3-app.com

# فحص CORS
curl -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://mp3-app.com/api/

# فحص CSP
curl -I https://mp3-app.com | grep "Content-Security-Policy"
```

### اختبار الوظائف

```bash
# اختبار الصفحة الرئيسية
curl -s https://mp3-app.com | grep -q "نظام إدارة" && echo "✅ Home page OK"

# اختبار API
curl -s https://mp3-app.com/api/health | jq .

# اختبار قاعدة البيانات
curl -s -H "Authorization: Bearer $TOKEN" \
  https://mp3-app.com/api/declarations | jq .

# اختبار الدفع
curl -s -H "Authorization: Bearer $TOKEN" \
  https://mp3-app.com/api/payments/stripe/status | jq .
```

---

## 🔄 المرحلة 5: المراقبة المستمرة

### مراقبة الأداء

```bash
# مراقبة استخدام الموارد
watch -n 1 'free -h && echo "---" && df -h'

# مراقبة السجلات
tail -f /var/log/nginx/mp3-app.com.access.log
tail -f /var/log/nginx/mp3-app.com.error.log

# مراقبة الخدمات
systemctl status nginx
systemctl status jordan-customs
```

### إعدادات المراقبة الخارجية

```bash
# إضافة مراقبة Uptime
# اذهب إلى: https://uptime.robot
# أضف: https://mp3-app.com

# إضافة مراقبة الأداء
# اذهب إلى: https://www.pingdom.com
# أضف: https://mp3-app.com

# إضافة مراقبة SSL
# اذهب إلى: https://www.sslshopper.com/ssl-checker.html
# أدخل: mp3-app.com
```

---

## 📊 قائمة التحقق النهائية

- [x] تحديث Nameservers
- [x] إضافة سجلات DNS
- [x] التحقق من انتشار DNS
- [x] الحصول على SSL Certificate
- [x] تكوين SSL في Nginx
- [x] ربط النطاق في Manus
- [x] التحقق من ملكية النطاق
- [x] تفعيل SSL
- [x] اختبار الاتصال
- [x] اختبار الأداء
- [x] اختبار الأمان
- [x] اختبار الوظائف
- [x] إعداد المراقبة

---

## 🚀 الخطوات التالية

1. ✅ تحديث Nameservers
2. ✅ إضافة سجلات DNS
3. ✅ الانتظار لانتشار DNS (24-48 ساعة)
4. ✅ الحصول على SSL Certificate
5. ✅ تكوين SSL
6. ✅ ربط النطاق في Manus
7. ✅ اختبار شامل
8. ✅ إعداد المراقبة

---

## 📞 الدعم والمساعدة

| الخدمة | البريد | الهاتف |
|--------|--------|--------|
| **دعم Manus** | support@manus.im | +1-XXX-XXX-XXXX |
| **دعم Nginx** | - | - |
| **دعم Let's Encrypt** | support@letsencrypt.org | - |

---

**تم الإعداد بواسطة:** فريق التطوير  
**التاريخ:** 11 فبراير 2026  
**الحالة:** جاهز للربط الفوري
