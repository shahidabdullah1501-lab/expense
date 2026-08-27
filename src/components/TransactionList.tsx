import React, { useState } from 'react';
import { Transaction, Wallet, Currency, CategoryKey, FilterOptions } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag, 
  FileText, 
  ArrowDownLeft, 
  ArrowUpRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  wallets: Wallet[];
  currency: Currency;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  selectedCategoryFilter: CategoryKey | null;
  onClearCategoryFilter: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  wallets,
  currency,
  onEdit,
  onDelete,
  onAddNew,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const walletMap = new Map(wallets.map(w => [w.id, w]));

  // Filtering Logic
  const filtered = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (selectedCategoryFilter && tx.category !== selectedCategoryFilter) return false;
    if (walletFilter !== 'all' && tx.walletId !== walletFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchMerchant = (tx.merchant || '').toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      const matchTags = (tx.tags || []).some(t => t.toLowerCase().includes(q));
      const matchCategory = (CATEGORIES[tx.category]?.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMerchant && !matchNotes && !matchTags && !matchCategory) return false;
    }
    return true;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full rounded-3xl bg-dark-card/90 border border-white/10 p-4 sm:p-6 shadow-card backdrop-blur-xl">
      
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Transaction Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Filter, search, or inspect your financial activity</p>
        </div>

        {/* Action Button & Active Filter Pill */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategoryFilter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold">
              <span>Category: {CATEGORIES[selectedCategoryFilter]?.name || selectedCategoryFilter}</span>
              <button 
                onClick={onClearCategoryFilter} 
                className="hover:text-white ml-1 bg-brand-500/30 rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-glow-teal transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Type Toggle, Wallet Dropdown, Search & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        
        {/* Type Selector (All, Expense, Income) */}
        <div className="flex bg-dark-surface/90 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => { setFilterType('all'); setCurrentPage(1); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterType('expense'); setCurrentPage(1); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => { setFilterType('income'); setCurrentPage(1); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Wallet Dropdown */}
        <div className="relative">
          <select
            value={walletFilter}
            onChange={(e) => { setWalletFilter(e.target.value); setCurrentPage(1); }}
            className="w-full h-full bg-dark-surface/90 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Accounts / Wallets</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatCurrency(w.balance, currency)})
              </option>
            ))}
          </select>
        </div>

        {/* Instant Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search records..."
            className="w-full bg-dark-surface/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full h-full bg-dark-surface/90 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>

      </div>

      {/* Transactions List / Cards */}
      {paginated.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">No transactions found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or adding a new record.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {paginated.map((tx) => {
            const category = CATEGORIES[tx.category] || CATEGORIES.other;
            const wallet = walletMap.get(tx.walletId);
            const isExpense = tx.type === 'expense';

            return (
              <div 
                key={tx.id}
                className="py-3.5 px-2 hover:bg-white/[0.03] rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/10"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {isExpense ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white group-hover:text-brand-300 transition-colors">
                        {tx.title}
                      </span>
                      {tx.merchant && (
                        <span className="hidden md:inline-block text-[11px] text-slate-400 font-medium">
                          • {tx.merchant}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span 
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                        style={{ 
                          backgroundColor: `${category.color}15`, 
                          borderColor: `${category.color}40`,
                          color: category.color 
                        }}
                      >
                        {category.name}
                      </span>

                      {wallet && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: wallet.color }} />
                          {wallet.name}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tx.date)}
                      </span>
                    </div>

                    {/* Notes & Tags if any */}
                    {(tx.notes || (tx.tags && tx.tags.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {tx.notes && (
                          <span className="text-[11px] text-slate-400 italic">
                            "{tx.notes}"
                          </span>
                        )}
                        {tx.tags?.map(t => (
                          <span key={t} className="px-1.5 py-0.2 text-[9px] font-semibold bg-white/5 text-slate-300 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
                  <div className="text-right">
                    <div className={`text-base font-extrabold tracking-tight ${
                      isExpense ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {tx.type}
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      title="Edit Transaction"
                      className="p-2 rounded-xl bg-white/5 hover:bg-brand-500/20 hover:text-brand-300 text-slate-400 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      title="Delete Transaction"
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
