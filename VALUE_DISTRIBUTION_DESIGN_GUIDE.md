# دليل توزيع القيم والتصميم المتقدم

## المقدمة

نظام متكامل لتوزيع القيم على البضاعة المختلفة وحساب تكلفة الوحدة النهائية (Landed Cost) مع تصميم واجهة متقدمة وسهلة الاستخدام.

---

## 1. مفاهيم توزيع القيم

### تكلفة الوحدة النهائية (Landed Cost)

تكلفة الوحدة النهائية = (قيمة البضاعة + جميع المصاريف) / عدد الوحدات

### مكونات التكلفة

| المكون | الوصف | الحساب |
|--------|--------|--------|
| **القيمة الأساسية** | سعر الشراء من المورد | مباشر |
| **رسوم الشحن** | تكاليف النقل | توزيع حسب الوزن |
| **رسوم التأمين** | تأمين الشحنة | توزيع حسب القيمة |
| **الرسوم الجمركية** | رسوم الاستيراد | حسب HS Code |
| **ضريبة القيمة المضافة** | الضريبة المحلية | حسب القيمة الإجمالية |
| **مصاريف إدارية** | رسوم التخليص والتوثيق | توزيع يدوي |

---

## 2. خوارزميات التوزيع

### التوزيع حسب الوزن

```typescript
function distributeByWeight(
  expense: Expense,
  items: Item[]
): ExpenseAllocation[] {
  // حساب الوزن الإجمالي
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
  
  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }
  
  // توزيع المصروف
  return items.map(item => {
    const itemWeight = item.weight || 0;
    const percentage = (itemWeight / totalWeight) * 100;
    const amount = (expense.amount * percentage) / 100;
    
    return {
      itemId: item.id,
      expenseId: expense.id,
      percentage,
      amount,
      allocationMethod: 'weight',
    };
  });
}
```

### التوزيع حسب القيمة

```typescript
function distributeByValue(
  expense: Expense,
  items: Item[]
): ExpenseAllocation[] {
  // حساب القيمة الإجمالية
  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);
  
  if (totalValue === 0) {
    throw new Error('Total value cannot be zero');
  }
  
  // توزيع المصروف
  return items.map(item => {
    const itemValue = item.value || 0;
    const percentage = (itemValue / totalValue) * 100;
    const amount = (expense.amount * percentage) / 100;
    
    return {
      itemId: item.id,
      expenseId: expense.id,
      percentage,
      amount,
      allocationMethod: 'value',
    };
  });
}
```

### التوزيع حسب الكمية

```typescript
function distributeByQuantity(
  expense: Expense,
  items: Item[]
): ExpenseAllocation[] {
  // حساب الكمية الإجمالية
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  if (totalQuantity === 0) {
    throw new Error('Total quantity cannot be zero');
  }
  
  // توزيع المصروف
  return items.map(item => {
    const itemQuantity = item.quantity || 0;
    const percentage = (itemQuantity / totalQuantity) * 100;
    const amount = (expense.amount * percentage) / 100;
    
    return {
      itemId: item.id,
      expenseId: expense.id,
      percentage,
      amount,
      allocationMethod: 'quantity',
    };
  });
}
```

### التوزيع اليدوي

```typescript
function distributeManually(
  expense: Expense,
  allocations: ManualAllocation[]
): ExpenseAllocation[] {
  // التحقق من أن الإجمالي = 100%
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Total percentage must be 100%, got ${totalPercentage}`);
  }
  
  // توزيع المصروف
  return allocations.map(allocation => ({
    itemId: allocation.itemId,
    expenseId: expense.id,
    percentage: allocation.percentage,
    amount: (expense.amount * allocation.percentage) / 100,
    allocationMethod: 'manual',
  }));
}
```

---

## 3. حساب تكلفة الوحدة النهائية

### الخوارزمية الرئيسية

```typescript
interface LandedCostCalculation {
  itemId: number;
  basePrice: number;
  shippingCost: number;
  insuranceCost: number;
  customsDuty: number;
  vat: number;
  administrativeCosts: number;
  totalCost: number;
  quantity: number;
  unitCost: number;
  profitMargin: number;
  suggestedSellingPrice: number;
}

function calculateLandedCost(
  item: Item,
  expenses: Expense[],
  allocations: ExpenseAllocation[]
): LandedCostCalculation {
  // جمع المصاريف حسب النوع
  const expensesByType = groupExpensesByType(expenses, allocations, item.id);
  
  // حساب الإجمالي
  const totalCost =
    item.value +
    (expensesByType.shipping || 0) +
    (expensesByType.insurance || 0) +
    (expensesByType.customsDuty || 0) +
    (expensesByType.vat || 0) +
    (expensesByType.administrative || 0);
  
  // حساب تكلفة الوحدة
  const unitCost = totalCost / (item.quantity || 1);
  
  // حساب السعر المقترح للبيع (مع هامش ربح 30%)
  const profitMargin = 0.30;
  const suggestedSellingPrice = unitCost * (1 + profitMargin);
  
  return {
    itemId: item.id,
    basePrice: item.value,
    shippingCost: expensesByType.shipping || 0,
    insuranceCost: expensesByType.insurance || 0,
    customsDuty: expensesByType.customsDuty || 0,
    vat: expensesByType.vat || 0,
    administrativeCosts: expensesByType.administrative || 0,
    totalCost,
    quantity: item.quantity || 1,
    unitCost,
    profitMargin,
    suggestedSellingPrice,
  };
}
```

---

## 4. واجهة توزيع القيم

### صفحة التوزيع المتقدمة

```typescript
export function ValueDistributionPage({ declarationId }: { declarationId: number }) {
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allocations, setAllocations] = useState<ExpenseAllocation[]>([]);
  const [distributionMethod, setDistributionMethod] = useState<'weight' | 'value' | 'quantity' | 'manual'>('weight');
  const [landedCosts, setLandedCosts] = useState<LandedCostCalculation[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      // جلب البيانات
      const [declRes, itemsRes, expensesRes] = await Promise.all([
        fetch(`/api/declarations/${declarationId}`),
        fetch(`/api/declarations/${declarationId}/items`),
        fetch(`/api/declarations/${declarationId}/expenses`),
      ]);
      
      const decl = await declRes.json();
      const itms = await itemsRes.json();
      const exps = await expensesRes.json();
      
      setDeclaration(decl);
      setItems(itms);
      setExpenses(exps);
      
      // حساب التوزيع الافتراضي
      const allocs = calculateDistribution(exps, itms, distributionMethod);
      setAllocations(allocs);
      
      // حساب تكاليف الوحدة
      const costs = itms.map(item =>
        calculateLandedCost(item, exps, allocs)
      );
      setLandedCosts(costs);
    };
    
    fetchData();
  }, [declarationId, distributionMethod]);
  
  const handleDistributionMethodChange = (method: any) => {
    setDistributionMethod(method);
  };
  
  const handleAllocationChange = (itemId: number, newAmount: number) => {
    const updatedAllocations = allocations.map(a =>
      a.itemId === itemId ? {...a, amount: newAmount} : a
    );
    setAllocations(updatedAllocations);
    
    // إعادة حساب تكاليف الوحدة
    const costs = items.map(item =>
      calculateLandedCost(item, expenses, updatedAllocations)
    );
    setLandedCosts(costs);
  };
  
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/declarations/${declarationId}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocations),
      });
      
      if (response.ok) {
        alert('تم حفظ التوزيع بنجاح');
      }
    } catch (error) {
      console.error('Error saving allocations:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1>توزيع القيم وحساب تكلفة الوحدة النهائية</h1>
      
      {/* اختيار طريقة التوزيع */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2>طريقة التوزيع</h2>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="weight"
              checked={distributionMethod === 'weight'}
              onChange={(e) => handleDistributionMethodChange(e.target.value)}
            />
            حسب الوزن
          </label>
          <label>
            <input
              type="radio"
              value="value"
              checked={distributionMethod === 'value'}
              onChange={(e) => handleDistributionMethodChange(e.target.value)}
            />
            حسب القيمة
          </label>
          <label>
            <input
              type="radio"
              value="quantity"
              checked={distributionMethod === 'quantity'}
              onChange={(e) => handleDistributionMethodChange(e.target.value)}
            />
            حسب الكمية
          </label>
          <label>
            <input
              type="radio"
              value="manual"
              checked={distributionMethod === 'manual'}
              onChange={(e) => handleDistributionMethodChange(e.target.value)}
            />
            يدوي
          </label>
        </div>
      </div>
      
      {/* جدول التوزيع */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <h2>توزيع المصاريف</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">البضاعة</th>
              <th className="border p-2">الكمية</th>
              <th className="border p-2">القيمة الأساسية</th>
              <th className="border p-2">مصاريف الشحن</th>
              <th className="border p-2">الرسوم الجمركية</th>
              <th className="border p-2">ضريبة القيمة</th>
              <th className="border p-2">إجمالي التكلفة</th>
              <th className="border p-2">تكلفة الوحدة</th>
            </tr>
          </thead>
          <tbody>
            {landedCosts.map((cost) => (
              <tr key={cost.itemId} className="hover:bg-gray-50">
                <td className="border p-2">
                  {items.find(i => i.id === cost.itemId)?.description}
                </td>
                <td className="border p-2 text-right">
                  {cost.quantity}
                </td>
                <td className="border p-2 text-right">
                  {cost.basePrice.toFixed(2)}
                </td>
                <td className="border p-2 text-right">
                  <input
                    type="number"
                    value={cost.shippingCost}
                    onChange={(e) => handleAllocationChange(cost.itemId, parseFloat(e.target.value))}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="border p-2 text-right">
                  {cost.customsDuty.toFixed(2)}
                </td>
                <td className="border p-2 text-right">
                  {cost.vat.toFixed(2)}
                </td>
                <td className="border p-2 text-right font-bold">
                  {cost.totalCost.toFixed(2)}
                </td>
                <td className="border p-2 text-right font-bold text-blue-600">
                  {cost.unitCost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ملخص التكاليف */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold">إجمالي التكاليف</h3>
          <p className="text-2xl font-bold">
            {landedCosts.reduce((sum, c) => sum + c.totalCost, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold">متوسط تكلفة الوحدة</h3>
          <p className="text-2xl font-bold">
            {(landedCosts.reduce((sum, c) => sum + c.unitCost, 0) / landedCosts.length).toFixed(2)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-bold">إجمالي الكمية</h3>
          <p className="text-2xl font-bold">
            {landedCosts.reduce((sum, c) => sum + c.quantity, 0)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-bold">السعر المقترح للبيع</h3>
          <p className="text-2xl font-bold">
            {landedCosts.reduce((sum, c) => sum + c.suggestedSellingPrice, 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* الأزرار */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          حفظ التوزيع
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
```

---

## 5. تحسينات التصميم

### نظام الألوان

```css
:root {
  --primary: #3b82f6;      /* أزرق */
  --success: #10b981;      /* أخضر */
  --warning: #f59e0b;      /* أصفر */
  --danger: #ef4444;       /* أحمر */
  --info: #0ea5e9;         /* أزرق فاتح */
  --secondary: #8b5cf6;    /* بنفسجي */
}
```

### المكونات المعاد استخدامها

- ✅ جداول البيانات المتقدمة
- ✅ نماذج الإدخال المحسنة
- ✅ الرسوم البيانية والمخططات
- ✅ الإشعارات والتنبيهات
- ✅ أزرار الإجراءات

---

## 6. الخلاصة

تم توثيق نظام توزيع القيم والتصميم المتقدم مع جميع الخوارزميات والواجهات المتقدمة.
