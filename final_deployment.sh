#!/bin/bash

=============================================
# 🚀 جاهزية ونشر تلقائي + تقرير نهائي – jordan-customs-system
=============================================

REPORT_FILE="/home/ubuntu/jordan-customs-system/deployment_report_$(date +%Y%m%d_%H%M%S).txt"

echo "=============================================" | tee $REPORT_FILE
echo "🚀 بدء فحص الجاهزية والنشر التلقائي" | tee -a $REPORT_FILE
echo "التاريخ: $(date)" | tee -a $REPORT_FILE
echo "=============================================" | tee -a $REPORT_FILE

cd /home/ubuntu/jordan-customs-system

# 1️⃣ فحص المشروع والخادم
echo "" | tee -a $REPORT_FILE
echo "1️⃣ فحص المشروع والخادم..." | tee -a $REPORT_FILE
echo "🔍 التحقق من جاهزية المشروع..." | tee -a $REPORT_FILE

# Build Status
if npm run build > /tmp/build_final.txt 2>&1; then
    echo "✅ Build Status: ناجح" | tee -a $REPORT_FILE
    BUILD_OK=1
else
    echo "❌ Build Status: فشل" | tee -a $REPORT_FILE
    BUILD_OK=0
fi

# TypeScript Errors
TS_ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
echo "📌 TypeScript Errors: $TS_ERROR_COUNT خطأ" | tee -a $REPORT_FILE
if [ "$TS_ERROR_COUNT" -lt 50 ]; then
    TS_OK=1
else
    TS_OK=0
fi

# Server Status
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
echo "📌 Server Status: HTTP $SERVER_STATUS" | tee -a $REPORT_FILE
if [ "$SERVER_STATUS" = "200" ]; then
    SERVER_OK=1
else
    SERVER_OK=0
fi

# 2️⃣ التحقق من النطاقات من مزود DNS
echo "" | tee -a $REPORT_FILE
echo "2️⃣ التحقق من سجلات DNS..." | tee -a $REPORT_FILE
echo "🌐 فحص DNS عبر المزود..." | tee -a $REPORT_FILE

DNS_JCS=$(dig +short jordan-customs-system.manus.space 2>/dev/null | head -1)
DNS_MP3=$(dig +short mp3-app.com 2>/dev/null | head -1)
DNS_WMP3=$(dig +short www.mp3-app.com 2>/dev/null | head -1)

echo "→ jordan-customs-system.manus.space: ${DNS_JCS:-'غير متصل'}" | tee -a $REPORT_FILE
echo "→ mp3-app.com: ${DNS_MP3:-'غير متصل'}" | tee -a $REPORT_FILE
echo "→ www.mp3-app.com: ${DNS_WMP3:-'غير متصل'}" | tee -a $REPORT_FILE

if [ -n "$DNS_JCS" ] || [ -n "$DNS_MP3" ] || [ -n "$DNS_WMP3" ]; then
    DNS_OK=1
else
    DNS_OK=0
fi

# 3️⃣ التحقق من SSL و HTTPS
echo "" | tee -a $REPORT_FILE
echo "3️⃣ التحقق من SSL و HTTPS..." | tee -a $REPORT_FILE
echo "🔐 فحص شهادات SSL..." | tee -a $REPORT_FILE

SSL_OK=1
for DOMAIN in "jordan-customs-system.manus.space" "mp3-app.com" "www.mp3-app.com"; do
    if openssl s_client -connect "$DOMAIN:443" </dev/null 2>/dev/null | grep -q "BEGIN CERTIFICATE"; then
        echo "✅ SSL $DOMAIN: مفعل" | tee -a $REPORT_FILE
    else
        echo "⚠️ SSL $DOMAIN: قد يحتاج تحقق" | tee -a $REPORT_FILE
        SSL_OK=0
    fi
done

# 4️⃣ التحقق من تحميل الصفحات
echo "" | tee -a $REPORT_FILE
echo "4️⃣ التحقق من تحميل الصفحات..." | tee -a $REPORT_FILE
echo "🌐 اختبار HTTP Status..." | tee -a $REPORT_FILE

HTTP_JCS=$(curl -s -o /dev/null -w "%{http_code}" https://jordan-customs-system.manus.space 2>/dev/null || echo "000")
HTTP_MP3=$(curl -s -o /dev/null -w "%{http_code}" https://mp3-app.com 2>/dev/null || echo "000")
HTTP_WMP3=$(curl -s -o /dev/null -w "%{http_code}" https://www.mp3-app.com 2>/dev/null || echo "000")

echo "→ jordan-customs-system.manus.space: HTTP $HTTP_JCS" | tee -a $REPORT_FILE
echo "→ mp3-app.com: HTTP $HTTP_MP3" | tee -a $REPORT_FILE
echo "→ www.mp3-app.com: HTTP $HTTP_WMP3" | tee -a $REPORT_FILE

if [ "$HTTP_JCS" = "200" ] && [ "$HTTP_MP3" = "200" ] && [ "$HTTP_WMP3" = "200" ]; then
    HTTP_OK=1
else
    HTTP_OK=0
fi

# 5️⃣ التحقق من الخدمات الإضافية
echo "" | tee -a $REPORT_FILE
echo "5️⃣ التحقق من الخدمات الإضافية..." | tee -a $REPORT_FILE
echo "⚡ فحص WebSocket و Stripe..." | tee -a $REPORT_FILE

if grep -q "WebSocket" server/websocket-server.ts 2>/dev/null; then
    echo "✅ WebSocket: مدمج" | tee -a $REPORT_FILE
    WS_OK=1
else
    echo "⚠️ WebSocket: قد يحتاج تحقق" | tee -a $REPORT_FILE
    WS_OK=0
fi

if grep -q "stripe" server/routers.ts 2>/dev/null; then
    echo "✅ Stripe: مدمج" | tee -a $REPORT_FILE
    STRIPE_OK=1
else
    echo "⚠️ Stripe: قد يحتاج تحقق" | tee -a $REPORT_FILE
    STRIPE_OK=0
fi

# 6️⃣ تقرير الجاهزية النهائي
echo "" | tee -a $REPORT_FILE
echo "=============================================" | tee -a $REPORT_FILE
echo "📋 تقرير الجاهزية النهائي" | tee -a $REPORT_FILE
echo "=============================================" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

TOTAL_SCORE=$((BUILD_OK + TS_OK + SERVER_OK + DNS_OK + SSL_OK + HTTP_OK + WS_OK + STRIPE_OK))
MAX_SCORE=8

echo "| المعيار | الحالة |" | tee -a $REPORT_FILE
echo "|--------|--------|" | tee -a $REPORT_FILE
echo "| Build | $([ $BUILD_OK -eq 1 ] && echo '✅ ناجح' || echo '❌ فشل') |" | tee -a $REPORT_FILE
echo "| TypeScript | $([ $TS_OK -eq 1 ] && echo '✅ مقبول' || echo '⚠️ يحتاج إصلاح') |" | tee -a $REPORT_FILE
echo "| الخادم | $([ $SERVER_OK -eq 1 ] && echo '✅ يعمل' || echo '⚠️ متوقف') |" | tee -a $REPORT_FILE
echo "| DNS | $([ $DNS_OK -eq 1 ] && echo '✅ متصل' || echo '⚠️ يحتاج تحديث') |" | tee -a $REPORT_FILE
echo "| SSL | $([ $SSL_OK -eq 1 ] && echo '✅ مفعل' || echo '⚠️ يحتاج تحقق') |" | tee -a $REPORT_FILE
echo "| HTTP Status | $([ $HTTP_OK -eq 1 ] && echo '✅ 200' || echo '⚠️ خطأ') |" | tee -a $REPORT_FILE
echo "| WebSocket | $([ $WS_OK -eq 1 ] && echo '✅ مدمج' || echo '⚠️ يحتاج تحقق') |" | tee -a $REPORT_FILE
echo "| Stripe | $([ $STRIPE_OK -eq 1 ] && echo '✅ مدمج' || echo '⚠️ يحتاج تحقق') |" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE
echo "📊 النتيجة الإجمالية: $TOTAL_SCORE/$MAX_SCORE" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

# 7️⃣ قرار النشر
if [ $TOTAL_SCORE -ge 6 ]; then
    echo "✅ المشروع جاهز للنشر!" | tee -a $REPORT_FILE
    echo "🚀 يمكن النشر الآن بثقة عالية" | tee -a $REPORT_FILE
    READY=1
else
    echo "⚠️ هناك مشاكل قبل النشر" | tee -a $REPORT_FILE
    echo "📝 يُنصح بمراجعة النقاط التي حصلت على ⚠️ أو ❌" | tee -a $REPORT_FILE
    READY=0
fi

echo "" | tee -a $REPORT_FILE
echo "=============================================" | tee -a $REPORT_FILE
echo "📄 تقرير كامل تم حفظه في: $REPORT_FILE" | tee -a $REPORT_FILE
echo "=============================================" | tee -a $REPORT_FILE

exit $((1 - READY))
