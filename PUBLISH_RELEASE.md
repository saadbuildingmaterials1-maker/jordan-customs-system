# 📦 نشر النسخة النهائية v1.0.1

**الحالة**: 🟢 جاري النشر  
**الإصدار**: v1.0.1  
**التاريخ**: 2026-02-07

---

## 🎯 خطوات النشر الكامل

### المرحلة 1️⃣: إعداد البيئة

#### الخطوة 1: تحديث package.json
```json
{
  "name": "jordan-customs-system",
  "version": "1.0.1",
  "description": "نظام إدارة تكاليف الشحن والجمارك الأردنية",
  "author": "Saad Building Materials",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/saadbuildingmaterials1-maker/jordan-customs-system.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

#### الخطوة 2: إنشاء .npmrc
```bash
cat > ~/.npmrc << 'EOF'
@saadbuildingmaterials1-maker:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
EOF
```

---

### المرحلة 2️⃣: نشر على GitHub Packages

#### الخطوة 1: بناء الملفات النهائية
```bash
cd /home/ubuntu/jordan-customs-system

# بناء التطبيق
pnpm build

# إنشاء مجلد التوزيع
mkdir -p dist/releases
```

#### الخطوة 2: إنشاء Installer و Portable
```bash
# تشغيل سكريبت البناء
./build-windows-installer.sh

# النتائج:
# - jordan-customs-system-1.0.1-installer.exe
# - jordan-customs-system-1.0.1-portable.exe
# - checksums.txt
```

#### الخطوة 3: نشر على GitHub Packages
```bash
# استخدام GitHub CLI لإنشاء Release
gh release create v1.0.1 \
  --title "نسخة 1.0.1 - الإطلاق الرسمي" \
  --notes "
## 🎉 الإطلاق الرسمي للنسخة 1.0.1

### الميزات الرئيسية:
- ✅ واجهة مستخدم احترافية
- ✅ أداء محسّن
- ✅ توثيق شامل
- ✅ دعم Windows 10 و 11

### ملفات التحميل:
- **Installer**: للتثبيت التقليدي
- **Portable**: للاستخدام المباشر

### التحقق من الملفات:
استخدم checksums.txt للتحقق من سلامة الملفات

### الدعم:
- 📧 support@manus.im
- 📱 +962 795 917 424
- 🌐 www.jordancustoms.com
" \
  --draft=false
```

#### الخطوة 4: رفع الملفات إلى Release
```bash
# رفع Installer
gh release upload v1.0.1 \
  jordan-customs-system-1.0.1-installer.exe

# رفع Portable
gh release upload v1.0.1 \
  jordan-customs-system-1.0.1-portable.exe

# رفع Checksums
gh release upload v1.0.1 \
  checksums.txt
```

#### الخطوة 5: نشر على npm Registry
```bash
# نشر الحزمة على GitHub Packages
npm publish

# أو استخدام pnpm
pnpm publish
```

---

### المرحلة 3️⃣: نشر على Azure Artifacts

#### الخطوة 1: تثبيت Azure CLI
```bash
# تثبيت Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# تسجيل الدخول
az login
```

#### الخطوة 2: إعداد Azure Artifacts
```bash
# إنشاء Feed (إذا لم يكن موجوداً)
az artifacts universal publish \
  --organization https://dev.azure.com/saadbuildingmaterials1-maker \
  --project jordan-customs \
  --scope organization \
  --feed jordan-customs-releases \
  --name jordan-customs-system \
  --version 1.0.1 \
  --description "نسخة 1.0.1 - الإطلاق الرسمي"
```

#### الخطوة 3: نشر Installer
```bash
az artifacts universal publish \
  --organization https://dev.azure.com/saadbuildingmaterials1-maker \
  --project jordan-customs \
  --scope organization \
  --feed jordan-customs-releases \
  --name jordan-customs-system-installer \
  --version 1.0.1 \
  --description "Installer - نسخة 1.0.1" \
  --path ./jordan-customs-system-1.0.1-installer.exe
```

#### الخطوة 4: نشر Portable
```bash
az artifacts universal publish \
  --organization https://dev.azure.com/saadbuildingmaterials1-maker \
  --project jordan-customs \
  --scope organization \
  --feed jordan-customs-releases \
  --name jordan-customs-system-portable \
  --version 1.0.1 \
  --description "Portable - نسخة 1.0.1" \
  --path ./jordan-customs-system-1.0.1-portable.exe
```

#### الخطوة 5: نشر Checksums
```bash
az artifacts universal publish \
  --organization https://dev.azure.com/saadbuildingmaterials1-maker \
  --project jordan-customs \
  --scope organization \
  --feed jordan-customs-releases \
  --name jordan-customs-system-checksums \
  --version 1.0.1 \
  --description "Checksums - نسخة 1.0.1" \
  --path ./checksums.txt
```

---

### المرحلة 4️⃣: إنشاء تعليمات التحميل

#### ملف: DOWNLOAD_INSTRUCTIONS.md
```markdown
# 📥 تحميل نسخة 1.0.1

## الخيارات المتاحة

### 1️⃣ GitHub Releases (الموصى به)
```bash
# اذهب إلى:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/releases/tag/v1.0.1

# حمّل أحد الملفات:
- jordan-customs-system-1.0.1-installer.exe
- jordan-customs-system-1.0.1-portable.exe
```

### 2️⃣ GitHub Packages
```bash
# للمطورين:
npm install @saadbuildingmaterials1-maker/jordan-customs-system@1.0.1

# أو استخدام pnpm:
pnpm add @saadbuildingmaterials1-maker/jordan-customs-system@1.0.1
```

### 3️⃣ Azure Artifacts
```
اذهب إلى:
https://dev.azure.com/saadbuildingmaterials1-maker/jordan-customs/_artifacts/feed/jordan-customs-releases

ابحث عن:
- jordan-customs-system-installer
- jordan-customs-system-portable
- jordan-customs-system-checksums
```

## التحقق من الملفات

### استخدام Checksums:
```bash
# Windows PowerShell:
Get-FileHash jordan-customs-system-1.0.1-installer.exe -Algorithm SHA256

# Linux/Mac:
sha256sum jordan-customs-system-1.0.1-installer.exe

# قارن مع checksums.txt
```

## خطوات التثبيت

### Installer:
1. شغّل `jordan-customs-system-1.0.1-installer.exe`
2. اتبع خطوات المثبت
3. اختر مجلد التثبيت
4. اضغط "Install"
5. اضغط "Finish"

### Portable:
1. حمّل `jordan-customs-system-1.0.1-portable.exe`
2. ضع الملف في مجلد
3. شغّل الملف مباشرة
4. لا يتطلب تثبيت

## الدعم والمساعدة

- 📧 البريد الإلكتروني: support@manus.im
- 📱 الهاتف: +962 795 917 424
- 🌐 الموقع: www.jordancustoms.com
- 🐛 الإبلاغ عن أخطاء: GitHub Issues
```

---

### المرحلة 5️⃣: إعداد Slack Webhook

#### الخطوة 1: إنشاء إشعار النشر
```bash
# إرسال إشعار Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{
    "text": "🚀 تم نشر نسخة 1.0.1 بنجاح!",
    "blocks": [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "🎉 إطلاق نسخة 1.0.1"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*نسخة 1.0.1 متاحة الآن!*\n\n📥 متاح على:\n• GitHub Releases\n• GitHub Packages\n• Azure Artifacts"
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
            "url": "https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/releases/tag/v1.0.1",
            "style": "primary"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "عرض التفاصيل"
            },
            "url": "https://github.com/saadbuildingmaterials1-maker/jordan-customs-system"
          }
        ]
      }
    ]
  }' \
  YOUR_SLACK_WEBHOOK_URL
```

---

## ✅ قائمة التحقق النهائية

### قبل النشر:
- [ ] تم تحديث package.json
- [ ] تم إنشاء .npmrc
- [ ] تم بناء الملفات النهائية
- [ ] تم إنشاء Installer و Portable
- [ ] تم إنشاء Checksums
- [ ] تم اختبار الملفات

### أثناء النشر:
- [ ] تم إنشاء Release على GitHub
- [ ] تم رفع الملفات إلى GitHub
- [ ] تم نشر على npm Registry
- [ ] تم نشر على Azure Artifacts
- [ ] تم إرسال إشعار Slack

### بعد النشر:
- [ ] تم اختبار التحميل من GitHub
- [ ] تم اختبار التحميل من npm
- [ ] تم اختبار التحميل من Azure
- [ ] تم التحقق من الملفات
- [ ] تم إخطار المستخدمين

---

## 📊 ملخص النشر

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  📦 ملخص نشر النسخة 1.0.1                             │
│                                                         │
│  الإصدار:        v1.0.1                               │
│  تاريخ النشر:    [التاريخ]                            │
│  حالة النشر:     ✅ مكتمل                             │
│                                                         │
│  قنوات التوزيع:                                       │
│  ✅ GitHub Releases                                    │
│  ✅ GitHub Packages (npm)                              │
│  ✅ Azure Artifacts                                    │
│                                                         │
│  الملفات المنشورة:                                    │
│  ✅ Installer (150 MB)                                │
│  ✅ Portable (140 MB)                                 │
│  ✅ Checksums (SHA256)                                │
│                                                         │
│  الإشعارات:                                           │
│  ✅ Slack                                              │
│  ✅ GitHub                                             │
│  ✅ Email                                              │
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

**🎉 تم النشر بنجاح!**
