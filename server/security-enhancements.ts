/**
 * Security Enhancements
 * تحسينات أمان إضافية
 */

import { Request, Response, NextFunction } from 'express';

// Rate Limiting
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests = 100;
  private windowMs = 60000; // 1 minute

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    
    const recentRequests = requests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(ip, recentRequests);
    
    return true;
  }
}

// Input Validation
export function validateInput(input: any, rules: any): boolean {
  for (const [key, rule] of Object.entries(rules)) {
    const value = input[key];
    
    if (rule.required && !value) {
      return false;
    }

    if (rule.type && typeof value !== rule.type) {
      return false;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return false;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return false;
    }
  }

  return true;
}

// CSRF Protection
export function generateCSRFToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// SQL Injection Prevention
export function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0');
}

// XSS Prevention
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export const rateLimiter = new RateLimiter();
