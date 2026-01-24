# دليل تحسينات التصميم والواجهة

## المقدمة

دليل شامل لتحسينات التصميم والواجهة الرسومية لنظام إدارة تكاليف الشحن والجمارك الأردنية.

---

## 1. نظام التصميم

### المبادئ الأساسية

| المبدأ | الوصف | التطبيق |
|--------|--------|---------|
| **البساطة** | واجهة نظيفة وسهلة الفهم | تقليل الفوضى البصرية |
| **الوضوح** | رسائل واضحة ومباشرة | نصوص بسيطة وموجزة |
| **الاتساق** | تصميم موحد في جميع الصفحات | استخدام نفس الألوان والخطوط |
| **الاستجابة** | دعم جميع أحجام الشاشات | تصميم متجاوب |
| **الوصولية** | سهولة الاستخدام للجميع | تباين كافي وحجم خط مناسب |

### نظام الألوان

```css
/* الألوان الأساسية */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* الأزرق الأساسي */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* ألوان الحالات */
--success: #10b981;      /* نجاح - أخضر */
--warning: #f59e0b;      /* تحذير - أصفر */
--danger: #ef4444;       /* خطر - أحمر */
--info: #0ea5e9;         /* معلومة - أزرق فاتح */

/* ألوان محايدة */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### الخطوط

```css
/* الخط الأساسي */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;

/* حجم الخط */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* وزن الخط */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 2. مكونات الواجهة

### البطاقات (Cards)

```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Card({ title, children, footer, className }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}
    </div>
  );
}
```

### الأزرار

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`rounded-lg font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### الجداول

```typescript
interface TableProps {
  headers: string[];
  rows: any[][];
  onRowClick?: (row: any[]) => void;
}

export function Table({ headers, rows, onRowClick }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onRowClick?.(row)}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### النماذج

```typescript
interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export function FormField({
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

---

## 3. تحسينات التفاعل

### الرسوم المتحركة

```css
/* الانتقالات السلسة */
.transition-smooth {
  transition: all 0.3s ease-in-out;
}

/* تأثير التحويم */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* تأثير النبض */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### الإشعارات والتنبيهات

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function Toast({ type, message, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);
  
  const typeClasses = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  
  if (!visible) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border ${typeClasses[type]}`}>
      {message}
    </div>
  );
}
```

---

## 4. التصميم المتجاوب

### نقاط التوقف

```css
/* الهاتف المحمول */
@media (max-width: 640px) {
  .container { padding: 1rem; }
  .grid { grid-template-columns: 1fr; }
}

/* الجهاز اللوحي */
@media (min-width: 641px) and (max-width: 1024px) {
  .container { padding: 1.5rem; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* سطح المكتب */
@media (min-width: 1025px) {
  .container { padding: 2rem; }
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

### الشبكة المتجاوبة

```typescript
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
```

---

## 5. الوصولية

### معايير WCAG

- ✅ تباين كافي بين النصوص والخلفيات
- ✅ أحجام خط قابلة للقراءة
- ✅ دعم لوحة المفاتيح
- ✅ وسوم ARIA مناسبة
- ✅ نصوص بديلة للصور

### مثال على الوصولية

```typescript
export function AccessibleButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
}
```

---

## 6. الخلاصة

تم توثيق نظام التصميم والواجهة الشامل مع جميع المكونات والتحسينات المتقدمة.
