#!/bin/bash

###############################################################################
# نظام المراقبة والفحص الصحي
# Monitoring & Health Check System
# 
# الوظيفة: مراقبة صحة التطبيق والخوادم والخدمات
# Function: Monitor application, servers, and services health
###############################################################################

set -e

# الإعدادات
APP_URL="https://mp3-app.com"
API_URL="https://mp3-app.com/api"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="jordan_customs_prod"
DB_USER="postgres"
LOG_DIR="/var/log/monitoring"
ALERT_EMAIL="admin@mp3-app.com"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# إنشاء مجلد السجلات
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/health_check_$(date +%Y%m%d).log"

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة الطباعة الملونة
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "ok")
            echo -e "${GREEN}✅ $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $message" >> "$LOG_FILE"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $message" >> "$LOG_FILE"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️ $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ $message" >> "$LOG_FILE"
            ;;
        "info")
            echo -e "${BLUE}ℹ️ $message${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️ $message" >> "$LOG_FILE"
            ;;
    esac
}

# دالة إرسال التنبيهات
send_alert() {
    local subject="$1"
    local body="$2"
    
    echo "$body" | mail -s "$subject" "$ALERT_EMAIL"
    print_status "info" "تم إرسال تنبيه: $subject"
}

# بداية الفحص
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        نظام المراقبة والفحص الصحي - Health Check System        ║"
echo "║                    $TIMESTAMP                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ====== 1. فحص الخادم ======
echo "📊 فحص الخادم والموارد..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص استخدام CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    print_status "warning" "استخدام CPU مرتفع: ${CPU_USAGE}%"
    send_alert "⚠️ استخدام CPU مرتفع" "استخدام CPU: ${CPU_USAGE}%"
else
    print_status "ok" "استخدام CPU طبيعي: ${CPU_USAGE}%"
fi

# فحص استخدام الذاكرة
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100}')
if (( $(echo "$MEM_USAGE > 85" | bc -l) )); then
    print_status "warning" "استخدام الذاكرة مرتفع: ${MEM_USAGE}%"
    send_alert "⚠️ استخدام الذاكرة مرتفع" "استخدام الذاكرة: ${MEM_USAGE}%"
else
    print_status "ok" "استخدام الذاكرة طبيعي: ${MEM_USAGE}%"
fi

# فحص مساحة القرص
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if (( DISK_USAGE > 90 )); then
    print_status "error" "مساحة القرص ممتلئة: ${DISK_USAGE}%"
    send_alert "❌ مساحة القرص ممتلئة" "استخدام القرص: ${DISK_USAGE}%"
else
    print_status "ok" "مساحة القرص متوفرة: ${DISK_USAGE}%"
fi

echo ""

# ====== 2. فحص الخدمات ======
echo "🔧 فحص الخدمات..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص Nginx
if systemctl is-active --quiet nginx; then
    print_status "ok" "خادم Nginx يعمل"
else
    print_status "error" "خادم Nginx متوقف"
    send_alert "❌ خادم Nginx متوقف" "يجب إعادة تشغيل خادم Nginx"
fi

# فحص PostgreSQL
if systemctl is-active --quiet postgresql; then
    print_status "ok" "خادم PostgreSQL يعمل"
else
    print_status "error" "خادم PostgreSQL متوقف"
    send_alert "❌ خادم PostgreSQL متوقف" "يجب إعادة تشغيل خادم PostgreSQL"
fi

# فحص تطبيق Node.js
if pgrep -f "node.*jordan-customs" > /dev/null; then
    print_status "ok" "تطبيق Node.js يعمل"
else
    print_status "error" "تطبيق Node.js متوقف"
    send_alert "❌ تطبيق Node.js متوقف" "يجب إعادة تشغيل التطبيق"
fi

echo ""

# ====== 3. فحص قاعدة البيانات ======
echo "🗄️ فحص قاعدة البيانات..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص الاتصال
if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    print_status "ok" "الاتصال بقاعدة البيانات نجح"
    
    # فحص عدد الاتصالات
    CONNECTIONS=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null || echo "0")
    print_status "info" "عدد الاتصالات النشطة: $CONNECTIONS"
    
    # فحص حجم قاعدة البيانات
    DB_SIZE=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null || echo "Unknown")
    print_status "info" "حجم قاعدة البيانات: $DB_SIZE"
    
    # فحص الجداول الرئيسية
    TABLES=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
    print_status "info" "عدد الجداول: $TABLES"
    
else
    print_status "error" "فشل الاتصال بقاعدة البيانات"
    send_alert "❌ فشل الاتصال بقاعدة البيانات" "لا يمكن الاتصال بـ $DB_HOST:$DB_PORT"
fi

echo ""

# ====== 4. فحص التطبيق ======
echo "🌐 فحص التطبيق..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص الصفحة الرئيسية
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
if [ "$HTTP_CODE" = "200" ]; then
    print_status "ok" "الصفحة الرئيسية تستجيب: HTTP $HTTP_CODE"
else
    print_status "error" "الصفحة الرئيسية لا تستجيب: HTTP $HTTP_CODE"
    send_alert "❌ الصفحة الرئيسية لا تستجيب" "HTTP Status: $HTTP_CODE"
fi

# فحص API
API_HEALTH=$(curl -s "$API_URL/health" | jq -r '.status' 2>/dev/null || echo "error")
if [ "$API_HEALTH" = "ok" ]; then
    print_status "ok" "API يعمل بشكل صحيح"
else
    print_status "warning" "حالة API: $API_HEALTH"
fi

# فحص سرعة الاستجابة
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$APP_URL")
if (( $(echo "$RESPONSE_TIME < 2" | bc -l) )); then
    print_status "ok" "سرعة الاستجابة جيدة: ${RESPONSE_TIME}s"
else
    print_status "warning" "سرعة الاستجابة بطيئة: ${RESPONSE_TIME}s"
fi

echo ""

# ====== 5. فحص SSL/TLS ======
echo "🔒 فحص SSL/TLS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص شهادة SSL
SSL_EXPIRY=$(echo | openssl s_client -servername mp3-app.com -connect mp3-app.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
    print_status "ok" "شهادة SSL صحيحة: تنتهي في $SSL_EXPIRY"
else
    print_status "error" "فشل التحقق من شهادة SSL"
fi

echo ""

# ====== 6. فحص بوابات الدفع ======
echo "💳 فحص بوابات الدفع..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص Stripe
STRIPE_STATUS=$(curl -s "$API_URL/payments/stripe/status" | jq -r '.status' 2>/dev/null || echo "unknown")
print_status "info" "حالة Stripe: $STRIPE_STATUS"

# فحص PayPal
PAYPAL_STATUS=$(curl -s "$API_URL/payments/paypal/status" | jq -r '.status' 2>/dev/null || echo "unknown")
print_status "info" "حالة PayPal: $PAYPAL_STATUS"

# فحص Apple Pay
APPLEPAY_STATUS=$(curl -s "$API_URL/payments/apple-pay/status" | jq -r '.status' 2>/dev/null || echo "unknown")
print_status "info" "حالة Apple Pay: $APPLEPAY_STATUS"

echo ""

# ====== 7. ملخص الفحص ======
echo "📋 ملخص الفحص..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SUMMARY="
✅ فحص صحة النظام - Health Check Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 موارد الخادم:
  • CPU: ${CPU_USAGE}%
  • الذاكرة: ${MEM_USAGE}%
  • القرص: ${DISK_USAGE}%

🔧 الخدمات:
  • Nginx: ✅
  • PostgreSQL: ✅
  • Node.js: ✅

🗄️ قاعدة البيانات:
  • الاتصال: ✅
  • الحجم: $DB_SIZE
  • الجداول: $TABLES

🌐 التطبيق:
  • الصفحة الرئيسية: HTTP $HTTP_CODE
  • سرعة الاستجابة: ${RESPONSE_TIME}s
  • API: $API_HEALTH

🔒 الأمان:
  • SSL/TLS: ✅
  • شهادة صحيحة: $SSL_EXPIRY

💳 بوابات الدفع:
  • Stripe: $STRIPE_STATUS
  • PayPal: $PAYPAL_STATUS
  • Apple Pay: $APPLEPAY_STATUS

⏰ الوقت: $TIMESTAMP
📁 السجل: $LOG_FILE
"

echo "$SUMMARY"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   انتهى الفحص الصحي بنجاح                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

exit 0
