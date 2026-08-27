import React, { useState } from 'react';
import { Transaction, Wallet, Currency, CategoryKey } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Volume2,
  Receipt,
  Sparkles
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
  onOpenMessageSlip?: (transaction: Transaction) => void;
  onOpenSmartParser?: () => void;
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
  onOpenMessageSlip,
  onOpenSmartParser,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [speakingTxId, setSpeakingTxId] = useState<string | null>(null);
  const itemsPerPage = 8;

  const walletMap = new Map(wallets.map(w => [w.id, w]));

  // Text-To-Speech Quick Trigger
  const handleSpeakTransaction = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speakingTxId === tx.id) {
      window.speechSynthesis.cancel();
      setSpeakingTxId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cat = CATEGORIES[tx.category]?.name || tx.category;
    const isExp = tx.type === 'expense';
    const amountStr = formatCurrency(tx.amount, currency);
    const msg = `${isExp ? 'Expense' : 'Income'} of ${amountStr} for ${tx.title}${tx.merchant ? ` at ${tx.merchant}` : ''}, category ${cat}, on ${formatDate(tx.date)}.`;
    
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingTxId(null);
    utterance.onerror = () => setSpeakingTxId(null);
    
    window.speechSynthesis.speak(utterance);
    setSpeakingTxId(tx.id);
  };

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
    <div className="card p-4 sm:p-6 w-full">
      
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">Transaction Ledger</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAFAEB] border border-stone-200 text-stone-700">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">Filter, inspect, listen to, or manage your financial entries</p>
        </div>

        {/* Action Buttons: Smart SMS Parser & Add Record */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategoryFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D5EBDA]/60 border border-[#B2DCBC] text-stone-900 text-xs font-medium">
              <span>{CATEGORIES[selectedCategoryFilter]?.name || selectedCategoryFilter}</span>
              <button 
                onClick={onClearCategoryFilter} 
                className="hover:text-stone-700 ml-1 w-3.5 h-3.5 flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
            </div>
          )}

          {onOpenSmartParser && (
            <button
              onClick={onOpenSmartParser}
              className="btn-secondary"
              title="Paste bank SMS to auto-extract transaction"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Smart SMS Reader</span>
            </button>
          )}

          <button
            onClick={onAddNew}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-4">
        
        {/* Type Selector Segmented Pill */}
        <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
          <button
            onClick={() => { setFilterType('all'); setCurrentPage(1); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filterType === 'all' ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterType('expense'); setCurrentPage(1); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filterType === 'expense' ? 'bg-[#EAD3D4] text-rose-950 shadow-xs border border-[#D7AEB0]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => { setFilterType('income'); setCurrentPage(1); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filterType === 'income' ? 'bg-[#D5EBDA] text-emerald-950 shadow-xs border border-[#B2DCBC]' : 'text-stone-600 hover:text-stone-900'
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
            className="w-full h-full bg-white hover:bg-[#FAFAEB] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#8CCA9A] cursor-pointer transition-colors shadow-xs"
          >
            <option value="all">All Accounts</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({formatCurrency(w.balance, currency)})
              </option>
            ))}
          </select>
        </div>

        {/* Instant Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search records..."
            className="w-full bg-white hover:border-stone-300 focus:border-[#8CCA9A] border border-stone-200 rounded-xl pl-8.5 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 outline-none transition-all shadow-xs"
          />
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full h-full bg-white hover:bg-[#FAFAEB] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#8CCA9A] cursor-pointer transition-colors shadow-xs"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>

      </div>

      {/* Transactions List */}
      {paginated.length === 0 ? (
        <div className="py-12 text-center text-stone-400">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAEB] border border-stone-200 flex items-center justify-center mx-auto mb-2 text-stone-500">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-stone-800">No transactions found</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {paginated.map((tx) => {
            const category = CATEGORIES[tx.category] || CATEGORIES.other;
            const wallet = walletMap.get(tx.walletId);
            const isExpense = tx.type === 'expense';
            const isSpeaking = speakingTxId === tx.id;

            return (
              <div 
                key={tx.id}
                onClick={() => onOpenMessageSlip && onOpenMessageSlip(tx)}
                className="py-3 px-2 hover:bg-[#FAFAEB]/70 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
              >
                {/* Left: Icon & Title & Metadata */}
                <div className="flex items-start sm:items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-stone-200/80 shadow-xs"
                    style={{ backgroundColor: category.color }}
                  >
                    {isExpense ? (
                      <ArrowDownLeft className="w-4 h-4 text-stone-900" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-stone-900" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                        {tx.title}
                      </span>
                      {tx.merchant && (
                        <span className="text-[11px] text-stone-500">
                          • {tx.merchant}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span 
                        className="px-1.5 py-0.2 rounded text-[10px] font-semibold text-stone-900 border border-stone-300/80"
                        style={{ backgroundColor: `${category.color}` }}
                      >
                        {category.name}
                      </span>

                      {wallet && (
                        <span className="text-[11px] text-stone-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full border border-stone-300" style={{ backgroundColor: wallet.color }} />
                          {wallet.name}
                        </span>
                      )}

                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {formatDate(tx.date)}
                      </span>
                    </div>

                    {/* Notes & Tags if any */}
                    {(tx.notes || (tx.tags && tx.tags.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {tx.notes && (
                          <span className="text-[11px] text-stone-500 italic">
                            "{tx.notes}"
                          </span>
                        )}
                        {tx.tags?.map(t => (
                          <span key={t} className="px-1.5 py-0.2 text-[9px] font-medium bg-[#FAFAEB] border border-stone-200 text-stone-600 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                  <div className="text-right">
                    <div className={`text-sm font-bold tracking-tight ${
                      isExpense ? 'text-[#8B4246]' : 'text-[#3D9251]'
                    }`}>
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                      {tx.type}
                    </div>
                  </div>

                  {/* Inline Action Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    
                    {/* Read Expense Audio Voice Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSpeakTransaction(tx, e)}
                      title="Read Expense Aloud (Speech Synthesis)"
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSpeaking 
                          ? 'bg-[#EAD3D4] border-[#D7AEB0] text-rose-950' 
                          : 'bg-stone-100 hover:bg-[#D5EBDA] text-stone-600 hover:text-stone-900 border-stone-200'
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-rose-900' : ''}`} />
                    </button>

                    {/* View Message Slip Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenMessageSlip && onOpenMessageSlip(tx); }}
                      title="View Expense Message Slip"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FAFAEB] text-stone-600 hover:text-stone-900 transition-all border border-stone-200"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                      title="Edit Transaction"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#D5EBDA] text-stone-600 hover:text-stone-900 transition-all border border-stone-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                      title="Delete Transaction"
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#EAD3D4] text-stone-600 hover:text-rose-950 transition-all border border-stone-200"
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
        <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-stone-100 text-xs text-stone-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none text-stone-700 transition-all border border-stone-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-stone-800 px-2 text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none text-stone-700 transition-all border border-stone-200"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
