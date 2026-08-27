import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryKey, Wallet, Currency } from '../types';
import { CATEGORIES } from '../data/initialData';
import { X, Plus, Check, DollarSign, Calendar, Tag, FileText, Store } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction?: Transaction | null;
  wallets: Wallet[];
  currency: Currency;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  wallets,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryKey>('food');
  const [walletId, setWalletId] = useState(wallets[0]?.id || 'w-main');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount((editingTransaction.amount * currency.rateAgainstUSD).toString());
      setCategory(editingTransaction.category);
      setWalletId(editingTransaction.walletId);
      setDate(editingTransaction.date);
      setMerchant(editingTransaction.merchant || '');
      setNotes(editingTransaction.notes || '');
      setTagInput((editingTransaction.tags || []).join(', '));
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('food');
      setWalletId(wallets[0]?.id || 'w-main');
      setDate(new Date().toISOString().slice(0, 10));
      setMerchant('');
      setNotes('');
      setTagInput('');
    }
  }, [editingTransaction, isOpen, currency, wallets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title or description');
      return;
    }

    // Convert back to base USD for storage
    const amountInUSD = numAmount / currency.rateAgainstUSD;

    const tags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(t => t.length > 0);

    onSave({
      id: editingTransaction?.id,
      title: title.trim(),
      amount: amountInUSD,
      type,
      category,
      walletId,
      date,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    onClose();
  };

  const availableCategories = Object.values(CATEGORIES).filter(cat => {
    if (type === 'expense') return cat.type === 'expense' || cat.type === 'both';
    if (type === 'income') return cat.type === 'income' || cat.type === 'both';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-dark-card border border-white/15 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-extrabold text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
            </h3>
            <p className="text-xs text-slate-400">
              {editingTransaction ? 'Update financial details' : 'Enter amount, category, and wallet details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Type Toggle: Expense / Income */}
          <div className="flex bg-dark-surface/90 border border-white/10 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Amount ({currency.code} {currency.symbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-brand-400">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-dark-surface border border-white/15 rounded-2xl pl-10 pr-4 py-3 text-xl font-extrabold text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:shadow-input-focus transition-all"
              />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic groceries, Freelance retainer, Uber ride..."
              className="w-full bg-dark-surface border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Category Picker (Interactive Chips) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-brand-400 bg-brand-500/20 text-white shadow-sm'
                        : 'border-white/10 bg-dark-surface/60 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet & Date in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Account / Wallet
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-brand-500 cursor-pointer"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} className="bg-dark-card text-white">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Merchant & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Merchant / Payee
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Apple, Amazon, Le Bernardin"
                  className="w-full bg-dark-surface border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="tech, dinner, recurring"
                  className="w-full bg-dark-surface border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Notes & Memo
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes or invoice references..."
              className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Save Changes' : 'Confirm Record'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
