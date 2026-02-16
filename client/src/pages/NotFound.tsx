/**
 * NotFound Page - 404 Error Page
 * 
 * صفحة الخطأ 404 - الصفحة غير موجودة
 * صفحة مخصصة لتحسين تجربة المستخدم عند الوصول إلى رابط غير موجود
 * 
 * @module ./client/src/pages/NotFound
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Search, Mail, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/advanced-search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleContact = () => {
    setLocation("/contact");
  };

  const quickLinks = [
    { label: "الرئيسية", path: "/", icon: "🏠" },
    { label: "التصريحات الجمركية", path: "/declarations", icon: "📋" },
    { label: "الشحنات", path: "/shipping", icon: "📦" },
    { label: "التقارير", path: "/reports", icon: "📊" },
    { label: "المساعدة", path: "/help-center", icon: "❓" },
    { label: "الاتصال", path: "/contact", icon: "📞" },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm mb-6">
          <CardContent className="pt-12 pb-12 px-6 sm:px-8 text-center">
            {/* 404 Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse blur-lg" />
                <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-full p-6">
                  <AlertCircle className="h-20 w-20 text-red-500" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Error Code */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-3">
              404
            </h1>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              الصفحة غير موجودة
            </h2>

            {/* Subtitle */}
            <p className="text-slate-600 mb-8 leading-relaxed text-base sm:text-lg">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو قد تكون قد تم حذفها أو نقلها.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ابحث عن ما تحتاجه..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button
                onClick={handleGoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                الصفحة الرئيسية
              </Button>

              <Button
                onClick={handleGoBack}
                variant="outline"
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للخلف
              </Button>

              <Button
                onClick={handleContact}
                variant="outline"
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                اتصل بنا
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-500 text-sm">روابط سريعة</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => setLocation(link.path)}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all duration-200 text-sm font-medium text-slate-700 hover:text-blue-600 flex flex-col items-center gap-2"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-slate-600 text-sm">
          <p>
            هل تحتاج إلى مساعدة؟{" "}
            <button
              onClick={() => setLocation("/help-center")}
              className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
            >
              تصفح مركز المساعدة
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
