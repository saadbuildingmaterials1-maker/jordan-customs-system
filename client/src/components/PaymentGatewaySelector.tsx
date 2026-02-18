import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, CheckCircle2 } from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  currencies: string[];
  isActive: boolean;
  color: string;
}

interface PaymentGatewaySelectorProps {
  gateways: PaymentGateway[];
  selectedGateway: string | null;
  onSelectGateway: (gatewayId: string) => void;
  isLoading?: boolean;
}

export const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  gateways,
  selectedGateway,
  onSelectGateway,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          اختر طريقة الدفع
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          اختر من بين بوابات الدفع المحلية الموثوقة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map((gateway) => (
          <Card
            key={gateway.id}
            className={`cursor-pointer transition-all border-2 ${
              selectedGateway === gateway.id
                ? `ring-2 ring-offset-2 ring-blue-500 ${gateway.color} text-white`
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
            } ${!gateway.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => gateway.isActive && onSelectGateway(gateway.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${gateway.color} text-white`}>
                    {gateway.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{gateway.name}</CardTitle>
                    <CardDescription className={selectedGateway === gateway.id ? 'text-blue-100' : ''}>
                      {gateway.description}
                    </CardDescription>
                  </div>
                </div>
                {selectedGateway === gateway.id && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    العملات المدعومة:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gateway.currencies.map((currency) => (
                      <Badge key={currency} variant="secondary">
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </div>

                {!gateway.isActive && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    غير متاح حالياً
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGateway && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✓ تم اختيار {gateways.find(g => g.id === selectedGateway)?.name}
          </p>
        </div>
      )}
    </div>
  );
};
