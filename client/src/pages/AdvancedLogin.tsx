/**
 * Advanced Login Page with 2FA
 * 
 * صفحة تسجيل الدخول المتقدمة مع المصادقة الثنائية
 * 
 * @module ./client/src/pages/AdvancedLogin
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

type LoginStep = "credentials" | "2fa" | "success";

export default function AdvancedLogin() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate email and password
      if (!email || !password) {
        setError("يرجى ملء جميع الحقول");
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        setLoading(false);
        return;
      }

      // Simulate sending 2FA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("2fa");
    } catch (err) {
      setError("حدث خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!twoFACode || twoFACode.length !== 6) {
        setError("يرجى إدخال رمز التحقق الصحيح (6 أرقام)");
        setLoading(false);
        return;
      }

      // Simulate 2FA verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError("رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step 1: Credentials */}
        {step === "credentials" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">
                {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {isSignUp 
                  ? "أنشئ حسابك للبدء في استخدام النظام"
                  : "أدخل بيانات تسجيل الدخول الخاصة بك"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pr-10"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {loading ? "جاري المعالجة..." : (isSignUp ? "إنشاء حساب" : "تسجيل الدخول")}
                </Button>

                {/* Toggle Sign Up */}
                <div className="text-center text-sm text-slate-300">
                  {isSignUp ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                      setEmail("");
                      setPassword("");
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {isSignUp ? "تسجيل الدخول" : "إنشاء حساب"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 2FA Verification */}
        {step === "2fa" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">التحقق الثنائي</CardTitle>
              <CardDescription className="text-slate-300">
                تم إرسال رمز التحقق إلى {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTwoFASubmit} className="space-y-4">
                {/* 2FA Code Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">رمز التحقق</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 text-center text-2xl tracking-widest"
                    dir="ltr"
                  />
                  <p className="text-xs text-slate-400">أدخل الرمز المكون من 6 أرقام</p>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {loading ? "جاري التحقق..." : "تأكيد"}
                </Button>

                {/* Back Button */}
                <Button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setTwoFACode("");
                    setError("");
                  }}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50"
                >
                  العودة
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">تم التحقق بنجاح</CardTitle>
              <CardDescription className="text-slate-300">
                جاري إعادة التوجيه إلى لوحة التحكم...
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
