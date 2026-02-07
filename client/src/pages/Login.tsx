import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, Lock, Eye, EyeOff, Loader, LogIn, UserPlus, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = 'ar' | 'en';

const translations = {
  ar: {
    back: "العودة للرئيسية",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أدخل كلمة المرور مرة أخرى",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    companyName: "اسم الشركة",
    companyNamePlaceholder: "أدخل اسم شركتك",
    loginTitle: "تسجيل الدخول",
    registerTitle: "إنشاء حساب",
    loginSubtitle: "أدخل بيانات حسابك للوصول إلى النظام",
    registerSubtitle: "أنشئ حساباً جديداً للبدء",
    allFieldsRequired: "جميع الحقول مطلوبة",
    passwordMismatch: "كلمات المرور غير متطابقة",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    registerSuccess: "تم التسجيل بنجاح! يرجى تسجيل الدخول",
    error: "حدث خطأ. يرجى المحاولة لاحقاً",
    processing: "جاري المعالجة...",
    submitLogin: "تسجيل الدخول",
    submitRegister: "إنشاء حساب",
    or: "أو",
    googleLogin: "تسجيل الدخول عبر Google",
    facebookLogin: "تسجيل الدخول عبر Facebook",
    githubLogin: "تسجيل الدخول عبر GitHub",
    appleLogin: "تسجيل الدخول عبر Apple",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    createNew: "إنشاء حساب جديد",
    signIn: "تسجيل الدخول",
    terms: "شروط الاستخدام",
    privacy: "سياسة الخصوصية",
    agree: "بتسجيلك، فإنك توافق على",
  },
  en: {
    back: "Back to Home",
    login: "Sign In",
    register: "Create Account",
    email: "Email Address",
    emailPlaceholder: "Enter your email address",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    companyName: "Company Name",
    companyNamePlaceholder: "Enter your company name",
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    loginSubtitle: "Enter your credentials to access the system",
    registerSubtitle: "Create a new account to get started",
    allFieldsRequired: "All fields are required",
    passwordMismatch: "Passwords do not match",
    loginSuccess: "Login successful!",
    registerSuccess: "Registration successful! Please sign in",
    error: "An error occurred. Please try again later",
    processing: "Processing...",
    submitLogin: "Sign In",
    submitRegister: "Create Account",
    or: "Or",
    googleLogin: "Sign in with Google",
    facebookLogin: "Sign in with Facebook",
    githubLogin: "Sign in with GitHub",
    appleLogin: "Sign in with Apple",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createNew: "Create new account",
    signIn: "Sign in",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    agree: "By signing up, you agree to our",
  }
};

export default function Login() {
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<Language>('ar');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const t = translations[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.email || !formData.password) {
        setError(t.allFieldsRequired);
        setIsLoading(false);
        return;
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError(t.passwordMismatch);
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isLogin) {
        setSuccess(t.loginSuccess);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setSuccess(t.registerSuccess);
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: "", password: "", confirmPassword: "", fullName: "", companyName: "" });
        }, 1500);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccess(`${language === 'ar' ? 'جاري تسجيل الدخول عبر' : 'Signing in with'} ${provider}...`);
      setTimeout(() => navigate("/dashboard"), 1500);
    }, 500);
  };

  const oauthProviders = [
    { name: 'Google', icon: '🔍', color: 'from-red-500 to-red-600' },
    { name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-700' },
    { name: 'GitHub', icon: '💻', color: 'from-gray-700 to-gray-800' },
    { name: 'Apple', icon: '🍎', color: 'from-gray-800 to-gray-900' },
  ];

  return (
    <div className={language === 'ar' ? 'rtl' : 'ltr'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Header with Language Selector */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-200 hover:text-blue-100 transition-colors"
            >
              <ArrowRight className="w-4 h-4" style={{ transform: language === 'ar' ? 'scaleX(-1)' : 'none' }} />
              {t.back}
            </button>
            
            {/* Language Selector */}
            <div className="flex gap-2 bg-white/10 rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded transition-all ${
                  language === 'ar'
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-200 hover:text-blue-100'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded transition-all ${
                  language === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-200 hover:text-blue-100'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {isLogin ? t.loginTitle : t.registerTitle}
              </h1>
              <p className="text-blue-100/70">
                {isLogin ? t.loginSubtitle : t.registerSubtitle}
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Full Name (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Company Name (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    {t.companyName}
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder={t.companyNamePlaceholder}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t.confirmPasswordPlaceholder}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {t.processing}
                  </>
                ) : isLogin ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t.submitLogin}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    {t.submitRegister}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 text-blue-100/70">
                  {t.or}
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {oauthProviders.map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => handleOAuthLogin(provider.name)}
                  disabled={isLoading}
                  className="py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  <span className="text-lg">{provider.icon}</span>
                  <span className="hidden sm:inline">{provider.name}</span>
                </button>
              ))}
            </div>

            {/* Toggle */}
            <div className="text-center">
              <p className="text-blue-100/70">
                {isLogin ? t.noAccount : t.hasAccount}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: "", password: "", confirmPassword: "", fullName: "", companyName: "" });
                    setError("");
                    setSuccess("");
                  }}
                  className={`ml-2 text-blue-300 hover:text-blue-200 font-semibold transition-colors ${language === 'ar' ? 'mr-2 ml-0' : ''}`}
                >
                  {isLogin ? t.createNew : t.signIn}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`mt-8 text-center text-blue-100/50 text-sm ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            <p>
              {t.agree} <a href="/terms" className="text-blue-300 hover:text-blue-200">{t.terms}</a> {language === 'ar' ? 'و' : 'and'} <a href="/privacy" className="text-blue-300 hover:text-blue-200">{t.privacy}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
