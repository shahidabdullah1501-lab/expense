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
import { ExpenseMessageModal } from './components/ExpenseMessageModal';
import { SmartMessageParserModal } from './components/SmartMessageParserModal';
import { UserGuideView } from './components/UserGuideView';
import { captureCanvasSnapshot } from './utils/exportUtils';
import { 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  Camera,
  BookOpen
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
  
  // Message Slip Modal & Smart SMS Parser State
  const [isMessageSlipOpen, setIsMessageSlipOpen] = useState<boolean>(false);
  const [selectedMessageTx, setSelectedMessageTx] = useState<Transaction | null>(null);
  const [isSmartParserOpen, setIsSmartParserOpen] = useState<boolean>(false);

  // 4. Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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
      showToast('Transaction updated');
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

      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      showToast('New record added');
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

  const handleOpenMessageSlip = (tx: Transaction) => {
    setSelectedMessageTx(tx);
    setIsMessageSlipOpen(true);
  };

  // ================= BUDGET & RECURRING & WALLET HANDLERS =================

  const handleUpdateBudget = (updated: Budget) => {
    setBudgets(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    showToast('Budget cap updated');
  };

  const handleAddBudget = (newB: Omit<Budget, 'id'>) => {
    const b: Budget = { ...newB, id: `b-${Date.now()}` };
    setBudgets(prev => [...prev, b]);
    showToast('Category budget added');
  };

  const handleAddRecurring = (item: Omit<RecurringItem, 'id'>) => {
    const r: RecurringItem = { ...item, id: `rec-${Date.now()}` };
    setRecurring(prev => [...prev, r]);
    showToast('Subscription added');
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
    showToast('Subscription removed');
  };

  const handleAddWallet = (wallet: Omit<Wallet, 'id'>) => {
    const w: Wallet = { ...wallet, id: `w-${Date.now()}` };
    setWallets(prev => [...prev, w]);
    showToast('Account added');
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
    showToast('Database restored successfully');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all records and accounts to default demo data?')) {
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
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAEB] text-stone-900 flex flex-col font-sans pb-20 lg:pb-10 selection:bg-[#D5EBDA] selection:text-stone-900">
      
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
        onOpenSmartParser={() => setIsSmartParserOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Toast Notification Popup */}
        {toastMsg && (
          <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs font-medium shadow-dropdown animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-[#3D9251]" />
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
          <div className="space-y-5 animate-fade-in">
            {/* Interactive 3D Canvas Scene */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D5EBDA] border border-[#8CCA9A]" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Interactive 3D Visualizer
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <button 
                    onClick={handleCapture3DSnapshot}
                    className="hover:text-stone-800 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snapshot</span>
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setActiveTab('guide')}
                    className="hover:text-stone-800 flex items-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                    <span>User Guide</span>
                  </button>
                  <span>•</span>
                  <button 
                    onClick={handleResetDemoData}
                    className="hover:text-stone-800 flex items-center gap-1 transition-colors"
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
              <div className="p-3 rounded-xl bg-[#D5EBDA]/50 border border-[#B2DCBC] flex items-center justify-between text-xs text-stone-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  <span>
                    Filtered by 3D category: <strong className="text-stone-900">{CATEGORIES[selectedCategoryFilter]?.name}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategoryFilter(null)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:bg-[#FAFAEB] text-stone-900 font-medium transition-all shadow-xs"
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
              onOpenMessageSlip={handleOpenMessageSlip}
              onOpenSmartParser={() => setIsSmartParserOpen(true)}
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
              onOpenMessageSlip={handleOpenMessageSlip}
              onOpenSmartParser={() => setIsSmartParserOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Analytics */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsView
              transactions={transactions}
              budgets={budgets}
              currency={currentCurrency}
            />
          </div>
        )}

        {/* Tab 4: Budgets */}
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

        {/* Tab 7: Comprehensive User Guide */}
        {activeTab === 'guide' && (
          <div className="animate-fade-in">
            <UserGuideView
              onNavigateTab={setActiveTab}
              onOpenNewTransaction={handleOpenNew}
              onOpenSmartParser={() => setIsSmartParserOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
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

      {/* Expense Message Slip & Voice Reader Modal */}
      <ExpenseMessageModal
        isOpen={isMessageSlipOpen}
        onClose={() => setIsMessageSlipOpen(false)}
        transaction={selectedMessageTx}
        wallets={wallets}
        currency={currentCurrency}
      />

      {/* Smart SMS Message Parser Modal */}
      <SmartMessageParserModal
        isOpen={isSmartParserOpen}
        onClose={() => setIsSmartParserOpen(false)}
        onSave={handleSaveTransaction}
        wallets={wallets}
        currency={currentCurrency}
      />

      {/* Global Minimalist Footer */}
      <footer className="w-full border-t border-stone-200/80 mt-10 py-5 px-4 text-center text-xs text-stone-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">OMNI 3D Fintech</span>
            <span>•</span>
            <span>Client-side Encrypted & Local Storage Secured</span>
          </div>
          <div className="flex items-center gap-4 text-stone-600">
            <button onClick={() => setActiveTab('guide')} className="hover:text-stone-900 transition-colors">
              User Guide
            </button>
            <button onClick={() => setIsSmartParserOpen(true)} className="hover:text-stone-900 transition-colors">
              Smart SMS Reader
            </button>
            <button onClick={() => setIsExportModalOpen(true)} className="hover:text-stone-900 transition-colors">
              Export Statement
            </button>
            <button onClick={handleResetDemoData} className="hover:text-stone-900 transition-colors">
              Reset Demo
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
