import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Code, Briefcase } from "lucide-react";

export default function Developer() {
  const developerInfo = {
    name: "سعد النابلسي",
    email: "saad.building.materials1@gmail.com",
    phone: "00962795917424",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Code className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              المطور
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              معلومات المطور والتواصل
            </p>
          </div>

          {/* Developer Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6" />
                {developerInfo.name}
              </CardTitle>
              <CardDescription>
                مطور نظام إدارة تكاليف الشحن والجمارك الأردنية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">رقم الهاتف</p>
                    <a
                      href={`tel:${developerInfo.phone}`}
                      className="text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      dir="ltr"
                    >
                      {developerInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">البريد الإلكتروني</p>
                    <a
                      href={`mailto:${developerInfo.email}`}
                      className="text-sm font-semibold text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate block"
                    >
                      {developerInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="flex-1" size="lg">
                  <a href={`tel:${developerInfo.phone}`}>
                    <Phone className="h-5 w-5 ml-2" />
                    اتصل الآن
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <a href={`mailto:${developerInfo.email}`}>
                    <Mail className="h-5 w-5 ml-2" />
                    أرسل بريد إلكتروني
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About the System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                عن النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                نظام إدارة تكاليف الشحن والجمارك الأردنية هو نظام متكامل يهدف إلى تسهيل عملية حساب
                التكاليف الجمركية والشحن للمستوردين في الأردن.
              </p>
              <p>
                يوفر النظام مجموعة من الأدوات الاحترافية بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>حاسبة التكاليف الجمركية والشحن</li>
                <li>استيراد البيانات الجمركية من PDF</li>
                <li>توزيع التكاليف التلقائي على الأصناف</li>
                <li>تتبع الحاويات والشحنات</li>
                <li>لوحة تحكم شاملة مع إحصائيات مباشرة</li>
              </ul>
              <p className="pt-4 border-t">
                <strong>ملاحظة:</strong> هذا النظام يوفر تقديرات تقريبية. للحصول على أرقام دقيقة،
                يرجى مراجعة دائرة الجمارك الأردنية.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
