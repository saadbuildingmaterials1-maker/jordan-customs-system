import { useLocation } from "wouter";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("شكراً لتواصلك معنا. سنرد عليك قريباً.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative py-12 px-4 md:px-8 lg:px-16 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-200 hover:text-blue-100 mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للرئيسية
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">اتصل بنا</h1>
          <p className="text-blue-100/70">نحن هنا لمساعدتك والإجابة على استفساراتك</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
              </div>

              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">البريد الإلكتروني</h3>
                  <a href="mailto:support@customs-jordan.com" className="text-blue-100/70 hover:text-blue-200">
                    support@customs-jordan.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">رقم الهاتف</h3>
                  <a href="tel:+962796123456" className="text-blue-100/70 hover:text-blue-200">
                    +962 79 6123456
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">العنوان</h3>
                  <p className="text-blue-100/70">
                    عمّان، الأردن<br />
                    منطقة الشميساني
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">الاسم</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الموضوع</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                    placeholder="موضوع الرسالة"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الرسالة</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 resize-none"
                    placeholder="اكتب رسالتك هنا"
                    rows={5}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  إرسال الرسالة
                </button>
              </form>
            </div>
          </div>

          {/* Back Button */}
          <div className="pt-8 border-t border-white/10">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
