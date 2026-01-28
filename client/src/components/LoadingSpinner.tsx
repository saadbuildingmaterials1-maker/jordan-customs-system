import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'جاري التحميل...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' 
    : '';

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${containerClasses}`}>
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
      {message && (
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      )}
    </div>
  );
}

// مكون تحميل سريع للصفحات
export function QuickLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

// مكون تحميل للأزرار
export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

// مكون تحميل للبطاقات
export function CardLoader() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  );
}

// مكون تحميل للجداول
export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-muted rounded flex-1"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}
