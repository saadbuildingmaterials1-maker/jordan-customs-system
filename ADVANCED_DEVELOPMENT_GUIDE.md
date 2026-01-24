# دليل التطوير المتقدم

## مقدمة

هذا الدليل يوفر معلومات متقدمة للمطورين الذين يريدون توسيع وتحسين نظام إدارة تكاليف الشحن والجمارك الأردنية.

---

## 1. بنية المشروع المتقدمة

### المجلدات الرئيسية

```
jordan-customs-system/
├── client/                    # تطبيق React
│   ├── src/
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── components/       # مكونات React
│   │   ├── lib/              # دوال مساعدة
│   │   └── hooks/            # React Hooks مخصصة
│   └── public/               # موارد ثابتة
├── server/                    # خادم Express
│   ├── routers/              # موجهات tRPC
│   ├── db.ts                 # دوال قاعدة البيانات
│   └── _core/                # ملفات النظام الأساسية
├── drizzle/                  # إعدادات قاعدة البيانات
└── shared/                   # ملفات مشتركة
```

---

## 2. إضافة ميزات جديدة

### خطوات إضافة ميزة جديدة

#### 1. تعديل قاعدة البيانات

```typescript
// drizzle/schema.ts
export const newFeature = sqliteTable('new_feature', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
});
```

#### 2. إنشاء دوال المساعدة

```typescript
// server/db.ts
export async function getNewFeatures() {
  return db.query.newFeature.findMany();
}
```

#### 3. إنشاء موجه tRPC

```typescript
// server/routers/new-feature.ts
import { router, publicProcedure } from '../_core/trpc';

export const newFeatureRouter = router({
  list: publicProcedure.query(async () => {
    return getNewFeatures();
  }),
});
```

#### 4. إضافة الموجه الرئيسي

```typescript
// server/routers.ts
export const appRouter = router({
  newFeature: newFeatureRouter,
  // ... موجهات أخرى
});
```

#### 5. استخدام في الواجهة

```typescript
// client/src/pages/NewFeature.tsx
const { data } = trpc.newFeature.list.useQuery();
```

---

## 3. تحسينات الأداء

### Lazy Loading للصفحات

```typescript
import { lazy, Suspense } from 'react';

const NewFeaturePage = lazy(() => import('./NewFeature'));

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <NewFeaturePage />
    </Suspense>
  );
}
```

### Memoization للدوال

```typescript
import { memoize } from '@/lib/performance-optimization';

const expensiveCalculation = memoize((data: any) => {
  // حسابات معقدة
  return result;
});
```

### Code Splitting

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-ui': ['@shadcn/ui'],
        },
      },
    },
  },
});
```

---

## 4. الأمان والحماية

### إضافة Middleware أمان

```typescript
// server/_core/security-middleware.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export function setupSecurityMiddleware(app: Express) {
  app.use(helmet());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
}
```

### التحقق من الصلاحيات

```typescript
// server/routers.ts
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

---

## 5. الاختبارات

### كتابة اختبارات Vitest

```typescript
// server/new-feature.test.ts
import { describe, it, expect } from 'vitest';
import { getNewFeatures } from './db';

describe('New Feature', () => {
  it('should get all features', async () => {
    const features = await getNewFeatures();
    expect(features).toBeInstanceOf(Array);
  });
});
```

### تشغيل الاختبارات

```bash
pnpm test                    # تشغيل جميع الاختبارات
pnpm test --watch           # تشغيل مع المراقبة
pnpm test --coverage        # مع تقرير التغطية
```

---

## 6. التكامل مع الخدمات الخارجية

### تكامل API خارجي

```typescript
// server/external-api.ts
export async function callExternalAPI(data: any) {
  const response = await fetch('https://api.example.com/endpoint', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.API_KEY}` },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### إضافة إجراء tRPC

```typescript
export const externalRouter = router({
  call: protectedProcedure
    .input(z.object({ data: z.any() }))
    .mutation(async ({ input }) => {
      return callExternalAPI(input.data);
    }),
});
```

---

## 7. قاعدة البيانات

### إضافة فهرس

```typescript
// drizzle/schema.ts
export const newFeature = sqliteTable(
  'new_feature',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => ({
    nameIdx: index('name_idx').on(table.name),
  })
);
```

### الترحيل

```bash
pnpm db:generate   # إنشاء ملف الترحيل
pnpm db:migrate    # تطبيق الترحيل
pnpm db:push       # دفع التغييرات
```

---

## 8. التوثيق

### توثيق الدوال

```typescript
/**
 * الحصول على جميع الميزات الجديدة
 * @returns قائمة الميزات الجديدة
 * @example
 * const features = await getNewFeatures();
 */
export async function getNewFeatures() {
  return db.query.newFeature.findMany();
}
```

---

## 9. النشر والإنتاج

### متغيرات البيئة

```bash
# .env.production
DATABASE_URL=mysql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
```

### البناء والنشر

```bash
pnpm build          # بناء التطبيق
pnpm start          # تشغيل الخادم
```

---

## 10. استكشاف الأخطاء

### تفعيل السجلات

```typescript
// server/_core/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### استخدام السجلات

```typescript
logger.info('تم إنشاء ميزة جديدة', { id: 123 });
logger.error('خطأ في العملية', { error: err });
```

---

## 11. أفضل الممارسات

### 1. استخدم TypeScript بشكل صارم

```typescript
// ✅ جيد
interface User {
  id: number;
  name: string;
}

// ❌ سيء
const user: any = {};
```

### 2. اختبر الكود

```typescript
// ✅ جيد
it('should calculate total cost', () => {
  expect(calculateTotal(100, 10)).toBe(110);
});
```

### 3. استخدم الثوابت

```typescript
// ✅ جيد
const RATE_LIMIT = 100;
const CACHE_DURATION = 3600;

// ❌ سيء
if (count > 100) { /* ... */ }
```

### 4. معالجة الأخطاء

```typescript
// ✅ جيد
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
}
```

---

## الموارد الإضافية

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [React Documentation](https://react.dev)
- [Express.js](https://expressjs.com)
- [Vitest](https://vitest.dev)

---

**آخر تحديث**: يناير 2026
**الإصدار**: 2.0.0
