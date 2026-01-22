'use client';

import React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  FileText,
  Package,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react';

export interface ImportSuccessData {
  declarationNumber: string;
  date: string;
  importerName: string;
  itemsCount: number;
  totalValue: number;
  currency: string;
  confidence: number;
  customsDuty?: number;
  tax?: number;
  totalAmount?: number;
}

export interface ImportSuccessAlertProps {
  data: ImportSuccessData;
  className?: string;
}

export function ImportSuccessAlert({
  data,
  className = '',
}: ImportSuccessAlertProps) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('ar-JO', {
      style: 'currency',
      currency: currency === 'JOD' ? 'JOD' : currency === 'USD' ? 'USD' : 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 border-green-300';
    if (confidence >= 75) return 'bg-blue-100 border-blue-300';
    if (confidence >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-orange-100 border-orange-300';
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-700';
    if (confidence >= 75) return 'text-blue-700';
    if (confidence >= 60) return 'text-yellow-700';
    return 'text-orange-700';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* رسالة النجاح الرئيسية */}
      <Alert className="border-green-300 bg-green-50">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800 text-base font-bold">
          ✓ تم استيراد البيان الجمركي بنجاح!
        </AlertTitle>
        <AlertDescription className="text-green-700 mt-2">
          تم استخراج جميع البيانات من ملف PDF وحفظها في النظام بنجاح.
        </AlertDescription>
      </Alert>

      {/* بطاقة معلومات البيان */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-blue-600" />
            معلومات البيان الجمركي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* رقم البيان والتاريخ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-gray-600 font-medium">رقم البيان</p>
              <p className="text-lg font-bold text-blue-700 mt-1">
                {data.declarationNumber}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                التاريخ
              </p>
              <p className="text-lg font-bold text-blue-700 mt-1">{data.date}</p>
            </div>
          </div>

          {/* المستورد */}
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
              <User className="h-3 w-3" />
              المستورد
            </p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {data.importerName}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* بطاقة تفاصيل الأصناف والقيم */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-purple-600" />
            تفاصيل الأصناف والقيم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* عدد الأصناف والقيمة الإجمالية */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <p className="text-xs text-gray-600 font-medium">عدد الأصناف</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {data.itemsCount}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                القيمة الأساسية
              </p>
              <p className="text-lg font-bold text-purple-700 mt-1">
                {formatCurrency(data.totalValue, data.currency)}
              </p>
            </div>
          </div>

          {/* الرسوم والضرائب والإجمالي */}
          {data.customsDuty !== undefined && (
            <div className="bg-white p-3 rounded-lg border border-purple-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">الرسوم الجمركية:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(data.customsDuty, data.currency)}
                </span>
              </div>
              {data.tax !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">ضريبة المبيعات:</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(data.tax, data.currency)}
                  </span>
                </div>
              )}
              {data.totalAmount !== undefined && (
                <div className="border-t border-purple-100 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">
                    الإجمالي النهائي:
                  </span>
                  <span className="text-lg font-bold text-purple-700">
                    {formatCurrency(data.totalAmount, data.currency)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* مؤشر درجة الثقة */}
      <Card
        className={`border-2 ${getConfidenceColor(data.confidence)}`}
      >
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              درجة ثقة البيانات المستخرجة
            </p>
            <span
              className={`text-lg font-bold ${getConfidenceTextColor(
                data.confidence
              )}`}
            >
              {data.confidence}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                data.confidence >= 90
                  ? 'bg-green-500'
                  : data.confidence >= 75
                    ? 'bg-blue-500'
                    : data.confidence >= 60
                      ? 'bg-yellow-500'
                      : 'bg-orange-500'
              }`}
              style={{ width: `${data.confidence}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {data.confidence >= 90
              ? '✓ جودة عالية جداً - البيانات موثوقة تماماً'
              : data.confidence >= 75
                ? '✓ جودة عالية - البيانات موثوقة'
                : data.confidence >= 60
                  ? '⚠ جودة متوسطة - تحقق من البيانات'
                  : '⚠ جودة منخفضة - يفضل المراجعة اليدوية'}
          </p>
        </CardContent>
      </Card>

      {/* رسالة إضافية */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800 text-sm">
          <p className="font-medium mb-1">💡 ملاحظة:</p>
          <p>
            يمكنك الآن مراجعة البيانات المستوردة وتعديلها إذا لزم الأمر. جميع
            البيانات محفوظة بنجاح في النظام.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
