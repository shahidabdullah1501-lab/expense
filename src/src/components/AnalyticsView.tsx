import React from 'react';
import { Transaction, Budget, Currency } from '../types';
import { formatCurrency, calculateFinancialHealth, getCategoryBreakdown } from '../utils/formatters';
import { 
  BarChart3, 
  Store, 
  Award, 
  Zap, 
  PieChart as PieIcon
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
    const monthKey = t.date.slice(0, 7);
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
    <div className="space-y-5">
      
      {/* Financial Health Diagnostic Banner */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3E4F1] border border-[#E6C6E1] flex items-center justify-center text-purple-950 flex-shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">Financial Health Audit</h3>
                <span className="badge badge-lavender text-[11px]">
                  {health.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Evaluated from savings rate, budget compliance, and burn velocity.
              </p>
            </div>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-baseline gap-2 bg-[#FAFAEB] border border-stone-200 rounded-xl px-4 py-2 self-start md:self-auto shadow-xs">
            <span className="text-2xl font-bold text-stone-900">{health.score}</span>
            <span className="text-xs font-normal text-stone-500">/100 Index</span>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {health.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-[#FAFAEB]/70 rounded-xl p-3 border border-stone-200 text-xs text-stone-800">
              <Zap className="w-3.5 h-3.5 text-stone-700 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Cashflow Timeline & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Cashflow Comparison Bars */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-stone-600" />
              <h3 className="text-sm font-bold text-stone-900">Monthly Inflow vs Outflow</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-900">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D5EBDA] border border-[#8CCA9A]" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-rose-950">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAD3D4] border border-[#D7AEB0]" /> Outflow
              </span>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {monthlyHistory.map((item) => {
              const incomeWidth = (item.income / maxMonthValue) * 100;
              const expenseWidth = (item.expense / maxMonthValue) * 100;

              return (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                    <span>{item.month}</span>
                    <span className="text-stone-500">
                      Net: <strong className="text-stone-900">{formatCurrency(item.income - item.expense, currency)}</strong>
                    </span>
                  </div>

                  {/* Dual comparative bars with Sage & Blush */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-stone-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-[#D5EBDA] border-r border-[#8CCA9A] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, incomeWidth)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-900 w-16 text-right">
                        {formatCurrency(item.income, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-stone-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-[#EAD3D4] border-r border-[#D7AEB0] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, expenseWidth)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-rose-950 w-16 text-right">
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
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-stone-600" />
              <h3 className="text-sm font-bold text-stone-900">Expense Distribution</h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              Total: {formatCurrency(totalExpense, currency)}
            </span>
          </div>

          <div className="space-y-3">
            {expenseCategories.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-stone-300"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-stone-800 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span className="text-[10px] text-stone-500 w-8 text-right font-medium">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
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

      {/* Top Payees Card */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3.5">
          <Store className="w-4 h-4 text-stone-600" />
          <h3 className="text-sm font-bold text-stone-900">Top Spending Payees</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topMerchants.map((m, idx) => (
            <div key={m.merchant} className="bg-[#FAFAEB]/80 border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-stone-500">#{idx + 1}</span>
                <span className="w-2 h-2 rounded-full bg-[#EAD3D4] border border-[#D7AEB0]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900 truncate">{m.merchant}</div>
                <div className="text-xs font-bold text-rose-950 mt-1">
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
