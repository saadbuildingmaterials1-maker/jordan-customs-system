/**
 * مكون UpdateDialog
 * يعرض نافذة حوار للتحديثات الجديدة
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Download, X } from "lucide-react";

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateDialog({ open, onOpenChange }: UpdateDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: updateStatus, isLoading } = trpc.updates.checkForUpdates.useQuery(
    undefined,
    { enabled: open }
  );
  const dismissMutation = trpc.updates.dismissUpdate.useMutation();

  const hasUpdate = updateStatus?.data?.hasUpdate;
  const release = updateStatus?.data?.release;

  const handleDownload = () => {
    if (release?.downloadUrl) {
      setIsDownloading(true);
      window.open(release.downloadUrl, "_blank");
      // إغلاق النافذة بعد 2 ثانية
      setTimeout(() => {
        setIsDownloading(false);
        onOpenChange(false);
      }, 2000);
    }
  };

  const handleDismiss = () => {
    dismissMutation.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>جاري التحقق من التحديثات...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!hasUpdate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>✅ أنت تستخدم الإصدار الأحدث</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center py-4">
            لا توجد تحديثات جديدة متاحة حالياً.
            <br />
            سيتم فحص التحديثات تلقائياً كل 7 أيام.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>تحديث جديد متاح</DialogTitle>
          </div>
          <DialogDescription>
            إصدار {release?.version} من نظام إدارة تكاليف الشحن والجمارك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* معلومات الإصدار */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">ما الجديد؟</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {release?.changeLog || "لا توجد معلومات عن التغييرات"}
            </p>
          </div>

          {/* تاريخ الإصدار */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">تاريخ الإصدار</p>
              <p className="font-medium">
                {release?.releaseDate
                  ? new Date(release.releaseDate).toLocaleDateString("ar-JO")
                  : "غير محدد"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">الإصدار الحالي</p>
              <p className="font-medium">v1.0.1</p>
            </div>
          </div>

          {/* ملاحظة مهمة */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>ملاحظة:</strong> يُنصح بتثبيت التحديث للحصول على أحدث الميزات والإصلاحات الأمنية.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={dismissMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            تجاهل
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading || dismissMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "جاري التحميل..." : "تحميل التحديث"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
