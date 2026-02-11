/**
 * Apple Pay Integration Service
 * خدمة دمج الدفع عبر Apple Pay
 * 
 * الميزات:
 * - الدفع الآمن عبر Apple Pay
 * - دعم التوكنات
 * - معالجة الدفع الفورية
 * - دعم العملات المختلفة
 * - التوافق مع الأجهزة المختلفة
 */

// تصريح نوع ApplePaySession
declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

interface ApplePayConfig {
  merchantIdentifier: string;
  displayName: string;
  supportedNetworks: string[];
  supportedCountries: string[];
  capabilities: string[];
}

interface ApplePayLineItem {
  label: string;
  amount: string;
  type?: 'final' | 'pending';
}

interface ApplePayRequest {
  countryCode: string;
  currencyCode: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  total: ApplePayLineItem;
  lineItems?: ApplePayLineItem[];
  requiredBillingContactFields?: string[];
  requiredShippingContactFields?: string[];
}

interface ApplePayPayment {
  token: {
    paymentMethod: {
      displayName: string;
      network: string;
      type: string;
    };
    transactionIdentifier: string;
    paymentData: string;
  };
  billingContact?: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
  };
  shippingContact?: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
  };
}

class ApplePayService {
  private config: ApplePayConfig;
  private session: any = null;
  private isAvailable: boolean = false;

  constructor(config: ApplePayConfig) {
    this.config = config;
    this.checkAvailability();
  }

  /**
   * التحقق من توفر Apple Pay
   */
  private checkAvailability(): void {
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      this.isAvailable = window.ApplePaySession.canMakePayments();
    }
  }

  /**
   * التحقق من إمكانية الدفع عبر Apple Pay
   */
  canMakePayments(): boolean {
    return this.isAvailable;
  }

  /**
   * التحقق من إمكانية الدفع بشبكة معينة
   */
  canMakePaymentsWithActiveCard(network: string): boolean {
    if (!this.isAvailable) return false;

    try {
      return window.ApplePaySession?.canMakePaymentsWithActiveCard(network) || false;
    } catch (error) {
      console.error('Error checking active card:', error);
      return false;
    }
  }

  /**
   * إنشاء جلسة دفع Apple Pay
   */
  createPaymentRequest(options: {
    items: Array<{
      label: string;
      amount: string;
      type?: 'final' | 'pending';
    }>;
    totalAmount: string;
    currencyCode: string;
    countryCode: string;
    requiredBillingFields?: string[];
    requiredShippingFields?: string[];
  }): ApplePayRequest {
    return {
      countryCode: options.countryCode,
      currencyCode: options.currencyCode,
      supportedNetworks: this.config.supportedNetworks,
      merchantCapabilities: this.config.capabilities,
      total: {
        label: this.config.displayName,
        amount: options.totalAmount,
        type: 'final',
      },
      lineItems: options.items,
      requiredBillingContactFields: options.requiredBillingFields || [
        'postalAddress',
        'name',
      ],
      requiredShippingContactFields: options.requiredShippingFields || [
        'postalAddress',
        'name',
        'email',
        'phone',
      ],
    };
  }

  /**
   * بدء جلسة الدفع
   */
  async beginPayment(paymentRequest: ApplePayRequest): Promise<void> {
    if (!this.isAvailable || !window.ApplePaySession) {
      throw new Error('Apple Pay is not available');
    }

    try {
      this.session = new window.ApplePaySession(3, paymentRequest);

      // معالج الدفع الناجح
      this.session.onpaymentauthorized = (event: any) => {
        this.handlePaymentAuthorized(event);
      };

      // معالج الدفع الفاشل
      this.session.onpaymentmethodselected = (event: any) => {
        this.handlePaymentMethodSelected(event);
      };

      // معالج إلغاء الدفع
      this.session.oncancel = () => {
        this.handlePaymentCanceled();
      };

      // معالج الأخطاء
      this.session.onerror = (event: any) => {
        this.handlePaymentError(event);
      };

      this.session.begin();
    } catch (error) {
      console.error('Error beginning Apple Pay session:', error);
      throw error;
    }
  }

  /**
   * معالج الدفع الناجح
   */
  private handlePaymentAuthorized(event: any): void {
    const payment = event.payment;

    // إرسال البيانات إلى الخادم للمعالجة
    this.processPayment(payment)
      .then(() => {
        this.session.completePayment(
          window.ApplePaySession?.STATUS_SUCCESS || 0
        );
      })
      .catch((error) => {
        console.error('Payment processing error:', error);
        this.session.completePayment(
          window.ApplePaySession?.STATUS_FAILURE || 1
        );
      });
  }

  /**
   * معالج اختيار طريقة الدفع
   */
  private handlePaymentMethodSelected(event: any): void {
    // يمكن استخدام هذا لتحديث الرسوم أو الضرائب بناءً على طريقة الدفع
    const paymentMethod = event.paymentMethod;
    console.log('Payment method selected:', paymentMethod);

    // تحديث الطلب إذا لزم الأمر
    this.session.completePaymentMethodSelection({
      newTotal: event.paymentRequest.total,
      newLineItems: event.paymentRequest.lineItems,
    });
  }

  /**
   * معالج إلغاء الدفع
   */
  private handlePaymentCanceled(): void {
    console.log('Apple Pay payment canceled');
  }

  /**
   * معالج أخطاء الدفع
   */
  private handlePaymentError(event: any): void {
    console.error('Apple Pay error:', event.errors);
  }

  /**
   * معالجة الدفع على الخادم
   */
  private async processPayment(payment: ApplePayPayment): Promise<void> {
    try {
      const response = await fetch('/api/apple-pay/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: payment.token,
          billingContact: payment.billingContact,
          shippingContact: payment.shippingContact,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process Apple Pay payment');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error processing Apple Pay payment:', error);
      throw error;
    }
  }

  /**
   * التحقق من صحة البيانات
   */
  validatePaymentRequest(paymentRequest: ApplePayRequest): boolean {
    // التحقق من العملة
    if (!paymentRequest.currencyCode) {
      console.error('Currency code is required');
      return false;
    }

    // التحقق من رمز الدولة
    if (!paymentRequest.countryCode) {
      console.error('Country code is required');
      return false;
    }

    // التحقق من المبلغ الإجمالي
    if (!paymentRequest.total || !paymentRequest.total.amount) {
      console.error('Total amount is required');
      return false;
    }

    // التحقق من شبكات الدفع المدعومة
    if (!paymentRequest.supportedNetworks || paymentRequest.supportedNetworks.length === 0) {
      console.error('Supported networks are required');
      return false;
    }

    return true;
  }

  /**
   * الحصول على الشبكات المدعومة
   */
  getSupportedNetworks(): string[] {
    return this.config.supportedNetworks;
  }

  /**
   * الحصول على الدول المدعومة
   */
  getSupportedCountries(): string[] {
    return this.config.supportedCountries;
  }

  /**
   * الحصول على القدرات المدعومة
   */
  getSupportedCapabilities(): string[] {
    return this.config.capabilities;
  }
}

// إنشاء مثيل من الخدمة
const applePayConfig: ApplePayConfig = {
  merchantIdentifier: process.env.VITE_APPLE_PAY_MERCHANT_ID || '',
  displayName: 'Jordan Customs System',
  supportedNetworks: ['visa', 'masterCard', 'amex'],
  supportedCountries: ['US', 'GB', 'AE', 'JO', 'SA'],
  capabilities: ['supports3DS', 'supportsEMV'],
};

export const applePayService = new ApplePayService(applePayConfig);

export default applePayService;
