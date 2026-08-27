import React, { useState, useRef } from 'react';
import { Transaction, Wallet, Budget, RecurringItem, Currency } from '../types';
import { 
  exportToPDF, 
  exportToExcel, 
  exportToCSV, 
  exportToJSON, 
  importFromJSON, 
  captureCanvasSnapshot,
  ExportOptions
} from '../utils/exportUtils';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Image as ImageIcon, 
  Printer, 
  Download, 
  Upload, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  recurring: RecurringItem[];
  currency: Currency;
  onRestoreState: (state: {
    transactions: Transaction[];
    wallets: Wallet[];
    budgets: Budget[];
    recurring: RecurringItem[];
    currency?: Currency;
  }) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  wallets,
  budgets,
  recurring,
  currency,
  onRestoreState,
}) => {
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter transactions for export if needed
  const getFilteredTransactions = () => {
    const now = new Date();
    const currentYearMonth = now.toISOString().slice(0, 7);
    
    // Last month
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);

    const currentYear = now.getFullYear().toString();

    switch (dateRange) {
      case 'this_month':
        return transactions.filter(t => t.date.startsWith(currentYearMonth));
      case 'last_month':
        return transactions.filter(t => t.date.startsWith(lastMonthKey));
      case 'this_year':
        return transactions.filter(t => t.date.startsWith(currentYear));
      default:
        return transactions;
    }
  };

  const filteredTxs = getFilteredTransactions();
  const dateRangeLabel = 
    dateRange === 'this_month' ? 'Current Month' :
    dateRange === 'last_month' ? 'Previous Month' :
    dateRange === 'this_year' ? 'Current Year' : 'All Historical Time';

  const triggerSuccess = (msg: string) => {
    setDownloadSuccessMsg(msg);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  // 1. PDF Trigger
  const handleExportPDF = () => {
    const options: ExportOptions = {
      dateRangeLabel,
      includeSummary,
      includeCategories,
      includeTransactions,
      includeWallets: true,
    };
    const filename = exportToPDF(filteredTxs, wallets, budgets, currency, options);
    triggerSuccess(`Successfully downloaded PDF statement: ${filename}`);
  };

  // 2. Google Sheets CSV Trigger
  const handleExportCSV = () => {
    const filename = exportToCSV(filteredTxs, wallets, currency);
    triggerSuccess(`Google Sheets ready CSV generated: ${filename}`);
  };

  // 3. Excel (.xlsx) Trigger
  const handleExportExcel = () => {
    const filename = exportToExcel(filteredTxs, wallets, budgets, currency);
    triggerSuccess(`Excel Workbook exported: ${filename}`);
  };

  // 4. JSON Backup
  const handleExportJSON = () => {
    const filename = exportToJSON({
      transactions,
      wallets,
      budgets,
      recurring,
      currency,
      version: '1.0.0',
    });
    triggerSuccess(`Full JSON database backup saved: ${filename}`);
  };

  // 5. JSON Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importFromJSON(file);
      onRestoreState(restored);
      triggerSuccess(`Successfully restored database with ${restored.transactions.length} records!`);
      onClose();
    } catch (err: any) {
      alert(`Import error: ${err?.message || 'Failed to parse JSON file'}`);
    }
  };

  // 6. 3D Canvas Snapshot
  const handleCaptureSnapshot = () => {
    const filename = captureCanvasSnapshot('canvas');
    if (filename) {
      triggerSuccess(`3D Canvas Snapshot saved: ${filename}`);
    } else {
      alert('Could not locate 3D canvas for screenshot');
    }
  };

  // 7. Direct Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-dark-card border border-white/15 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-extrabold text-white">Universal Download & Export Suite</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Download your complete financial records into PDF, Google Sheets, Excel XLSX, JSON, or high-res Image.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccessMsg && (
          <div className="my-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* Date Scope Filter */}
        <div className="my-5 p-4 rounded-2xl bg-dark-surface/80 border border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              Export Period Scope
            </label>
            <span className="text-xs font-bold text-brand-300">
              {filteredTxs.length} records selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all', label: 'All History' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'this_year', label: 'This Year' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateRange(p.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  dateRange === p.id
                    ? 'bg-brand-600 border-brand-400 text-white shadow-glow-teal'
                    : 'bg-dark-card border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Format 1: Professional PDF Statement */}
          <div className="p-4 rounded-2xl bg-dark-surface/90 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30">
                  .PDF Statement
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Executive PDF Report</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Multi-page branded ledger with summary metrics, category breakdown table, and formatted rows.
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="mt-4 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Report
            </button>
          </div>

          {/* Format 2: Google Sheets (.csv) */}
          <div className="p-4 rounded-2xl bg-dark-surface/90 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Google Sheets CSV
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Google Sheets CSV</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                UTF-8 structured CSV ready for 1-click drag-and-drop import to Google Drive / Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Google Sheets CSV
            </button>
          </div>

          {/* Format 3: Microsoft Excel Workbook (.xlsx) */}
          <div className="p-4 rounded-2xl bg-dark-surface/90 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  .XLSX Workbook
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Excel Multi-Sheet Workbook</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Rich workbook with separate tabs for Transactions, Category Summaries, and Wallet balances.
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="mt-4 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel Workbook (.xlsx)
            </button>
          </div>

          {/* Format 4: 3D Visual Snapshot (.png) */}
          <div className="p-4 rounded-2xl bg-dark-surface/90 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  .PNG Snapshot
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">3D HD Visual Snapshot</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Instant high-res PNG capture of your current interactive 3D WebGL scene.
              </p>
            </div>
            <button
              onClick={handleCaptureSnapshot}
              className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Capture 3D Snapshot (.png)
            </button>
          </div>

        </div>

        {/* Full Database Backup & Restore Section */}
        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-300">Raw JSON Backup & Migration</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportJSON}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Save JSON Backup
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore JSON Backup
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all"
              title="Print Clean Statement"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
