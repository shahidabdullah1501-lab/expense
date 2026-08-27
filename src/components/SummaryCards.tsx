import React from 'react';
import { Transaction, Wallet, Currency, Budget } from '../types';
import { formatCurrency, calculateFinancialHealth } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet as WalletIcon, 
  PiggyBank, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Flame
} from 'lucide-react';

interface SummaryCardsProps {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  currency: Currency;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  transactions,
  wallets,
  budgets,
  currency,
}) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTxs = transactions.filter(t => t.date.startsWith(currentMonth));

  // Wallet total balance
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  // Income & Expenses for current month
  const monthlyIncome = thisMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netMonthly = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, (netMonthly / monthlyIncome) * 100) : 0;

  const health = calculateFinancialHealth(transactions, budgets);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
      
      {/* Card 1: Total Net Wealth / Total Balance */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-card/90 via-dark-card/80 to-dark-surface/95 border border-white/10 p-5 shadow-card hover:shadow-card-hover transition-all group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
          <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <WalletIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Across {wallets.length} active wallets</span>
        </div>
      </div>

      {/* Card 2: Monthly Income */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-card/90 via-dark-card/80 to-dark-surface/95 border border-white/10 p-5 shadow-card hover:shadow-card-hover transition-all group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Income</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
          {formatCurrency(monthlyIncome, currency)}
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-emerald-300 font-medium">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{thisMonthTxs.filter(t => t.type === 'income').length} deposits this month</span>
        </div>
      </div>

      {/* Card 3: Monthly Expenses & Burn */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-card/90 via-dark-card/80 to-dark-surface/95 border border-white/10 p-5 shadow-card hover:shadow-card-hover transition-all group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Expenses</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
          {formatCurrency(monthlyExpense, currency)}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-300 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Burn: ~{formatCurrency(health.burnRatePerDay, currency)} / day</span>
        </div>
      </div>

      {/* Card 4: Financial Health Score & Savings Rate */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-card/90 via-dark-card/80 to-dark-surface/95 border border-white/10 p-5 shadow-card hover:shadow-card-hover transition-all group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Index</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
            health.status === 'Elite' 
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : health.status === 'Healthy'
              ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}>
            {health.status}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {health.score}<span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <div className="text-xs font-bold text-indigo-300">
            {savingsRate.toFixed(0)}% Saved
          </div>
        </div>

        {/* Health Score Mini Progress Bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${health.score}%` }}
          />
        </div>
      </div>

    </div>
  );
};
