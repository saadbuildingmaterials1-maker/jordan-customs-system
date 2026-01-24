# دليل إدارة المصاريف الشامل

## المقدمة

نظام متكامل لإدارة المصاريف والتكاليف الجمركية والشحن مع تتبع شامل وتقارير مفصلة.

---

## 1. أنواع المصاريف

### مصاريف الشحن
- ✅ رسوم الشحن الأساسية
- ✅ رسوم التأمين
- ✅ رسوم المناولة
- ✅ رسوم التخزين
- ✅ رسوم التوصيل

### المصاريف الجمركية
- ✅ الرسوم الجمركية
- ✅ ضريبة القيمة المضافة
- ✅ رسوم التخليص
- ✅ رسوم الفحص
- ✅ رسوم التسجيل

### المصاريف الإدارية
- ✅ رسوم البنك
- ✅ رسوم المستندات
- ✅ رسوم الاستشارة
- ✅ رسوم الوكالة
- ✅ رسوم أخرى

### مصاريف إضافية
- ✅ مصاريف الطوارئ
- ✅ مصاريف التأخير
- ✅ مصاريف الأضرار
- ✅ مصاريف التعويض

---

## 2. هيكل قاعدة البيانات

### جدول المصاريف

```typescript
interface Expense {
  id: number;
  declarationId: number;
  type: 'shipping' | 'customs' | 'administrative' | 'other';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  vendor: string;
  invoiceNumber: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  notes: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### جدول توزيع المصاريف

```typescript
interface ExpenseAllocation {
  id: number;
  expenseId: number;
  itemId: number;
  percentage: number;
  amount: number;
  allocationMethod: 'weight' | 'value' | 'quantity' | 'manual';
  createdAt: Date;
}
```

---

## 3. إضافة المصاريف

### واجهة إضافة مصروف

```typescript
export function AddExpenseForm() {
  const [formData, setFormData] = useState({
    type: 'shipping',
    category: '',
    description: '',
    amount: '',
    currency: 'JOD',
    date: new Date(),
    vendor: '',
    invoiceNumber: '',
    paymentStatus: 'pending',
    notes: '',
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // رفع المرفقات
      const uploadedAttachments = await uploadAttachments(attachments);
      
      // حفظ المصروف
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          attachments: uploadedAttachments,
        }),
      });
      
      const expense = await response.json();
      
      // إعادة توجيه إلى صفحة التوزيع
      window.location.href = `/expenses/${expense.id}/allocate`;
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* النوع */}
      <div>
        <label>نوع المصروف</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value as any})}
        >
          <option value="shipping">مصاريف الشحن</option>
          <option value="customs">مصاريف جمركية</option>
          <option value="administrative">مصاريف إدارية</option>
          <option value="other">أخرى</option>
        </select>
      </div>
      
      {/* الفئة */}
      <div>
        <label>الفئة</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          placeholder="مثل: رسوم الشحن الأساسية"
        />
      </div>
      
      {/* الوصف */}
      <div>
        <label>الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="وصف تفصيلي للمصروف"
        />
      </div>
      
      {/* المبلغ */}
      <div>
        <label>المبلغ</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="0.00"
          step="0.01"
          required
        />
      </div>
      
      {/* العملة */}
      <div>
        <label>العملة</label>
        <select
          value={formData.currency}
          onChange={(e) => setFormData({...formData, currency: e.target.value})}
        >
          <option value="JOD">دينار أردني</option>
          <option value="USD">دولار أمريكي</option>
          <option value="EUR">يورو</option>
        </select>
      </div>
      
      {/* التاريخ */}
      <div>
        <label>التاريخ</label>
        <input
          type="date"
          value={formData.date.toISOString().split('T')[0]}
          onChange={(e) => setFormData({...formData, date: new Date(e.target.value)})}
        />
      </div>
      
      {/* المورد */}
      <div>
        <label>المورد</label>
        <input
          type="text"
          value={formData.vendor}
          onChange={(e) => setFormData({...formData, vendor: e.target.value})}
          placeholder="اسم الشركة أو المورد"
        />
      </div>
      
      {/* رقم الفاتورة */}
      <div>
        <label>رقم الفاتورة</label>
        <input
          type="text"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
          placeholder="INV-2026-001"
        />
      </div>
      
      {/* حالة الدفع */}
      <div>
        <label>حالة الدفع</label>
        <select
          value={formData.paymentStatus}
          onChange={(e) => setFormData({...formData, paymentStatus: e.target.value as any})}
        >
          <option value="pending">قيد الانتظار</option>
          <option value="paid">مدفوع</option>
          <option value="partial">دفع جزئي</option>
        </select>
      </div>
      
      {/* المرفقات */}
      <div>
        <label>المرفقات</label>
        <input
          type="file"
          multiple
          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
        />
      </div>
      
      {/* الملاحظات */}
      <div>
        <label>الملاحظات</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="ملاحظات إضافية"
        />
      </div>
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        إضافة المصروف
      </button>
    </form>
  );
}
```

---

## 4. توزيع المصاريف

### طرق التوزيع

| الطريقة | الوصف | الاستخدام |
|--------|--------|---------|
| **الوزن** | توزيع حسب وزن البضاعة | الشحنات الثقيلة |
| **القيمة** | توزيع حسب قيمة البضاعة | الشحنات المختلطة |
| **الكمية** | توزيع حسب عدد الوحدات | البضاعع المتطابقة |
| **يدوي** | توزيع يدوي | حالات خاصة |

### واجهة التوزيع

```typescript
export function AllocateExpenseForm({ expenseId }: { expenseId: number }) {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [method, setMethod] = useState<'weight' | 'value' | 'quantity' | 'manual'>('weight');
  const [allocations, setAllocations] = useState<ExpenseAllocation[]>([]);
  
  useEffect(() => {
    // جلب المصروف والبضاعة
    const fetchData = async () => {
      const expenseRes = await fetch(`/api/expenses/${expenseId}`);
      const expense = await expenseRes.json();
      setExpense(expense);
      
      const itemsRes = await fetch(`/api/declarations/${expense.declarationId}/items`);
      const items = await itemsRes.json();
      setItems(items);
      
      // حساب التوزيع الافتراضي
      calculateAllocations(expense, items, method);
    };
    fetchData();
  }, [expenseId, method]);
  
  const calculateAllocations = (expense: Expense, items: Item[], method: string) => {
    if (!expense) return;
    
    let total = 0;
    let allocations: ExpenseAllocation[] = [];
    
    // حساب الإجمالي حسب الطريقة
    if (method === 'weight') {
      total = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    } else if (method === 'value') {
      total = items.reduce((sum, item) => sum + (item.value || 0), 0);
    } else if (method === 'quantity') {
      total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    
    // توزيع المصروف
    for (const item of items) {
      let itemValue = 0;
      if (method === 'weight') {
        itemValue = item.weight || 0;
      } else if (method === 'value') {
        itemValue = item.value || 0;
      } else if (method === 'quantity') {
        itemValue = item.quantity || 0;
      }
      
      const percentage = (itemValue / total) * 100;
      const amount = (expense.amount * percentage) / 100;
      
      allocations.push({
        id: 0,
        expenseId: expense.id,
        itemId: item.id,
        percentage: percentage,
        amount: amount,
        allocationMethod: method as any,
        createdAt: new Date(),
      });
    }
    
    setAllocations(allocations);
  };
  
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocations),
      });
      
      if (response.ok) {
        window.location.href = `/declarations/${expense?.declarationId}`;
      }
    } catch (error) {
      console.error('Error saving allocations:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1>توزيع المصروف</h1>
      
      {/* اختيار الطريقة */}
      <div>
        <label>طريقة التوزيع</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
        >
          <option value="weight">حسب الوزن</option>
          <option value="value">حسب القيمة</option>
          <option value="quantity">حسب الكمية</option>
          <option value="manual">يدوي</option>
        </select>
      </div>
      
      {/* جدول التوزيع */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>البضاعة</th>
            <th>النسبة</th>
            <th>المبلغ</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((allocation) => (
            <tr key={allocation.itemId}>
              <td>
                {items.find(i => i.id === allocation.itemId)?.description}
              </td>
              <td>
                {method === 'manual' ? (
                  <input
                    type="number"
                    value={allocation.percentage}
                    onChange={(e) => {
                      const newAllocations = allocations.map(a =>
                        a.itemId === allocation.itemId
                          ? {...a, percentage: parseFloat(e.target.value), amount: (expense?.amount || 0) * parseFloat(e.target.value) / 100}
                          : a
                      );
                      setAllocations(newAllocations);
                    }}
                  />
                ) : (
                  `${allocation.percentage.toFixed(2)}%`
                )}
              </td>
              <td>{allocation.amount.toFixed(2)} {expense?.currency}</td>
              <td>
                <button onClick={() => console.log('Edit')}>تعديل</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        حفظ التوزيع
      </button>
    </div>
  );
}
```

---

## 5. تقارير المصاريف

### ملخص المصاريف

```typescript
export function ExpenseSummary({ declarationId }: { declarationId: number }) {
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    paymentStatus: {} as Record<string, number>,
  });
  
  useEffect(() => {
    const fetchSummary = async () => {
      const response = await fetch(`/api/declarations/${declarationId}/expenses/summary`);
      const data = await response.json();
      setSummary(data);
    };
    fetchSummary();
  }, [declarationId]);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* الإجمالي */}
      <div className="bg-blue-50 p-4 rounded">
        <h3>إجمالي المصاريف</h3>
        <p className="text-2xl font-bold">{summary.totalExpenses.toFixed(2)}</p>
      </div>
      
      {/* حسب النوع */}
      <div className="bg-green-50 p-4 rounded">
        <h3>حسب النوع</h3>
        <ul>
          {Object.entries(summary.byType).map(([type, amount]) => (
            <li key={type}>{type}: {amount}</li>
          ))}
        </ul>
      </div>
      
      {/* حسب الفئة */}
      <div className="bg-yellow-50 p-4 rounded">
        <h3>حسب الفئة</h3>
        <ul>
          {Object.entries(summary.byCategory).map(([category, amount]) => (
            <li key={category}>{category}: {amount}</li>
          ))}
        </ul>
      </div>
      
      {/* حالة الدفع */}
      <div className="bg-red-50 p-4 rounded">
        <h3>حالة الدفع</h3>
        <ul>
          {Object.entries(summary.paymentStatus).map(([status, count]) => (
            <li key={status}>{status}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 6. الخلاصة

تم توثيق نظام إدارة المصاريف الشامل مع جميع الميزات والتقارير المتقدمة.
