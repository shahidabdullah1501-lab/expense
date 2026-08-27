import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, Wallet, Budget, RecurringItem, Currency } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, getCategoryBreakdown } from './formatters';

// Extend jsPDF with autoTable plugin types
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
  lastAutoTable?: {
    finalY: number;
  };
}

export interface ExportOptions {
  dateRangeLabel: string;
  startDate?: string;
  endDate?: string;
  includeSummary: boolean;
  includeCategories: boolean;
  includeTransactions: boolean;
  includeWallets: boolean;
}

/**
 * 1. Export as Professional PDF Statement
 */
export const exportToPDF = (
  transactions: Transaction[],
  wallets: Wallet[],
  budgets: Budget[],
  currency: Currency,
  options: ExportOptions
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header Banner Background
  doc.setFillColor(13, 21, 36); // #0d1524
  doc.rect(0, 0, pageWidth, 42, 'F');

  // App Brand / Logo Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166); // Teal #14b8a6
  doc.text('OMNI 3D', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('FINANCIAL STATEMENT & WEALTH REPORT', 14, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Period: ${options.dateRangeLabel}`, 14, 32);

  // Currency & Status Badge on Right
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Base Currency: ${currency.code} (${currency.symbol})`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Total Records: ${transactions.length} transactions`, pageWidth - 14, 26, { align: 'right' });

  currentY = 50;

  // Calculate Metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  if (options.includeSummary) {
    // 3 Summary Boxes
    const boxWidth = (pageWidth - 28 - 12) / 3;
    const boxHeight = 24;

    // Income Box
    doc.setFillColor(240, 253, 250); // Teal tint
    doc.roundedRect(14, currentY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text('TOTAL INCOME', 18, currentY + 7);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text(formatCurrency(totalIncome, currency), 18, currentY + 17);

    // Expense Box
    const box2X = 14 + boxWidth + 6;
    doc.setFillColor(254, 242, 242); // Red tint
    doc.roundedRect(box2X, currentY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTAL EXPENSES', box2X + 4, currentY + 7);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(formatCurrency(totalExpense, currency), box2X + 4, currentY + 17);

    // Net Savings Box
    const box3X = box2X + boxWidth + 6;
    doc.setFillColor(238, 242, 255); // Indigo tint
    doc.roundedRect(box3X, currentY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(67, 56, 202);
    doc.setFont('helvetica', 'normal');
    doc.text(`NET SAVINGS (${savingsRate}%)`, box3X + 4, currentY + 7);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(formatCurrency(netSavings, currency), box3X + 4, currentY + 17);

    currentY += 32;
  }

  // Category Breakdown Section
  if (options.includeCategories) {
    const expenseCategories = getCategoryBreakdown(transactions, 'expense');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Expense Distribution by Category', 14, currentY);
    currentY += 4;

    const categoryTableData = expenseCategories.map(cat => [
      cat.name,
      formatCurrency(cat.amount, currency),
      `${cat.percentage}%`,
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Category', 'Total Spent', '% Share']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : currentY + 40;
  }

  // Transactions Ledger Table
  if (options.includeTransactions) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Detailed Transaction Ledger', 14, currentY);
    currentY += 4;

    const walletMap = new Map(wallets.map(w => [w.id, w.name]));

    const transactionRows = transactions.map(t => {
      const categoryName = CATEGORIES[t.category]?.name || t.category;
      const walletName = walletMap.get(t.walletId) || 'Main';
      const formattedAmount = `${t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount, currency)}`;

      return [
        t.date,
        t.title + (t.merchant ? ` (${t.merchant})` : ''),
        categoryName,
        walletName,
        t.type.toUpperCase(),
        formattedAmount,
      ];
    });

    doc.autoTable({
      startY: currentY,
      head: [['Date', 'Description / Merchant', 'Category', 'Account', 'Type', 'Amount']],
      body: transactionRows,
      theme: 'striped',
      headStyles: {
        fillColor: [13, 21, 36],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 55 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20, fontStyle: 'bold' },
        5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Page numbering in footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Omni3D Expense Statement • Page ${i} of ${totalPages} • Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Save Document
  const filename = `Omni3D-Expense-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * 2. Export as Excel Workbook (.xlsx) with Multiple Formatted Sheets
 */
export const exportToExcel = (
  transactions: Transaction[],
  wallets: Wallet[],
  budgets: Budget[],
  currency: Currency
) => {
  const wb = XLSX.utils.book_new();
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  // Sheet 1: Transactions
  const txData = transactions.map(t => ({
    'Date': t.date,
    'Time': t.time || '',
    'Title / Description': t.title,
    'Merchant': t.merchant || '',
    'Type': t.type.toUpperCase(),
    'Category': CATEGORIES[t.category]?.name || t.category,
    'Account / Wallet': walletMap.get(t.walletId) || t.walletId,
    [`Amount (${currency.code})`]: t.type === 'expense' ? -t.amount * currency.rateAgainstUSD : t.amount * currency.rateAgainstUSD,
    'Tags': (t.tags || []).join(', '),
    'Notes': t.notes || '',
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  // Sheet 2: Category Breakdown
  const expenseBreakdown = getCategoryBreakdown(transactions, 'expense');
  const catData = expenseBreakdown.map(c => ({
    'Category': c.name,
    [`Total Spent (${currency.code})`]: c.amount * currency.rateAgainstUSD,
    'Share (%)': `${c.percentage}%`,
  }));
  const wsCategories = XLSX.utils.json_to_sheet(catData);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Category Summary');

  // Sheet 3: Wallets & Balances
  const walletData = wallets.map(w => ({
    'Account Name': w.name,
    'Account Type': w.type.toUpperCase(),
    'Account Number': w.accountNumberMasked || 'N/A',
    [`Balance (${currency.code})`]: w.balance * currency.rateAgainstUSD,
  }));
  const wsWallets = XLSX.utils.json_to_sheet(walletData);
  XLSX.utils.book_append_sheet(wb, wsWallets, 'Accounts & Wallets');

  const filename = `Omni3D-Expenses-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
};

/**
 * 3. Export as CSV (Directly Openable in Google Sheets & MS Excel)
 */
export const exportToCSV = (
  transactions: Transaction[],
  wallets: Wallet[],
  currency: Currency
) => {
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  // Prevent CSV Formula Injection (CWE-1236)
  const sanitizeCSV = (val: string): string => {
    let s = val.replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) {
      s = `'` + s;
    }
    return `"${s}"`;
  };

  const headers = ['Date', 'Time', 'Title', 'Merchant', 'Type', 'Category', 'Account', `Amount (${currency.code})`, 'Tags', 'Notes'];
  
  const rows = transactions.map(t => [
    sanitizeCSV(t.date),
    sanitizeCSV(t.time || ''),
    sanitizeCSV(t.title || ''),
    sanitizeCSV(t.merchant || ''),
    sanitizeCSV(t.type.toUpperCase()),
    sanitizeCSV(CATEGORIES[t.category]?.name || t.category),
    sanitizeCSV(walletMap.get(t.walletId) || t.walletId),
    t.type === 'expense' ? (-t.amount * currency.rateAgainstUSD).toFixed(2) : (t.amount * currency.rateAgainstUSD).toFixed(2),
    sanitizeCSV((t.tags || []).join(';')),
    sanitizeCSV(t.notes || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `Omni3D-Expenses-GoogleSheets-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return filename;
};

/**
 * 4. Export Complete Application State as JSON Backup
 */
export const exportToJSON = (data: {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  recurring: RecurringItem[];
  currency: Currency;
  version: string;
}) => {
  const jsonStr = JSON.stringify({
    ...data,
    exportTimestamp: new Date().toISOString(),
    schema: 'Omni3D_Expense_Backup_v1',
  }, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `Omni3D-Full-Backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return filename;
};

/**
 * 5. Import and Restore State from JSON Backup File (Strictly Sanitized)
 */
export const importFromJSON = (file: File): Promise<{
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  recurring: RecurringItem[];
  currency?: Currency;
}> => {
  return new Promise((resolve, reject) => {
    // Max file size limit: 5MB to prevent DoS
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size exceeds the 5MB security threshold'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || typeof content !== 'string') {
          throw new Error('Empty or invalid file payload');
        }

        // Prevent Prototype Pollution
        const parsed = JSON.parse(content, (key, value) => {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return undefined;
          }
          return value;
        });

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Invalid JSON structure: Root must be a valid JSON object');
        }

        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
          throw new Error('Invalid JSON structure: Missing transactions array');
        }

        // Sanitize and validate transactions
        const sanitizedTransactions: Transaction[] = parsed.transactions
          .filter((t: any) => t && typeof t === 'object' && typeof t.title === 'string' && typeof t.amount === 'number' && !isNaN(t.amount))
          .map((t: any) => ({
            id: String(t.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
            title: String(t.title).slice(0, 200),
            amount: Math.abs(Number(t.amount)),
            type: t.type === 'income' ? 'income' : 'expense',
            category: String(t.category || 'other') as any,
            walletId: String(t.walletId || 'w-main'),
            date: String(t.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
            time: t.time ? String(t.time).slice(0, 10) : undefined,
            notes: t.notes ? String(t.notes).slice(0, 500) : undefined,
            tags: Array.isArray(t.tags) ? t.tags.map((tag: any) => String(tag).slice(0, 50)) : undefined,
            merchant: t.merchant ? String(t.merchant).slice(0, 100) : undefined,
          }));

        // Sanitize wallets
        const sanitizedWallets: Wallet[] = Array.isArray(parsed.wallets)
          ? parsed.wallets
              .filter((w: any) => w && typeof w === 'object' && typeof w.name === 'string')
              .map((w: any) => ({
                id: String(w.id || `w-${Math.random().toString(36).slice(2, 6)}`),
                name: String(w.name).slice(0, 100),
                type: ['checking', 'savings', 'credit', 'investment', 'cash'].includes(w.type) ? w.type : 'checking',
                balance: typeof w.balance === 'number' && !isNaN(w.balance) ? w.balance : 0,
                currency: String(w.currency || 'USD').slice(0, 5),
                color: String(w.color || '#14b8a6').slice(0, 20),
                icon: String(w.icon || 'CreditCard').slice(0, 30),
                accountNumberMasked: w.accountNumberMasked ? String(w.accountNumberMasked).slice(0, 30) : undefined,
              }))
          : [];

        // Sanitize budgets
        const sanitizedBudgets: Budget[] = Array.isArray(parsed.budgets)
          ? parsed.budgets
              .filter((b: any) => b && typeof b === 'object' && typeof b.limit === 'number')
              .map((b: any) => ({
                id: String(b.id || `b-${Math.random().toString(36).slice(2, 6)}`),
                categoryId: String(b.categoryId || 'other') as any,
                limit: Math.max(0, Number(b.limit)),
                period: b.period === 'yearly' ? 'yearly' : 'monthly',
                alertThreshold: typeof b.alertThreshold === 'number' ? Math.min(1, Math.max(0.1, b.alertThreshold)) : 0.85,
              }))
          : [];

        // Sanitize recurring
        const sanitizedRecurring: RecurringItem[] = Array.isArray(parsed.recurring)
          ? parsed.recurring
              .filter((r: any) => r && typeof r === 'object' && typeof r.title === 'string' && typeof r.amount === 'number')
              .map((r: any) => ({
                id: String(r.id || `rec-${Math.random().toString(36).slice(2, 6)}`),
                title: String(r.title).slice(0, 200),
                amount: Math.abs(Number(r.amount)),
                type: r.type === 'income' ? 'income' : 'expense',
                category: String(r.category || 'utilities') as any,
                walletId: String(r.walletId || 'w-main'),
                frequency: ['daily', 'weekly', 'monthly', 'yearly'].includes(r.frequency) ? r.frequency : 'monthly',
                nextBillingDate: String(r.nextBillingDate || new Date().toISOString().slice(0, 10)).slice(0, 10),
                autoDeduct: Boolean(r.autoDeduct),
                notes: r.notes ? String(r.notes).slice(0, 500) : undefined,
              }))
          : [];

        resolve({
          transactions: sanitizedTransactions,
          wallets: sanitizedWallets.length > 0 ? sanitizedWallets : undefined as any,
          budgets: sanitizedBudgets.length > 0 ? sanitizedBudgets : undefined as any,
          recurring: sanitizedRecurring.length > 0 ? sanitizedRecurring : undefined as any,
          currency: parsed.currency,
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * 6. Capture 3D WebGL Canvas Snapshot as High-Resolution PNG
 */
export const captureCanvasSnapshot = (canvasSelector = 'canvas'): string | null => {
  const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
  if (!canvas) return null;

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const filename = `Omni3D-Visual-Snapshot-${new Date().toISOString().slice(0, 10)}.png`;
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return filename;
  } catch (err) {
    console.error('Failed to capture canvas snapshot:', err);
    return null;
  }
};
