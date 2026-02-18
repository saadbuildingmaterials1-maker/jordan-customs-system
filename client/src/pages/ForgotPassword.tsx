/**
 * Forgot Password Page
 * 
 * صفحة استرجاع كلمة المرور
 * 
 * @module ./client/src/pages/ForgotPassword
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

type ForgotPasswordStep = "email" | "verification" | "reset" | "success";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email) {
        setError("يرجى إدخال البريد الإلكتروني");
        setLoading(false);
        return;
      }

      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("verification");
    } catch (err) {
      setError("حدث خطأ في إرسال البريد");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!verificationCode || verificationCode.length !== 6) {
        setError("يرجى إدخال رمز التحقق الصحيح (6 أرقام)");
        setLoading(false);
        return;
      }

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("reset");
    } catch (err) {
      setError("رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        setError("يرجى ملء جميع الحقول");
        setLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("كلمات المرور غير متطابقة");
        setLoading(false);
        return;
      }

      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/advanced-login");
      }, 2000);
    } catch (err) {
      setError("حدث خطأ في إعادة تعيين كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step 1: Email */}
        {step === "email" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">استرجاع كلمة المرور</CardTitle>
              <CardDescription className="text-slate-300">
                أدخل البريد الإلكتروني المرتبط بحسابك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    onClick={() => navigate("/advanced-login")}
                    variant="ghost"
                    className="text-slate-300 hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4 ml-2" />
                    العودة إلى تسجيل الدخول
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verification */}
        {step === "verification" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">التحقق من البريد</CardTitle>
              <CardDescription className="text-slate-300">
                تم إرسال رمز التحقق إلى {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">رمز التحقق</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 text-center text-2xl tracking-widest"
                    dir="ltr"
                  />
                </div>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {loading ? "جاري التحقق..." : "تأكيد"}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setVerificationCode("");
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

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">تعيين كلمة مرور جديدة</CardTitle>
              <CardDescription className="text-slate-300">
                أدخل كلمة مرور جديدة قوية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">تأكيد كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">تم التحديث بنجاح</CardTitle>
              <CardDescription className="text-slate-300">
                تم تحديث كلمة المرور بنجاح. جاري إعادة التوجيه...
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
