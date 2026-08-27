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
  X
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
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Overview Card */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D5EBDA] border border-[#B2DCBC] flex items-center justify-center text-stone-900 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">Budget Caps & Limits</h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Active targets for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'New Category Budget'}</span>
          </button>
        </div>

        {/* Total Overall Progress Meter */}
        <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Monthly Cap</div>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {formatCurrency(totalMonthlyBudget, currency)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Consumed</div>
            <div className={`text-xl font-bold mt-0.5 ${
              overallUsedPercent >= 100 ? 'text-[#8B4246]' : overallUsedPercent >= 80 ? 'text-[#AC522B]' : 'text-stone-900'
            }`}>
              {formatCurrency(totalMonthlySpent, currency)}
              <span className="text-xs font-normal text-stone-500 ml-1.5">
                ({overallUsedPercent.toFixed(0)}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Remaining Buffer</div>
            <div className="text-xl font-bold text-[#3D9251] mt-0.5">
              {formatCurrency(Math.max(0, totalMonthlyBudget - totalMonthlySpent), currency)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar with Aesthetic Sage/Peach/Blush */}
        <div className="mt-4 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallUsedPercent >= 100
                ? 'bg-[#EAD3D4]'
                : overallUsedPercent >= 80
                ? 'bg-[#F4DACD]'
                : 'bg-[#D5EBDA]'
            }`}
            style={{ width: `${Math.min(100, overallUsedPercent)}%` }}
          />
        </div>
      </div>

      {/* Add New Budget Form */}
      {showAddForm && (
        <form onSubmit={handleCreateNew} className="card p-4 sm:p-5 border-stone-300 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Create Category Limit</h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CategoryKey)}
                className="input cursor-pointer"
              >
                {Object.values(CATEGORIES).filter(c => c.type === 'expense' || c.type === 'both').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Monthly Limit ({currency.symbol})
              </label>
              <input
                type="number"
                required
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="500"
                className="input"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="btn-primary w-full py-2 text-xs"
              >
                Save Budget
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
              className={`card p-4 sm:p-5 transition-all flex flex-col justify-between ${
                isOver
                  ? 'border-[#EAD3D4] bg-[#FAF5F5]'
                  : isWarning
                  ? 'border-[#F4DACD] bg-[#FDF7F4]'
                  : 'hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-stone-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs font-bold text-stone-900">{category.name}</span>
                  </div>

                  {isOver ? (
                    <span className="badge badge-blush text-[10px]">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-900" /> Over
                    </span>
                  ) : isWarning ? (
                    <span className="badge badge-peach text-[10px]">
                      Near Cap
                    </span>
                  ) : (
                    <span className="badge badge-sage text-[10px]">
                      On Track
                    </span>
                  )}
                </div>

                {/* Amount & Cap */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-base font-bold text-stone-900">
                    {formatCurrency(spent, currency)}
                    <span className="text-xs font-normal text-stone-500 ml-1">
                      spent
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newLimitInput}
                        onChange={(e) => setNewLimitInput(e.target.value)}
                        className="w-20 bg-white border border-stone-300 rounded-lg px-2 py-0.5 text-xs text-stone-900 outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(b)}
                        className="p-1 rounded-lg bg-[#D5EBDA] border border-[#B2DCBC] text-stone-900"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="text-[11px] font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 group"
                    >
                      <span>Cap: {formatCurrency(b.limit, currency)}</span>
                      <Edit2 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                {/* Progress Meter with aesthetic pastel bar */}
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-[#EAD3D4]' : isWarning ? 'bg-[#F4DACD]' : 'bg-[#D5EBDA]'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>{percent.toFixed(0)}% used</span>
                  <span className="font-medium text-stone-700">
                    {isOver
                      ? `+${formatCurrency(spent - b.limit, currency)} over`
                      : `${formatCurrency(b.limit - spent, currency)} left`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
