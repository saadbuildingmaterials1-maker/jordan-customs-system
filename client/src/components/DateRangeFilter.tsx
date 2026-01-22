import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears, addMonths, addQuarters, addYears } from "date-fns";
import { ar } from "date-fns/locale";

export type PeriodType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type ComparisonType = "none" | "previous_period" | "year_over_year";

export interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onComparisonChange?: (comparisonType: ComparisonType, startDate?: Date, endDate?: Date) => void;
  onPeriodChange?: (periodType: PeriodType) => void;
}

/**
 * مكون الفلاتر الزمنية المتقدمة
 * يوفر خيارات متعددة للاختيار بين فترات زمنية مختلفة والمقارنة بينها
 */
export default function DateRangeFilter({
  onDateRangeChange,
  onComparisonChange,
  onPeriodChange,
}: DateRangeFilterProps) {
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [comparisonType, setComparisonType] = useState<ComparisonType>("none");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showCustomRange, setShowCustomRange] = useState(false);

  // حساب نطاق التاريخ بناءً على نوع الفترة
  const getDateRange = (date: Date, period: PeriodType) => {
    switch (period) {
      case "daily":
        return { start: date, end: date };
      case "weekly":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { start: weekStart, end: weekEnd };
      case "monthly":
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case "quarterly":
        return { start: startOfQuarter(date), end: endOfQuarter(date) };
      case "yearly":
        return { start: startOfYear(date), end: endOfYear(date) };
    }
  };

  // حساب الفترة المقارنة
  const getComparisonDateRange = (date: Date, period: PeriodType, comparison: ComparisonType) => {
    if (comparison === "none") return null;

    if (comparison === "previous_period") {
      switch (period) {
        case "daily":
          const prevDay = new Date(date);
          prevDay.setDate(date.getDate() - 1);
          return { start: prevDay, end: prevDay };
        case "weekly":
          const prevWeekStart = new Date(date);
          prevWeekStart.setDate(date.getDate() - 7 - date.getDay());
          const prevWeekEnd = new Date(prevWeekStart);
          prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
          return { start: prevWeekStart, end: prevWeekEnd };
        case "monthly":
          const prevMonth = subMonths(date, 1);
          return { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) };
        case "quarterly":
          const prevQuarter = subQuarters(date, 1);
          return { start: startOfQuarter(prevQuarter), end: endOfQuarter(prevQuarter) };
        case "yearly":
          const prevYear = subYears(date, 1);
          return { start: startOfYear(prevYear), end: endOfYear(prevYear) };
      }
    }

    if (comparison === "year_over_year") {
      const lastYear = subYears(date, 1);
      switch (period) {
        case "daily":
          return { start: lastYear, end: lastYear };
        case "weekly":
          const weekStartLY = new Date(lastYear);
          weekStartLY.setDate(lastYear.getDate() - lastYear.getDay());
          const weekEndLY = new Date(weekStartLY);
          weekEndLY.setDate(weekStartLY.getDate() + 6);
          return { start: weekStartLY, end: weekEndLY };
        case "monthly":
          return { start: startOfMonth(lastYear), end: endOfMonth(lastYear) };
        case "quarterly":
          return { start: startOfQuarter(lastYear), end: endOfQuarter(lastYear) };
        case "yearly":
          return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
    }

    return null;
  };

  // معالج تغيير نوع الفترة
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
    setShowCustomRange(false);
    const range = getDateRange(currentDate, newPeriod);
    onDateRangeChange(range.start, range.end);
    onPeriodChange?.(newPeriod);
  };

  // معالج تغيير نوع المقارنة
  const handleComparisonChange = (newComparison: ComparisonType) => {
    setComparisonType(newComparison);
    const comparisonRange = getComparisonDateRange(currentDate, periodType, newComparison);
    onComparisonChange?.(newComparison, comparisonRange?.start, comparisonRange?.end);
  };

  // معالج الانتقال للفترة السابقة
  const handlePreviousPeriod = () => {
    let newDate = currentDate;
    switch (periodType) {
      case "daily":
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case "weekly":
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case "monthly":
        newDate = subMonths(currentDate, 1);
        break;
      case "quarterly":
        newDate = subQuarters(currentDate, 1);
        break;
      case "yearly":
        newDate = subYears(currentDate, 1);
        break;
    }
    setCurrentDate(newDate);
    const range = getDateRange(newDate, periodType);
    onDateRangeChange(range.start, range.end);
  };

  // معالج الانتقال للفترة التالية
  const handleNextPeriod = () => {
    let newDate = currentDate;
    switch (periodType) {
      case "daily":
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case "monthly":
        newDate = addMonths(currentDate, 1);
        break;
      case "quarterly":
        newDate = addQuarters(currentDate, 1);
        break;
      case "yearly":
        newDate = addYears(currentDate, 1);
        break;
    }
    setCurrentDate(newDate);
    const range = getDateRange(newDate, periodType);
    onDateRangeChange(range.start, range.end);
  };

  // معالج تطبيق النطاق المخصص
  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      onDateRangeChange(startDate, endDate);
      setShowCustomRange(false);
    }
  };

  // الحصول على نطاق التاريخ الحالي
  const currentRange = getDateRange(currentDate, periodType);

  // نص وصفي للفترة الحالية
  const getPeriodLabel = () => {
    switch (periodType) {
      case "daily":
        return format(currentDate, "EEEE، d MMMM yyyy", { locale: ar });
      case "weekly":
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, "d MMM", { locale: ar })} - ${format(weekEnd, "d MMM yyyy", { locale: ar })}`;
      case "monthly":
        return format(currentDate, "MMMM yyyy", { locale: ar });
      case "quarterly":
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
        return `الربع ${quarter} - ${currentDate.getFullYear()}`;
      case "yearly":
        return format(currentDate, "yyyy", { locale: ar });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          فلاتر التقارير الزمنية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* اختيار نوع الفترة */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">نوع الفترة</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { value: "daily", label: "يومي" },
              { value: "weekly", label: "أسبوعي" },
              { value: "monthly", label: "شهري" },
              { value: "quarterly", label: "ربع سنوي" },
              { value: "yearly", label: "سنوي" },
            ].map((period) => (
              <Button
                key={period.value}
                variant={periodType === period.value ? "default" : "outline"}
                onClick={() => handlePeriodChange(period.value as PeriodType)}
                className="w-full"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* التنقل بين الفترات */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">الفترة الحالية</label>
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousPeriod}
              className="flex-1"
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              السابقة
            </Button>
            <div className="flex-1 text-center font-semibold text-slate-900">
              {getPeriodLabel()}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPeriod}
              className="flex-1"
            >
              التالية
              <ChevronLeft className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* خيارات المقارنة */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">المقارنة</label>
          <Select value={comparisonType} onValueChange={(value) => handleComparisonChange(value as ComparisonType)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المقارنة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون مقارنة</SelectItem>
              <SelectItem value="previous_period">مقارنة مع الفترة السابقة</SelectItem>
              <SelectItem value="year_over_year">مقارنة سنة على سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* نطاق مخصص */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowCustomRange(!showCustomRange)}
            className="w-full"
          >
            {showCustomRange ? "إخفاء النطاق المخصص" : "استخدام نطاق مخصص"}
          </Button>

          {showCustomRange && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">تاريخ البداية</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">تاريخ النهاية</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleApplyCustomRange}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                تطبيق النطاق المخصص
              </Button>
            </div>
          )}
        </div>

        {/* ملخص الفترة */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-slate-700">
            <div className="font-semibold mb-2">الفترة المحددة:</div>
            <div className="space-y-1 text-xs">
              <div>
                من: <span className="font-mono">{format(currentRange.start, "yyyy-MM-dd")}</span>
              </div>
              <div>
                إلى: <span className="font-mono">{format(currentRange.end, "yyyy-MM-dd")}</span>
              </div>
              {comparisonType !== "none" && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="font-semibold mb-1">الفترة المقارنة:</div>
                  {(() => {
                    const compRange = getComparisonDateRange(currentDate, periodType, comparisonType);
                    return compRange ? (
                      <div className="space-y-1 text-xs">
                        <div>
                          من: <span className="font-mono">{format(compRange.start, "yyyy-MM-dd")}</span>
                        </div>
                        <div>
                          إلى: <span className="font-mono">{format(compRange.end, "yyyy-MM-dd")}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
