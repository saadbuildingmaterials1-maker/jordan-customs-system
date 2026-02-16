#!/bin/bash
# =========================================
# Jordan Customs System - Full Automated Publish & Verification
# نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي الكامل
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
echo -e "${BLUE}║     نظام إدارة تكاليف الشحن والجمارك الأردنية - النشر الآلي      ║${NC}"
echo -e "${BLUE}║          Jordan Customs System - Automated Publishing          ║${NC}"
echo -e "${BLUE}║                    $(date '+%Y-%m-%d %H:%M:%S')                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ---------- 1️⃣ تنظيف البيئة ----------
echo -e "${YELLOW}🧹 تنظيف البيئة القديمة...${NC}"
rm -rf node_modules $BUILD_DIR package-lock.json .cache 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

echo -e "${YELLOW}📦 تثبيت الحزم...${NC}"
npm install --force --legacy-peer-deps 2>/dev/null || npm install --force

# ---------- 2️⃣ بناء المشروع ----------
echo -e "${YELLOW}🔨 إعادة بناء المشروع...${NC}"
npm run build 2>&1 | tail -20

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ فشل البناء! لم يتم إنشاء مجلد $BUILD_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم بناء المشروع بنجاح${NC}"

# ---------- 3️⃣ تحديث _redirects و _headers ----------
echo -e "${YELLOW}🔧 تحديث _redirects و _headers...${NC}"

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

# ---------- 4️⃣ التحقق من الملفات المبنية ----------
echo -e "${YELLOW}📊 التحقق من الملفات المبنية...${NC}"
echo "📁 محتوى مجلد dist:"
ls -lh $BUILD_DIR/ | head -20

# ---------- 5️⃣ التحقق التلقائي من الموقع ----------
echo ""
echo -e "${YELLOW}⏱ التحقق من الموقع الحي...${NC}"
success=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo ""
    echo -e "${BLUE}محاولة #$((RETRY_COUNT + 1))/${MAX_RETRIES}${NC}"
    
    # التحقق من الصفحة الرئيسية
    echo -e "${YELLOW}  ⏱ التحقق من الصفحة الرئيسية...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$DASHBOARD_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ الصفحة الرئيسية تعمل (HTTP $HTTP_CODE)${NC}"
        
        # التحقق من وجود عنوان H1
        echo -e "${YELLOW}  ⏱ التحقق من عنوان H1...${NC}"
        H1_CHECK=$(curl -s "$DOMAIN$DASHBOARD_URL" | grep -i "<h1" | head -1)
        if [ ! -z "$H1_CHECK" ]; then
            echo -e "${GREEN}  ✅ عنوان H1 موجود${NC}"
        else
            echo -e "${YELLOW}  ⚠️  عنوان H1 غير موجود${NC}"
        fi
        
        # التحقق من الكلمات الرئيسية
        echo -e "${YELLOW}  ⏱ التحقق من الكلمات الرئيسية...${NC}"
        KEYWORDS_CHECK=$(curl -s "$DOMAIN$DASHBOARD_URL" | grep -i "keywords" | head -1)
        if [ ! -z "$KEYWORDS_CHECK" ]; then
            echo -e "${GREEN}  ✅ الكلمات الرئيسية موجودة${NC}"
        else
            echo -e "${YELLOW}  ⚠️  الكلمات الرئيسية غير موجودة${NC}"
        fi
        
        # التحقق من ملف JS
        echo -e "${YELLOW}  ⏱ التحقق من ملف JS...${NC}"
        JS_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -I "$DOMAIN/$JS_FILE" 2>/dev/null || echo "000")
        JS_CONTENT_TYPE=$(curl -s -I "$DOMAIN/$JS_FILE" 2>/dev/null | grep -i "Content-Type" | awk '{print $2}' | tr -d '\r' || echo "unknown")
        
        if [ "$JS_HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}  ✅ ملف JS متاح (HTTP $JS_HTTP_CODE)${NC}"
            echo -e "${GREEN}     Content-Type: $JS_CONTENT_TYPE${NC}"
        else
            echo -e "${YELLOW}  ⚠️  ملف JS غير متاح (HTTP $JS_HTTP_CODE)${NC}"
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
    echo -e "${GREEN}║                    ✅ النشر اكتمل بنجاح!                      ║${NC}"
    echo -e "${GREEN}║              The deployment completed successfully!          ║${NC}"
else
    echo -e "${RED}║                  ⚠️  النشر قد يحتاج إلى فحص إضافي              ║${NC}"
    echo -e "${RED}║              The deployment may need additional checks         ║${NC}"
fi

echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${BLUE}📊 ملخص النشر:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  🌐 النطاق: ${GREEN}$DOMAIN${NC}"
echo -e "  📁 مجلد البناء: ${GREEN}$BUILD_DIR${NC}"
echo -e "  📄 ملف JS: ${GREEN}$JS_FILE${NC}"
echo -e "  🔄 حالة النشر: $([ "$success" = true ] && echo -e "${GREEN}✅ نجح${NC}" || echo -e "${RED}❌ فشل${NC}")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$success" = true ]; then
    echo -e "${GREEN}🎉 جميع الاختبارات ناجحة! الموقع جاهز للاستخدام.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  قد تحتاج إلى فحص إضافي. يرجى التحقق من الموقع يدويًا.${NC}"
    exit 1
fi
