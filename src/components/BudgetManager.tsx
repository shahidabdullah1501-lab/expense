import React, { useState } from 'react';
import { Budget, Transaction, Currency, CategoryKey } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency } from '../utils/formatters';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Check, 
  Sparkles,
  TrendingDown,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: Currency;
  onUpdateBudget: (budget: Budget) => void;
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  currency,
  onUpdateBudget,
  onAddBudget,
}) => {
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<CategoryKey>('shopping');
  const [newLimit, setNewLimit] = useState<string>('500');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalMonthlySpent = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const overallUsedPercent = totalMonthlyBudget > 0 ? (totalMonthlySpent / totalMonthlyBudget) * 100 : 0;

  const handleStartEdit = (b: Budget) => {
    setEditingBudgetId(b.id);
    setNewLimitInput((b.limit * currency.rateAgainstUSD).toString());
  };

  const handleSaveEdit = (b: Budget) => {
    const parsed = parseFloat(newLimitInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateBudget({
        ...b,
        limit: parsed / currency.rateAgainstUSD,
      });
    }
    setEditingBudgetId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newLimit);
    if (!isNaN(parsed) && parsed > 0) {
      onAddBudget({
        categoryId: newCategory,
        limit: parsed / currency.rateAgainstUSD,
        period: 'monthly',
        alertThreshold: 0.85,
      });
      setShowAddForm(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-card via-dark-surface to-dark-bg border border-white/10 p-6 shadow-card backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Monthly Budget Governance</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active control & safety caps for current billing cycle ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'New Category Budget'}</span>
          </button>
        </div>

        {/* Total Overall Progress Meter */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Monthly Cap</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {formatCurrency(totalMonthlyBudget, currency)}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consumed</div>
            <div className={`text-2xl font-extrabold mt-0.5 ${
              overallUsedPercent >= 100 ? 'text-rose-400' : overallUsedPercent >= 80 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {formatCurrency(totalMonthlySpent, currency)}
              <span className="text-xs font-semibold text-slate-400 ml-1.5">
                ({overallUsedPercent.toFixed(0)}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Buffer</div>
            <div className="text-2xl font-extrabold text-brand-300 mt-0.5">
              {formatCurrency(Math.max(0, totalMonthlyBudget - totalMonthlySpent), currency)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              overallUsedPercent >= 100
                ? 'bg-rose-500'
                : overallUsedPercent >= 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-teal-400 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, overallUsedPercent)}%` }}
          />
        </div>
      </div>

      {/* Add New Budget Collapse */}
      {showAddForm && (
        <form onSubmit={handleCreateNew} className="p-5 rounded-2xl bg-dark-card border border-brand-500/40 shadow-glow-teal animate-slide-up">
          <h3 className="text-sm font-extrabold text-white mb-3">Add Target Category Budget</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CategoryKey)}
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              >
                {Object.values(CATEGORIES).filter(c => c.type === 'expense' || c.type === 'both').map(c => (
                  <option key={c.id} value={c.id} className="bg-dark-card text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Monthly Limit ({currency.symbol})
              </label>
              <input
                type="number"
                required
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="500"
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all"
              >
                Save Budget
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const category = CATEGORIES[b.categoryId] || CATEGORIES.other;
          const spent = thisMonthExpenses
            .filter(t => t.category === b.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);

          const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
          const isOver = spent > b.limit;
          const isWarning = percent >= b.alertThreshold * 100 && !isOver;
          const isEditing = editingBudgetId === b.id;

          return (
            <div
              key={b.id}
              className={`rounded-2xl bg-dark-card/90 border p-5 transition-all shadow-card hover:shadow-card-hover ${
                isOver
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-extrabold text-white">{category.name}</span>
                </div>

                {isOver ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    Over Limit
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Warning
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    On Track
                  </span>
                )}
              </div>

              {/* Numbers */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-lg font-extrabold text-white">
                  {formatCurrency(spent, currency)}
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    spent
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={newLimitInput}
                      onChange={(e) => setNewLimitInput(e.target.value)}
                      className="w-20 bg-dark-surface border border-brand-400 rounded px-1.5 py-0.5 text-xs text-white"
                    />
                    <button
                      onClick={() => handleSaveEdit(b)}
                      className="p-1 rounded bg-brand-600 text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 group"
                  >
                    <span>Cap: {formatCurrency(b.limit, currency)}</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                  </button>
                )}
              </div>

              {/* Progress Meter */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-400'
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{percent.toFixed(0)}% used</span>
                <span>
                  {isOver
                    ? `Exceeded by ${formatCurrency(spent - b.limit, currency)}`
                    : `${formatCurrency(b.limit - spent, currency)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
