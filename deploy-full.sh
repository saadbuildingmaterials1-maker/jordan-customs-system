#!/bin/bash

# ========================================
# FULL AUTOMATED DEPLOY + MIME FIX + DASHBOARD CHECK
# Jordan Customs System
# Domains:
#   - https://jordan-customs-system.manus.space/
#   - https://www.mp3-app.com/
#   - https://mp3-app.com/
# ========================================

set -e

BUILD_DIR="dist"
DOMAINS=(
  "https://jordan-customs-system.manus.space"
  "https://www.mp3-app.com"
  "https://mp3-app.com"
)
DASHBOARD_URL="/dashboard"
RETRY_INTERVAL=15
MAX_RETRIES=5
RETRY_COUNT=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

function log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

function log_error() {
  echo -e "${RED}❌ $1${NC}"
}

function log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

function clean_build() {
  log_info "تنظيف البيئة..."
  rm -rf node_modules $BUILD_DIR package-lock.json .cache
  npm cache clean --force
  log_success "تم تنظيف البيئة"
}

function install_deps() {
  log_info "تثبيت المكتبات..."
  npm install --force
  log_success "تم تثبيت المكتبات"
}

function build_project() {
  log_info "بناء المشروع..."
  npm run build -- --force
  log_success "تم بناء المشروع"
}

function update_redirects_headers() {
  log_info "تحديث _redirects و _headers..."
  
  # Update _redirects
  echo "/assets/* /assets/:splat 200" > $BUILD_DIR/_redirects
  echo "/* /index.html 200" >> $BUILD_DIR/_redirects
  
  # Update _headers
  echo "/assets/*.js" > $BUILD_DIR/_headers
  echo "  Content-Type: application/javascript" >> $BUILD_DIR/_headers
  echo "/assets/*.mjs" >> $BUILD_DIR/_headers
  echo "  Content-Type: application/javascript" >> $BUILD_DIR/_headers
  echo "/assets/*.css" >> $BUILD_DIR/_headers
  echo "  Content-Type: text/css" >> $BUILD_DIR/_headers
  
  log_success "تم تحديث _redirects و _headers"
}

function commit_changes() {
  log_info "حفظ التغييرات في git..."
  git add -A
  git commit -m "🚀 Auto-deploy: Full build with corrected MIME types and dashboard check" || log_warning "لا توجد تغييرات جديدة"
  log_success "تم حفظ التغييرات"
}

function find_main_js() {
  # Find the main JS file
  JS_FILE=$(ls -1 $BUILD_DIR/public/assets/index-*.js 2>/dev/null | head -1 | xargs basename)
  if [ -z "$JS_FILE" ]; then
    log_error "لم يتم العثور على ملف index-*.js"
    return 1
  fi
  echo "$JS_FILE"
}

function check_js_mime() {
  local domain=$1
  local js_file=$2
  
  log_info "فحص MIME type: $domain/assets/$js_file"
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -I "$domain/assets/$js_file")
  CONTENT_TYPE=$(curl -s -I "$domain/assets/$js_file" | grep -i "Content-Type" | head -1 | awk '{print $2}' | tr -d '\r')
  
  if [[ "$HTTP_CODE" == "200" && "$CONTENT_TYPE" == "application/javascript" ]]; then
    log_success "MIME type صحيح: $CONTENT_TYPE"
    return 0
  else
    log_error "MIME type خاطئ: $CONTENT_TYPE (HTTP $HTTP_CODE)"
    return 1
  fi
}

function check_dashboard() {
  local domain=$1
  
  log_info "فحص /dashboard: $domain$DASHBOARD_URL"
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$domain$DASHBOARD_URL")
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    log_success "/dashboard متاح (HTTP $HTTP_CODE)"
    return 0
  else
    log_warning "/dashboard غير متاح (HTTP $HTTP_CODE)"
    return 1
  fi
}

function check_all_domains() {
  local js_file=$1
  local all_ok=true
  
  echo ""
  log_info "فحص جميع النطاقات..."
  echo ""
  
  for domain in "${DOMAINS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 النطاق: $domain"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_js_mime "$domain" "$js_file" || all_ok=false
    check_dashboard "$domain" || all_ok=false
    
    echo ""
  done
  
  if [ "$all_ok" = true ]; then
    return 0
  else
    return 1
  fi
}

# ===========================
# MAIN DEPLOYMENT LOOP
# ===========================
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                  🚀 FULL AUTOMATED DEPLOYMENT SCRIPT                       ║"
echo "║                    Jordan Customs System                                   ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo ""
  echo "╔════════════════════════════════════════════════════════════════════════════╗"
  echo "║                   دورة النشر #$((RETRY_COUNT + 1))                          ║"
  echo "╚════════════════════════════════════════════════════════════════════════════╝"
  echo ""
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  clean_build
  install_deps
  build_project
  update_redirects_headers
  commit_changes
  
  # Wait for Manus deployment
  log_info "انتظار نشر Manus (30 ثانية)..."
  sleep 30
  
  # Find main JS file
  JS_FILE=$(find_main_js)
  if [ -z "$JS_FILE" ]; then
    log_error "فشل في العثور على ملف JS"
    RETRY_COUNT=$((RETRY_COUNT - 1))
    continue
  fi
  
  log_success "ملف JS المكتشف: $JS_FILE"
  
  # Check all domains
  if check_all_domains "$JS_FILE"; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════════╗"
    echo "║                      🎉 النشر نجح بنجاح!                                   ║"
    echo "║                                                                            ║"
    echo "║  ✅ MIME type صحيح: application/javascript                               ║"
    echo "║  ✅ /dashboard متاح على جميع النطاقات                                    ║"
    echo "║  ✅ الموقع يحمّل بشكل صحيح تماماً                                        ║"
    echo "╚════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    exit 0
  else
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      log_warning "سيتم إعادة المحاولة في $RETRY_INTERVAL ثانية..."
      sleep $RETRY_INTERVAL
    fi
  fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                      ❌ فشل النشر بعد عدة محاولات                          ║"
echo "║                                                                            ║"
echo "║  يرجى التحقق من:                                                          ║"
echo "║  1. اتصال الإنترنت                                                        ║"
echo "║  2. صحة بيانات اعتماد git                                                 ║"
echo "║  3. حالة Manus deployment                                                 ║"
echo "║  4. إعدادات Cloudflare                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
exit 1
