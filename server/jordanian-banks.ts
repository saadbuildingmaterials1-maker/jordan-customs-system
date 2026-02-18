/**
 * Jordanian Banks Integration
 * نظام تكامل البنوك الأردنية
 */

import { z } from 'zod';

/**
 * Jordanian Banks List
 */
export const JORDANIAN_BANKS = [
  {
    id: 'abc',
    name: 'Arab Bank',
    arabicName: 'البنك العربي',
    code: 'ARJOJD22',
    swiftCode: 'ARJOJD22',
    apiEndpoint: 'https://api.arabbank.com.jo/v1',
  },
  {
    id: 'jib',
    name: 'Jordan Islamic Bank',
    arabicName: 'البنك الإسلامي الأردني',
    code: 'JIBOJD22',
    swiftCode: 'JIBOJD22',
    apiEndpoint: 'https://api.jib.com.jo/v1',
  },
  {
    id: 'cb',
    name: 'Central Bank of Jordan',
    arabicName: 'البنك المركزي الأردني',
    code: 'CBJO',
    swiftCode: 'CBJO',
    apiEndpoint: 'https://api.cbj.gov.jo/v1',
  },
  {
    id: 'hb',
    name: 'Housing Bank for Trade and Finance',
    arabicName: 'بنك الإسكان للتجارة والتمويل',
    code: 'HBKOJD22',
    swiftCode: 'HBKOJD22',
    apiEndpoint: 'https://api.housingjb.com/v1',
  },
  {
    id: 'kb',
    name: 'Kuwaiti-Jordanian Bank',
    arabicName: 'البنك الكويتي الأردني',
    code: 'KJBJD22',
    swiftCode: 'KJBJD22',
    apiEndpoint: 'https://api.kjb.com.jo/v1',
  },
  {
    id: 'ib',
    name: 'Investment Bank',
    arabicName: 'بنك الاستثمار',
    code: 'IBJO',
    swiftCode: 'IBJO',
    apiEndpoint: 'https://api.investmentbank.com.jo/v1',
  },
];

/**
 * Bank Transfer Request
 */
export interface BankTransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description: string;
  bankId: string;
  referenceNumber?: string;
}

/**
 * Bank Transfer Response
 */
export interface BankTransferResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  timestamp: Date;
  bankName: string;
  errorMessage?: string;
}

/**
 * Account Information
 */
export interface AccountInfo {
  accountNumber: string;
  accountHolder: string;
  balance: number;
  currency: string;
  bankId: string;
  accountType: 'checking' | 'savings' | 'business';
  lastUpdated: Date;
}

/**
 * Process Bank Transfer
 */
export async function processBankTransfer(
  request: BankTransferRequest
): Promise<BankTransferResponse> {
  try {
    const bank = JORDANIAN_BANKS.find((b) => b.id === request.bankId);
    if (!bank) {
      throw new Error('Bank not found');
    }

    const response = await fetch(`${bank.apiEndpoint}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BANK_API_KEY}`,
        'X-Bank-Code': bank.code,
      },
      body: JSON.stringify({
        from: request.fromAccount,
        to: request.toAccount,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        reference: request.referenceNumber || `TXN-${Date.now()}`,
      }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      transactionId: data.transactionId || `TXN-${Date.now()}`,
      status: response.ok ? 'completed' : 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      bankName: bank.name,
      errorMessage: data.error,
    };
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      status: 'failed',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date(),
      bankName: '',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get Account Information
 */
export async function getAccountInfo(
  accountNumber: string,
  bankId: string
): Promise<AccountInfo | null> {
  try {
    const bank = JORDANIAN_BANKS.find((b) => b.id === bankId);
    if (!bank) {
      throw new Error('Bank not found');
    }

    const response = await fetch(`${bank.apiEndpoint}/accounts/${accountNumber}`, {
      headers: {
        'Authorization': `Bearer ${process.env.BANK_API_KEY}`,
        'X-Bank-Code': bank.code,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      accountNumber: data.accountNumber,
      accountHolder: data.accountHolder,
      balance: data.balance,
      currency: data.currency || 'JOD',
      bankId,
      accountType: data.accountType || 'checking',
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    return null;
  }
}

/**
 * Verify Account
 */
export async function verifyAccount(
  accountNumber: string,
  bankId: string
): Promise<boolean> {
  try {
    const bank = JORDANIAN_BANKS.find((b) => b.id === bankId);
    if (!bank) {
      return false;
    }

    const response = await fetch(`${bank.apiEndpoint}/accounts/${accountNumber}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BANK_API_KEY}`,
        'X-Bank-Code': bank.code,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error verifying account:', error);
    return false;
  }
}

/**
 * Get Exchange Rates
 */
export async function getExchangeRates(
  baseCurrency: string = 'JOD'
): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://api.cbj.gov.jo/v1/exchange-rates?base=${baseCurrency}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BANK_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    return data.rates || {};
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {
      USD: 0.709,
      EUR: 0.77,
      GBP: 0.89,
      SAR: 0.189,
      AED: 0.193,
    };
  }
}

/**
 * Get Transaction History
 */
export async function getTransactionHistory(
  accountNumber: string,
  bankId: string,
  limit: number = 50
): Promise<
  Array<{
    id: string;
    date: Date;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    balance: number;
  }>
> {
  try {
    const bank = JORDANIAN_BANKS.find((b) => b.id === bankId);
    if (!bank) {
      throw new Error('Bank not found');
    }

    const response = await fetch(
      `${bank.apiEndpoint}/accounts/${accountNumber}/transactions?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BANK_API_KEY}`,
          'X-Bank-Code': bank.code,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.transactions || []).map((t: any) => ({
      id: t.id,
      date: new Date(t.date),
      description: t.description,
      amount: t.amount,
      type: t.type,
      balance: t.balance,
    }));
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Schedule Recurring Transfer
 */
export async function scheduleRecurringTransfer(
  request: BankTransferRequest & {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: Date;
    endDate?: Date;
  }
): Promise<{ success: boolean; scheduleId: string }> {
  try {
    const bank = JORDANIAN_BANKS.find((b) => b.id === request.bankId);
    if (!bank) {
      throw new Error('Bank not found');
    }

    const response = await fetch(`${bank.apiEndpoint}/transfers/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BANK_API_KEY}`,
        'X-Bank-Code': bank.code,
      },
      body: JSON.stringify({
        from: request.fromAccount,
        to: request.toAccount,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        frequency: request.frequency,
        startDate: request.startDate.toISOString(),
        endDate: request.endDate?.toISOString(),
      }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      scheduleId: data.scheduleId || `SCHED-${Date.now()}`,
    };
  } catch (error) {
    console.error('Error scheduling transfer:', error);
    return {
      success: false,
      scheduleId: '',
    };
  }
}

export default {
  JORDANIAN_BANKS,
  processBankTransfer,
  getAccountInfo,
  verifyAccount,
  getExchangeRates,
  getTransactionHistory,
  scheduleRecurringTransfer,
};
