/**
 * VarianceAnalysis Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/VarianceAnalysis
 */
import { useState } from "react";
import { useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

export default function VarianceAnalysis() {
  const { id } = useParams<{ id: string }>();
  const [estimatedData, setEstimatedData] = useState({
    estimatedFobValue: 0,
    estimatedFreight: 0,
    estimatedInsurance: 0,
    estimatedCustomsDuty: 0,
    estimatedSalesTax: 0,
  });

  // Queries
  const { data: declaration, isLoading: isLoadingDeclaration } =
    trpc.customs.getDeclaration.useQuery(
      { id: parseInt(id!) },
      { enabled: !!id }
    );

  const { data: variances, isLoading: isLoadingVariances } =
    trpc.variances.getVariances.useQuery(
      { declarationId: parseInt(id!) },
      { enabled: !!id }
    );

  // Mutations
  const calculateVariancesMutation = trpc.variances.calculateVariances.useMutation();

  const handleCalculateVariances = async () => {
    try {
      await calculateVariancesMutation.mutateAsync({
        declarationId: parseInt(id!),
        ...estimatedData,
      });
      toast.success("تم حساب الانحرافات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حساب الانحرافات");
    }
  };

  if (isLoadingDeclaration) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!declaration) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">البيان الجمركي غير موجود</p>
        </div>
      </DashboardLayout>
    );
  }

  // إعداد بيانات المقارنة
  const comparisonData = [
    {
      name: "قيمة البضاعة",
      فعلي: Number(declaration.fobValueJod),
      تقديري: estimatedData.estimatedFobValue,
    },
    {
      name: "الشحن",
      فعلي: Number(declaration.freightCost),
      تقديري: estimatedData.estimatedFreight,
    },
    {
      name: "التأمين",
      فعلي: Number(declaration.insuranceCost),
      تقديري: estimatedData.estimatedInsurance,
    },
    {
      name: "الرسوم الجمركية",
      فعلي: Number(declaration.customsDuty),
      تقديري: estimatedData.estimatedCustomsDuty,
    },
    {
      name: "ضريبة المبيعات",
      فعلي: Number(declaration.salesTax),
      تقديري: estimatedData.estimatedSalesTax,
    },
  ];

  // بيانات الانحرافات
  const varianceChartData = variances
    ? [
        {
          name: "قيمة البضاعة",
          انحراف: Number(variances.fobVariance),
          نسبة: Number(variances.fobVariancePercent),
        },
        {
          name: "الشحن",
          انحراف: Number(variances.freightVariance),
          نسبة: Number(variances.freightVariancePercent),
        },
        {
          name: "التأمين",
          انحراف: Number(variances.insuranceVariance),
          نسبة: Number(variances.insuranceVariancePercent),
        },
        {
          name: "الرسوم الجمركية",
          انحراف: Number(variances.customsDutyVariance),
          نسبة: Number(variances.customsDutyVariancePercent),
        },
        {
          name: "ضريبة المبيعات",
          انحراف: Number(variances.salesTaxVariance),
          نسبة: Number(variances.salesTaxVariancePercent),
        },
      ]
    : [];

  const COLORS = ["#1f4788", "#4a90e2", "#7cb342", "#ffa726", "#ef5350"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="section-title">تحليل الانحرافات والمقارنات</h1>
          <p className="text-muted-foreground">
            مقارنة التكاليف الفعلية مع التقديرية وحساب الانحرافات
          </p>
        </div>

        {/* نموذج إدخال التكاليف التقديرية */}
        <Card className="card-elegant p-6">
          <h2 className="text-lg font-bold mb-6 text-foreground">
            إدخال التكاليف التقديرية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="estimatedFob" className="text-sm font-semibold">
                قيمة البضاعة التقديرية (JOD)
              </Label>
              <Input
                id="estimatedFob"
                type="number"
                step="0.001"
                value={estimatedData.estimatedFobValue}
                onChange={(e) =>
                  setEstimatedData({
                    ...estimatedData,
                    estimatedFobValue: Number(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="estimatedFreight" className="text-sm font-semibold">
                الشحن التقديري (JOD)
              </Label>
              <Input
                id="estimatedFreight"
                type="number"
                step="0.001"
                value={estimatedData.estimatedFreight}
                onChange={(e) =>
                  setEstimatedData({
                    ...estimatedData,
                    estimatedFreight: Number(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="estimatedInsurance" className="text-sm font-semibold">
                التأمين التقديري (JOD)
              </Label>
              <Input
                id="estimatedInsurance"
                type="number"
                step="0.001"
                value={estimatedData.estimatedInsurance}
                onChange={(e) =>
                  setEstimatedData({
                    ...estimatedData,
                    estimatedInsurance: Number(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="estimatedDuty" className="text-sm font-semibold">
                الرسوم التقديرية (JOD)
              </Label>
              <Input
                id="estimatedDuty"
                type="number"
                step="0.001"
                value={estimatedData.estimatedCustomsDuty}
                onChange={(e) =>
                  setEstimatedData({
                    ...estimatedData,
                    estimatedCustomsDuty: Number(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="estimatedTax" className="text-sm font-semibold">
                الضريبة التقديرية (JOD)
              </Label>
              <Input
                id="estimatedTax"
                type="number"
                step="0.001"
                value={estimatedData.estimatedSalesTax}
                onChange={(e) =>
                  setEstimatedData({
                    ...estimatedData,
                    estimatedSalesTax: Number(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
          </div>
          <Button
            onClick={handleCalculateVariances}
            className="btn-primary mt-6"
            disabled={calculateVariancesMutation.isPending}
          >
            {calculateVariancesMutation.isPending ? "جاري الحساب..." : "حساب الانحرافات"}
          </Button>
        </Card>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني مقارنة الأعمدة */}
          <Card className="card-elegant p-6">
            <h3 className="text-lg font-bold mb-4 text-foreground">
              مقارنة التكاليف الفعلية مع التقديرية
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    Number(value).toLocaleString("ar-JO", {
                      style: "currency",
                      currency: "JOD",
                      minimumFractionDigits: 2,
                    })
                  }
                />
                <Legend />
                <Bar dataKey="فعلي" fill="#1f4788" />
                <Bar dataKey="تقديري" fill="#4a90e2" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* رسم بياني الانحرافات */}
          {variances && (
            <Card className="card-elegant p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">
                نسبة الانحرافات %
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={varianceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Legend />
                  <Bar dataKey="نسبة" fill="#ef5350" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* ملخص الانحرافات */}
        {variances && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="stat-card">
              <p className="stat-label">انحراف قيمة البضاعة</p>
              <p className={`stat-value ${Number(variances.fobVariance) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(variances.fobVariance) > 0 ? "+" : ""}
                {Number(variances.fobVariance).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(variances.fobVariancePercent).toFixed(2)}%
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-label">انحراف الشحن</p>
              <p className={`stat-value ${Number(variances.freightVariance) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(variances.freightVariance) > 0 ? "+" : ""}
                {Number(variances.freightVariance).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(variances.freightVariancePercent).toFixed(2)}%
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-label">انحراف التأمين</p>
              <p className={`stat-value ${Number(variances.insuranceVariance) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(variances.insuranceVariance) > 0 ? "+" : ""}
                {Number(variances.insuranceVariance).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(variances.insuranceVariancePercent).toFixed(2)}%
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-label">انحراف الرسوم</p>
              <p className={`stat-value ${Number(variances.customsDutyVariance) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(variances.customsDutyVariance) > 0 ? "+" : ""}
                {Number(variances.customsDutyVariance).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(variances.customsDutyVariancePercent).toFixed(2)}%
              </p>
            </div>

            <div className="stat-card border-2 border-accent">
              <p className="stat-label">الانحراف الإجمالي</p>
              <p className={`stat-value ${Number(variances.totalVariance) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(variances.totalVariance) > 0 ? "+" : ""}
                {Number(variances.totalVariance).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(variances.totalVariancePercent).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* جدول تفصيلي للانحرافات */}
        {variances && (
          <Card className="card-elegant overflow-x-auto">
            <table className="table-elegant">
              <thead>
                <tr>
                  <th>البند</th>
                  <th>الفعلي (JOD)</th>
                  <th>التقديري (JOD)</th>
                  <th>الانحراف (JOD)</th>
                  <th>نسبة الانحراف %</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">قيمة البضاعة</td>
                  <td>{Number(declaration.fobValueJod).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{estimatedData.estimatedFobValue.toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.fobVariance).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.fobVariancePercent).toFixed(2)}%</td>
                  <td>
                    {Number(variances.fobVariance) > 0 ? (
                      <span className="badge-danger flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        أعلى من التقدير
                      </span>
                    ) : (
                      <span className="badge-success flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        أقل من التقدير
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">الشحن</td>
                  <td>{Number(declaration.freightCost).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{estimatedData.estimatedFreight.toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.freightVariance).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.freightVariancePercent).toFixed(2)}%</td>
                  <td>
                    {Number(variances.freightVariance) > 0 ? (
                      <span className="badge-danger flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        أعلى من التقدير
                      </span>
                    ) : (
                      <span className="badge-success flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        أقل من التقدير
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">التأمين</td>
                  <td>{Number(declaration.insuranceCost).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{estimatedData.estimatedInsurance.toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.insuranceVariance).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.insuranceVariancePercent).toFixed(2)}%</td>
                  <td>
                    {Number(variances.insuranceVariance) > 0 ? (
                      <span className="badge-danger flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        أعلى من التقدير
                      </span>
                    ) : (
                      <span className="badge-success flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        أقل من التقدير
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">الرسوم الجمركية</td>
                  <td>{Number(declaration.customsDuty).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{estimatedData.estimatedCustomsDuty.toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.customsDutyVariance).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.customsDutyVariancePercent).toFixed(2)}%</td>
                  <td>
                    {Number(variances.customsDutyVariance) > 0 ? (
                      <span className="badge-danger flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        أعلى من التقدير
                      </span>
                    ) : (
                      <span className="badge-success flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        أقل من التقدير
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">ضريبة المبيعات</td>
                  <td>{Number(declaration.salesTax).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{estimatedData.estimatedSalesTax.toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.salesTaxVariance).toLocaleString("ar-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 3 })}</td>
                  <td>{Number(variances.salesTaxVariancePercent).toFixed(2)}%</td>
                  <td>
                    {Number(variances.salesTaxVariance) > 0 ? (
                      <span className="badge-danger flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        أعلى من التقدير
                      </span>
                    ) : (
                      <span className="badge-success flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        أقل من التقدير
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
