import { CategoryInfo, CategoryKey, Wallet, Transaction, Budget, RecurringItem, Currency } from '../types';

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 83.5 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 155.0 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateAgainstUSD: 1.36 },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateAgainstUSD: 1.52 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateAgainstUSD: 3.67 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateAgainstUSD: 1.35 },
};

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  housing: {
    id: 'housing',
    name: 'Housing & Rent',
    color: '#6366f1', // Indigo
    hexColor: 0x6366f1,
    icon: 'Home',
    type: 'expense',
  },
  food: {
    id: 'food',
    name: 'Food & Dining',
    color: '#f59e0b', // Amber
    hexColor: 0xf59e0b,
    icon: 'Utensils',
    type: 'expense',
  },
  transportation: {
    id: 'transportation',
    name: 'Transportation',
    color: '#06b6d4', // Cyan
    hexColor: 0x06b6d4,
    icon: 'Car',
    type: 'expense',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment & Gaming',
    color: '#ec4899', // Pink
    hexColor: 0xec4899,
    icon: 'Gamepad2',
    type: 'expense',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities & Bills',
    color: '#14b8a6', // Teal
    hexColor: 0x14b8a6,
    icon: 'Zap',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping & Gear',
    color: '#a855f7', // Purple
    hexColor: 0xa855f7,
    icon: 'ShoppingBag',
    type: 'expense',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Health & Wellness',
    color: '#ef4444', // Red
    hexColor: 0xef4444,
    icon: 'HeartPulse',
    type: 'expense',
  },
  education: {
    id: 'education',
    name: 'Education & Courses',
    color: '#3b82f6', // Blue
    hexColor: 0x3b82f6,
    icon: 'GraduationCap',
    type: 'expense',
  },
  investment: {
    id: 'investment',
    name: 'Investments & Crypto',
    color: '#10b981', // Emerald
    hexColor: 0x10b981,
    icon: 'TrendingUp',
    type: 'both',
  },
  salary: {
    id: 'salary',
    name: 'Salary & Employment',
    color: '#10b981',
    hexColor: 0x10b981,
    icon: 'Briefcase',
    type: 'income',
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance & Business',
    color: '#22c55e',
    hexColor: 0x22c55e,
    icon: 'Laptop',
    type: 'income',
  },
  other: {
    id: 'other',
    name: 'Other & Miscellaneous',
    color: '#64748b', // Slate
    hexColor: 0x64748b,
    icon: 'Layers',
    type: 'both',
  },
};

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w-main',
    name: 'Main Checking',
    type: 'checking',
    balance: 8450.00,
    currency: 'USD',
    color: '#14b8a6',
    icon: 'CreditCard',
    accountNumberMasked: '•••• 4892',
  },
  {
    id: 'w-savings',
    name: 'High-Yield Vault',
    type: 'savings',
    balance: 24200.00,
    currency: 'USD',
    color: '#6366f1',
    icon: 'ShieldCheck',
    accountNumberMasked: '•••• 9104',
  },
  {
    id: 'w-credit',
    name: 'Apex Sapphire Card',
    type: 'credit',
    balance: -1150.50,
    currency: 'USD',
    color: '#ec4899',
    icon: 'Zap',
    accountNumberMasked: '•••• 2309',
  },
  {
    id: 'w-crypto',
    name: 'Crypto & Assets',
    type: 'investment',
    balance: 14500.00,
    currency: 'USD',
    color: '#f59e0b',
    icon: 'Coins',
    accountNumberMasked: '0x71...8F9',
  },
  {
    id: 'w-cash',
    name: 'Physical Cash',
    type: 'cash',
    balance: 620.00,
    currency: 'USD',
    color: '#10b981',
    icon: 'Banknote',
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b-housing', categoryId: 'housing', limit: 2000, period: 'monthly', alertThreshold: 0.85 },
  { id: 'b-food', categoryId: 'food', limit: 800, period: 'monthly', alertThreshold: 0.80 },
  { id: 'b-transport', categoryId: 'transportation', limit: 350, period: 'monthly', alertThreshold: 0.75 },
  { id: 'b-shopping', categoryId: 'shopping', limit: 500, period: 'monthly', alertThreshold: 0.80 },
  { id: 'b-entertainment', categoryId: 'entertainment', limit: 400, period: 'monthly', alertThreshold: 0.85 },
  { id: 'b-utilities', categoryId: 'utilities', limit: 300, period: 'monthly', alertThreshold: 0.90 },
  { id: 'b-healthcare', categoryId: 'healthcare', limit: 250, period: 'monthly', alertThreshold: 0.80 },
];

export const INITIAL_RECURRING: RecurringItem[] = [
  {
    id: 'rec-1',
    title: 'Luxury Apartment Rent',
    amount: 1850,
    type: 'expense',
    category: 'housing',
    walletId: 'w-main',
    frequency: 'monthly',
    nextBillingDate: '2026-09-01',
    autoDeduct: true,
    notes: 'Direct ACH withdrawal'
  },
  {
    id: 'rec-2',
    title: 'Figma & OpenAI Pro Subscriptions',
    amount: 45,
    type: 'expense',
    category: 'utilities',
    walletId: 'w-credit',
    frequency: 'monthly',
    nextBillingDate: '2026-09-05',
    autoDeduct: true,
    notes: 'AI development tools'
  },
  {
    id: 'rec-3',
    title: 'Equinox Gym & Spa',
    amount: 220,
    type: 'expense',
    category: 'healthcare',
    walletId: 'w-credit',
    frequency: 'monthly',
    nextBillingDate: '2026-09-12',
    autoDeduct: true,
  },
  {
    id: 'rec-4',
    title: 'Senior Software Architect Retainer',
    amount: 8500,
    type: 'income',
    category: 'salary',
    walletId: 'w-main',
    frequency: 'monthly',
    nextBillingDate: '2026-09-01',
    autoDeduct: true,
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Bi-Weekly Tech Salary Deposit',
    amount: 4250.00,
    type: 'income',
    category: 'salary',
    walletId: 'w-main',
    date: '2026-08-15',
    time: '09:00',
    notes: 'Direct deposit from Quantum Systems',
    tags: ['salary', 'tech', 'work'],
    merchant: 'Quantum Systems Inc'
  },
  {
    id: 'tx-2',
    title: 'Luxury Apartment Rent August',
    amount: 1850.00,
    type: 'expense',
    category: 'housing',
    walletId: 'w-main',
    date: '2026-08-01',
    time: '08:30',
    notes: 'Paid via auto-debit',
    tags: ['rent', 'fixed-cost'],
    merchant: 'Skyline Residences'
  },
  {
    id: 'tx-3',
    title: 'Whole Foods Organic Groceries',
    amount: 174.50,
    type: 'expense',
    category: 'food',
    walletId: 'w-credit',
    date: '2026-08-24',
    time: '18:45',
    notes: 'Weekly fresh produce & artisanal coffee',
    tags: ['groceries', 'organic'],
    merchant: 'Whole Foods Market'
  },
  {
    id: 'tx-4',
    title: 'Freelance Next.js Client Milestone',
    amount: 2200.00,
    type: 'income',
    category: 'freelance',
    walletId: 'w-main',
    date: '2026-08-20',
    time: '14:20',
    notes: 'Final frontend delivery for FinTech client',
    tags: ['freelance', 'react', 'web3'],
    merchant: 'Stripe Payout'
  },
  {
    id: 'tx-5',
    title: 'Apple Store — Studio Display & Accs',
    amount: 1599.00,
    type: 'expense',
    category: 'shopping',
    walletId: 'w-credit',
    date: '2026-08-18',
    time: '15:10',
    notes: 'Workstation upgrade with 5K display',
    tags: ['hardware', 'apple', 'office'],
    merchant: 'Apple Fifth Ave'
  },
  {
    id: 'tx-6',
    title: 'Michelin Star Dinner with Friends',
    amount: 285.00,
    type: 'expense',
    category: 'food',
    walletId: 'w-credit',
    date: '2026-08-22',
    time: '20:15',
    notes: 'Tasting menu at Le Bernardin',
    tags: ['dining', 'celebration'],
    merchant: 'Le Bernardin NYC'
  },
  {
    id: 'tx-7',
    title: 'Tesla Supercharging & Tolls',
    amount: 48.20,
    type: 'expense',
    category: 'transportation',
    walletId: 'w-credit',
    date: '2026-08-25',
    time: '11:05',
    notes: 'Weekend trip charging',
    tags: ['tesla', 'electric-vehicle'],
    merchant: 'Tesla Supercharger'
  },
  {
    id: 'tx-8',
    title: 'Ethereum Staking Rewards',
    amount: 320.00,
    type: 'income',
    category: 'investment',
    walletId: 'w-crypto',
    date: '2026-08-16',
    time: '04:00',
    notes: 'Passive validator yield',
    tags: ['crypto', 'eth', 'passive-income'],
    merchant: 'Lido Protocol'
  },
  {
    id: 'tx-9',
    title: 'High-Speed Fiber Gigabit Internet',
    amount: 85.00,
    type: 'expense',
    category: 'utilities',
    walletId: 'w-main',
    date: '2026-08-10',
    time: '10:00',
    tags: ['bills', 'wifi'],
    merchant: 'Verizon Fios'
  },
  {
    id: 'tx-10',
    title: 'Equinox Gym & Spa Membership',
    amount: 220.00,
    type: 'expense',
    category: 'healthcare',
    walletId: 'w-credit',
    date: '2026-08-12',
    time: '07:30',
    tags: ['fitness', 'health'],
    merchant: 'Equinox Sports Club'
  },
  {
    id: 'tx-11',
    title: 'Steam Summer Sale & VR Games',
    amount: 89.90,
    type: 'expense',
    category: 'entertainment',
    walletId: 'w-credit',
    date: '2026-08-14',
    time: '22:30',
    tags: ['gaming', 'steam'],
    merchant: 'Valve Steam Store'
  },
  {
    id: 'tx-12',
    title: 'NVIDIA GPU Cloud Compute Credits',
    amount: 140.00,
    type: 'expense',
    category: 'education',
    walletId: 'w-credit',
    date: '2026-08-08',
    time: '16:45',
    notes: 'LLM fine-tuning experiment',
    tags: ['ai', 'cloud', 'research'],
    merchant: 'Lambda Labs'
  },
  {
    id: 'tx-13',
    title: 'Uber Black — Airport Transfer',
    amount: 92.50,
    type: 'expense',
    category: 'transportation',
    walletId: 'w-credit',
    date: '2026-08-05',
    time: '06:15',
    tags: ['travel', 'taxi'],
    merchant: 'Uber Technologies'
  },
  {
    id: 'tx-14',
    title: 'Blue Bottle Artisanal Coffee & Beans',
    amount: 36.40,
    type: 'expense',
    category: 'food',
    walletId: 'w-credit',
    date: '2026-08-26',
    time: '09:15',
    tags: ['coffee', 'daily'],
    merchant: 'Blue Bottle Coffee'
  },
  {
    id: 'tx-15',
    title: 'Consulting Retainer Bonus',
    amount: 1500.00,
    type: 'income',
    category: 'freelance',
    walletId: 'w-main',
    date: '2026-08-26',
    time: '17:00',
    notes: 'Performance bonus for Q3 architecture refactor',
    tags: ['bonus', 'consulting'],
    merchant: 'Apex Technologies'
  }
];
