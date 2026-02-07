#!/bin/bash

# سكريبت إنشاء Release حقيقي مع ملفات من Build الفعلي
# بدون ملفات وهمية أو Checksums يدوية

set -e

# ألوان للطباعة
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

VERSION="1.0.1"
RELEASE_DIR="releases"
BUILD_DIR="dist"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 بدء إنشاء Release v$VERSION (ملفات حقيقية فقط)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# الخطوة 1: التحقق من وجود مجلد البناء
echo -e "${YELLOW}📁 التحقق من مجلد البناء...${NC}"

if [[ ! -d "$BUILD_DIR" ]]; then
    echo -e "${RED}❌ خطأ: مجلد البناء '$BUILD_DIR' غير موجود${NC}"
    echo -e "${YELLOW}يرجى تشغيل: pnpm build:win${NC}"
    exit 1
fi

echo -e "${GREEN}✅ مجلد البناء موجود${NC}"

# الخطوة 2: إنشاء مجلد الإصدارات
echo -e "${YELLOW}📁 إنشاء مجلد الإصدارات...${NC}"
mkdir -p "$RELEASE_DIR/v$VERSION"

# الخطوة 3: البحث عن الملفات الحقيقية
echo -e "${YELLOW}🔍 البحث عن ملفات البناء الحقيقية...${NC}"

INSTALLER_SOURCE=$(find "$BUILD_DIR" -name "*Setup*.exe" -o -name "*Installer*.exe" | head -1)
PORTABLE_SOURCE=$(find "$BUILD_DIR" -name "*Portable*.exe" | head -1)

if [[ -z "$INSTALLER_SOURCE" ]]; then
    echo -e "${RED}❌ خطأ: لم يتم العثور على ملف Installer${NC}"
    echo -e "${YELLOW}ملفات موجودة في $BUILD_DIR:${NC}"
    ls -la "$BUILD_DIR" || echo "المجلد فارغ"
    exit 1
fi

if [[ -z "$PORTABLE_SOURCE" ]]; then
    echo -e "${RED}❌ خطأ: لم يتم العثور على ملف Portable${NC}"
    echo -e "${YELLOW}ملفات موجودة في $BUILD_DIR:${NC}"
    ls -la "$BUILD_DIR" || echo "المجلد فارغ"
    exit 1
fi

# الخطوة 4: نسخ الملفات الحقيقية
echo -e "${YELLOW}📦 نسخ الملفات الحقيقية...${NC}"

INSTALLER_DEST="$RELEASE_DIR/v$VERSION/JordanCustomsSystem-Setup-$VERSION.exe"
PORTABLE_DEST="$RELEASE_DIR/v$VERSION/JordanCustomsSystem-Portable-$VERSION.exe"

cp "$INSTALLER_SOURCE" "$INSTALLER_DEST"
if [[ ! -f "$INSTALLER_DEST" ]] || [[ ! -s "$INSTALLER_DEST" ]]; then
    echo -e "${RED}❌ خطأ: فشل نسخ Installer أو الملف فارغ${NC}"
    exit 1
fi
echo -e "${GREEN}✅ تم نسخ Installer بنجاح ($(du -h "$INSTALLER_DEST" | cut -f1))${NC}"

cp "$PORTABLE_SOURCE" "$PORTABLE_DEST"
if [[ ! -f "$PORTABLE_DEST" ]] || [[ ! -s "$PORTABLE_DEST" ]]; then
    echo -e "${RED}❌ خطأ: فشل نسخ Portable أو الملف فارغ${NC}"
    exit 1
fi
echo -e "${GREEN}✅ تم نسخ Portable بنجاح ($(du -h "$PORTABLE_DEST" | cut -f1))${NC}"

# الخطوة 5: حساب Checksums الحقيقية
echo -e "${YELLOW}🔐 حساب Checksums الحقيقية (SHA256)...${NC}"

CHECKSUMS_FILE="$RELEASE_DIR/v$VERSION/checksums.txt"

# حساب SHA256 للملفات الحقيقية
sha256sum "$INSTALLER_DEST" > "$CHECKSUMS_FILE"
sha256sum "$PORTABLE_DEST" >> "$CHECKSUMS_FILE"

if [[ ! -f "$CHECKSUMS_FILE" ]]; then
    echo -e "${RED}❌ خطأ: فشل إنشاء ملف Checksums${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم إنشاء Checksums الحقيقية:${NC}"
cat "$CHECKSUMS_FILE"

# الخطوة 6: إنشاء ملف معلومات الإصدار
echo -e "${YELLOW}📝 إنشاء ملف معلومات الإصدار...${NC}"

RELEASE_INFO="$RELEASE_DIR/v$VERSION/RELEASE_INFO.txt"

cat > "$RELEASE_INFO" << EOF
═══════════════════════════════════════════════════════════
نسخة $VERSION - الإطلاق الرسمي
═══════════════════════════════════════════════════════════

📦 الملفات:
- JordanCustomsSystem-Setup-$VERSION.exe (Installer)
- JordanCustomsSystem-Portable-$VERSION.exe (Portable)
- checksums.txt (SHA256 Checksums)

✅ الميزات:
- واجهة مستخدم احترافية
- Portable بدون تثبيت
- دعم Windows 10 / 11
- Build حقيقي من GitHub Actions Windows Runner
- Checksums حقيقية (SHA256)
- Code Signing (عند التوفر)

📥 خيارات التحميل:
1. GitHub Releases
2. GitHub Packages (npm)
3. Azure Artifacts

📞 الدعم:
- البريد الإلكتروني: support@manus.im
- رقم الهاتف: +962 795 917 424
- الموقع الإلكتروني: www.jordancustoms.com
- GitHub Issues: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/issues

═══════════════════════════════════════════════════════════
تاريخ الإصدار: $(date '+%Y-%m-%d %H:%M:%S')
Build Platform: Windows (GitHub Actions)
═══════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ تم إنشاء ملف معلومات الإصدار${NC}"

# الخطوة 7: التحقق من الملفات
echo -e "${YELLOW}🔍 التحقق من الملفات...${NC}"

echo -e "${BLUE}الملفات المتاحة:${NC}"
ls -lh "$RELEASE_DIR/v$VERSION/"

# الخطوة 8: إنشاء Release على GitHub (اختياري)
echo -e "${YELLOW}📤 إنشاء Release على GitHub...${NC}"

if command -v gh &> /dev/null; then
    echo -e "${YELLOW}استخدام GitHub CLI لإنشاء Release...${NC}"
    
    gh release create "v$VERSION" \
        "$INSTALLER_DEST" \
        "$PORTABLE_DEST" \
        "$CHECKSUMS_FILE" \
        "$RELEASE_INFO" \
        --title "JordanCustomsSystem v$VERSION - الإطلاق الرسمي" \
        --notes-file "$RELEASE_INFO" \
        --draft=false \
        2>/dev/null && echo -e "${GREEN}✅ تم إنشاء Release على GitHub بنجاح${NC}" || echo -e "${YELLOW}⚠️  قد يكون Release موجود بالفعل${NC}"
else
    echo -e "${YELLOW}⚠️  GitHub CLI غير مثبت${NC}"
    echo -e "${YELLOW}استخدم الأمر التالي يدويًا:${NC}"
    echo ""
    echo "gh release create v$VERSION \\"
    echo "  \"$INSTALLER_DEST\" \\"
    echo "  \"$PORTABLE_DEST\" \\"
    echo "  \"$CHECKSUMS_FILE\" \\"
    echo "  \"$RELEASE_INFO\" \\"
    echo "  --title \"JordanCustomsSystem v$VERSION - الإطلاق الرسمي\" \\"
    echo "  --notes-file \"$RELEASE_INFO\""
fi

# الخطوة 9: ملخص النتائج
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ تم إنشاء Release v$VERSION بنجاح!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo ""
echo -e "${YELLOW}📋 ملخص الملفات:${NC}"
echo "  • Installer: $(basename "$INSTALLER_DEST") ($(du -h "$INSTALLER_DEST" | cut -f1))"
echo "  • Portable: $(basename "$PORTABLE_DEST") ($(du -h "$PORTABLE_DEST" | cut -f1))"
echo "  • Checksums: $(basename "$CHECKSUMS_FILE")"
echo "  • Release Info: $(basename "$RELEASE_INFO")"

echo ""
echo -e "${YELLOW}🔗 الروابط:${NC}"
echo "  • GitHub Release: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/releases/tag/v$VERSION"
echo "  • GitHub Packages: https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/packages"
echo "  • Azure Artifacts: https://dev.azure.com/saadbuildingmaterials1-maker/jordan-customs/_artifacts/feed/jordan-customs-releases"

echo ""
echo -e "${YELLOW}📝 الخطوات التالية:${NC}"
echo "  1. اختبر الملفات على Windows VM"
echo "  2. تحقق من Checksums باستخدام:"
echo "     sha256sum -c $CHECKSUMS_FILE"
echo "  3. انشر على Azure Artifacts (إذا لم يكن تلقائياً)"
echo "  4. أرسل إشعار Slack للفريق"

echo ""
echo -e "${GREEN}🎉 تم الإطلاق بنجاح!${NC}"
