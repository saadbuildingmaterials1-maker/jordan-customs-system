/**
 * Advanced Payment Gateway Integration
 * نظام الدفع المتقدم - Stripe, HyperPay, Telr
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Payment Gateway Types
 */
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  email: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  timestamp: Date;
  gateway: 'stripe' | 'hyperpay' | 'telr';
}

/**
 * Stripe Payment Handler
 */
export async function processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      description: request.description,
      metadata: {
        userId: request.userId,
        email: request.email,
        ...request.metadata,
      },
      receipt_email: request.email,
    });

    return {
      success: true,
      transactionId: paymentIntent.id,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      gateway: 'stripe',
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    return {
      success: false,
      transactionId: '',
      status: 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      gateway: 'stripe',
    };
  }
}

/**
 * HyperPay Payment Handler
 */
export async function processHyperPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // HyperPay API integration
    const response = await fetch('https://api.hyperpay.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HYPERPAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        customer: {
          email: request.email,
          id: request.userId,
        },
        metadata: request.metadata,
      }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      transactionId: data.id || '',
      status: response.ok ? 'pending' : 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      gateway: 'hyperpay',
    };
  } catch (error) {
    console.error('HyperPay payment error:', error);
    return {
      success: false,
      transactionId: '',
      status: 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      gateway: 'hyperpay',
    };
  }
}

/**
 * Telr Payment Handler
 */
export async function processTelrPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Telr API integration
    const response = await fetch('https://api.telr.com/v1/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TELR_API_KEY}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        customer: {
          email: request.email,
          id: request.userId,
        },
        metadata: request.metadata,
      }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      transactionId: data.transactionId || '',
      status: response.ok ? 'pending' : 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      gateway: 'telr',
    };
  } catch (error) {
    console.error('Telr payment error:', error);
    return {
      success: false,
      transactionId: '',
      status: 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      gateway: 'telr',
    };
  }
}

/**
 * Multi-Gateway Payment Processor
 * يحاول الدفع عبر عدة بوابات
 */
export async function processPaymentMultiGateway(
  request: PaymentRequest,
  gateways: Array<'stripe' | 'hyperpay' | 'telr'> = ['stripe', 'hyperpay', 'telr']
): Promise<PaymentResponse> {
  for (const gateway of gateways) {
    try {
      let response: PaymentResponse;

      switch (gateway) {
        case 'stripe':
          response = await processStripePayment(request);
          break;
        case 'hyperpay':
          response = await processHyperPayPayment(request);
          break;
        case 'telr':
          response = await processTelrPayment(request);
          break;
        default:
          continue;
      }

      if (response.success) {
        return response;
      }
    } catch (error) {
      console.error(`Payment failed with ${gateway}:`, error);
      continue;
    }
  }

  // All gateways failed
  return {
    success: false,
    transactionId: '',
    status: 'failed',
    amount: request.amount,
    currency: request.currency,
    timestamp: new Date(),
    gateway: 'stripe',
  };
}

/**
 * Verify Payment Status
 */
export async function verifyPaymentStatus(
  transactionId: string,
  gateway: 'stripe' | 'hyperpay' | 'telr'
): Promise<PaymentResponse | null> {
  try {
    switch (gateway) {
      case 'stripe': {
        const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
        return {
          success: paymentIntent.status === 'succeeded',
          transactionId: paymentIntent.id,
          status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          timestamp: new Date(paymentIntent.created * 1000),
          gateway: 'stripe',
        };
      }
      case 'hyperpay': {
        const response = await fetch(`https://api.hyperpay.com/v1/payment/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.HYPERPAY_API_KEY}`,
          },
        });
        const data = await response.json();
        return {
          success: data.status === 'completed',
          transactionId: data.id,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          timestamp: new Date(data.createdAt),
          gateway: 'hyperpay',
        };
      }
      case 'telr': {
        const response = await fetch(`https://api.telr.com/v1/transaction/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.TELR_API_KEY}`,
          },
        });
        const data = await response.json();
        return {
          success: data.status === 'completed',
          transactionId: data.transactionId,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          timestamp: new Date(data.createdAt),
          gateway: 'telr',
        };
      }
      default:
        return null;
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return null;
  }
}

/**
 * Refund Payment
 */
export async function refundPayment(
  transactionId: string,
  gateway: 'stripe' | 'hyperpay' | 'telr',
  amount?: number
): Promise<boolean> {
  try {
    switch (gateway) {
      case 'stripe': {
        const refund = await stripe.refunds.create({
          payment_intent: transactionId,
          amount: amount ? Math.round(amount * 100) : undefined,
        });
        return refund.status === 'succeeded';
      }
      case 'hyperpay': {
        const response = await fetch(`https://api.hyperpay.com/v1/payment/${transactionId}/refund`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HYPERPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
        return response.ok;
      }
      case 'telr': {
        const response = await fetch(`https://api.telr.com/v1/transaction/${transactionId}/refund`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.TELR_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
        return response.ok;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error('Error refunding payment:', error);
    return false;
  }
}

export default {
  processStripePayment,
  processHyperPayPayment,
  processTelrPayment,
  processPaymentMultiGateway,
  verifyPaymentStatus,
  refundPayment,
};
