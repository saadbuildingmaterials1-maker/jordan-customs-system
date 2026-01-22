# دليل المطور - نظام إدارة تكاليف الشحن والجمارك الأردنية 👨‍💻

## مقدمة

يوفر دليل المطور معلومات تقنية شاملة للمطورين الذين يرغبون في المساهمة أو توسيع نظام إدارة تكاليف الشحن والجمارك الأردنية.

## جدول المحتويات

1. [متطلبات التطوير](#متطلبات-التطوير)
2. [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
3. [البنية المعمارية](#البنية-المعمارية)
4. [المكونات الرئيسية](#المكونات-الرئيسية)
5. [قاعدة البيانات](#قاعدة-البيانات)
6. [tRPC والإجراءات](#trpc-والإجراءات)
7. [المصادقة والأمان](#المصادقة-والأمان)
8. [الاختبار](#الاختبار)
9. [النشر](#النشر)
10. [أفضل الممارسات](#أفضل-الممارسات)

## متطلبات التطوير

### البرامج المطلوبة

- **Node.js**: الإصدار 18 أو أحدث
- **npm** أو **pnpm**: مدير الحزم (يُفضل pnpm)
- **Git**: نظام التحكم بالإصدارات
- **Visual Studio Code**: محرر النصوص (اختياري ولكن موصى به)
- **MySQL**: قاعدة البيانات
- **Postman**: لاختبار API (اختياري)

### المكتبات والأدوات

```json
{
  "react": "^19.0.0",
  "tailwindcss": "^4.0.0",
  "express": "^4.18.0",
  "trpc": "^11.0.0",
  "drizzle-orm": "^0.30.0",
  "stripe": "^14.0.0",
  "typescript": "^5.0.0"
}
```

## إعداد بيئة التطوير

### 1. استنساخ المستودع

```bash
git clone https://github.com/jordan-customs/system.git
cd jordan-customs-system
```

### 2. تثبيت الاعتماديات

```bash
pnpm install
```

### 3. إعداد متغيرات البيئة

```bash
cp .env.example .env.local
```

ثم قم بتحديث المتغيرات:

```env
DATABASE_URL=mysql://user:password@localhost:3306/jordan_customs
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
STRIPE_SECRET_KEY=your-stripe-key
```

### 4. إعداد قاعدة البيانات

```bash
pnpm db:push
```

### 5. تشغيل خادم التطوير

```bash
pnpm dev
```

سيبدأ الخادم على `http://localhost:3000`.

## البنية المعمارية

### نمط MVC

يتبع المشروع نمط معماري حديث يجمع بين:

- **الواجهة الأمامية**: React مع Tailwind CSS
- **الخادم**: Express مع tRPC
- **قاعدة البيانات**: MySQL مع Drizzle ORM

### الطبقات

```
┌─────────────────────────────────────┐
│       React UI (Presentation)       │
├─────────────────────────────────────┤
│        tRPC Client & Hooks          │
├─────────────────────────────────────┤
│     Express Server & tRPC Router    │
├─────────────────────────────────────┤
│    Database Layer (Drizzle ORM)     │
├─────────────────────────────────────┤
│      MySQL Database                 │
└─────────────────────────────────────┘
```

## المكونات الرئيسية

### الواجهة الأمامية (Client)

تقع في مجلد `client/src/` وتتضمن:

- **Pages**: صفحات التطبيق (Home, Dashboard, Declarations, etc.)
- **Components**: مكونات React قابلة لإعادة الاستخدام
- **Contexts**: React Contexts للحالة العامة
- **Hooks**: Custom Hooks للمنطق المشترك
- **Lib**: مكتبات مساعدة (trpc.ts, etc.)

### الخادم (Server)

يقع في مجلد `server/` ويتضمن:

- **routers.ts**: تعريفات tRPC والإجراءات
- **db.ts**: استعلامات قاعدة البيانات
- **auth.ts**: منطق المصادقة
- **_core**: ملفات النظام الأساسية

## قاعدة البيانات

### الجداول الرئيسية

| الجدول | الوصف |
|------|-------|
| **users** | بيانات المستخدمين |
| **declarations** | البيانات الجمركية |
| **items** | عناصر الشحنة |
| **invoices** | الفواتير |
| **costs** | التكاليف والرسوم |
| **notifications** | الإشعارات |

### تعريف الجداول

يتم تعريف الجداول في `drizzle/schema.ts`:

```typescript
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  role: text('role').default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const declarations = sqliteTable('declarations', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  shipmentNumber: text('shipment_number'),
  totalCost: real('total_cost'),
  status: text('status').default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

### الهجرات

لإنشاء هجرة جديدة:

```bash
pnpm drizzle-kit generate
pnpm db:push
```

## tRPC والإجراءات

### تعريف الإجراء

يتم تعريف الإجراءات في `server/routers.ts`:

```typescript
export const appRouter = router({
  declarations: router({
    list: publicProcedure
      .query(async ({ ctx }) => {
        return await db.query.declarations.findMany({
          where: eq(declarations.userId, ctx.user?.id),
        });
      }),
    
    create: protectedProcedure
      .input(z.object({
        shipmentNumber: z.string(),
        totalCost: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.insert(declarations).values({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),
});
```

### استخدام الإجراء في الواجهة الأمامية

```typescript
import { trpc } from '@/lib/trpc';

export function DeclarationsList() {
  const { data, isLoading } = trpc.declarations.list.useQuery();
  const createMutation = trpc.declarations.create.useMutation();

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <ul>
          {data?.map(d => (
            <li key={d.id}>{d.shipmentNumber}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## المصادقة والأمان

### Manus OAuth

يتم التعامل مع المصادقة عبر Manus OAuth:

```typescript
import { getLoginUrl } from '@/const';

export function LoginButton() {
  return (
    <button onClick={() => {
      window.location.href = getLoginUrl();
    }}>
      تسجيل الدخول
    </button>
  );
}
```

### الإجراءات المحمية

للإجراءات التي تتطلب مصادقة:

```typescript
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});
```

### التحقق من الدور

للإجراءات التي تتطلب دور معين:

```typescript
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

## الاختبار

### اختبارات الوحدة

يتم كتابة الاختبارات باستخدام Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotalCost } from '@/lib/calculations';

describe('calculateTotalCost', () => {
  it('should calculate total cost correctly', () => {
    const result = calculateTotalCost({
      fobValue: 1000,
      shippingCost: 100,
      insuranceCost: 50,
      customsDuty: 200,
    });
    expect(result).toBe(1350);
  });
});
```

### تشغيل الاختبارات

```bash
pnpm test
```

### اختبارات التكامل

لاختبار الإجراءات الكاملة:

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/routers';

describe('declarations router', () => {
  it('should create a declaration', async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: 'user' },
    });
    
    const result = await caller.declarations.create({
      shipmentNumber: 'SHP-001',
      totalCost: 1500,
    });
    
    expect(result.id).toBeDefined();
  });
});
```

## النشر

### البناء للإنتاج

```bash
pnpm build
```

### التحقق من الأخطاء

```bash
pnpm lint
pnpm type-check
```

### النشر على Manus

```bash
pnpm deploy
```

## أفضل الممارسات

### 1. كتابة الكود النظيف

- استخدم أسماء واضحة ومعبرة للمتغيرات والدوال
- اتبع معايير الترميز المتفق عليها
- اكتب تعليقات واضحة للكود المعقد

### 2. الأداء

- استخدم `useMemo` و `useCallback` لتحسين الأداء
- تجنب إعادة التصيير غير الضرورية
- استخدم الـ lazy loading للمكونات الثقيلة

### 3. الأمان

- تحقق دائماً من صحة المدخلات
- استخدم متغيرات البيئة للبيانات الحساسة
- لا تخزن كلمات المرور أو البيانات الحساسة في localStorage

### 4. قابلية الصيانة

- اكتب اختبارات شاملة
- استخدم TypeScript للأمان النوعي
- وثّق الكود والواجهات البرمجية

### 5. التعاون

- استخدم Git بشكل صحيح (commits واضحة، branches منظمة)
- اطلب مراجعة الكود قبل الدمج
- وثّق التغييرات الكبيرة

---

**آخر تحديث**: 22 يناير 2026  
**الإصدار**: 2.5.0
