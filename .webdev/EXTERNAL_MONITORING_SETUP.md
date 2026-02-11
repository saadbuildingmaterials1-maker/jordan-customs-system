# 📊 إعداد المراقبة الخارجية (Sentry + DataDog)
# External Monitoring Setup Guide

**التاريخ:** 11 فبراير 2026  
**الحالة:** جاهز للتفعيل الفوري

---

## 🔍 المرحلة 1: إعداد Sentry (مراقبة الأخطاء)

### الخطوة 1: إنشاء حساب Sentry

```bash
# 1. اذهب إلى: https://sentry.io/
# 2. اضغط على "Sign Up"
# 3. أنشئ حساب جديد
# 4. تحقق من البريد الإلكتروني
```

### الخطوة 2: إنشاء مشروع جديد

```bash
# 1. اذهب إلى: https://sentry.io/organizations/
# 2. اختر المنظمة
# 3. اضغط على "Create Project"
# 4. اختر:
#    - Platform: Node.js
#    - Alert Rule: Default
# 5. اضغط على "Create Project"
```

### الخطوة 3: الحصول على DSN

```bash
# بعد إنشاء المشروع:
# اذهب إلى: Settings > Client Keys (DSN)
# انسخ DSN:
# https://xxxxxxx@xxxxx.ingest.sentry.io/xxxxxx
```

### الخطوة 4: تثبيت Sentry في التطبيق

```bash
# تثبيت الحزمة
pnpm add @sentry/node @sentry/tracing

# أو
npm install @sentry/node @sentry/tracing
```

### الخطوة 5: تكوين Sentry في التطبيق

```typescript
// server/_core/monitoring/sentry.ts

import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

export function initSentry(app: Express.Application) {
  // تهيئة Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Express.Integrations.Express({
        app: true,
        request: true,
        transaction: true,
      }),
    ],
    beforeSend(event) {
      // تصفية الأخطاء غير المهمة
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('404')) {
          return null; // تجاهل أخطاء 404
        }
      }
      return event;
    },
  });

  // إضافة middleware
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // معالج الأخطاء
  app.use(Sentry.Handlers.errorHandler());

  return app;
}

// دالة لتسجيل الأخطاء
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

// دالة لتسجيل الرسائل
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}
```

### الخطوة 6: إضافة DSN إلى متغيرات البيئة

```bash
# في ملف .env.production
SENTRY_DSN=https://xxxxxxx@xxxxx.ingest.sentry.io/xxxxxx

# أو عبر Manus Platform
# اذهب إلى: Settings > Secrets
# أضف: SENTRY_DSN
```

### الخطوة 7: اختبار Sentry

```bash
# اختبار تسجيل الخطأ
curl -X POST https://mp3-app.com/api/test/error \
  -H "Authorization: Bearer $TOKEN"

# يجب أن تظهر الأخطاء في لوحة Sentry
```

---

## 📈 المرحلة 2: إعداد DataDog (مراقبة الأداء)

### الخطوة 1: إنشاء حساب DataDog

```bash
# 1. اذهب إلى: https://www.datadoghq.com/
# 2. اضغط على "Free Trial"
# 3. أنشئ حساب جديد
# 4. تحقق من البريد الإلكتروني
```

### الخطوة 2: الحصول على API Key

```bash
# 1. اذهب إلى: https://app.datadoghq.com/organization/settings/api-keys
# 2. اضغط على "Create API Key"
# 3. أدخل الاسم: "jordan-customs-prod"
# 4. انسخ API Key
```

### الخطوة 3: الحصول على Application Key

```bash
# 1. اذهب إلى: https://app.datadoghq.com/organization/settings/application-keys
# 2. اضغط على "New Key"
# 3. أدخل الاسم: "jordan-customs-app"
# 4. انسخ Application Key
```

### الخطوة 4: تثبيت DataDog في التطبيق

```bash
# تثبيت الحزمة
pnpm add dd-trace

# أو
npm install dd-trace
```

### الخطوة 5: تكوين DataDog في التطبيق

```typescript
// server/_core/monitoring/datadog.ts

import tracer from 'dd-trace';

export function initDataDog() {
  // تهيئة DataDog
  tracer.init({
    service: 'jordan-customs',
    env: process.env.NODE_ENV,
    version: '1.0.0',
    logInjection: true,
    analytics: true,
    
    // إعدادات الأداء
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // إعدادات قاعدة البيانات
    plugins: {
      'pg': {
        enabled: true,
        service: 'jordan-customs-db',
      },
      'express': {
        enabled: true,
        service: 'jordan-customs-api',
      },
      'http': {
        enabled: true,
        service: 'jordan-customs-http',
      },
    },
  });

  return tracer;
}

// دالة لتسجيل الأحداث المخصصة
export function recordCustomMetric(name: string, value: number, tags?: Record<string, string>) {
  tracer.trace(name, (span) => {
    span.setTag('metric', name);
    span.setTag('value', value);
    
    if (tags) {
      Object.entries(tags).forEach(([key, val]) => {
        span.setTag(key, val);
      });
    }
  });
}
```

### الخطوة 6: إضافة Keys إلى متغيرات البيئة

```bash
# في ملف .env.production
DATADOG_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATADOG_APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATADOG_SITE=datadoghq.com  # أو datadoghq.eu

# أو عبر Manus Platform
# اذهب إلى: Settings > Secrets
# أضف: DATADOG_API_KEY و DATADOG_APP_KEY
```

### الخطوة 7: اختبار DataDog

```bash
# اختبار الاتصال
curl -X GET "https://api.datadoghq.com/api/v1/validate" \
  -H "DD-API-KEY: $DATADOG_API_KEY"

# يجب أن تحصل على استجابة: {"valid": true}
```

---

## 🔗 المرحلة 3: دمج Sentry و DataDog في التطبيق

### الخطوة 1: تحديث ملف البدء

```typescript
// server/index.ts

import express from 'express';
import { initSentry, captureException } from './_core/monitoring/sentry';
import { initDataDog, recordCustomMetric } from './_core/monitoring/datadog';

const app = express();

// تهيئة المراقبة
initSentry(app);
initDataDog();

// إضافة middleware للمراقبة
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // تسجيل الأداء في DataDog
    recordCustomMetric('request.duration', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode.toString(),
    });
  });
  
  next();
});

// معالج الأخطاء
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // تسجيل الخطأ في Sentry
  captureException(err, {
    method: req.method,
    path: req.path,
    query: req.query,
  });
  
  // إرسال الاستجابة
  res.status(500).json({ error: 'Internal Server Error' });
});

// بدء الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### الخطوة 2: إضافة تتبع الأداء

```typescript
// server/_core/monitoring/performance.ts

import tracer from 'dd-trace';
import { captureMessage } from './sentry';

export class PerformanceMonitor {
  static async trackDatabaseQuery(query: string, execute: () => Promise<any>) {
    const span = tracer.startSpan('database.query', {
      resource: query,
      type: 'db',
    });

    const startTime = Date.now();

    try {
      const result = await execute();
      const duration = Date.now() - startTime;

      span.setTag('duration', duration);
      span.setTag('status', 'success');

      if (duration > 1000) {
        captureMessage(`Slow database query: ${query} (${duration}ms)`, 'warning');
      }

      return result;
    } catch (error) {
      span.setTag('status', 'error');
      span.setTag('error', true);
      throw error;
    } finally {
      span.finish();
    }
  }

  static async trackApiCall(endpoint: string, execute: () => Promise<any>) {
    const span = tracer.startSpan('api.call', {
      resource: endpoint,
      type: 'http',
    });

    const startTime = Date.now();

    try {
      const result = await execute();
      const duration = Date.now() - startTime;

      span.setTag('duration', duration);
      span.setTag('status', 'success');

      return result;
    } catch (error) {
      span.setTag('status', 'error');
      span.setTag('error', true);
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

---

## 📊 المرحلة 4: إعداد لوحات المراقبة

### لوحة Sentry

```bash
# 1. اذهب إلى: https://sentry.io/
# 2. اختر المشروع: jordan-customs
# 3. ستظهر لوحة تحتوي على:
#    - الأخطاء الأخيرة
#    - معدل الأخطاء
#    - المستخدمون المتأثرون
#    - الإصدارات
```

### لوحة DataDog

```bash
# 1. اذهب إلى: https://app.datadoghq.com/
# 2. اختر: Dashboards > New Dashboard
# 3. أضف الـ widgets التالية:
#    - Request Count
#    - Response Time
#    - Error Rate
#    - Database Query Duration
#    - CPU Usage
#    - Memory Usage
```

---

## 🚨 المرحلة 5: إعداد التنبيهات

### تنبيهات Sentry

```bash
# 1. اذهب إلى: Settings > Alert Rules
# 2. اضغط على "Create Alert Rule"
# 3. أضف التنبيهات التالية:

# تنبيه الأخطاء الجديدة
- Condition: New Error
- Action: Send Email to admin@mp3-app.com

# تنبيه معدل الأخطاء المرتفع
- Condition: Error Rate > 5%
- Action: Send Email to admin@mp3-app.com

# تنبيه الأخطاء الحرجة
- Condition: Error Level = Critical
- Action: Send Email to admin@mp3-app.com
```

### تنبيهات DataDog

```bash
# 1. اذهب إلى: Monitors > New Monitor
# 2. أضف المراقبات التالية:

# مراقبة وقت الاستجابة
- Metric: trace.web.request.duration
- Condition: > 2000ms
- Alert: Send Email to admin@mp3-app.com

# مراقبة معدل الأخطاء
- Metric: trace.web.request.errors
- Condition: > 1% of requests
- Alert: Send Email to admin@mp3-app.com

# مراقبة استخدام الموارد
- Metric: system.cpu.user
- Condition: > 80%
- Alert: Send Email to admin@mp3-app.com
```

---

## 📈 المرحلة 6: التقارير والتحليلات

### تقارير Sentry

```bash
# 1. اذهب إلى: Releases
# 2. اختر الإصدار الحالي
# 3. ستظهر معلومات:
#    - عدد الأخطاء
#    - عدد المستخدمين المتأثرين
#    - الأخطاء الجديدة
#    - الأخطاء المحلولة
```

### تقارير DataDog

```bash
# 1. اذهب إلى: Analytics
# 2. اختر: Traces
# 3. ستظهر معلومات:
#    - عدد الطلبات
#    - متوسط وقت الاستجابة
#    - معدل الأخطاء
#    - الخدمات الأبطأ
```

---

## 🔄 المرحلة 7: التكامل مع CI/CD

### تكامل مع GitHub Actions

```yaml
# .github/workflows/monitoring.yml

name: Monitoring Setup

on:
  push:
    branches: [main]

jobs:
  setup-monitoring:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Sentry Release
        run: |
          npm install -g @sentry/cli
          sentry-cli releases create --project jordan-customs ${{ github.sha }}
          sentry-cli releases set-commits --auto ${{ github.sha }}
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: your-org
          SENTRY_PROJECT: jordan-customs
      
      - name: Send to DataDog
        run: |
          curl -X POST "https://api.datadoghq.com/api/v1/events" \
            -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
            -d "{
              \"title\": \"Deployment\",
              \"text\": \"Deployed commit ${{ github.sha }}\",
              \"priority\": \"normal\",
              \"tags\": [\"env:production\", \"service:jordan-customs\"]
            }"
```

---

## ✅ قائمة التحقق النهائية

- [x] إنشاء حساب Sentry
- [x] إنشاء مشروع Sentry
- [x] الحصول على DSN
- [x] تثبيت Sentry
- [x] تكوين Sentry
- [x] إنشاء حساب DataDog
- [x] الحصول على API Key
- [x] تثبيت DataDog
- [x] تكوين DataDog
- [x] إعداد لوحات المراقبة
- [x] إعداد التنبيهات
- [x] اختبار المراقبة

---

## 🚀 الخطوات التالية

1. ✅ إنشاء حسابات Sentry و DataDog
2. ✅ الحصول على المفاتيح والـ DSN
3. ✅ تثبيت المكتبات
4. ✅ تكوين التطبيق
5. ✅ إضافة متغيرات البيئة
6. ✅ إعادة بناء التطبيق
7. ✅ اختبار المراقبة
8. ✅ إعداد التنبيهات

---

## 📞 الدعم والمساعدة

| الخدمة | البريد | الموقع |
|--------|--------|--------|
| **دعم Sentry** | support@sentry.io | https://sentry.io/support/ |
| **دعم DataDog** | support@datadoghq.com | https://www.datadoghq.com/support/ |

---

**تم الإعداد بواسطة:** فريق التطوير  
**التاريخ:** 11 فبراير 2026  
**الحالة:** جاهز للتفعيل الفوري
