import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * خدمة التكامل مع الجهات الحكومية
 * تتعامل مع الاتصال والمزامنة مع نظام الجمارك الأردنية
 */

interface GovernmentConfig {
  baseUrl: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  certificatePath?: string;
}

interface CustomsDeclaration {
  declarationNumber: string;
  declarationType: 'import' | 'export';
  declarationDate: string;
  importer: {
    name: string;
    taxId: string;
    address: string;
  };
  items: Array<{
    hsCode: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    currency: string;
    totalValue: number;
  }>;
  totalValue: number;
  currency: string;
}

interface GovernmentResponse {
  status: 'success' | 'error' | 'pending';
  declarationId: string;
  referenceNumber: string;
  message: string;
  data?: any;
}

/**
 * فئة التكامل مع الجهات الحكومية
 */
export class GovernmentIntegrationService {
  private client: AxiosInstance;
  private config: GovernmentConfig;
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor(config: GovernmentConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JordanCustomsSystem/1.0.0',
      },
    });

    // إضافة interceptor للتعامل مع الأخطاء
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('خطأ في الاتصال بالنظام الحكومي:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * الحصول على رمز الوصول (Access Token)
   */
  async getAccessToken(): Promise<string> {
    // التحقق من صحة الرمز الحالي
    if (this.accessToken && this.accessToken.length > 0 && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await this.client.post('/auth/token', {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        grantType: 'client_credentials',
      });

      this.accessToken = response.data.accessToken;
      this.tokenExpiry = Date.now() + (response.data.expiresIn * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('فشل الحصول على رمز الوصول:', error);
      throw new Error('فشل المصادقة مع النظام الحكومي');
    }
  }

  /**
   * إرسال بيان جمركي إلى النظام الحكومي
   */
  async submitCustomsDeclaration(
    declaration: CustomsDeclaration
  ): Promise<GovernmentResponse> {
    try {
      const token = await this.getAccessToken();

      // التوقيع الرقمي على البيان
      const signature = this.signDeclaration(declaration);

      const response = await this.client.post(
        '/customs/declaration/submit',
        {
          ...declaration,
          signature,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      return {
        status: 'success',
        declarationId: response.data.id,
        referenceNumber: response.data.referenceNumber,
        message: 'تم إرسال البيان بنجاح',
        data: response.data,
      };
    } catch (error: any) {
      console.error('خطأ في إرسال البيان:', error.message);
      return {
        status: 'error',
        declarationId: '',
        referenceNumber: '',
        message: error.message || 'فشل إرسال البيان',
      };
    }
  }

  /**
   * الحصول على حالة البيان الجمركي
   */
  async getDeclarationStatus(declarationId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(
        `/customs/declaration/${declarationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      return {
        status: 'success',
        data: response.data,
      };
    } catch (error: any) {
      console.error('خطأ في الحصول على حالة البيان:', error.message);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * الحصول على قائمة الرموز الجمركية (HS Codes)
   */
  async getTariffCodes(searchTerm?: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();

      const params = searchTerm ? { search: searchTerm } : {};

      const response = await this.client.get('/customs/tariff-codes', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-API-Key': this.config.apiKey,
        },
      });

      return response.data.codes || [];
    } catch (error) {
      console.error('خطأ في الحصول على الرموز الجمركية:', error);
      return [];
    }
  }

  /**
   * التحقق من صحة البيان الجمركي
   */
  async validateDeclaration(
    declaration: CustomsDeclaration
  ): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        '/customs/declaration/validate',
        declaration,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      return {
        valid: response.data.valid,
        errors: response.data.errors || [],
      };
    } catch (error: any) {
      console.error('خطأ في التحقق من البيان:', error.message);
      return {
        valid: false,
        errors: [error.message],
      };
    }
  }

  /**
   * حساب الرسوم والضرائب
   */
  async calculateTaxesAndDuties(declaration: CustomsDeclaration): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        '/tax/calculate',
        {
          items: declaration.items,
          totalValue: declaration.totalValue,
          currency: declaration.currency,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      return {
        customsDuty: response.data.customsDuty,
        salesTax: response.data.salesTax,
        additionalTaxes: response.data.additionalTaxes || 0,
        total: response.data.total,
      };
    } catch (error) {
      console.error('خطأ في حساب الرسوم:', error);
      throw error;
    }
  }

  /**
   * تتبع الشحنة
   */
  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(
        `/shipping/track/${trackingNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('خطأ في تتبع الشحنة:', error);
      throw error;
    }
  }

  /**
   * التوقيع الرقمي على البيان
   */
  private signDeclaration(declaration: CustomsDeclaration): string {
    const payload = JSON.stringify(declaration);
    const signature = crypto
      .createHmac('sha256', this.config.clientSecret)
      .update(payload)
      .digest('hex');
    return signature;
  }

  /**
   * التحقق من التوقيع الرقمي
   */
  verifySignature(declaration: CustomsDeclaration, signature: string): boolean {
    const expectedSignature = this.signDeclaration(declaration);
    return expectedSignature === signature;
  }

  /**
   * إنشاء رمز JWT للتوثيق
   */
  createJWT(payload: any, expiresIn: string = '1h'): string {
    return jwt.sign(payload, this.config.clientSecret, { expiresIn } as any);
  }

  /**
   * التحقق من صحة رمز JWT
   */
  verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.config.clientSecret);
    } catch (error) {
      console.error('خطأ في التحقق من الرمز:', error);
      return null;
    }
  }

  /**
   * اختبار الاتصال بالنظام الحكومي
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get('/health', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('فشل اختبار الاتصال:', error);
      return false;
    }
  }
}

/**
 * إنشاء نسخة واحدة من الخدمة
 */
let governmentIntegrationService: GovernmentIntegrationService | null = null;

export function initializeGovernmentIntegration(): GovernmentIntegrationService {
  if (!governmentIntegrationService) {
    const config: GovernmentConfig = {
      baseUrl: process.env.GOVERNMENT_API_URL || 'https://api.customs.gov.jo',
      apiKey: process.env.GOVERNMENT_API_KEY || '',
      clientId: process.env.GOVERNMENT_CLIENT_ID || '',
      clientSecret: process.env.GOVERNMENT_CLIENT_SECRET || '',
    };

    governmentIntegrationService = new GovernmentIntegrationService(config);
  }

  return governmentIntegrationService;
}

export function getGovernmentIntegration(): GovernmentIntegrationService {
  if (!governmentIntegrationService) {
    return initializeGovernmentIntegration();
  }
  return governmentIntegrationService;
}
