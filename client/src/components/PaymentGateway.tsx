/**
 * Advanced Payment Gateway Component
 * مكون بوابة الدفع المتقدمة
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentGateway({
  amount,
  currency = 'USD',
  description = 'Payment',
  onSuccess,
  onError,
}: PaymentGatewayProps) {
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'hyperpay' | 'telr'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createPaymentMutation = trpc.payment.createPaymentIntent.useMutation();
  const verifyPaymentQuery = trpc.payment.verifyPayment.useQuery(
    { transactionId: '', gateway: 'stripe' },
    { enabled: false }
  );
  const calculateFeeQuery = trpc.payment.calculatePaymentFee.useQuery({
    amount,
    gateway: selectedGateway,
    currency,
  });
  const availableGatewaysQuery = trpc.payment.getAvailableGateways.useQuery();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const result = await createPaymentMutation.mutateAsync({
        amount,
        currency,
        description,
        gateway: selectedGateway,
      });

      if (result.success) {
        toast({
          title: 'Payment Initiated',
          description: `Transaction ID: ${result.transactionId}`,
        });
        onSuccess?.(result.transactionId);
      } else {
        throw new Error('Payment creation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const fee = calculateFeeQuery.data?.fee || 0;
  const total = calculateFeeQuery.data?.total || amount;

  return (
    <div className="space-y-6">
      {/* Payment Gateway Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableGatewaysQuery.data?.gateways.map((gateway) => (
            <button
              key={gateway.id}
              onClick={() => setSelectedGateway(gateway.id as any)}
              className={`p-4 border-2 rounded-lg transition ${
                selectedGateway === gateway.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{gateway.icon}</div>
              <div className="font-semibold">{gateway.name}</div>
              <div className="text-sm text-gray-600">{gateway.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Payment Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">
              {amount.toFixed(2)} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gateway Fee:</span>
            <span className="font-semibold text-orange-600">
              {fee.toFixed(2)} {currency}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">
              {total.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input value={description} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <Input value={currency} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gateway</label>
              <Input value={selectedGateway.toUpperCase()} disabled />
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || createPaymentMutation.isPending}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        {isProcessing ? 'Processing Payment...' : `Pay ${total.toFixed(2)} ${currency}`}
      </Button>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          🔒 Your payment is secure and encrypted. We support multiple payment gateways for your convenience.
        </p>
      </div>
    </div>
  );
}

export default PaymentGateway;
