# تعليمات نشر نظام إدارة تكاليف الشحن والجمارك الأردنية

هذا الدليل يشرح كيفية نشر التطبيق على استضافة مستقلة (VPS أو خادم خاص) بدون أي dependencies على Manus.

## المتطلبات الأساسية

- خادم Linux (Ubuntu 20.04+ مفضل)
- Docker و Docker Compose
- نطاق خاص (مثل mp3-app.com)
- قاعدة بيانات MySQL 8.0+

## الخطوة 1: إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تثبيت Docker Compose
sudo apt install docker-compose -y

# إضافة المستخدم الحالي لمجموعة docker
sudo usermod -aG docker $USER
newgrp docker
```

## الخطوة 2: رفع الكود إلى الخادم

```bash
# على جهازك المحلي، قم بضغط المشروع
cd /home/ubuntu/jordan-customs-system
tar -czf jordan-customs-system.tar.gz .

# رفع الملف إلى الخادم
scp jordan-customs-system.tar.gz user@your-server-ip:/home/user/

# على الخادم، فك الضغط
ssh user@your-server-ip
cd /home/user
tar -xzf jordan-customs-system.tar.gz
cd jordan-customs-system
```

## الخطوة 3: إعداد المتغيرات البيئية

```bash
# إنشاء ملف .env
nano .env
```

أضف المتغيرات التالية:

```env
# Database Configuration
DATABASE_URL=mysql://customs_user:your_password@db:3306/jordan_customs
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=jordan_customs
MYSQL_USER=customs_user
MYSQL_PASSWORD=your_password_here

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_here_generate_random_string

# Server Configuration
NODE_ENV=production
PORT=3000
```

**ملاحظة مهمة:** قم بتوليد JWT_SECRET عشوائي قوي:
```bash
openssl rand -base64 32
```

## الخطوة 4: بناء ونشر التطبيق

```bash
# بناء وتشغيل الحاويات
docker-compose up -d --build

# التحقق من حالة الحاويات
docker-compose ps

# عرض logs
docker-compose logs -f app
```

## الخطوة 5: إعداد Nginx كـ Reverse Proxy

```bash
# تثبيت Nginx
sudo apt install nginx -y

# إنشاء ملف تكوين للموقع
sudo nano /etc/nginx/sites-available/mp3-app.com
```

أضف التكوين التالي:

```nginx
server {
    listen 80;
    server_name mp3-app.com www.mp3-app.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/mp3-app.com /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

## الخطوة 6: تفعيل SSL مع Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d mp3-app.com -d www.mp3-app.com

# التجديد التلقائي
sudo certbot renew --dry-run
```

## الخطوة 7: إعداد قاعدة البيانات

```bash
# الدخول إلى حاوية قاعدة البيانات
docker-compose exec db mysql -u root -p

# إنشاء الجداول (سيتم تنفيذها تلقائياً عند أول تشغيل)
# أو يمكنك تنفيذ migrations يدوياً:
docker-compose exec app pnpm db:push
```

## الخطوة 8: إنشاء أول مستخدم admin

```bash
# الدخول إلى حاوية التطبيق
docker-compose exec app sh

# تشغيل Node REPL
node

# تنفيذ الكود التالي:
```

```javascript
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await connection.execute(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin@mp3-app.com', hashedPassword, 'المدير', 'admin']
  );
  
  console.log('Admin user created successfully!');
  await connection.end();
}

createAdmin();
```

## الخطوة 9: التحقق من عمل التطبيق

1. افتح المتصفح وانتقل إلى https://mp3-app.com
2. سجل دخول باستخدام:
   - البريد: admin@mp3-app.com
   - كلمة المرور: admin123
3. غيّر كلمة المرور فوراً!

## الخطوة 10: إعداد Firewall

```bash
# تفعيل UFW
sudo ufw enable

# السماح بالمنافذ الضرورية
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# التحقق من الحالة
sudo ufw status
```

## الصيانة والتحديثات

### إعادة تشغيل التطبيق
```bash
docker-compose restart app
```

### تحديث الكود
```bash
# إيقاف الحاويات
docker-compose down

# تحديث الكود
git pull  # إذا كنت تستخدم Git
# أو رفع ملف جديد

# إعادة البناء والتشغيل
docker-compose up -d --build
```

### النسخ الاحتياطي لقاعدة البيانات
```bash
# إنشاء نسخة احتياطية
docker-compose exec db mysqldump -u root -p jordan_customs > backup_$(date +%Y%m%d).sql

# استعادة من نسخة احتياطية
docker-compose exec -T db mysql -u root -p jordan_customs < backup_20260222.sql
```

### عرض Logs
```bash
# logs التطبيق
docker-compose logs -f app

# logs قاعدة البيانات
docker-compose logs -f db
```

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
# التحقق من حالة الحاويات
docker-compose ps

# عرض logs
docker-compose logs app

# إعادة تشغيل
docker-compose restart app
```

### مشاكل قاعدة البيانات
```bash
# التحقق من الاتصال
docker-compose exec app sh
ping db

# التحقق من MySQL
docker-compose exec db mysql -u root -p -e "SHOW DATABASES;"
```

### مشاكل SSL
```bash
# تجديد الشهادة
sudo certbot renew

# التحقق من تاريخ انتهاء الصلاحية
sudo certbot certificates
```

## الأمان

1. **تغيير كلمات المرور الافتراضية** فوراً
2. **تفعيل Two-Factor Authentication** (إذا كان متاحاً)
3. **تحديث النظام بانتظام**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **مراقبة Logs** بانتظام للكشف عن أي نشاط مشبوه
5. **النسخ الاحتياطي اليومي** لقاعدة البيانات

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من logs: `docker-compose logs -f`
2. تحقق من حالة الحاويات: `docker-compose ps`
3. تحقق من المتغيرات البيئية في `.env`
4. تأكد من أن جميع المنافذ مفتوحة في Firewall

---

**ملاحظة:** هذا التطبيق الآن مستقل تماماً ولا يعتمد على أي خدمات خارجية (Manus, amplitude, plausible, إلخ). جميع البيانات والمعالجة تتم على خادمك الخاص.
