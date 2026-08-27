export type TransactionType = 'expense' | 'income' | 'transfer';

export type CategoryKey = 
  | 'housing'
  | 'food'
  | 'transportation'
  | 'entertainment'
  | 'utilities'
  | 'shopping'
  | 'healthcare'
  | 'education'
  | 'investment'
  | 'freelance'
  | 'salary'
  | 'other';

export interface CategoryInfo {
  id: CategoryKey;
  name: string;
  color: string;
  hexColor: number; // For Three.js materials
  icon: string;
  type: 'expense' | 'income' | 'both';
}

export interface Wallet {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  accountNumberMasked?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryKey;
  walletId: string;
  date: string; // ISO format YYYY-MM-DD
  time?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  merchant?: string;
  receiptUrl?: string;
}

export interface Budget {
  id: string;
  categoryId: CategoryKey;
  limit: number;
  period: 'monthly' | 'yearly';
  alertThreshold: number; // e.g., 80% (0.8)
}

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryKey;
  walletId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: string;
  autoDeduct: boolean;
  notes?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export type Visual3DMode = 'rings' | 'towers' | 'vault' | 'flow';

export interface FilterOptions {
  search: string;
  type: 'all' | 'expense' | 'income';
  category: string;
  walletId: string;
  dateRange: 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface FinancialHealthMetric {
  score: number; // 0 - 100
  savingsRate: number; // percentage
  burnRatePerDay: number;
  budgetAdherence: number;
  status: 'Elite' | 'Healthy' | 'Moderate' | 'Warning' | 'Critical';
  recommendations: string[];
}
