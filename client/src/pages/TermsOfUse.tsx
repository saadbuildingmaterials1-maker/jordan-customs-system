import React from 'react';
import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfUse() {
  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'تعريف الخدمة',
      content: `Jordan Customs System هي منصة رقمية توفر:
      • إدارة البيانات الجمركية والشحنات
      • حساب الرسوم والضرائب تلقائياً
      • تقارير وتحليلات متقدمة
      • إدارة المستخدمين والأدوار
      • دعم فني وخدمة عملاء
      
      الخدمة متاحة عبر الويب والهاتف وسطح المكتب.`
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'شروط الاستخدام',
      content: `بقبول هذه الشروط، أنت توافق على:
      • استخدام الخدمة فقط للأغراض المشروعة
      • عدم انتهاك القوانين والتشريعات المعمول بها
      • عدم استخدام الخدمة بطريقة قد تضر الآخرين
      • عدم محاولة اختراق أو تعطيل النظام
      • عدم نسخ أو توزيع محتوى الخدمة بدون إذن
      • عدم استخدام الخدمة لأغراض تجارية غير مصرح بها`
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'المسؤولية والالتزامات',
      content: `أنت مسؤول عن:
      • دقة المعلومات التي تدخلها في النظام
      • حماية بيانات حسابك وكلمة المرور
      • الإبلاغ عن أي استخدام غير مصرح به
      • الامتثال لجميع القوانين المعمول بها
      • عدم نقل حسابك لشخص آخر
      • الاحتفاظ بنسخ احتياطية من بيانات مهمة
      
      نحن لا نتحمل مسؤولية الأخطاء الناتجة عن إدخالك الخاطئ.`
    },
    {
      icon: <XCircle className="w-6 h-6" />,
      title: 'السلوك المحظور',
      content: `يُحظر عليك:
      • نشر محتوى غير قانوني أو مسيء
      • محاولة اختراق النظام أو الخوادم
      • استخدام برامج ضارة أو فيروسات
      • إرسال رسائل غير مرغوب فيها (Spam)
      • انتحال شخصية أو الادعاء بهوية كاذبة
      • محاولة الوصول لحسابات أخرى بدون إذن
      • نقل البيانات الحساسة لأطراف ثالثة
      
      انتهاك هذه الشروط قد يؤدي لإيقاف حسابك.`
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'الملكية الفكرية',
      content: `جميع محتوى الخدمة (البرنامج، التصاميم، النصوص):
      • مملوكة لـ Jordan Customs System أو مرخصة لنا
      • محمية بموجب قوانين الملكية الفكرية
      • لا يمكن نسخها أو توزيعها بدون إذن
      
      محتواك الشخصي:
      • تحتفظ بملكيته الكاملة
      • تمنحنا الحق في استخدامه لتحسين الخدمة
      • لا نبيع أو نوزع محتواك لأطراف ثالثة`
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'إنهاء الخدمة',
      content: `يمكنك إنهاء حسابك في أي وقت:
      • من خلال إعدادات الحساب
      • سيتم حذف بيانات حسابك بعد 30 يوم
      • يمكنك طلب حذف فوري للبيانات
      
      نحن قد ننهي خدمتك إذا:
      • انتهكت هذه الشروط بشكل متكرر
      • استخدمت الخدمة بطريقة غير قانونية
      • لم تدفع الرسوم المستحقة
      • لم تستخدم الحساب لمدة سنة كاملة`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Scale className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">شروط الاستخدام</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا
          </p>
          <p className="text-sm text-amber-200 mt-4">آخر تحديث: يناير 2026</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                تحدد شروط الاستخدام هذه الحقوق والالتزامات بينك وبين Jordan Customs System. باستخدام خدماتنا، فإنك توافق على الالتزام بهذه الشروط بالكامل.
              </p>
              <p className="text-gray-700 leading-relaxed">
                إذا كنت تستخدم الخدمة نيابة عن شركة أو جهة حكومية، فأنت تؤكد أن لديك السلطة لقبول هذه الشروط نيابة عنهم.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-3 text-amber-900">
                  <span className="text-amber-600">{section.icon}</span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الخدمة "كما هي"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                نوفر الخدمة "كما هي" بدون ضمانات صريحة أو ضمنية. لا نضمن:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>عدم وجود أخطاء أو انقطاعات في الخدمة</li>
                <li>دقة جميع البيانات والحسابات</li>
                <li>توفر الخدمة بنسبة 100% في جميع الأوقات</li>
                <li>عدم وجود فيروسات أو برامج ضارة</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تحديد المسؤولية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                في أي حال من الأحوال، لن نكون مسؤولين عن:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>الأضرار المباشرة أو غير المباشرة</li>
                <li>فقدان البيانات أو الأرباح</li>
                <li>انقطاع الخدمة أو التأخير</li>
                <li>أخطاء في الحسابات أو البيانات</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الدفع والرسوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                بخصوص الخدمات المدفوعة:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>الرسوم تُحدد بوضوح قبل الشراء</li>
                <li>الدفع يتم بشكل آمن عبر بوابات معتمدة</li>
                <li>لا استرجاع للمبالغ بعد استخدام الخدمة</li>
                <li>قد تتغير الأسعار مع إشعار مسبق بـ 30 يوم</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>القانون المعمول به</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                تخضع هذه الشروط لقوانين الأردن. أي نزاع سيتم حله:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>أولاً: من خلال التفاوض الودي</li>
                <li>ثانياً: من خلال الوساطة</li>
                <li>أخيراً: من خلال المحاكم الأردنية المختصة</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التعديلات على الشروط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                قد نعدل هذه الشروط في أي وقت. التعديلات الجوهرية ستُبلغ عنها مسبقاً. استمرارك في استخدام الخدمة يعني قبول الشروط الجديدة.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التواصل والدعم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                للأسئلة حول شروط الاستخدام:
              </p>
              <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>البريد الإلكتروني:</strong> support@jordancustoms.com</p>
                <p className="text-gray-700"><strong>الهاتف:</strong> +962 6 1234 5678</p>
                <p className="text-gray-700"><strong>ساعات العمل:</strong> السبت - الخميس، 8 صباحاً - 6 مساءً</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">هل فهمت الشروط؟</h2>
          <p className="text-amber-100 mb-6">
            بالمتابعة، أنت توافق على جميع الشروط والأحكام
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              العودة للرئيسية
            </a>
            <a
              href="/privacy"
              className="bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-900 transition-colors border border-white"
            >
              سياسة الخصوصية
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
