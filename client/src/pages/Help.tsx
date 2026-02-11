import React, { useState } from 'react';
import { ChevronDown, Search, BookOpen, HelpCircle, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

/**
 * صفحة المساعدة الشاملة
 * تحتوي على أسئلة شائعة وتوثيق وتعليمات الاستخدام
 */
export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'guide' | 'glossary'>('faq');

  // الأسئلة الشائعة
  const faqs = [
    {
      id: 1,
      question: 'كيف أبدأ باستخدام النظام؟',
      answer: 'يمكنك البدء بتسجيل الدخول أو إنشاء حساب جديد. بعد ذلك، اذهب إلى "إدارة البيانات الجمركية" لإضافة بيان جمركي جديد. النظام سيساعدك خطوة بخطوة.',
      category: 'البدء'
    },
    {
      id: 2,
      question: 'ما هي البيانات المطلوبة لإنشاء بيان جمركي؟',
      answer: 'تحتاج إلى: اسم الشاحن، البلد المصدر، نوع البضاعة، الوزن، القيمة FOB، أجور الشحن، وتأمين الشحنة. جميع هذه الحقول مهمة لحساب التكاليف بدقة.',
      category: 'البيانات الجمركية'
    },
    {
      id: 3,
      question: 'كيف يتم حساب الرسوم الجمركية؟',
      answer: 'يتم حساب الرسوم الجمركية بناءً على: قيمة البضاعة FOB + أجور الشحن + التأمين. ثم يتم تطبيق نسبة الرسم الجمركي حسب نوع البضاعة والدولة المصدرة.',
      category: 'الحسابات'
    },
    {
      id: 4,
      question: 'ما هي ضريبة المبيعات وكيف تُحسب؟',
      answer: 'ضريبة المبيعات بنسبة 16% تُطبق على: (قيمة البضاعة + الرسوم الجمركية). هذه النسبة ثابتة وتُطبق تلقائياً على جميع البيانات الجمركية.',
      category: 'الحسابات'
    },
    {
      id: 5,
      question: 'كيف أتتبع شحنتي؟',
      answer: 'اذهب إلى صفحة "تتبع الشحنات" واختر الشحنة من القائمة. ستظهر الخريطة التفاعلية توضح موقع الشحنة الحالي والمسار الكامل.',
      category: 'التتبع'
    },
    {
      id: 6,
      question: 'كيف أصدر تقرير؟',
      answer: 'اذهب إلى صفحة "التقارير والتحليلات" واختر نطاق التاريخ المطلوب. يمكنك تصدير التقرير بصيغة PDF أو Excel.',
      category: 'التقارير'
    },
    {
      id: 7,
      question: 'هل يمكنني استيراد بيانات من ملف PDF؟',
      answer: 'نعم! اذهب إلى "استيراد من PDF" وحمّل الملف. النظام سيستخرج البيانات تلقائياً باستخدام الذكاء الاصطناعي.',
      category: 'الاستيراد'
    },
    {
      id: 8,
      question: 'كيف أدفع الفاتورة؟',
      answer: 'اذهب إلى صفحة "نظام الدفع والفواتير" واختر طريقة الدفع المفضلة (بطاقة ائتمان، PayPal، Alipay، أو تحويل بنكي).',
      category: 'الدفع'
    }
  ];

  // دليل الاستخدام
  const guides = [
    {
      title: 'إنشاء بيان جمركي جديد',
      steps: [
        'اذهب إلى "إدارة البيانات الجمركية"',
        'اضغط على زر "بيان جديد"',
        'ملء الحقول المطلوبة (الشاحن، البلد، النوع، الوزن، القيمة)',
        'تحقق من الحسابات المالية',
        'اضغط "حفظ" لإنشاء البيان'
      ]
    },
    {
      title: 'تصدير التقارير',
      steps: [
        'اذهب إلى "التقارير والتحليلات"',
        'اختر نطاق التاريخ المطلوب',
        'اختر نوع التقرير (ملخص، مفصل، إحصائي)',
        'اختر صيغة التصدير (PDF أو Excel)',
        'اضغط "تصدير" لتحميل الملف'
      ]
    },
    {
      title: 'تتبع الشحنات',
      steps: [
        'اذهب إلى "تتبع الشحنات"',
        'اختر الشحنة من القائمة أو ابحث عن رقمها',
        'ستظهر الخريطة التفاعلية بموقع الشحنة',
        'اضغط على المحطات لرؤية التفاصيل',
        'يمكنك مشاركة معلومات التتبع مع الآخرين'
      ]
    }
  ];

  // المصطلحات والتعاريف
  const glossary = [
    { term: 'FOB', definition: 'Free On Board - القيمة الأساسية للبضاعة عند الميناء' },
    { term: 'الرسوم الجمركية', definition: 'الضريبة المفروضة على البضاعة المستوردة' },
    { term: 'ضريبة المبيعات', definition: 'ضريبة بنسبة 16% تُطبق على القيمة الإجمالية' },
    { term: 'Landed Cost', definition: 'التكلفة الإجمالية للبضاعة بما فيها جميع الرسوم' },
    { term: 'الحاوية', definition: 'وحدة نقل البضاعة البحرية' },
    { term: 'التتبع', definition: 'متابعة موقع الشحنة في الوقت الفعلي' }
  ];

  // تصفية الأسئلة بناءً على البحث
  const filteredFAQs = faqs.filter(faq =>
    faq.question.includes(searchQuery) || faq.answer.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 rtl">
      {/* رأس الصفحة */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">مركز المساعدة</h1>
          </div>
          <p className="text-lg text-gray-600">
            ابحث عن الإجابات والتعليمات لاستخدام النظام بكفاءة
          </p>
        </div>

        {/* شريط البحث */}
        <div className="relative mb-8">
          <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن سؤال أو موضوع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 py-3 text-lg"
          />
        </div>

        {/* التبويبات */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'faq'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-5 h-5 inline ml-2" />
            أسئلة شائعة
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'guide'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-5 h-5 inline ml-2" />
            دليل الاستخدام
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'glossary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-5 h-5 inline ml-2" />
            المصطلحات
          </button>
        </div>

        {/* محتوى الأسئلة الشائعة */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <Card key={faq.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full p-6 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-right flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-400 transition-transform ml-4 ${
                        expandedFAQ === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-600 text-lg">لم نجد نتائج لبحثك. جرب كلمات مفتاحية أخرى.</p>
              </Card>
            )}
          </div>
        )}

        {/* محتوى دليل الاستخدام */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            {guides.map((guide, idx) => (
              <Card key={idx} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  {guide.title}
                </h3>
                <ol className="space-y-3 mr-6">
                  {guide.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {stepIdx + 1}
                      </span>
                      <span className="text-gray-700 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        )}

        {/* محتوى المصطلحات */}
        {activeTab === 'glossary' && (
          <div className="grid gap-4">
            {glossary.map((item, idx) => (
              <Card key={idx} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{item.term}</h3>
                <p className="text-gray-700">{item.definition}</p>
              </Card>
            ))}
          </div>
        )}

        {/* قسم الدعم */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">هل تحتاج إلى مساعدة إضافية؟</h3>
              <p className="text-gray-700 mb-4">
                إذا لم تجد الإجابة التي تبحث عنها، يمكنك التواصل مع فريق الدعم الفني لدينا.
              </p>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  📧 راسلنا بريداً إلكترونياً
                </Button>
                <Button variant="outline">
                  💬 ابدأ محادثة مباشرة
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
