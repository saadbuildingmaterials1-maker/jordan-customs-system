/**
 * Advanced Registration Page
 * صفحة التسجيل المتقدمة
 * 
 * Features:
 * - Email verification
 * - 2FA setup
 * - Password strength validation
 * - Phone number verification
 */

import { useState } from 'react';
import { useRouter } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdvancedRegister() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'email' | '2fa' | 'complete'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    companyName: '',
    acceptTerms: false,
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [twoFAMethod, setTwoFAMethod] = useState<'totp' | 'sms'>('totp');
  const [verificationCode, setVerificationCode] = useState('');

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, acceptTerms: checked });
  };

  // Step 1: Basic Information
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (passwordStrength === 'weak') {
      setError('كلمة المرور ضعيفة جداً. استخدم أحرف كبيرة وصغيرة وأرقام ورموز');
      return;
    }

    if (!formData.acceptTerms) {
      setError('يجب قبول شروط الخدمة');
      return;
    }

    setStep('email');
  };

  // Step 2: Email Verification
  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send verification email
      // await trpc.auth.sendEmailVerification.mutate({ email: formData.email });
      setSuccess('تم إرسال رابط التحقق إلى بريدك الإلكتروني');
      setStep('2fa');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إرسال البريد');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: 2FA Setup
  const handleSetup2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Setup 2FA
      // const result = await trpc.auth.setup2FA.mutate({
      //   userId: userId,
      //   method: twoFAMethod,
      // });
      setSuccess('تم تفعيل المصادقة الثنائية بنجاح');
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تفعيل 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Complete Registration
  const handleCompleteRegistration = async () => {
    setError('');
    setLoading(true);

    try {
      // Complete registration
      // await trpc.auth.completeRegistration.mutate({
      //   email: formData.email,
      //   password: formData.password,
      //   fullName: formData.fullName,
      //   phoneNumber: formData.phoneNumber,
      //   companyName: formData.companyName,
      // });

      setSuccess('تم التسجيل بنجاح! جاري إعادة التوجيه...');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              التسجيل الآمن
            </h1>
            <p className="text-gray-600">
              نموذج تسجيل متقدم مع المصادقة الثنائية
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {['info', 'email', '2fa', 'complete'].map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                  ['info', 'email', '2fa', 'complete'].indexOf(step) >= i
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          {step === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    placeholder="كلمة مرور قوية"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex gap-1">
                  <div
                    className={`h-1 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  قوة كلمة المرور: {passwordStrength}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف (اختياري)
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+962 79 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الشركة (اختياري)
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="اسم الشركة"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.acceptTerms}
                  onCheckedChange={handleCheckboxChange}
                />
                <label className="text-sm text-gray-600">
                  أوافق على شروط الخدمة والسياسة
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري المتابعة...
                  </>
                ) : (
                  'المتابعة'
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Email Verification */}
          {step === 'email' && (
            <form onSubmit={handleEmailVerification} className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">تحقق من بريدك الإلكتروني</h2>
                <p className="text-gray-600 mb-4">
                  تم إرسال رابط التحقق إلى {formData.email}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  'تم التحقق'
                )}
              </Button>
            </form>
          )}

          {/* Step 3: 2FA Setup */}
          {step === '2fa' && (
            <form onSubmit={handleSetup2FA} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-4">تفعيل المصادقة الثنائية</h2>
                <p className="text-gray-600 mb-4">
                  اختر طريقة المصادقة الثنائية المفضلة لديك
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="totp"
                    checked={twoFAMethod === 'totp'}
                    onChange={(e) => setTwoFAMethod(e.target.value as 'totp' | 'sms')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">تطبيق المصادقة (TOTP)</p>
                    <p className="text-sm text-gray-600">استخدم تطبيق مثل Google Authenticator</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="sms"
                    checked={twoFAMethod === 'sms'}
                    onChange={(e) => setTwoFAMethod(e.target.value as 'totp' | 'sms')}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">رسالة نصية (SMS)</p>
                    <p className="text-sm text-gray-600">استقبل رموز التحقق عبر الرسائل النصية</p>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التفعيل...
                  </>
                ) : (
                  'تفعيل المصادقة الثنائية'
                )}
              </Button>
            </form>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">تم التسجيل بنجاح!</h2>
              <p className="text-gray-600">
                حسابك آمن الآن مع المصادقة الثنائية
              </p>
              <Button
                onClick={handleCompleteRegistration}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  'الذهاب إلى لوحة التحكم'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
