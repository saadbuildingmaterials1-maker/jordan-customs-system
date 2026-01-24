export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-border"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
      <p className="text-sm text-muted-foreground">جاري التحميل...</p>
    </div>
  );
}
