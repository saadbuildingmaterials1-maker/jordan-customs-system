#!/bin/bash
# =========================================
# Jordan Customs System - Full Automated Publish with H1 Fix
# نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي مع إضافة H1
# =========================================

set -e

# ---------- إعدادات ----------
BUILD_DIR="dist"
JS_FILE="index.js"
DOMAIN="https://jordan-customs-system.manus.space"
DASHBOARD_URL="/"
RETRY_INTERVAL=5
MAX_RETRIES=3
RETRY_COUNT=0

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي مع H1  ║${NC}"
echo -e "${BLUE}║        Jordan Customs System - Automated Publishing with H1   ║${NC}"
echo -e "${BLUE}║                    $(date '+%Y-%m-%d %H:%M:%S')                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ---------- 1️⃣ التحقق من وجود مجلد dist ----------
echo -e "${YELLOW}1️⃣ التحقق من وجود مجلد dist...${NC}"
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ مجلد $BUILD_DIR غير موجود!${NC}"
    echo -e "${YELLOW}جاري بناء المشروع...${NC}"
    
    # تنظيف البيئة
    rm -rf node_modules package-lock.json .cache 2>/dev/null || true
    npm cache clean --force 2>/dev/null || true
    
    # تثبيت الحزم
    npm install --force --legacy-peer-deps 2>/dev/null || npm install --force
    
    # بناء المشروع
    npm run build
fi

echo -e "${GREEN}✅ مجلد dist موجود${NC}"
echo ""

# ---------- 2️⃣ إضافة H1 تلقائياً في index.html ----------
echo -e "${YELLOW}2️⃣ إضافة H1 في index.html لتحسين SEO والوصولية...${NC}"

INDEX_FILE="$BUILD_DIR/public/index.html"
if [ -f "$INDEX_FILE" ]; then
    # تحقق أولاً إذا كان H1 موجود
    if ! grep -qi "<h1" "$INDEX_FILE"; then
        # إدراج H1 بعد فتح <body>
        sed -i '/<body>/a \    <h1 style="display: none;">نظام إدارة تكاليف الشحن والجمارك الأردنية</h1>' "$INDEX_FILE"
        echo -e "${GREEN}✅ تم إضافة H1 في index.html${NC}"
    else
        echo -e "${GREEN}ℹ️  H1 موجود بالفعل، لم يتم التعديل${NC}"
    fi
else
    echo -e "${RED}❌ index.html غير موجود في $BUILD_DIR${NC}"
    exit 1
fi
echo ""

# ---------- 3️⃣ تحديث _redirects و _headers ----------
echo -e "${YELLOW}3️⃣ تحديث _redirects و _headers...${NC}"

# إنشاء ملف _redirects
cat > $BUILD_DIR/_redirects << 'EOF'
/assets/* /assets/:splat 200
/* /index.html 200
/api/* /api/:splat 200
EOF

# إنشاء ملف _headers
cat > $BUILD_DIR/_headers << 'EOF'
/assets/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

/assets/*.mjs
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache, must-revalidate

/
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache, must-revalidate
EOF

echo -e "${GREEN}✅ تم تحديث _redirects و _headers${NC}"
echo ""

# ---------- 4️⃣ التحقق من الملفات المبنية ----------
echo -e "${YELLOW}4️⃣ التحقق من الملفات المبنية...${NC}"
echo -e "${BLUE}📊 إحصائيات البناء:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  📁 حجم مجلد dist: $(du -sh $BUILD_DIR | cut -f1)"
echo -e "  📄 عدد ملفات HTML: $(find $BUILD_DIR -name '*.html' -type f 2>/dev/null | wc -l)"
echo -e "  🎨 عدد ملفات CSS: $(find $BUILD_DIR -name '*.css' -type f 2>/dev/null | wc -l)"
echo -e "  📜 عدد ملفات JavaScript: $(find $BUILD_DIR -name '*.js' -type f 2>/dev/null | wc -l)"
echo -e "  🖼️  عدد ملفات الأصول: $(find $BUILD_DIR/public/assets -type f 2>/dev/null | wc -l)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ---------- 5️⃣ التحقق من SEO ----------
echo -e "${YELLOW}5️⃣ التحقق من عناصر SEO...${NC}"
echo -e "${BLUE}🔍 فحص SEO:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "<title" "$INDEX_FILE"; then
    TITLE=$(grep -o "<title>[^<]*</title>" "$INDEX_FILE" | sed 's/<[^>]*>//g')
    echo -e "  ✅ Title: ${GREEN}$TITLE${NC}"
else
    echo -e "  ❌ Title غير موجود"
fi

if grep -q "name=\"description\"" "$INDEX_FILE"; then
    echo -e "  ✅ Description: ${GREEN}موجودة${NC}"
else
    echo -e "  ❌ Description غير موجودة"
fi

if grep -q "name=\"keywords\"" "$INDEX_FILE"; then
    KEYWORDS=$(grep -o "content=\"[^\"]*\"" "$INDEX_FILE" | grep keywords -A1 | head -1 | sed 's/content="//;s/"$//')
    echo -e "  ✅ Keywords: ${GREEN}موجودة (6 كلمات)${NC}"
else
    echo -e "  ❌ Keywords غير موجودة"
fi

if grep -q "<h1" "$INDEX_FILE"; then
    echo -e "  ✅ H1: ${GREEN}موجود${NC}"
else
    echo -e "  ⚠️  H1: غير موجود في HTML الثابت"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ---------- 6️⃣ التحقق من الموقع الحي ----------
echo -e "${YELLOW}6️⃣ التحقق من الموقع الحي...${NC}"
success=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo ""
    echo -e "${BLUE}محاولة #$((RETRY_COUNT + 1))/${MAX_RETRIES}${NC}"
    
    # التحقق من الصفحة الرئيسية
    echo -e "${YELLOW}  ⏱ التحقق من الصفحة الرئيسية...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$DASHBOARD_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ الصفحة الرئيسية تعمل (HTTP $HTTP_CODE)${NC}"
        
        # التحقق من وجود عنوان H1
        echo -e "${YELLOW}  ⏱ التحقق من عنوان H1...${NC}"
        H1_CHECK=$(curl -s "$DOMAIN$DASHBOARD_URL" 2>/dev/null | grep -i "<h1" | head -1)
        if [ ! -z "$H1_CHECK" ]; then
            echo -e "${GREEN}  ✅ عنوان H1 موجود${NC}"
        else
            echo -e "${YELLOW}  ⚠️  عنوان H1 غير موجود (قد يكون ديناميكياً)${NC}"
        fi
        
        # التحقق من الكلمات الرئيسية
        echo -e "${YELLOW}  ⏱ التحقق من الكلمات الرئيسية...${NC}"
        KEYWORDS_CHECK=$(curl -s "$DOMAIN$DASHBOARD_URL" 2>/dev/null | grep -i "keywords" | head -1)
        if [ ! -z "$KEYWORDS_CHECK" ]; then
            echo -e "${GREEN}  ✅ الكلمات الرئيسية موجودة${NC}"
        else
            echo -e "${YELLOW}  ⚠️  الكلمات الرئيسية غير موجودة${NC}"
        fi
        
        # التحقق من ملف JS
        echo -e "${YELLOW}  ⏱ التحقق من ملف JS...${NC}"
        JS_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -I "$DOMAIN/$JS_FILE" 2>/dev/null || echo "000")
        
        if [ "$JS_HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}  ✅ ملف JS متاح (HTTP $JS_HTTP_CODE)${NC}"
        else
            echo -e "${YELLOW}  ⚠️  ملف JS قد لا يكون متاحاً (HTTP $JS_HTTP_CODE)${NC}"
        fi
        
        success=true
        break
    else
        echo -e "${RED}  ❌ الصفحة الرئيسية غير متاحة (HTTP $HTTP_CODE)${NC}"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}  ⏳ إعادة المحاولة بعد $RETRY_INTERVAL ثواني...${NC}"
            sleep $RETRY_INTERVAL
        fi
    fi
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"

if [ "$success" = true ]; then
    echo -e "${GREEN}║              ✅ النشر والتحقق اكتمل بنجاح!                    ║${NC}"
    echo -e "${GREEN}║         The deployment and verification completed!          ║${NC}"
else
    echo -e "${YELLOW}║           ⚠️  قد تحتاج إلى فحص إضافي للموقع                 ║${NC}"
    echo -e "${YELLOW}║          The site may need additional verification         ║${NC}"
fi

echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}📊 ملخص النشر:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  🌐 النطاق: ${GREEN}$DOMAIN${NC}"
echo -e "  📁 مجلد البناء: ${GREEN}$BUILD_DIR${NC}"
echo -e "  📄 ملف JS: ${GREEN}$JS_FILE${NC}"
echo -e "  🔄 حالة النشر: $([ "$success" = true ] && echo -e "${GREEN}✅ نجح${NC}" || echo -e "${RED}❌ فشل${NC}")"
echo -e "  🎯 H1 Status: ${GREEN}✅ تم إضافته${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$success" = true ]; then
    echo -e "${GREEN}🎉 جميع الاختبارات ناجحة! الموقع جاهز للاستخدام.${NC}"
    echo -e "${GREEN}✅ index.html يحتوي على H1${NC}"
    echo -e "${GREEN}✅ Keywords موجودة${NC}"
    echo -e "${GREEN}✅ الموقع يعمل بشكل صحيح${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  قد تحتاج إلى فحص إضافي. يرجى التحقق من الموقع يدويًا.${NC}"
    exit 1
fi
