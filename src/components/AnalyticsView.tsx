import React from 'react';
import { Transaction, Budget, Currency } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, calculateFinancialHealth, getCategoryBreakdown } from '../utils/formatters';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Store, 
  Award, 
  Zap, 
  PieChart as PieIcon,
  Flame
} from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  budgets,
  currency,
}) => {
  const expenseCategories = getCategoryBreakdown(transactions, 'expense');
  const totalExpense = expenseCategories.reduce((sum, c) => sum + c.amount, 0);

  const incomeCategories = getCategoryBreakdown(transactions, 'income');
  const totalIncome = incomeCategories.reduce((sum, c) => sum + c.amount, 0);

  const health = calculateFinancialHealth(transactions, budgets);

  // Top Merchants Analysis
  const merchantTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense' && t.merchant)
    .forEach(t => {
      const m = t.merchant!;
      merchantTotals[m] = (merchantTotals[m] || 0) + t.amount;
    });

  const topMerchants = Object.entries(merchantTotals)
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Monthly Cashflow History
  const monthsMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(t => {
    const monthKey = t.date.slice(0, 7); // 'YYYY-MM'
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') monthsMap[monthKey].income += t.amount;
    if (t.type === 'expense') monthsMap[monthKey].expense += t.amount;
  });

  const monthlyHistory = Object.entries(monthsMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const maxMonthValue = Math.max(
    ...monthlyHistory.flatMap(m => [m.income, m.expense]),
    1000
  );

  return (
    <div className="space-y-6">
      
      {/* Financial Health Diagnostic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-card via-brand-950/40 to-dark-card border border-brand-500/30 p-6 shadow-card backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-glow-teal flex-shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">Financial Intelligence Audit</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  {health.status} Status
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Calculated across savings rate, budget compliance, and spending velocity.
              </p>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="flex items-baseline gap-2 bg-dark-bg/60 border border-white/10 rounded-2xl px-5 py-3">
            <span className="text-3xl font-extrabold text-brand-300">{health.score}</span>
            <span className="text-xs font-semibold text-slate-400">/100 Health Score</span>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3">
          {health.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-dark-surface/60 rounded-xl p-3 border border-white/5 text-xs text-slate-200">
              <Zap className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Cashflow Timeline & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cashflow Comparison Bars */}
        <div className="rounded-3xl bg-dark-card/90 border border-white/10 p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-extrabold text-white">Monthly Cashflow Flow</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Expense
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {monthlyHistory.map((item) => {
              const incomeHeight = (item.income / maxMonthValue) * 100;
              const expenseHeight = (item.expense / maxMonthValue) * 100;

              return (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>{item.month}</span>
                    <span className="text-brand-300">
                      Net: {formatCurrency(item.income - item.expense, currency)}
                    </span>
                  </div>

                  {/* Dual comparative bars */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-dark-surface rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, incomeHeight)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 w-20 text-right">
                        {formatCurrency(item.income, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-dark-surface rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, expenseHeight)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-rose-400 w-20 text-right">
                        {formatCurrency(item.expense, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share Distribution */}
        <div className="rounded-3xl bg-dark-card/90 border border-white/10 p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-extrabold text-white">Expense Distribution</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total: {formatCurrency(totalExpense, currency)}
            </span>
          </div>

          <div className="space-y-3">
            {expenseCategories.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-200">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 w-9 text-right font-bold">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-dark-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Merchants Card */}
      <div className="rounded-3xl bg-dark-card/90 border border-white/10 p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-extrabold text-white">Top Spending Merchants</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topMerchants.map((m, idx) => (
            <div key={m.merchant} className="bg-dark-surface/70 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-400">#{idx + 1}</span>
                <Store className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white truncate">{m.merchant}</div>
                <div className="text-sm font-bold text-rose-400 mt-1">
                  {formatCurrency(m.amount, currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
