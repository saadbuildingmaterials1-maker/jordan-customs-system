# المتغيرات البيئية المطلوبة

## قاعدة البيانات (Database)

```env
DATABASE_URL=mysql://customs_user:your_password@db:3306/jordan_customs
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=jordan_customs
MYSQL_USER=customs_user
MYSQL_PASSWORD=your_password_here
```

## الأمان (Security)

```env
# JWT Secret - قم بتوليد مفتاح عشوائي قوي باستخدام:
# openssl rand -base64 32
JWT_SECRET=your_jwt_secret_here_generate_random_string
```

## إعدادات الخادم (Server)

```env
NODE_ENV=production
PORT=3000
```

## إعدادات التطبيق (Application)

```env
VITE_APP_TITLE=نظام إدارة تكاليف الشحن والجمارك الأردنية
VITE_APP_LOGO=/logo.png
```

## النطاق (Domain)

```env
DOMAIN=mp3-app.com
```

---

## ملاحظات مهمة:

1. **لا تشارك هذه المتغيرات أبداً** في أي repository عام
2. **قم بتغيير جميع كلمات المرور** إلى قيم قوية وعشوائية
3. **JWT_SECRET** يجب أن يكون عشوائياً تماماً وطويلاً (32 حرف على الأقل)
4. استخدم `.env` للتطوير المحلي و environment variables في الإنتاج

## توليد قيم آمنة:

```bash
# توليد JWT Secret
openssl rand -base64 32

# توليد كلمة مرور عشوائية
openssl rand -base64 16
```
