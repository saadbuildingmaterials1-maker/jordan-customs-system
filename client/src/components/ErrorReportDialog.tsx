/**
 * مكون ErrorReportDialog
 * يعرض نافذة حوار للإبلاغ عن الأخطاء
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Send, Copy, CheckCircle } from "lucide-react";

interface ErrorReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialError?: {
    title: string;
    description: string;
    stackTrace?: string;
  };
}

export function ErrorReportDialog({
  open,
  onOpenChange,
  initialError,
}: ErrorReportDialogProps) {
  const [title, setTitle] = useState(initialError?.title || "");
  const [description, setDescription] = useState(initialError?.description || "");
  const [stackTrace, setStackTrace] = useState(initialError?.stackTrace || "");
  const [userEmail, setUserEmail] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submitMutation = trpc.errors.submitErrorReport.useMutation();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert("يرجى ملء العنوان والوصف");
      return;
    }

    submitMutation.mutate(
      {
        title,
        description,
        stackTrace: stackTrace || undefined,
        userEmail: userEmail || undefined,
        userMessage: userMessage || undefined,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.reportId) {
            setReportId(data.reportId);
            // إعادة تعيين النموذج
            setTitle("");
            setDescription("");
            setStackTrace("");
            setUserEmail("");
            setUserMessage("");
          }
        },
      }
    );
  };

  const handleCopyReportId = () => {
    if (reportId) {
      navigator.clipboard.writeText(reportId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setReportId(null);
    onOpenChange(false);
  };

  // عرض رسالة النجاح
  if (reportId) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <DialogTitle>✅ تم إرسال التقرير بنجاح</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              شكراً لمساعدتك في تحسين التطبيق! سيتم مراجعة التقرير من قبل فريق الدعم الفني.
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">معرف التقرير:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-background p-2 rounded">
                  {reportId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyReportId}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                احفظ هذا المعرف للرجوع إليه لاحقاً
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                📧 سيتم التواصل معك عبر البريد الإلكتروني إذا أدخلت بريدك الإلكتروني.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>إرسال تقرير خطأ</DialogTitle>
          </div>
          <DialogDescription>
            ساعدنا في تحسين التطبيق بإرسال تقرير عن الخطأ الذي واجهته
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* العنوان */}
          <div>
            <Label htmlFor="error-title">عنوان الخطأ *</Label>
            <Input
              id="error-title"
              placeholder="مثال: التطبيق توقف عند إضافة شحنة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitMutation.isPending}
            />
          </div>

          {/* الوصف */}
          <div>
            <Label htmlFor="error-description">وصف الخطأ *</Label>
            <Textarea
              id="error-description"
              placeholder="وصف تفصيلي للخطأ والخطوات التي أدت إليه..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitMutation.isPending}
              rows={4}
            />
          </div>

          {/* Stack Trace */}
          <div>
            <Label htmlFor="error-stack">رسالة الخطأ (اختياري)</Label>
            <Textarea
              id="error-stack"
              placeholder="انسخ رسالة الخطأ من وحدة التحكم هنا..."
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              disabled={submitMutation.isPending}
              rows={3}
              className="font-mono text-xs"
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <Label htmlFor="user-email">بريدك الإلكتروني (اختياري)</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="your@email.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={submitMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              سنستخدمه للتواصل معك بشأن التقرير
            </p>
          </div>

          {/* رسالة إضافية */}
          <div>
            <Label htmlFor="user-message">رسالة إضافية (اختياري)</Label>
            <Textarea
              id="user-message"
              placeholder="أي معلومات إضافية تود إضافتها..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={submitMutation.isPending}
              rows={2}
            />
          </div>

          {/* ملاحظة */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              ℹ️ <strong>ملاحظة:</strong> سيتم جمع معلومات النظام تلقائياً مع التقرير.
            </p>
          </div>

          {/* رسالة الخطأ */}
          {submitMutation.isError && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-100">
                ❌ حدث خطأ: {submitMutation.error?.message || "فشل إرسال التقرير"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitMutation.isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !title.trim() || !description.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {submitMutation.isPending ? "جاري الإرسال..." : "إرسال التقرير"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
