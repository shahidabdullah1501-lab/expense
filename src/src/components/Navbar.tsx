import React from 'react';
import { Currency, Wallet } from '../types';
import { CURRENCIES } from '../data/initialData';
import { 
  Plus, 
  Download, 
  Globe, 
  Search, 
  Command,
  BookOpen,
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
  onOpenSmartParser?: () => void;
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
  onOpenSmartParser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAEB]/90 backdrop-blur-xl border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => onTabChange('dashboard')}
        >
          <div className="w-8 h-8 rounded-xl bg-[#D5EBDA] border border-[#B2DCBC] flex items-center justify-center text-stone-900 group-hover:bg-[#B2DCBC] transition-colors shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-stone-900">
                OMNI<span className="text-stone-600 font-normal ml-0.5">3D</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[#F3E4F1] border border-[#E6C6E1] text-purple-950 rounded-md">
                Fintech
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-200/50 p-1 rounded-xl border border-stone-200/80">
          {[
            { id: 'dashboard', label: '3D View' },
            { id: 'transactions', label: 'Ledger' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'budgets', label: 'Budgets' },
            { id: 'subscriptions', label: 'Recurring' },
            { id: 'wallets', label: 'Accounts' },
            { id: 'guide', label: 'User Guide' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Global Instant Search Bar */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-[#8CCA9A] rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-stone-900 placeholder-stone-400 outline-none transition-all shadow-xs"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-stone-400 pointer-events-none">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Smart SMS Quick Button */}
          {onOpenSmartParser && (
            <button
              onClick={onOpenSmartParser}
              className="btn-secondary hidden sm:inline-flex"
              title="Paste bank SMS to auto-extract transaction"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span className="hidden xl:inline">Smart SMS</span>
            </button>
          )}

          {/* User Guide Quick Button */}
          <button
            onClick={() => onTabChange('guide')}
            className={`btn-secondary ${activeTab === 'guide' ? 'bg-[#FAFAEB] border-stone-400 text-stone-900' : ''}`}
            title="User Guide & Tutorials"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-white border border-stone-200 hover:border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 transition-colors shadow-xs">
            <Globe className="w-3.5 h-3.5 text-stone-500 mr-1.5" />
            <select
              value={currentCurrency.code}
              onChange={(e) => onCurrencyChange(CURRENCIES[e.target.value] || CURRENCIES.USD)}
              className="bg-transparent outline-none cursor-pointer font-medium text-xs pr-1 text-stone-800"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code} className="bg-white text-stone-900">
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Export Center Button */}
          <button
            onClick={onOpenExportModal}
            className="btn-secondary"
            title="Download Reports"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* New Record Button with Pastel Sage */}
          <button
            onClick={onOpenNewTransaction}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>

      </div>
    </header>
  );
};
