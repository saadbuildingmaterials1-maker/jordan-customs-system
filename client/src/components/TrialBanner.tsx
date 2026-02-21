import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TrialBanner() {
  const { data: trialStatus, isLoading } = trpc.auth.checkTrial.useQuery();

  if (isLoading || !trialStatus) return null;

  // Don't show banner for active subscriptions
  if (trialStatus.status === "active") return null;

  // Expired trial
  if (trialStatus.status === "expired" || trialStatus.isExpired) {
    return (
      <Alert className="bg-red-50 border-red-200 mb-6">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900 font-bold">انتهت فترة التجربة المجانية</AlertTitle>
        <AlertDescription className="text-red-800 flex items-center justify-between">
          <span>
            لقد انتهت فترة التجربة المجانية. للاستمرار في استخدام جميع الميزات، يرجى الاشتراك الآن.
          </span>
          <Button className="bg-red-600 hover:bg-red-700 mr-4">
            اشترك الآن
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Active trial
  const daysRemaining = trialStatus.daysRemaining || 0;
  const isLastDays = daysRemaining <= 2;

  return (
    <Alert className={`${isLastDays ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'} mb-6`}>
      <Clock className={`h-4 w-4 ${isLastDays ? 'text-orange-600' : 'text-blue-600'}`} />
      <AlertTitle className={`${isLastDays ? 'text-orange-900' : 'text-blue-900'} font-bold`}>
        {isLastDays ? '⏰ تنبيه: فترة التجربة على وشك الانتهاء' : '✨ فترة التجربة المجانية'}
      </AlertTitle>
      <AlertDescription className={`${isLastDays ? 'text-orange-800' : 'text-blue-800'} flex items-center justify-between`}>
        <span>
          {daysRemaining === 1 
            ? 'يوم واحد متبقي من فترة التجربة المجانية'
            : daysRemaining === 2
            ? 'يومان متبقيان من فترة التجربة المجانية'
            : `${daysRemaining} أيام متبقية من فترة التجربة المجانية`
          }. استمتع بجميع الميزات الآن!
        </span>
        <Button variant={isLastDays ? "default" : "outline"} className={isLastDays ? 'bg-orange-600 hover:bg-orange-700' : ''}>
          اشترك الآن
        </Button>
      </AlertDescription>
    </Alert>
  );
}
