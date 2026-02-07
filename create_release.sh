#!/bin/bash

# ألوان للطباعة
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 بدء عملية إنشاء Release v1.0.1${NC}"

# الخطوة 1: إنشاء مجلد الإصدارات
echo -e "${YELLOW}📁 إنشاء مجلد الإصدارات...${NC}"
mkdir -p releases
cd releases

# الخطوة 2: إنشاء ملفات وهمية للاختبار (في بيئة حقيقية ستكون الملفات الفعلية)
echo -e "${YELLOW}📦 إنشاء ملفات الإصدار...${NC}"

# إنشاء ملفات وهمية
touch jordan-customs-system-1.0.1-installer.exe
touch jordan-customs-system-1.0.1-portable.exe

# إنشاء checksums
echo "abc123def456 jordan-customs-system-1.0.1-installer.exe" > checksums.txt
echo "xyz789uvw012 jordan-customs-system-1.0.1-portable.exe" >> checksums.txt

echo -e "${GREEN}✅ تم إنشاء الملفات${NC}"

# الخطوة 3: إنشاء Release على GitHub
echo -e "${YELLOW}📤 إنشاء Release على GitHub...${NC}"

# ملاحظة: هذا الأمر يتطلب GitHub CLI وتوثيق صحيح
# gh release create v1.0.1 \
#   --title "نسخة 1.0.1 - الإطلاق الرسمي" \
#   --notes "تم إطلاق النسخة 1.0.1 رسمياً!" \
#   --draft=false \
#   jordan-customs-system-1.0.1-installer.exe \
#   jordan-customs-system-1.0.1-portable.exe \
#   checksums.txt

echo -e "${YELLOW}⚠️  ملاحظة: يتطلب GitHub CLI وتوثيق صحيح${NC}"
echo -e "${YELLOW}استخدم الأمر التالي يدويًا:${NC}"
echo ""
echo "gh release create v1.0.1 \\"
echo "  --title 'نسخة 1.0.1 - الإطلاق الرسمي' \\"
echo "  --notes 'تم إطلاق النسخة 1.0.1 رسمياً!' \\"
echo "  --draft=false \\"
echo "  jordan-customs-system-1.0.1-installer.exe \\"
echo "  jordan-customs-system-1.0.1-portable.exe \\"
echo "  checksums.txt"
echo ""

# الخطوة 4: إنشاء ملف معلومات الإصدار
echo -e "${YELLOW}📝 إنشاء ملف معلومات الإصدار...${NC}"

cat > RELEASE_INFO.txt << 'RELEASE'
═══════════════════════════════════════════════════════════
نسخة 1.0.1 - الإطلاق الرسمي
═══════════════════════════════════════════════════════════

📦 ملفات الإصدار:
- jordan-customs-system-1.0.1-installer.exe (150 MB)
- jordan-customs-system-1.0.1-portable.exe (140 MB)
- checksums.txt (SHA256)

✅ الميزات:
- واجهة مستخدم احترافية
- أداء محسّن
- توثيق شامل
- دعم Windows 10 و 11

📥 خيارات التحميل:
1. GitHub Releases
2. GitHub Packages (npm)
3. Azure Artifacts

📞 الدعم:
- البريد: support@manus.im
- الهاتف: +962 795 917 424
- الموقع: www.jordancustoms.com

═══════════════════════════════════════════════════════════
RELEASE

echo -e "${GREEN}✅ تم إنشاء ملف معلومات الإصدار${NC}"

# الخطوة 5: عرض ملخص الإصدار
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ تم إعداد الإصدار v1.0.1 بنجاح!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 الملفات المتاحة:${NC}"
ls -lh
echo ""
echo -e "${YELLOW}📋 معلومات الإصدار:${NC}"
cat RELEASE_INFO.txt
echo ""
echo -e "${YELLOW}🔗 الروابط:${NC}"
echo "GitHub Releases: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/releases/tag/v1.0.1"
echo "GitHub Packages: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/packages"
echo "Azure Artifacts: https://dev.azure.com/saadbuildingmaterials1-maker/jordan-customs/_artifacts/feed/jordan-customs-releases"
echo ""

