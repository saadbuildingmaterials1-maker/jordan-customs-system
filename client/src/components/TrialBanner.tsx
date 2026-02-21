import { trpc } from "@/lib/trpc";
import { AlertCircle, Crown, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: trialInfo, isLoading } = trpc.auth.checkTrial.useQuery();

  if (isLoading || dismissed || !trialInfo) return null;

  // Don't show banner for active subscriptions
  if (trialInfo.status === "active") return null;

  const isExpired = trialInfo.status === "expired";
  const daysRemaining = trialInfo.daysRemaining || 0;

  // Color scheme based on days remaining
  const getColorScheme = () => {
    if (isExpired) {
      return {
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-900 dark:text-red-100",
        icon: "text-red-600 dark:text-red-400",
        button: "bg-red-600 hover:bg-red-700 text-white",
      };
    }
    if (daysRemaining <= 2) {
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-900 dark:text-orange-100",
        icon: "text-orange-600 dark:text-orange-400",
        button: "bg-orange-600 hover:bg-orange-700 text-white",
      };
    }
    return {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-900 dark:text-blue-100",
      icon: "text-blue-600 dark:text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    };
  };

  const colors = getColorScheme();

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-6 relative`}>
      <button
        onClick={() => setDismissed(true)}
        className={`absolute top-3 left-3 ${colors.icon} hover:opacity-70 transition-opacity`}
        aria-label="إغلاق"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div className={`${colors.icon} mt-0.5`}>
          {isExpired ? (
            <AlertCircle className="h-6 w-6" />
          ) : (
            <Crown className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${colors.text} mb-1`}>
            {isExpired
              ? "انتهت فترة التجربة المجانية"
              : `${daysRemaining} ${daysRemaining === 1 ? "يوم" : "أيام"} متبقية من التجربة المجانية`}
          </h3>
          <p className={`text-sm ${colors.text} opacity-90 mb-3`}>
            {isExpired
              ? "للاستمرار في استخدام جميع ميزات النظام، يرجى الاشتراك في إحدى الخطط المتاحة."
              : "استمتع بجميع ميزات النظام خلال فترة التجربة. قم بالترقية الآن للحصول على وصول غير محدود."}
          </p>

          <Link href="/pricing">
            <button className={`${colors.button} px-4 py-2 rounded-md text-sm font-medium transition-colors`}>
              {isExpired ? "اشترك الآن" : "ترقية الحساب"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
