import React from 'react';
import { Shield, Lock, Eye, Database, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'المعلومات التي نجمعها',
      content: `نقوم بجمع المعلومات التالية:
      • معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف
      • معلومات الشركة: اسم الشركة، العنوان، رقم التسجيل
      • بيانات العمليات: معلومات الشحنات والجمارك والفواتير
      • معلومات الجهاز: نوع المتصفح، عنوان IP، نظام التشغيل
      • ملفات تعريف الارتباط: لتحسين تجربة المستخدم`
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'كيفية استخدام معلوماتك',
      content: `نستخدم معلوماتك لـ:
      • توفير وتحسين خدماتنا
      • معالجة طلباتك وتنفيذ العمليات
      • التواصل معك بشأن حسابك والخدمات
      • إرسال تحديثات ورسائل إخبارية (يمكنك الاشتراك/الإلغاء)
      • تحليل الاستخدام وتحسين الأداء
      • الامتثال للقوانين واللوائح المعمول بها`
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'حماية البيانات',
      content: `نتخذ إجراءات أمان متقدمة:
      • تشفير SSL/TLS لجميع الاتصالات
      • تخزين آمن للبيانات مع نسخ احتياطية منتظمة
      • الوصول المحدود للموظفين المصرح لهم
      • مراقبة مستمرة للأنشطة المريبة
      • الامتثال لمعايير الأمان الدولية (ISO 27001)
      • تحديثات أمنية منتظمة للأنظمة`
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'مشاركة البيانات',
      content: `نشارك معلوماتك فقط:
      • مع الشركاء الموثوقين الذين يساعدوننا في تقديم الخدمة
      • عند الضرورة القانونية أو لحماية الحقوق
      • مع الجهات الحكومية عند الطلب الرسمي
      • لا نبيع أو نؤجر بيانات المستخدمين لأطراف ثالثة
      • جميع الشركاء ملزمون بسياسات الخصوصية المماثلة`
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'حقوقك',
      content: `لديك الحق في:
      • الوصول إلى بيانات حسابك الشخصية
      • تصحيح أو تحديث معلوماتك
      • حذف حسابك والبيانات المرتبطة به
      • الاعتراض على معالجة بيانات معينة
      • نقل بيانات حسابك إلى خدمة أخرى
      • سحب الموافقة على معالجة البيانات
      • تقديم شكوى لسلطات حماية البيانات`
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'الأطفال والقصّر',
      content: `خدماتنا موجهة للبالغين فقط:
      • لا نقصد جمع بيانات من الأشخاص دون 18 سنة
      • إذا اكتشفنا بيانات لقاصر، سنحذفها فوراً
      • الآباء والأمهات يمكنهم طلب حذف بيانات أطفالهم
      • نشجع الآباء على مراقبة استخدام أطفالهم للإنترنت`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            نحن نلتزم بحماية خصوصيتك وأمان بيانات الشركة الخاصة بك
          </p>
          <p className="text-sm text-blue-200 mt-4">آخر تحديث: يناير 2026</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                تشرح سياسة الخصوصية هذه كيفية قيام Jordan Customs System بجمع واستخدام وحماية معلوماتك الشخصية. نحن نعتقد أن الشفافية والأمان هما أساس الثقة بيننا وبينك.
              </p>
              <p className="text-gray-700 leading-relaxed">
                بموجب استخدامك لخدماتنا، فإنك توافق على سياسة الخصوصية هذه. إذا كنت لا توافق على أي جزء من هذه السياسة، يرجى عدم استخدام خدماتنا.
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
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <span className="text-blue-600">{section.icon}</span>
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

      {/* Additional Information */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملفات تعريف الارتباط (Cookies)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم في إعدادات الملفات من متصفحك. ملفات تعريف الارتباط الضرورية مطلوبة لتشغيل الخدمة، بينما يمكنك رفض ملفات التحليل والتسويق.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الروابط الخارجية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                قد تحتوي خدماتنا على روابط لمواقع خارجية. لا نتحمل مسؤولية سياسات الخصوصية لتلك المواقع. ننصحك بمراجعة سياسات الخصوصية الخاصة بها قبل مشاركة معلوماتك.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التعديلات على السياسة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                قد نحدث سياسة الخصوصية هذه من وقت لآخر. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع. استمرارك في استخدام الخدمة يعني قبولك للتعديلات الجديدة.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الاتصال بنا</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                إذا كان لديك أسئلة حول سياسة الخصوصية أو كيفية التعامل مع بيانات الشركة، يرجى التواصل معنا:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>البريد الإلكتروني:</strong> privacy@jordancustoms.com</p>
                <p className="text-gray-700"><strong>الهاتف:</strong> +962 6 1234 5678</p>
                <p className="text-gray-700"><strong>العنوان:</strong> عمّان، الأردن</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">هل لديك أسئلة؟</h2>
          <p className="text-blue-100 mb-6">
            نحن هنا للإجابة على استفساراتك حول سياسة الخصوصية والأمان
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              تواصل معنا
            </a>
            <a
              href="/terms"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors border border-white"
            >
              شروط الاستخدام
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
