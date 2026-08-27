import { Currency, Transaction, FinancialHealthMetric, Budget, CategoryKey } from '../types';
import { CATEGORIES } from '../data/initialData';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const converted = amount * currency.rateAgainstUSD;
  const isNegative = converted < 0;
  const absAmount = Math.abs(converted);
  
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${currency.symbol}${formatted}`;
};

export const formatCompactCurrency = (amount: number, currency: Currency): string => {
  const converted = amount * currency.rateAgainstUSD;
  if (Math.abs(converted) >= 1_000_000) {
    return `${currency.symbol}${(converted / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(converted) >= 1_000) {
    return `${currency.symbol}${(converted / 1_000).toFixed(1)}k`;
  }
  return `${currency.symbol}${converted.toFixed(0)}`;
};

export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const calculateFinancialHealth = (
  transactions: Transaction[],
  budgets: Budget[]
): FinancialHealthMetric => {
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  
  const thisMonthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalIncome = thisMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Day of month
  const dayOfMonth = new Date().getDate();
  const burnRatePerDay = dayOfMonth > 0 ? totalExpense / dayOfMonth : 0;

  // Budget Adherence
  let overBudgetCount = 0;
  let totalBudgets = budgets.length;

  budgets.forEach(b => {
    const categorySpent = thisMonthTxs
      .filter(t => t.type === 'expense' && t.category === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    if (categorySpent > b.limit) {
      overBudgetCount++;
    }
  });

  const budgetScore = totalBudgets > 0 ? Math.max(0, 100 - (overBudgetCount / totalBudgets) * 100) : 100;
  const savingsScore = Math.min(100, savingsRate * 2.5); // 40% savings = 100 score

  const overallScore = Math.round(savingsScore * 0.6 + budgetScore * 0.4);

  let status: FinancialHealthMetric['status'] = 'Moderate';
  if (overallScore >= 85) status = 'Elite';
  else if (overallScore >= 70) status = 'Healthy';
  else if (overallScore >= 50) status = 'Moderate';
  else if (overallScore >= 35) status = 'Warning';
  else status = 'Critical';

  const recommendations: string[] = [];
  if (savingsRate < 20) {
    recommendations.push('Try to boost your savings rate to at least 20% of net monthly income.');
  }
  if (overBudgetCount > 0) {
    recommendations.push(`${overBudgetCount} category budget${overBudgetCount > 1 ? 's are' : ' is'} currently exceeded.`);
  }
  if (burnRatePerDay > 150) {
    recommendations.push(`Daily burn rate is high ($${burnRatePerDay.toFixed(0)}/day). Review discretionary shopping.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Superb financial discipline! You are on track for significant wealth compounding.');
  }

  return {
    score: overallScore,
    savingsRate: Math.round(savingsRate),
    burnRatePerDay: Math.round(burnRatePerDay),
    budgetAdherence: Math.round(budgetScore),
    status,
    recommendations,
  };
};

export const getCategoryBreakdown = (transactions: Transaction[], type: 'expense' | 'income' = 'expense') => {
  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals: Record<CategoryKey, number> = {} as Record<CategoryKey, number>;
  
  filtered.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  return Object.entries(categoryTotals)
    .map(([catKey, amount]) => {
      const category = CATEGORIES[catKey as CategoryKey] || CATEGORIES.other;
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return {
        key: catKey as CategoryKey,
        name: category.name,
        color: category.color,
        hexColor: category.hexColor,
        icon: category.icon,
        amount,
        percentage: Number(percentage.toFixed(1)),
      };
    })
    .sort((a, b) => b.amount - a.amount);
};
