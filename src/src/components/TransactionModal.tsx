import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryKey, Wallet, Currency } from '../types';
import { CATEGORIES } from '../data/initialData';
import { X, Check, Store, Tag } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {editingTransaction ? 'Update record details' : 'Enter amount, category, and account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          
          {/* Type Toggle: Expense (Blush) / Income (Sage) */}
          <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-[#EAD3D4] text-rose-950 shadow-xs border border-[#D7AEB0]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-[#D5EBDA] text-emerald-950 shadow-xs border border-[#B2DCBC]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Amount ({currency.code} {currency.symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input pl-8 py-2.5 text-lg font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Description / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic groceries, Design retainer..."
              className="input"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-stone-800 bg-[#FAFAEB] text-stone-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-stone-300" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account & Date in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Account
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="input cursor-pointer"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Merchant & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Payee / Merchant
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Apple, Uber"
                  className="input pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="tax, recurring"
                  className="input pl-8"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="input resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingTransaction ? 'Save Changes' : 'Confirm Record'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
