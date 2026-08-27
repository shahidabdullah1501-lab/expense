import React, { useState } from 'react';
import { RecurringItem, Wallet, Currency, CategoryKey } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Repeat, 
  Calendar, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  CreditCard,
  CheckCircle2,
  AlertCircle
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
    <div className="space-y-6">
      
      {/* Top Banner Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-card via-dark-surface to-dark-bg border border-white/10 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Recurring Subscriptions & Fixed Bills</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active subscriptions, SaaS licenses, memberships, and automated monthly commitments
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add Subscription'}</span>
          </button>
        </div>

        {/* Total Metric Stats */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Monthly Commitment</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {formatCurrency(monthlyExpenseTotal, currency)}/mo
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Annualized Run-Rate</div>
            <div className="text-2xl font-extrabold text-indigo-400 mt-0.5">
              {formatCurrency(monthlyExpenseTotal * 12, currency)}/yr
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Active Subscriptions</div>
            <div className="text-2xl font-extrabold text-brand-300 mt-0.5">
              {recurringItems.length} services
            </div>
          </div>
        </div>
      </div>

      {/* Add Subscription Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-dark-card border border-brand-500/40 shadow-glow-teal animate-slide-up">
          <h3 className="text-sm font-extrabold text-white mb-3">Add Subscription or Recurring Bill</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Service / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Netflix, AWS, Rent, etc."
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount ({currency.symbol})</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="29.99"
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              >
                {Object.values(CATEGORIES).map(c => (
                  <option key={c.id} value={c.id} className="bg-dark-card text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Next Billing Date</label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all"
            >
              Confirm Subscription
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringItems.map((item) => {
          const categoryInfo = CATEGORIES[item.category] || CATEGORIES.other;
          const walletName = walletMap.get(item.walletId) || 'Main';

          return (
            <div
              key={item.id}
              className="rounded-2xl bg-dark-card/90 border border-white/10 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: categoryInfo.color }}
                    >
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                      <span className="text-[11px] text-slate-400">{categoryInfo.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteRecurring(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-3">
                  <div className="text-xl font-extrabold text-white">
                    {formatCurrency(item.amount, currency)}
                    <span className="text-xs text-slate-400 font-semibold ml-1">/{item.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                  {walletName}
                </span>

                <span className="flex items-center gap-1 font-semibold text-brand-300">
                  <Clock className="w-3.5 h-3.5" />
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
