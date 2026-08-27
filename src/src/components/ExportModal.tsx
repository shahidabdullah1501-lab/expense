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
  Calendar
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
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    setTimeout(() => setDownloadSuccessMsg(null), 3500);
  };

  // 1. PDF Trigger
  const handleExportPDF = () => {
    const options: ExportOptions = {
      dateRangeLabel,
      includeSummary: true,
      includeCategories: true,
      includeTransactions: true,
      includeWallets: true,
    };
    const filename = exportToPDF(filteredTxs, wallets, budgets, currency, options);
    triggerSuccess(`Downloaded PDF: ${filename}`);
  };

  // 2. Google Sheets CSV Trigger
  const handleExportCSV = () => {
    const filename = exportToCSV(filteredTxs, wallets, currency);
    triggerSuccess(`Generated CSV: ${filename}`);
  };

  // 3. Excel (.xlsx) Trigger
  const handleExportExcel = () => {
    const filename = exportToExcel(filteredTxs, wallets, budgets, currency);
    triggerSuccess(`Exported XLSX: ${filename}`);
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
    triggerSuccess(`Saved JSON: ${filename}`);
  };

  // 5. JSON Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importFromJSON(file);
      onRestoreState(restored);
      triggerSuccess(`Database restored with ${restored.transactions.length} records!`);
      onClose();
    } catch (err: any) {
      alert(`Import error: ${err?.message || 'Failed to parse JSON file'}`);
    }
  };

  // 6. 3D Canvas Snapshot
  const handleCaptureSnapshot = () => {
    const filename = captureCanvasSnapshot('canvas');
    if (filename) {
      triggerSuccess(`Snapshot saved: ${filename}`);
    } else {
      alert('Could not locate 3D canvas for screenshot');
    }
  };

  // 7. Direct Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D5EBDA] border border-[#B2DCBC] flex items-center justify-center text-stone-900 shadow-xs">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Data Export & Reports</h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Export records into PDF, Google Sheets, Excel XLSX, JSON, or Image
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccessMsg && (
          <div className="my-3.5 p-3 rounded-xl bg-[#D5EBDA]/60 border border-[#B2DCBC] text-emerald-950 text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-800" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* Date Scope Filter */}
        <div className="my-4 p-3.5 rounded-xl bg-[#FAFAEB] border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-stone-500" />
              Period Scope
            </label>
            <span className="text-[11px] font-bold text-emerald-900">
              {filteredTxs.length} records selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'this_year', label: 'This Year' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateRange(p.id as any)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === p.id
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-300'
                    : 'bg-transparent text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Format 1: PDF */}
          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/50 border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FileText className="w-4 h-4 text-[#8B4246]" />
                <span className="badge badge-blush text-[10px]">
                  PDF
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900">Executive PDF Report</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Multi-page statement with summary metrics and formatted transaction ledger.
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="btn-secondary mt-3 w-full py-1.5 text-xs font-semibold"
            >
              <Download className="w-3 h-3" />
              Download PDF
            </button>
          </div>

          {/* Format 2: CSV */}
          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/50 border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#3D9251]" />
                <span className="badge badge-sage text-[10px]">
                  CSV
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900">Google Sheets CSV</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Structured CSV ready for 1-click import to Google Drive / Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="btn-secondary mt-3 w-full py-1.5 text-xs font-semibold"
            >
              <Download className="w-3 h-3" />
              Download CSV
            </button>
          </div>

          {/* Format 3: Excel */}
          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/50 border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                <span className="badge badge-peach text-[10px]">
                  XLSX
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900">Excel Workbook</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Multi-sheet workbook with transactions, category summaries, and accounts.
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="btn-secondary mt-3 w-full py-1.5 text-xs font-semibold"
            >
              <Download className="w-3 h-3" />
              Download XLSX
            </button>
          </div>

          {/* Format 4: Snapshot */}
          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/50 border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <ImageIcon className="w-4 h-4 text-purple-900" />
                <span className="badge badge-lavender text-[10px]">
                  PNG
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900">3D Scene Snapshot</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Instant high-resolution PNG capture of your current 3D visualizer canvas.
              </p>
            </div>
            <button
              onClick={handleCaptureSnapshot}
              className="btn-secondary mt-3 w-full py-1.5 text-xs font-semibold"
            >
              <Download className="w-3 h-3" />
              Capture PNG
            </button>
          </div>

        </div>

        {/* Database Backup & Restore Section */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-xs font-semibold text-stone-700">Raw JSON Backup</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportJSON}
              className="btn-secondary flex-1 sm:flex-initial py-1.5 text-xs font-medium"
            >
              <Download className="w-3 h-3" />
              Save JSON
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
              className="btn-secondary flex-1 sm:flex-initial py-1.5 text-xs font-medium"
            >
              <Upload className="w-3 h-3" />
              Restore
            </button>

            <button
              onClick={handlePrint}
              className="btn-secondary p-2"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
