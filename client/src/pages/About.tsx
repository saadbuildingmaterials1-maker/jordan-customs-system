/**
 * About Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/About
 */
import React from 'react';
import { Users, Target, Lightbulb, Award, Globe, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
  const teamMembers = [
    {
      name: 'سعد محمد',
      role: 'المؤسس والرئيس التنفيذي',
      description: 'خبرة 15 سنة في إدارة اللوجستيات والجمارك',
      icon: '👨‍💼',
    },
    {
      name: 'فاطمة أحمد',
      role: 'مديرة العمليات',
      description: 'متخصصة في تحسين العمليات والكفاءة',
      icon: '👩‍💼',
    },
    {
      name: 'محمود علي',
      role: 'مدير التكنولوجيا',
      description: 'خبرة في تطوير الأنظمة المتقدمة',
      icon: '👨‍💻',
    },
    {
      name: 'ليلى حسن',
      role: 'مديرة خدمة العملاء',
      description: 'متخصصة في تحسين تجربة العملاء',
      icon: '👩‍💼',
    },
  ];

  const achievements = [
    {
      number: '500+',
      label: 'عميل نشط',
      description: 'شركات وجهات حكومية تستخدم النظام',
    },
    {
      number: '1M+',
      label: 'عملية معالجة',
      description: 'عملية جمركية تمت معالجتها بنجاح',
    },
    {
      number: '99.9%',
      label: 'توفر النظام',
      description: 'ضمان توفر الخدمة طوال الوقت',
    },
    {
      number: '24/7',
      label: 'دعم فني',
      description: 'فريق دعم متاح طوال الساعة',
    },
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'الأمان والموثوقية',
      description: 'حماية البيانات والمعلومات بأعلى معايير الأمان العالمية',
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'الابتكار والتطوير',
      description: 'تطوير حلول مبتكرة تلبي احتياجات السوق المتغيرة',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'التعاون الدولي',
      description: 'التعاون مع الشركاء الدوليين لتقديم أفضل الخدمات',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'الجودة والتميز',
      description: 'الالتزام بأعلى معايير الجودة في جميع الخدمات',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">معلومات عنا</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            نحن نقدم حلاً متكاملاً لإدارة تكاليف الشحن والجمارك الأردنية بكفاءة واحترافية
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Vision */}
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Target className="w-6 h-6" />
                  رؤيتنا
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  أن نكون الحل الموثوق والمفضل لإدارة العمليات الجمركية والشحنات في المنطقة، من خلال تقديم تقنيات حديثة وخدمات عالية الجودة تساهم في تسهيل التجارة الدولية وتحسين الكفاءة التشغيلية.
                </p>
              </CardContent>
            </Card>

            {/* Mission */}
            <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Lightbulb className="w-6 h-6" />
                  رسالتنا
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  توفير نظام متكامل وسهل الاستخدام لإدارة تكاليف الشحن والعمليات الجمركية، يساعد الشركات والجهات الحكومية على اتخاذ قرارات مستنيرة وتحسين الإنتاجية والربحية.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">قيمنا الأساسية</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-blue-600 mb-4">{value.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">إنجازاتنا</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{achievement.number}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{achievement.label}</h3>
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">فريقنا</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-5xl text-center mb-4">{member.icon}</div>
                  <h3 className="font-bold text-lg text-center text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 text-center font-semibold mb-2">{member.role}</p>
                  <p className="text-gray-600 text-center text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">رحلتنا</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2020</div>
                <div className="w-1 h-16 bg-blue-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">التأسيس والانطلاق</h3>
                <p className="text-gray-600">تأسيس شركة Jordan Customs System بهدف توفير حل متكامل لإدارة العمليات الجمركية والشحنات.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2021</div>
                <div className="w-1 h-16 bg-blue-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">إطلاق النسخة الأولى</h3>
                <p className="text-gray-600">إطلاق النسخة الأولى من النظام مع مميزات أساسية وقاعدة بيانات قوية.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2022</div>
                <div className="w-1 h-16 bg-blue-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">التوسع والتطوير</h3>
                <p className="text-gray-600">توسيع قاعدة العملاء وإضافة مميزات جديدة مثل التقارير المتقدمة والتحليلات.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2023</div>
                <div className="w-1 h-16 bg-blue-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">الاعتراف والجوائز</h3>
                <p className="text-gray-600">حصول النظام على عدة جوائز وشهادات تقدير من الجهات الحكومية والشركات الخاصة.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2024</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">الابتكار والمستقبل</h3>
                <p className="text-gray-600">تطوير تقنيات جديدة مثل الذكاء الاصطناعي والتعلم الآلي لتحسين الخدمات.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">هل تريد معرفة المزيد؟</h2>
          <p className="text-xl text-blue-100 mb-8">
            تواصل معنا للحصول على معلومات إضافية أو لبدء استخدام النظام اليوم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              تواصل معنا
            </a>
            <a
              href="/"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors border border-white"
            >
              العودة للرئيسية
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
