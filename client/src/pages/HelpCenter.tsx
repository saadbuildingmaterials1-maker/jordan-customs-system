/**
 * HelpCenter Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/HelpCenter
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, Search, ChevronDown, Mail, Phone, MessageSquare, 
  BookOpen, Video, Users, AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * صفحة مركز المساعدة والأسئلة الشائعة
 */

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  views: number;
  helpful: number;
}

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'getting-started',
      question: 'كيف أبدأ باستخدام النظام؟',
      answer: `
        1. قم بإنشاء حساب جديد باستخدام بريدك الإلكتروني
        2. تحقق من بريدك الإلكتروني لتأكيد الحساب
        3. سجل الدخول واملأ معلومات ملفك الشخصي
        4. ابدأ بإنشاء أول بيان جمركي
      `,
      views: 1250,
      helpful: 980,
    },
    {
      id: 2,
      category: 'customs',
      question: 'ما هي البيانات المطلوبة لإنشاء بيان جمركي؟',
      answer: `
        البيانات المطلوبة:
        - معلومات المُصدّر والمستقبل
        - وصف المنتجات بالتفصيل
        - الأوزان والكميات
        - القيمة الإجمالية
        - رقم الفاتورة الأصلية
        - شهادات الأصل (إن وجدت)
      `,
      views: 890,
      helpful: 750,
    },
    {
      id: 3,
      category: 'tracking',
      question: 'كيف أتتبع حاويتي؟',
      answer: `
        لتتبع حاويتك:
        1. انتقل إلى قسم تتبع الحاويات
        2. أدخل رقم الحاوية
        3. ستظهر الخريطة التفاعلية بموقع الحاوية الحالي
        4. فعّل التنبيهات لتلقي تحديثات فورية
      `,
      views: 2100,
      helpful: 1950,
    },
    {
      id: 4,
      category: 'payments',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: `
        طرق الدفع المدعومة:
        - بطاقات الائتمان (Visa, Mastercard)
        - التحويلات البنكية
        - المحافظ الرقمية
        - الدفع عند الاستلام (في بعض الحالات)
      `,
      views: 650,
      helpful: 580,
    },
    {
      id: 5,
      category: 'reports',
      question: 'كيف أنشئ تقرير شامل؟',
      answer: `
        خطوات إنشاء التقرير:
        1. اذهب إلى قسم التقارير
        2. اختر نوع التقرير (إيرادات، شحنات، تكاليف)
        3. حدد الفترة الزمنية
        4. طبق الفلاتر المطلوبة
        5. صدّر التقرير بصيغة PDF أو Excel
      `,
      views: 780,
      helpful: 680,
    },
    {
      id: 6,
      category: 'security',
      question: 'كيف أحافظ على أمان حسابي؟',
      answer: `
        نصائح الأمان:
        - استخدم كلمة مرور قوية (حروف + أرقام + رموز)
        - فعّل المصادقة الثنائية
        - لا تشارك بيانات دخولك مع أحد
        - تحقق من الاتصال الآمن (HTTPS)
        - حدّث كلمة المرور بانتظام
      `,
      views: 450,
      helpful: 420,
    },
    {
      id: 7,
      category: 'technical',
      question: 'ماذا أفعل إذا واجهت مشكلة تقنية؟',
      answer: `
        خطوات استكشاف الأخطاء:
        1. حاول تحديث الصفحة (F5)
        2. امسح ذاكرة التخزين المؤقتة
        3. جرب متصفح آخر
        4. تأكد من اتصالك بالإنترنت
        5. اتصل بفريق الدعم إذا استمرت المشكلة
      `,
      views: 320,
      helpful: 280,
    },
    {
      id: 8,
      category: 'account',
      question: 'كيف أغير كلمة المرور؟',
      answer: `
        لتغيير كلمة المرور:
        1. اذهب إلى الإعدادات
        2. اختر "الأمان والخصوصية"
        3. انقر على "تغيير كلمة المرور"
        4. أدخل كلمة المرور الحالية
        5. أدخل كلمة المرور الجديدة مرتين
        6. انقر على "حفظ"
      `,
      views: 560,
      helpful: 510,
    },
  ];

  const categories = [
    { id: 'all', label: 'الكل', icon: '📚' },
    { id: 'getting-started', label: 'البدء السريع', icon: '🚀' },
    { id: 'customs', label: 'البيانات الجمركية', icon: '📋' },
    { id: 'tracking', label: 'التتبع', icon: '🚢' },
    { id: 'payments', label: 'الدفع', icon: '💳' },
    { id: 'reports', label: 'التقارير', icon: '📊' },
    { id: 'security', label: 'الأمان', icon: '🔒' },
    { id: 'technical', label: 'المشاكل التقنية', icon: '⚙️' },
    { id: 'account', label: 'الحساب', icon: '👤' },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.includes(searchTerm) || faq.answer.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="w-10 h-10 text-cyan-400" />
            مركز المساعدة
          </h1>
          <p className="text-gray-400">ابحث عن إجابات لأسئلتك الشائعة</p>
        </div>

        {/* البحث */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن سؤال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-slate-800 border-slate-700 text-white placeholder-gray-500 text-lg py-6"
          />
        </div>

        {/* الفئات */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* الأسئلة الشائعة */}
        <div className="space-y-3 mb-8">
          {filteredFAQs.map(faq => (
            <Card
              key={faq.id}
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors"
              onClick={() =>
                setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex-1">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 transition-transform ${
                      expandedFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-gray-300 whitespace-pre-line">
                      {faq.answer}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                      <span>{faq.views} مشاهدة</span>
                      <span>{faq.helpful} وجدوها مفيدة</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <Alert className="bg-blue-900/20 border-blue-700 mb-8">
            <AlertDescription className="text-blue-400">
              لم يتم العثور على أسئلة مطابقة. جرب كلمات بحث مختلفة.
            </AlertDescription>
          </Alert>
        )}

        {/* خيارات الدعم الإضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6 text-center">
              <Video className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">مقاطع فيديو</h3>
              <p className="text-gray-400 text-sm mb-4">
                شاهد مقاطع فيديو تعليمية شاملة
              </p>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white w-full">
                عرض الفيديوهات
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">المجتمع</h3>
              <p className="text-gray-400 text-sm mb-4">
                تواصل مع مستخدمين آخرين وشارك تجاربك
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                انضم للمجتمع
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">الدعم المباشر</h3>
              <p className="text-gray-400 text-sm mb-4">
                تحدث مع فريق الدعم الخاص بنا
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                اتصل بنا
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* معلومات الاتصال */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">معلومات الاتصال</CardTitle>
            <CardDescription>
              اتصل بنا عبر أحد القنوات التالية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-white font-semibold">البريد الإلكتروني</p>
                <p className="text-gray-400">support@customs-system.jo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-semibold">الهاتف</p>
                <p className="text-gray-400">+962 6 5XXX XXXX</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-semibold">الدردشة المباشرة</p>
                <p className="text-gray-400">متاحة من 9 صباحاً إلى 5 مساءً</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
