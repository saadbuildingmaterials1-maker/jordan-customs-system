import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              شروط الاستخدام
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              آخر تحديث: {new Date().toLocaleDateString('ar-JO')}
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>قبول الشروط</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  باستخدامك لنظام إدارة تكاليف الشحن والجمارك الأردنية، فإنك توافق على الالتزام
                  بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام النظام.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>استخدام النظام</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>يحق لك استخدام النظام للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>حساب التكاليف الجمركية وتكاليف الشحن</li>
                  <li>استيراد وتحليل البيانات الجمركية</li>
                  <li>تتبع الحاويات والشحنات</li>
                  <li>إدارة عمليات الاستيراد الخاصة بك</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>القيود على الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>يُحظر عليك:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>استخدام النظام لأي أغراض غير قانونية</li>
                  <li>محاولة اختراق أو تعطيل النظام</li>
                  <li>نسخ أو توزيع محتوى النظام دون إذن</li>
                  <li>استخدام النظام بطريقة تضر بالمستخدمين الآخرين</li>
                  <li>إدخال فيروسات أو برامج ضارة</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>دقة المعلومات</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  تنويه مهم:
                </p>
                <p>
                  النظام يوفر تقديرات تقريبية للتكاليف الجمركية وتكاليف الشحن. هذه التقديرات
                  قد لا تكون دقيقة 100% وقد تختلف عن الأرقام الفعلية.
                </p>
                <p>
                  للحصول على أرقام دقيقة ونهائية، يجب مراجعة دائرة الجمارك الأردنية أو الجهات
                  الرسمية المختصة.
                </p>
                <p>
                  نحن غير مسؤولين عن أي خسائر أو أضرار قد تنتج عن الاعتماد على المعلومات
                  المقدمة من النظام.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الملكية الفكرية</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  جميع حقوق الملكية الفكرية للنظام، بما في ذلك التصميم والكود والمحتوى، محفوظة
                  للمطور. لا يجوز نسخ أو توزيع أو تعديل أي جزء من النظام دون إذن كتابي مسبق.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حساب المستخدم</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>أنت مسؤول عن:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>الحفاظ على سرية معلومات حسابك</li>
                  <li>جميع الأنشطة التي تحدث تحت حسابك</li>
                  <li>إخطارنا فوراً بأي استخدام غير مصرح به</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إخلاء المسؤولية</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  يتم توفير النظام "كما هو" دون أي ضمانات من أي نوع، صريحة أو ضمنية. نحن لا
                  نضمن أن النظام سيكون خالياً من الأخطاء أو متاحاً دون انقطاع.
                </p>
                <p>
                  لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية ناتجة
                  عن استخدام أو عدم القدرة على استخدام النظام.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التعديلات على الشروط</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه
                  الصفحة، واستمرارك في استخدام النظام بعد التعديلات يعني قبولك للشروط الجديدة.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إنهاء الخدمة</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  نحتفظ بالحق في تعليق أو إنهاء وصولك إلى النظام في أي وقت، دون إشعار مسبق،
                  لأي سبب، بما في ذلك انتهاك هذه الشروط.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>القانون الواجب التطبيق</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  تخضع هذه الشروط وتفسر وفقاً لقوانين المملكة الأردنية الهاشمية. أي نزاع ينشأ
                  عن هذه الشروط يخضع للاختصاص الحصري للمحاكم الأردنية.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>اتصل بنا</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  إذا كان لديك أي أسئلة حول شروط الاستخدام، يرجى الاتصال بنا:
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
