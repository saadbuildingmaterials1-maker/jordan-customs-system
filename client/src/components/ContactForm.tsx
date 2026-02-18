/**
 * Contact Form Component
 * 
 * Advanced contact form with validation, submission, and feedback
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type ContactCategory = 'general_inquiry' | 'technical_support' | 'billing' | 'partnership' | 'feedback' | 'complaint' | 'other';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  category: ContactCategory;
  message: string;
}

const CATEGORIES: { value: ContactCategory; label: string }[] = [
  { value: 'general_inquiry', label: 'استفسار عام' },
  { value: 'technical_support', label: 'الدعم الفني' },
  { value: 'billing', label: 'الفواتير والدفع' },
  { value: 'partnership', label: 'الشراكات' },
  { value: 'feedback', label: 'التعليقات والاقتراحات' },
  { value: 'complaint', label: 'شكوى' },
  { value: 'other', label: 'أخرى' },
];

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    category: 'general_inquiry',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const submitMutation = trpc.contact.submitForm.useMutation({
    onSuccess: (data) => {
      setSubmitStatus('success');
      setSubmitMessage(data.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        category: 'general_inquiry',
        message: '',
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    },
    onError: (error) => {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'فشل في إرسال الرسالة. يرجى المحاولة لاحقاً.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'الاسم يجب أن يكون على الأقل حرفين';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!formData.phone || !phoneRegex.test(formData.phone) || formData.phone.length < 9) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.subject.trim() || formData.subject.length < 5) {
      newErrors.subject = 'الموضوع يجب أن يكون على الأقل 5 أحرف';
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'الرسالة يجب أن تكون على الأقل 10 أحرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitStatus('loading');
    submitMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value as ContactCategory,
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>نموذج الاتصال</CardTitle>
          <CardDescription>
            تواصل معنا لأي استفسارات أو اقتراحات. سنرد عليك في أقرب وقت ممكن.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitStatus === 'success' && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {submitMessage}
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                الاسم الكامل *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسمك الكامل"
                className={errors.name ? 'border-red-500' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                البريد الإلكتروني *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                رقم الهاتف *
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+962791234567"
                className={errors.phone ? 'border-red-500' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                اسم الشركة (اختياري)
              </label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="اسم شركتك"
                disabled={submitStatus === 'loading'}
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                الفئة *
              </label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger disabled={submitStatus === 'loading'}>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                الموضوع *
              </label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="موضوع الرسالة"
                className={errors.subject ? 'border-red-500' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                الرسالة *
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="أدخل رسالتك هنا..."
                rows={6}
                className={errors.message ? 'border-red-500' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.message.length}/5000 حرف
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitStatus === 'loading'}
              size="lg"
            >
              {submitStatus === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال الرسالة'
              )}
            </Button>

            <p className="text-gray-500 text-sm text-center">
              * الحقول المطلوبة
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
