import React, { useState } from 'react';
import { Wallet, Currency, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  CreditCard, 
  ShieldCheck, 
  Coins, 
  Banknote, 
  Plus, 
  TrendingUp, 
  Zap,
  Check
} from 'lucide-react';

interface WalletManagerProps {
  wallets: Wallet[];
  transactions: Transaction[];
  currency: Currency;
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
}

export const WalletManager: React.FC<WalletManagerProps> = ({
  wallets,
  transactions,
  currency,
  onAddWallet,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Wallet['type']>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#14b8a6');

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(balance);
    if (isNaN(parsed) || !name.trim()) return;

    onAddWallet({
      name: name.trim(),
      type,
      balance: parsed / currency.rateAgainstUSD,
      currency: currency.code,
      color,
      icon: type === 'credit' ? 'Zap' : type === 'investment' ? 'Coins' : 'CreditCard',
    });

    setName('');
    setBalance('');
    setShowAddForm(false);
  };

  const getIcon = (type: Wallet['type']) => {
    switch (type) {
      case 'credit': return Zap;
      case 'investment': return Coins;
      case 'savings': return ShieldCheck;
      case 'cash': return Banknote;
      default: return CreditCard;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-card via-dark-surface to-dark-bg border border-white/10 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Accounts & Vaults</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-wallet balance distribution across bank accounts, cards, crypto & cash
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add New Account'}</span>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex items-baseline gap-3">
          <div className="text-xs font-bold text-slate-400 uppercase">Aggregated Net Liquidity:</div>
          <div className="text-2xl font-extrabold text-brand-300">
            {formatCurrency(totalBalance, currency)}
          </div>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-dark-card border border-brand-500/40 shadow-glow-teal animate-slide-up">
          <h3 className="text-sm font-extrabold text-white mb-3">Register New Account / Wallet</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Account Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chase Sapphire, Trezor Vault"
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              >
                <option value="checking">Checking / Debit</option>
                <option value="savings">Savings Account</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Crypto / Investment</option>
                <option value="cash">Physical Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Current Balance ({currency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="5000"
                className="w-full bg-dark-surface border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all"
              >
                Save Account
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Wallets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => {
          const Icon = getIcon(wallet.type);
          const walletTxs = transactions.filter(t => t.walletId === wallet.id);

          return (
            <div
              key={wallet.id}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-card via-dark-card/90 to-dark-surface border border-white/10 p-6 shadow-card hover:shadow-card-hover transition-all group flex flex-col justify-between"
            >
              {/* Decorative Card Accent */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: wallet.color }}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md border border-white/10"
                    style={{ backgroundColor: wallet.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                    {wallet.type}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white">{wallet.name}</h3>
                {wallet.accountNumberMasked && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{wallet.accountNumberMasked}</p>
                )}

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-400">Current Balance</div>
                  <div className={`text-2xl font-extrabold mt-0.5 ${
                    wallet.balance < 0 ? 'text-rose-400' : 'text-white'
                  }`}>
                    {formatCurrency(wallet.balance, currency)}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>{walletTxs.length} transactions</span>
                <span className="font-semibold text-brand-300">Active</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
