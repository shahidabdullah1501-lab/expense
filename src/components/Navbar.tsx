import React from 'react';
import { Currency, Wallet } from '../types';
import { CURRENCIES } from '../data/initialData';
import { 
  Plus, 
  Download, 
  Globe, 
  Wallet as WalletIcon, 
  Search, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  wallets: Wallet[];
  selectedWalletId: string;
  onWalletChange: (walletId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewTransaction: () => void;
  onOpenExportModal: () => void;
  onResetDemoData: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  wallets,
  selectedWalletId,
  onWalletChange,
  searchQuery,
  onSearchChange,
  onOpenNewTransaction,
  onOpenExportModal,
  onResetDemoData,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-dark-bg/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center shadow-glow-teal p-0.5">
            <div className="w-full h-full bg-dark-bg rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                OMNI<span className="text-brand-400">3D</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 border border-brand-500/30 text-brand-300 rounded-full">
                FinTech 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Interactive Wealth & Expense Intelligence</p>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search expenses, merchants, tags, or notes..."
              className="w-full bg-dark-card/90 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-brand-500 focus:shadow-input-focus transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-dark-card/60 p-1 rounded-2xl border border-white/10">
          {[
            { id: 'dashboard', label: '3D Overview' },
            { id: 'transactions', label: 'Ledger' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'budgets', label: 'Budgets' },
            { id: 'subscriptions', label: 'Recurring' },
            { id: 'wallets', label: 'Accounts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-glow-teal'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Currency Switcher */}
          <div className="relative flex items-center bg-dark-card/90 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white">
            <Globe className="w-3.5 h-3.5 text-brand-400 mr-1.5" />
            <select
              value={currentCurrency.code}
              onChange={(e) => onCurrencyChange(CURRENCIES[e.target.value] || CURRENCIES.USD)}
              className="bg-transparent outline-none cursor-pointer font-bold text-xs pr-1 text-slate-200"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code} className="bg-dark-card text-white">
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Export / Download Center Button */}
          <button
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-card hover:bg-dark-cardHover border border-white/10 hover:border-brand-500/50 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm group"
            title="Download Reports (PDF, Google Sheets, Excel, JSON, Image)"
          >
            <Download className="w-4 h-4 text-brand-400 group-hover:translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-bold shadow-glow-teal hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Record</span>
          </button>
        </div>

      </div>
    </header>
  );
};
