import React, { useState } from 'react';
import { RecurringItem, Wallet, Currency, CategoryKey } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Repeat, 
  Plus, 
  Trash2, 
  Clock, 
  CreditCard,
  X
} from 'lucide-react';

interface RecurringManagerProps {
  recurringItems: RecurringItem[];
  wallets: Wallet[];
  currency: Currency;
  onAddRecurring: (item: Omit<RecurringItem, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
}

export const RecurringManager: React.FC<RecurringManagerProps> = ({
  recurringItems,
  wallets,
  currency,
  onAddRecurring,
  onDeleteRecurring,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryKey>('utilities');
  const [walletId, setWalletId] = useState(wallets[0]?.id || 'w-main');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().slice(0, 10));

  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  // Calculate Monthly Run-Rate
  const monthlyExpenseTotal = recurringItems
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => {
      if (r.frequency === 'yearly') return sum + r.amount / 12;
      if (r.frequency === 'weekly') return sum + r.amount * 4.33;
      return sum + r.amount;
    }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0 || !title.trim()) return;

    onAddRecurring({
      title: title.trim(),
      amount: parsed / currency.rateAgainstUSD,
      type: 'expense',
      category,
      walletId,
      frequency,
      nextBillingDate,
      autoDeduct: true,
    });

    setTitle('');
    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner Overview */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F3E4F1] border border-[#E6C6E1] flex items-center justify-center text-purple-950 shadow-xs">
                <Repeat className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">Recurring Subscriptions & Bills</h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Automated memberships, SaaS licenses, and recurring commitments
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Add Subscription'}</span>
          </button>
        </div>

        {/* Metric Stats */}
        <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Monthly Commitment</div>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {formatCurrency(monthlyExpenseTotal, currency)}/mo
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Annualized Run-Rate</div>
            <div className="text-xl font-bold text-stone-800 mt-0.5">
              {formatCurrency(monthlyExpenseTotal * 12, currency)}/yr
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Active Subscriptions</div>
            <div className="text-xl font-bold text-[#3D9251] mt-0.5">
              {recurringItems.length} services
            </div>
          </div>
        </div>
      </div>

      {/* Add Subscription Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="card p-4 sm:p-5 border-stone-300 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Add Subscription</h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Service / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Netflix, AWS, Gym"
                className="input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Amount ({currency.symbol})</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="29.99"
                className="input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="input cursor-pointer"
              >
                {Object.values(CATEGORIES).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Next Billing Date</label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="btn-primary py-2 text-xs"
            >
              Confirm Subscription
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recurringItems.map((item) => {
          const categoryInfo = CATEGORIES[item.category] || CATEGORIES.other;
          const walletName = walletMap.get(item.walletId) || 'Main';

          return (
            <div
              key={item.id}
              className="card p-5 hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-900 border border-stone-300 shadow-xs"
                      style={{ backgroundColor: categoryInfo.color }}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.title}</h4>
                      <span className="text-[10px] text-stone-500">{categoryInfo.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteRecurring(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-900 hover:bg-[#EAD3D4] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-3">
                  <div className="text-lg font-bold text-stone-900">
                    {formatCurrency(item.amount, currency)}
                    <span className="text-xs text-stone-500 font-normal ml-1">/{item.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-stone-400" />
                  {walletName}
                </span>

                <span className="flex items-center gap-1 font-semibold text-emerald-900">
                  <Clock className="w-3 h-3 text-emerald-700" />
                  Next: {formatDate(item.nextBillingDate)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
