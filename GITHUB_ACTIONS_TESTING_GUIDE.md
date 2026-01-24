# دليل GitHub Actions والاختبارات الشامل

## المقدمة

دليل شامل لإعداد GitHub Actions وتشغيل الاختبارات الآلية والبناء المستمر لنظام إدارة تكاليف الشحن والجمارك الأردنية.

---

## 1. GitHub Actions

### إعداد المستودع

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: customs_db
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: mysql://root:root@localhost:3306/customs_db
      
      - name: Build application
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### سير العمل للبناء

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npm run build:web
      
      - name: Build Electron
        run: npm run build:electron
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.os }}
          path: dist-electron/
```

---

## 2. الاختبارات

### اختبارات الوحدة (Unit Tests)

```typescript
// server/customs-declaration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCustomsDuty, validateDeclaration } from './customs-declaration';

describe('Customs Declaration', () => {
  describe('calculateCustomsDuty', () => {
    it('should calculate duty correctly', () => {
      const result = calculateCustomsDuty({
        value: 1000,
        code: '0201',
        country: 'US',
      });
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1000);
    });
    
    it('should handle zero value', () => {
      const result = calculateCustomsDuty({
        value: 0,
        code: '0201',
        country: 'US',
      });
      
      expect(result).toBe(0);
    });
    
    it('should throw error for invalid code', () => {
      expect(() => {
        calculateCustomsDuty({
          value: 1000,
          code: 'INVALID',
          country: 'US',
        });
      }).toThrow();
    });
  });
  
  describe('validateDeclaration', () => {
    it('should validate correct declaration', () => {
      const declaration = {
        number: 'DEC-2026-001',
        items: [{ code: '0201', quantity: 10, value: 1000 }],
        importer: 'Test Company',
      };
      
      const result = validateDeclaration(declaration);
      expect(result.valid).toBe(true);
    });
    
    it('should reject missing required fields', () => {
      const declaration = {
        number: 'DEC-2026-001',
        items: [],
        importer: '',
      };
      
      const result = validateDeclaration(declaration);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Importer is required');
    });
  });
});
```

### اختبارات التكامل (Integration Tests)

```typescript
// server/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from './server';
import axios from 'axios';

describe('Integration Tests', () => {
  let server: any;
  let baseURL: string;
  
  beforeAll(async () => {
    server = await createServer();
    baseURL = 'http://localhost:3000';
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  describe('Customs Declaration API', () => {
    it('should create declaration', async () => {
      const response = await axios.post(`${baseURL}/api/declarations`, {
        items: [
          { code: '0201', quantity: 10, value: 1000 }
        ],
        importer: 'Test Company',
      });
      
      expect(response.status).toBe(201);
      expect(response.data.id).toBeDefined();
    });
    
    it('should retrieve declaration', async () => {
      const createRes = await axios.post(`${baseURL}/api/declarations`, {
        items: [{ code: '0201', quantity: 10, value: 1000 }],
        importer: 'Test Company',
      });
      
      const getRes = await axios.get(
        `${baseURL}/api/declarations/${createRes.data.id}`
      );
      
      expect(getRes.status).toBe(200);
      expect(getRes.data.id).toBe(createRes.data.id);
    });
    
    it('should update declaration', async () => {
      const createRes = await axios.post(`${baseURL}/api/declarations`, {
        items: [{ code: '0201', quantity: 10, value: 1000 }],
        importer: 'Test Company',
      });
      
      const updateRes = await axios.put(
        `${baseURL}/api/declarations/${createRes.data.id}`,
        {
          status: 'approved',
        }
      );
      
      expect(updateRes.status).toBe(200);
      expect(updateRes.data.status).toBe('approved');
    });
    
    it('should delete declaration', async () => {
      const createRes = await axios.post(`${baseURL}/api/declarations`, {
        items: [{ code: '0201', quantity: 10, value: 1000 }],
        importer: 'Test Company',
      });
      
      const deleteRes = await axios.delete(
        `${baseURL}/api/declarations/${createRes.data.id}`
      );
      
      expect(deleteRes.status).toBe(204);
    });
  });
});
```

### اختبارات الأداء (Performance Tests)

```typescript
// server/performance.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLandedCost } from './landed-cost';

describe('Performance Tests', () => {
  it('should calculate landed cost for 1000 items in < 100ms', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      quantity: 10,
      value: 1000,
      weight: 5,
    }));
    
    const startTime = performance.now();
    
    for (const item of items) {
      calculateLandedCost(item, []);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });
  
  it('should handle concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      calculateLandedCost({ id: 1, quantity: 10, value: 1000, weight: 5 }, [])
    );
    
    const startTime = performance.now();
    await Promise.all(requests);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
```

---

## 3. تغطية الاختبارات

### إعدادات Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'dist-electron/',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
});
```

### تقرير التغطية

```bash
# تشغيل الاختبارات مع التغطية
npm test -- --coverage

# عرض تقرير HTML
open coverage/index.html
```

---

## 4. الاختبارات اليدوية

### قائمة الاختبار

| الميزة | الخطوات | النتيجة المتوقعة |
|--------|--------|-----------------|
| **إنشاء بيان** | 1. انقر على "جديد" 2. أدخل البيانات 3. انقر "حفظ" | يتم إنشاء البيان بنجاح |
| **استيراد PDF** | 1. انقر على "استيراد" 2. اختر ملف PDF 3. انقر "استيراد" | يتم استخراج البيانات من PDF |
| **حساب الرسوم** | 1. أدخل رمز جمركي 2. أدخل القيمة 3. انقر "حساب" | يتم حساب الرسوم بشكل صحيح |
| **توزيع المصاريف** | 1. أضف مصروف 2. اختر طريقة التوزيع 3. انقر "توزيع" | يتم توزيع المصاريف بشكل متساوي |
| **تصدير البيان** | 1. افتح البيان 2. انقر "تصدير" 3. اختر الصيغة | يتم تصدير البيان بالصيغة المختارة |

---

## 5. سكريبتات الاختبار

### package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint src server --ext .ts,.tsx",
    "lint:fix": "eslint src server --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\" \"server/**/*.ts\""
  }
}
```

---

## 6. الخلاصة

تم توثيق نظام GitHub Actions والاختبارات الشامل مع جميع الأنواع والتكوينات المتقدمة.
