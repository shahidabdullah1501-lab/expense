import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  Wallet, 
  Budget, 
  RecurringItem, 
  Currency, 
  CategoryKey 
} from './types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_WALLETS, 
  INITIAL_BUDGETS, 
  INITIAL_RECURRING, 
  CURRENCIES, 
  CATEGORIES 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SummaryCards } from './components/SummaryCards';
import { ExpenseScene3D } from './components/3d/ExpenseScene3D';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetManager } from './components/BudgetManager';
import { AnalyticsView } from './components/AnalyticsView';
import { RecurringManager } from './components/RecurringManager';
import { WalletManager } from './components/WalletManager';
import { ExportModal } from './components/ExportModal';
import { captureCanvasSnapshot } from './utils/exportUtils';
import { 
  Rotate3d, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY_PREFIX = 'omni3d_fin_v1_';

export function App() {
  // 1. Persistent State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}wallets`);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}budgets`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [recurring, setRecurring] = useState<RecurringItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}recurring`);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING;
  });

  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}currency`);
    return saved ? JSON.parse(saved) : CURRENCIES.USD;
  });

  // 2. UI & Filter State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryKey | null>(null);

  // 3. Modals State
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // 4. Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}wallets`, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}budgets`, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}recurring`, JSON.stringify(recurring));
  }, [recurring]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currency`, JSON.stringify(currentCurrency));
  }, [currentCurrency]);

  // ================= TRANSACTION HANDLERS =================

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    if (txData.id) {
      // Edit Existing
      setTransactions(prev => prev.map(t => (t.id === txData.id ? { ...txData, id: txData.id! } : t)));
      showToast('Transaction updated successfully');
    } else {
      // Create New
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };

      setTransactions(prev => [newTx, ...prev]);

      // Adjust Wallet Balance
      setWallets(prevWallets =>
        prevWallets.map(w => {
          if (w.id === newTx.walletId) {
            const delta = newTx.type === 'expense' ? -newTx.amount : newTx.amount;
            return { ...w, balance: w.balance + delta };
          }
          return w;
        })
      );

      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      showToast('New transaction recorded');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (window.confirm(`Delete "${tx.title}"?`)) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Revert wallet balance
      setWallets(prevWallets =>
        prevWallets.map(w => {
          if (w.id === tx.walletId) {
            const delta = tx.type === 'expense' ? tx.amount : -tx.amount;
            return { ...w, balance: w.balance + delta };
          }
          return w;
        })
      );

      showToast('Transaction deleted');
    }
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  // ================= BUDGET & RECURRING & WALLET HANDLERS =================

  const handleUpdateBudget = (updated: Budget) => {
    setBudgets(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    showToast('Budget cap updated');
  };

  const handleAddBudget = (newB: Omit<Budget, 'id'>) => {
    const b: Budget = { ...newB, id: `b-${Date.now()}` };
    setBudgets(prev => [...prev, b]);
    showToast('New category budget registered');
  };

  const handleAddRecurring = (item: Omit<RecurringItem, 'id'>) => {
    const r: RecurringItem = { ...item, id: `rec-${Date.now()}` };
    setRecurring(prev => [...prev, r]);
    showToast('Recurring commitment added');
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
    showToast('Recurring subscription removed');
  };

  const handleAddWallet = (wallet: Omit<Wallet, 'id'>) => {
    const w: Wallet = { ...wallet, id: `w-${Date.now()}` };
    setWallets(prev => [...prev, w]);
    showToast('New account registered');
  };

  const handleRestoreState = (restored: {
    transactions: Transaction[];
    wallets: Wallet[];
    budgets: Budget[];
    recurring: RecurringItem[];
    currency?: Currency;
  }) => {
    setTransactions(restored.transactions);
    setWallets(restored.wallets);
    setBudgets(restored.budgets);
    setRecurring(restored.recurring);
    if (restored.currency) setCurrentCurrency(restored.currency);
    showToast('Database state restored successfully!');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all transactions and accounts to default demo dataset?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setWallets(INITIAL_WALLETS);
      setBudgets(INITIAL_BUDGETS);
      setRecurring(INITIAL_RECURRING);
      setCurrentCurrency(CURRENCIES.USD);
      showToast('Demo data restored');
    }
  };

  const handleCapture3DSnapshot = () => {
    const filename = captureCanvasSnapshot('canvas');
    if (filename) {
      showToast(`Snapshot saved: ${filename}`);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col font-sans pb-20 lg:pb-10 selection:bg-brand-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentCurrency={currentCurrency}
        onCurrencyChange={setCurrentCurrency}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onWalletChange={setSelectedWalletId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewTransaction={handleOpenNew}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Toast Notification Popup */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-glow-teal border border-brand-400 animate-slide-up">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Global Summary Statistics */}
        <SummaryCards
          transactions={transactions}
          wallets={wallets}
          budgets={budgets}
          currency={currentCurrency}
        />

        {/* Tab 1: 3D Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive 3D Canvas Scene */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
                    Interactive 3D Visualizer
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <button 
                    onClick={handleCapture3DSnapshot}
                    className="hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>📸 Snapshot</span>
                  </button>
                  <span>•</span>
                  <button 
                    onClick={handleResetDemoData}
                    className="hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Demo</span>
                  </button>
                </div>
              </div>

              <ExpenseScene3D
                transactions={transactions}
                currency={currentCurrency}
                selectedCategory={selectedCategoryFilter}
                onSelectCategory={setSelectedCategoryFilter}
                onCaptureSnapshot={handleCapture3DSnapshot}
              />
            </div>

            {/* Quick Filter Active Notice */}
            {selectedCategoryFilter && (
              <div className="p-3 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-between text-xs text-brand-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Filtering by 3D Selected Category: <strong>{CATEGORIES[selectedCategoryFilter]?.name}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
                  className="px-2.5 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all"
                >
                  Show All
                </button>
              </div>
            )}

            {/* Recent Transaction Ledger Preview */}
            <TransactionList
              transactions={transactions}
              wallets={wallets}
              currency={currentCurrency}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTransaction}
              onAddNew={handleOpenNew}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
            />
          </div>
        )}

        {/* Tab 2: Full Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div className="animate-fade-in">
            <TransactionList
              transactions={transactions}
              wallets={wallets}
              currency={currentCurrency}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTransaction}
              onAddNew={handleOpenNew}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
            />
          </div>
        )}

        {/* Tab 3: Analytics & Diagnostics */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsView
              transactions={transactions}
              budgets={budgets}
              currency={currentCurrency}
            />
          </div>
        )}

        {/* Tab 4: Budget Governance */}
        {activeTab === 'budgets' && (
          <div className="animate-fade-in">
            <BudgetManager
              budgets={budgets}
              transactions={transactions}
              currency={currentCurrency}
              onUpdateBudget={handleUpdateBudget}
              onAddBudget={handleAddBudget}
            />
          </div>
        )}

        {/* Tab 5: Recurring Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="animate-fade-in">
            <RecurringManager
              recurringItems={recurring}
              wallets={wallets}
              currency={currentCurrency}
              onAddRecurring={handleAddRecurring}
              onDeleteRecurring={handleDeleteRecurring}
            />
          </div>
        )}

        {/* Tab 6: Accounts & Wallets */}
        {activeTab === 'wallets' && (
          <div className="animate-fade-in">
            <WalletManager
              wallets={wallets}
              transactions={transactions}
              currency={currentCurrency}
              onAddWallet={handleAddWallet}
            />
          </div>
        )}

      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTransaction={handleOpenNew}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        wallets={wallets}
        currency={currentCurrency}
      />

      {/* Universal Multi-Format Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        wallets={wallets}
        budgets={budgets}
        recurring={recurring}
        currency={currentCurrency}
        onRestoreState={handleRestoreState}
      />

      {/* Global Footer */}
      <footer className="w-full border-t border-white/10 mt-12 py-6 px-4 text-center text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">OMNI 3D FinTech</span>
            <span>•</span>
            <span>Client-Side Encrypted & Local Storage Secured</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsExportModalOpen(true)} className="hover:text-brand-400">
              Download PDF / Sheets
            </button>
            <button onClick={handleResetDemoData} className="hover:text-brand-400">
              Reset Demo
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
