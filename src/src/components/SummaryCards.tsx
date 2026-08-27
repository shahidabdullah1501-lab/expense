import React from 'react';
import { Transaction, Wallet, Currency, Budget } from '../types';
import { formatCurrency, calculateFinancialHealth } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet as WalletIcon, 
  ArrowUpRight,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      
      {/* Card 1: Total Net Worth (Sage Accent) */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between group hover:border-stone-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total Net Worth</span>
            <div className="w-7 h-7 rounded-lg bg-[#D5EBDA] border border-[#B2DCBC] flex items-center justify-center text-stone-800 shadow-xs">
              <WalletIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-2xl font-bold text-stone-900 tracking-tight">
            {formatCurrency(totalBalance, currency)}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span>{wallets.length} active accounts</span>
          <span className="text-emerald-800 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3 text-[#3D9251]" /> Live
          </span>
        </div>
      </div>

      {/* Card 2: Monthly Inflow (Sage / Mint) */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between group hover:border-stone-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Monthly Inflow</span>
            <div className="w-7 h-7 rounded-lg bg-[#D5EBDA] border border-[#B2DCBC] flex items-center justify-center text-emerald-900 shadow-xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-2xl font-bold text-stone-900 tracking-tight">
            {formatCurrency(monthlyIncome, currency)}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span>{thisMonthTxs.filter(t => t.type === 'income').length} deposits</span>
          <span className="text-emerald-800 font-semibold">
            +{formatCurrency(monthlyIncome, currency)}
          </span>
        </div>
      </div>

      {/* Card 3: Monthly Outflow (Blush Pink / Rose) */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between group hover:border-stone-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Monthly Outflow</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAD3D4] border border-[#D7AEB0] flex items-center justify-center text-rose-950 shadow-xs">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-2xl font-bold text-stone-900 tracking-tight">
            {formatCurrency(monthlyExpense, currency)}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#CE744B]" />
            ~{formatCurrency(health.burnRatePerDay, currency)} / day
          </span>
          <span className="text-rose-900 font-semibold">
            -{formatCurrency(monthlyExpense, currency)}
          </span>
        </div>
      </div>

      {/* Card 4: Health Index & Savings (Lavender & Peach) */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between group hover:border-stone-300 transition-all">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Health Index</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3E4F1] border border-[#E6C6E1] text-purple-950">
              {health.status}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-stone-900 tracking-tight">
              {health.score}<span className="text-xs font-normal text-stone-400">/100</span>
            </div>
            <div className="text-xs font-semibold text-stone-700">
              {savingsRate.toFixed(0)}% Saved
            </div>
          </div>
        </div>

        {/* Health Score Mini Progress Bar */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-[#3D9251] rounded-full transition-all duration-500"
              style={{ width: `${health.score}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
