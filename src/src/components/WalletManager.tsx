import React, { useState } from 'react';
import { Wallet, Currency, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  CreditCard, 
  ShieldCheck, 
  Coins, 
  Banknote, 
  Plus, 
  Zap,
  X
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
  const [color, setColor] = useState('#D5EBDA');

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
    <div className="space-y-5">
      
      {/* Header Overview Banner */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D5EBDA] border border-[#B2DCBC] flex items-center justify-center text-stone-900 shadow-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">Accounts & Vaults</h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Balances across bank accounts, cards, investments, and cash
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Add New Account'}</span>
          </button>
        </div>

        <div className="mt-5 pt-5 border-t border-stone-100 flex items-baseline gap-3">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Aggregated Liquidity:</div>
          <div className="text-2xl font-bold text-[#3D9251]">
            {formatCurrency(totalBalance, currency)}
          </div>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="card p-4 sm:p-5 border-stone-300 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Register Account</h3>
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
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Account Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chase Sapphire, Vault"
                className="input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="input cursor-pointer"
              >
                <option value="checking">Checking / Debit</option>
                <option value="savings">Savings Account</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Crypto / Investment</option>
                <option value="cash">Physical Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Balance ({currency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="5000"
                className="input"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="btn-primary w-full py-2 text-xs"
              >
                Save Account
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Wallets Cards Grid with Pastel Palette Accents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {wallets.map((wallet) => {
          const Icon = getIcon(wallet.type);
          const walletTxs = transactions.filter(t => t.walletId === wallet.id);

          return (
            <div
              key={wallet.id}
              className="card p-5 hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-900 border border-stone-300/80 shadow-xs"
                    style={{ backgroundColor: wallet.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="badge badge-neutral text-[10px] uppercase font-semibold">
                    {wallet.type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900">{wallet.name}</h3>
                {wallet.accountNumberMasked && (
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">{wallet.accountNumberMasked}</p>
                )}

                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Current Balance</div>
                  <div className={`text-xl font-bold mt-0.5 ${
                    wallet.balance < 0 ? 'text-[#8B4246]' : 'text-stone-900'
                  }`}>
                    {formatCurrency(wallet.balance, currency)}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>{walletTxs.length} records</span>
                <span className="text-[#3D9251] font-semibold">Active</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
