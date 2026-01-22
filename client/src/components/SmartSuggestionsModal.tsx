import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface SmartSuggestion {
  itemName: string;
  suggestedCustomsCode: string;
  suggestedDutyRate: number;
  confidence: number;
  reasoning: string;
}

interface DeclarationAnalysis {
  riskLevel: "منخفض" | "متوسط" | "مرتفع";
  warnings: string[];
  suggestions: string[];
  estimatedDutyPercentage: number;
}

interface CostPrediction {
  estimatedCustomsDuty: number;
  estimatedTotalCost: number;
  costBreakdown: {
    fobValue: number;
    freight: number;
    insurance: number;
    customsDuty: number;
    salesTax: number;
    totalCost: number;
  };
}

interface SmartSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "classification" | "analysis" | "prediction";
  data: SmartSuggestion | DeclarationAnalysis | CostPrediction | null;
  isLoading: boolean;
  onAccept?: (data: any) => void;
}

export function SmartSuggestionsModal({
  isOpen,
  onClose,
  type,
  data,
  isLoading,
  onAccept,
}: SmartSuggestionsModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (onAccept && data) {
      onAccept(data);
      setAccepted(true);
      toast.success("تم قبول الاقتراح الذكي بنجاح");
      setTimeout(() => {
        setAccepted(false);
        onClose();
      }, 1500);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "منخفض":
        return "bg-green-100 text-green-800";
      case "متوسط":
        return "bg-yellow-100 text-yellow-800";
      case "مرتفع":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {type === "classification" && "اقتراح ذكي لتصنيف الصنف"}
            {type === "analysis" && "تحليل ذكي للبيان الجمركي"}
            {type === "prediction" && "توقع ذكي للتكاليف"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {type === "classification" && "يستخدم الذكاء الاصطناعي لاقتراح الكود الجمركي الصحيح"}
            {type === "analysis" && "تحليل شامل للبيان مع تقييم المخاطر"}
            {type === "prediction" && "توقع دقيق للتكاليف الجمركية والضريبية"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="mr-3 text-lg">جاري المعالجة...</span>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {type === "classification" && (
              <ClassificationSuggestion
                data={data as SmartSuggestion}
                onAccept={handleAccept}
                accepted={accepted}
              />
            )}
            {type === "analysis" && (
              <AnalysisSuggestion
                data={data as DeclarationAnalysis}
                onAccept={handleAccept}
                accepted={accepted}
              />
            )}
            {type === "prediction" && (
              <PredictionSuggestion
                data={data as CostPrediction}
                onAccept={handleAccept}
                accepted={accepted}
              />
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ClassificationSuggestion({
  data,
  onAccept,
  accepted,
}: {
  data: SmartSuggestion;
  onAccept: () => void;
  accepted: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-right text-lg">الاقتراح الرئيسي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">الكود الجمركي المقترح</p>
              <p className="text-2xl font-bold text-blue-600">{data.suggestedCustomsCode}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-right">
              <p className="text-sm text-gray-600">معدل الرسم الجمركي</p>
              <p className="text-xl font-bold">{data.suggestedDutyRate}%</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-right">
              <p className="text-sm text-gray-600">درجة الثقة</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xl font-bold">{data.confidence}%</span>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-right">
            <p className="text-sm font-semibold text-amber-900">التفسير العلمي</p>
            <p className="mt-1 text-sm text-amber-800">{data.reasoning}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={onAccept}
          disabled={accepted}
          className="flex-1"
          variant="default"
        >
          {accepted ? "تم القبول" : "قبول الاقتراح"}
        </Button>
      </div>
    </div>
  );
}

function AnalysisSuggestion({
  data,
  onAccept,
  accepted,
}: {
  data: DeclarationAnalysis;
  onAccept: () => void;
  accepted: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-right text-lg">تقييم المخاطر</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={`text-lg px-4 py-2 ${
            data.riskLevel === 'منخفض' ? 'bg-green-100 text-green-800' :
            data.riskLevel === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {data.riskLevel}
          </Badge>
          <p className="mt-2 text-sm text-gray-600">
            معدل الرسم الجمركي المتوقع: <span className="font-bold">{data.estimatedDutyPercentage}%</span>
          </p>
        </CardContent>
      </Card>

      {data.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right text-sm flex items-center justify-end gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              التحذيرات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-right">
              {data.warnings.map((warning, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span>•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right text-sm">الاقتراحات</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-right">
              {data.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <span>✓</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          onClick={onAccept}
          disabled={accepted}
          className="flex-1"
          variant="default"
        >
          {accepted ? "تم الفهم" : "فهمت"}
        </Button>
      </div>
    </div>
  );
}

function PredictionSuggestion({
  data,
  onAccept,
  accepted,
}: {
  data: CostPrediction;
  onAccept: () => void;
  accepted: boolean;
}) {
  const breakdown = data.costBreakdown;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-right text-lg">توقع التكاليف</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-green-50 p-4 text-right">
            <p className="text-sm text-green-600">إجمالي التكلفة المتوقعة</p>
            <p className="text-3xl font-bold text-green-700">
              {breakdown.totalCost.toLocaleString("ar-JO")} د.ا
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between rounded-lg bg-gray-50 p-2 text-sm">
              <span className="font-semibold">قيمة البضاعة (FOB)</span>
              <span>{breakdown.fobValue.toLocaleString("ar-JO")} د.ا</span>
            </div>
            <div className="flex justify-between rounded-lg bg-gray-50 p-2 text-sm">
              <span className="font-semibold">أجور الشحن</span>
              <span>{breakdown.freight.toLocaleString("ar-JO")} د.ا</span>
            </div>
            <div className="flex justify-between rounded-lg bg-gray-50 p-2 text-sm">
              <span className="font-semibold">التأمين</span>
              <span>{breakdown.insurance.toLocaleString("ar-JO")} د.ا</span>
            </div>
            <div className="flex justify-between rounded-lg bg-red-50 p-2 text-sm">
              <span className="font-semibold">الرسوم الجمركية</span>
              <span className="text-red-600">{breakdown.customsDuty.toLocaleString("ar-JO")} د.ا</span>
            </div>
            <div className="flex justify-between rounded-lg bg-orange-50 p-2 text-sm">
              <span className="font-semibold">ضريبة المبيعات (16%)</span>
              <span className="text-orange-600">{breakdown.salesTax.toLocaleString("ar-JO")} د.ا</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={onAccept}
          disabled={accepted}
          className="flex-1"
          variant="default"
        >
          {accepted ? "تم القبول" : "قبول التوقع"}
        </Button>
      </div>
    </div>
  );
}
