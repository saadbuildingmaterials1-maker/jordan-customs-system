# 🚀 دليل الإطلاق الرسمي الكامل

**الإصدار**: v1.0.1  
**تاريخ الإطلاق**: [أضف التاريخ]  
**الحالة**: 🔴 جاري الإطلاق

---

## 📋 خطوات الإطلاق الرسمي

### 1️⃣ بناء النسخة النهائية (v1.0.1)

#### الخطوة 1: إنشاء Release Branch
```bash
git checkout -b release/v1.0.1
git push origin release/v1.0.1
```

#### الخطوة 2: تحديث الإصدار في package.json
```json
{
  "version": "1.0.1",
  "name": "jordan-customs-system",
  "description": "نظام إدارة تكاليف الشحن والجمارك الأردنية"
}
```

#### الخطوة 3: بناء Installer و Portable
```bash
# تشغيل GitHub Actions
git push origin main

# أو بناء محلي
./build-windows-installer.sh
```

**النتائج المتوقعة:**
- ✅ `jordan-customs-system-1.0.1-installer.exe` (حجم: ~150 MB)
- ✅ `jordan-customs-system-1.0.1-portable.exe` (حجم: ~140 MB)
- ✅ `checksums.txt` (SHA256)

---

### 2️⃣ نشر على GitHub Packages

#### الخطوة 1: إعداد GitHub Packages
```bash
# إنشاء .npmrc في المشروع
echo "@saadbuildingmaterials1-maker:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

#### الخطوة 2: نشر الملفات
```bash
# نشر على npm.pkg.github.com
npm publish

# أو نشر يدوي للملفات الثنائية
gh release create v1.0.1 \
  jordan-customs-system-1.0.1-installer.exe \
  jordan-customs-system-1.0.1-portable.exe \
  --title "نسخة 1.0.1" \
  --notes "الإصدار الأول الرسمي"
```

#### الخطوة 3: تعليمات التحميل
```markdown
## تحميل من GitHub Packages

### للمطورين:
```bash
npm install @saadbuildingmaterials1-maker/jordan-customs-system@1.0.1
```

### للمستخدمين:
1. اذهب إلى GitHub Releases
2. حمّل الملف المناسب (Installer أو Portable)
3. شغّل الملف
```

---

### 3️⃣ نشر على Azure Artifacts

#### الخطوة 1: إعداد Azure Account
```bash
# تسجيل الدخول إلى Azure
az login

# إنشاء Feed
az artifacts universal publish \
  --organization https://dev.azure.com/saadbuildingmaterials1-maker \
  --project jordan-customs \
  --scope organization \
  --feed jordan-customs-releases
```

#### الخطوة 2: نشر الملفات
```bash
# نشر Installer
az artifacts universal publish \
  --name jordan-customs-system \
  --version 1.0.1 \
  --description "نسخة 1.0.1" \
  --path jordan-customs-system-1.0.1-installer.exe

# نشر Portable
az artifacts universal publish \
  --name jordan-customs-system-portable \
  --version 1.0.1 \
  --description "نسخة 1.0.1 محمولة" \
  --path jordan-customs-system-1.0.1-portable.exe
```

#### الخطوة 3: تعليمات التحميل
```markdown
## تحميل من Azure Artifacts

### الرابط المباشر:
https://dev.azure.com/saadbuildingmaterials1-maker/jordan-customs/_artifacts/feed/jordan-customs-releases

### خطوات التحميل:
1. اذهب إلى Azure Artifacts
2. ابحث عن "jordan-customs-system"
3. حمّل الإصدار 1.0.1
```

---

### 4️⃣ إعداد Slack Webhook

#### الخطوة 1: إنشاء Slack App
```
1. اذهب إلى https://api.slack.com/apps
2. اختر "Create New App"
3. اختر "From scratch"
4. أدخل الاسم: "Jordan Customs Releases"
5. اختر Workspace
```

#### الخطوة 2: تفعيل Incoming Webhooks
```
1. اذهب إلى "Incoming Webhooks"
2. فعّل "Activate Incoming Webhooks"
3. اضغط "Add New Webhook to Workspace"
4. اختر القناة: #releases
5. انسخ Webhook URL
```

#### الخطوة 3: إضافة إلى GitHub Secrets
```bash
# أضف إلى GitHub Secrets
gh secret set SLACK_WEBHOOK_URL -b "YOUR_WEBHOOK_URL"
```

#### الخطوة 4: اختبار الإشعار
```bash
# إرسال إشعار تجريبي
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚀 نسخة 1.0.1 جاهزة للإطلاق!"}' \
  YOUR_WEBHOOK_URL
```

---

### 5️⃣ نشر GitHub Wiki

#### الخطوة 1: تفعيل Wiki
```
1. اذهب إلى Settings
2. تفعيل "Wiki"
3. اختر "Create the first page"
```

#### الخطوة 2: إنشاء الصفحات

**الصفحة 1: Home**
```markdown
# نظام إدارة تكاليف الشحن والجمارك الأردنية

مرحباً بك في نظام إدارة تكاليف الشحن والجمارك الأردنية!

## الميزات الرئيسية
- ✅ إدارة تكاليف الشحن
- ✅ حساب الجمارك التلقائي
- ✅ تقارير شاملة
- ✅ واجهة سهلة الاستخدام

## البدء السريع
1. [التحميل](Installation)
2. [الاستخدام](User-Guide)
3. [الأسئلة الشائعة](FAQ)
```

**الصفحة 2: Installation**
```markdown
# دليل التثبيت

## المتطلبات
- Windows 10 أو أحدث
- 200 MB مساحة حرة
- اتصال إنترنت

## خطوات التثبيت

### الطريقة 1: Installer
1. حمّل `jordan-customs-system-1.0.1-installer.exe`
2. شغّل الملف
3. اتبع خطوات التثبيت
4. اضغط "Finish"

### الطريقة 2: Portable
1. حمّل `jordan-customs-system-1.0.1-portable.exe`
2. ضع الملف في مجلد
3. شغّل الملف مباشرة
```

**الصفحة 3: User-Guide**
```markdown
# دليل الاستخدام

## الواجهة الرئيسية
- القائمة العلوية
- الشريط الجانبي
- منطقة المحتوى

## الميزات الأساسية
1. إضافة شحنة جديدة
2. حساب التكاليف
3. عرض التقارير
4. تصدير البيانات
```

**الصفحة 4: FAQ**
```markdown
# الأسئلة الشائعة

## س: كيف أثبت البرنامج؟
ج: اتبع دليل التثبيت

## س: هل يعمل على Mac؟
ج: حالياً يعمل على Windows فقط

## س: كيف أبلغ عن خطأ؟
ج: استخدم GitHub Issues
```

---

### 6️⃣ الإطلاق الرسمي على GitHub Releases

#### الخطوة 1: إنشاء Tag
```bash
git tag -a v1.0.1 -m "الإصدار الأول الرسمي - v1.0.1"
git push origin v1.0.1
```

#### الخطوة 2: إنشاء Release
```bash
# استخدام GitHub CLI
gh release create v1.0.1 \
  jordan-customs-system-1.0.1-installer.exe \
  jordan-customs-system-1.0.1-portable.exe \
  --title "نسخة 1.0.1 - الإطلاق الرسمي" \
  --notes "
## 🎉 الإطلاق الرسمي

### الميزات الجديدة
- ✅ واجهة احترافية
- ✅ أداء محسّن
- ✅ توثيق شامل

### التحميل
- **Installer**: للمستخدمين الجدد
- **Portable**: للاستخدام المباشر

### الدعم
- 📧 support@manus.im
- 📱 +962 795 917 424
- 🌐 www.jordancustoms.com
" \
  --draft=false
```

#### الخطوة 3: إضافة Checksums
```bash
# إنشاء checksums
sha256sum jordan-customs-system-1.0.1-installer.exe > checksums.txt
sha256sum jordan-customs-system-1.0.1-portable.exe >> checksums.txt

# إضافة إلى Release
gh release upload v1.0.1 checksums.txt
```

#### الخطوة 4: إرسال إشعار Slack
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{
    "text": "🚀 تم إطلاق نسخة 1.0.1 رسمياً!",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*🚀 نسخة 1.0.1 متاحة الآن!*\n\n📥 التحميل من GitHub Releases\n📦 GitHub Packages\n☁️ Azure Artifacts"
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "تحميل الآن"
            },
            "url": "https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/releases/tag/v1.0.1"
          }
        ]
      }
    ]
  }' \
  YOUR_WEBHOOK_URL
```

---

## ✅ قائمة التحقق النهائية

### قبل الإطلاق:
- [ ] تم بناء Installer و Portable بنجاح
- [ ] تم اختبار الملفات على Windows 10 و 11
- [ ] تم إنشاء Checksums
- [ ] تم إعداد GitHub Packages
- [ ] تم إعداد Azure Artifacts
- [ ] تم إعداد Slack Webhook
- [ ] تم نشر GitHub Wiki
- [ ] تم إنشاء Release على GitHub

### بعد الإطلاق:
- [ ] تم اختبار التحميل من GitHub Releases
- [ ] تم اختبار التحميل من GitHub Packages
- [ ] تم اختبار التحميل من Azure Artifacts
- [ ] تم استقبال إشعار Slack
- [ ] تم إخطار المستخدمين

---

## 📊 ملخص الإطلاق

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🚀 ملخص الإطلاق الرسمي                               │
│                                                         │
│  الإصدار:        v1.0.1                               │
│  تاريخ الإطلاق:  [التاريخ]                            │
│  حالة الإطلاق:   ✅ مكتمل                             │
│                                                         │
│  قنوات التوزيع:                                       │
│  ✅ GitHub Releases                                    │
│  ✅ GitHub Packages                                    │
│  ✅ Azure Artifacts                                    │
│                                                         │
│  الإشعارات:                                           │
│  ✅ Slack                                              │
│  ✅ Email                                              │
│  ✅ GitHub                                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 معلومات الاتصال

```
البريد الإلكتروني: support@manus.im
رقم الهاتف: +962 795 917 424
الموقع الإلكتروني: www.jordancustoms.com
GitHub: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system
```

---

**🎉 تم الإطلاق الرسمي بنجاح!**
