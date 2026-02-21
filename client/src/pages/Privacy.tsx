import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              سياسة الخصوصية
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              آخر تحديث: {new Date().toLocaleDateString('ar-JO')}
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المقدمة</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  نحن في نظام إدارة تكاليف الشحن والجمارك الأردنية نلتزم بحماية خصوصيتك وبياناتك الشخصية.
                  توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المعلومات التي نجمعها</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>قد نجمع الأنواع التالية من المعلومات:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>معلومات الحساب (الاسم، البريد الإلكتروني)</li>
                  <li>بيانات الشحنات والبيانات الجمركية التي تدخلها</li>
                  <li>معلومات الاستخدام (الصفحات المزارة، الوقت المستغرق)</li>
                  <li>معلومات تقنية (عنوان IP، نوع المتصفح)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>كيفية استخدام المعلومات</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>توفير وتحسين خدماتنا</li>
                  <li>حساب التكاليف الجمركية وتكاليف الشحن</li>
                  <li>حفظ بياناتك لاسترجاعها لاحقاً</li>
                  <li>التواصل معك بخصوص الخدمة</li>
                  <li>تحليل استخدام النظام لتحسين الأداء</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حماية البيانات</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل
                  أو الإفصاح أو الإتلاف. تشمل هذه الإجراءات:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>استخدام خوادم آمنة ومحمية</li>
                  <li>تقييد الوصول إلى البيانات الشخصية</li>
                  <li>مراجعة دورية للإجراءات الأمنية</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مشاركة المعلومات</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>بموافقتك الصريحة</li>
                  <li>للامتثال للقوانين واللوائح</li>
                  <li>لحماية حقوقنا وممتلكاتنا</li>
                  <li>مع مزودي خدمات موثوقين يساعدوننا في تشغيل النظام</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حقوقك</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>لديك الحق في:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>الوصول إلى معلوماتك الشخصية</li>
                  <li>تصحيح المعلومات غير الدقيقة</li>
                  <li>حذف معلوماتك الشخصية</li>
                  <li>الاعتراض على معالجة بياناتك</li>
                  <li>طلب نقل بياناتك</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملفات تعريف الارتباط (Cookies)</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك في استخدام النظام. يمكنك التحكم
                  في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التغييرات على سياسة الخصوصية</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عن طريق
                  نشر السياسة الجديدة على هذه الصفحة.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>اتصل بنا</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>البريد الإلكتروني:</strong> saad.building.materials1@gmail.com</li>
                  <li><strong>الهاتف:</strong> 00962795917424</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
