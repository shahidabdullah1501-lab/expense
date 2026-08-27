import React, { useState } from 'react';
import { Transaction, Wallet, CategoryKey, Currency } from '../types';
import { CATEGORIES } from '../data/initialData';
import { 
  X, 
  Sparkles, 
  Check, 
  MessageSquare, 
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartMessageParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  wallets: Wallet[];
  currency: Currency;
}

export const SmartMessageParserModal: React.FC<SmartMessageParserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  wallets,
  currency,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedTitle, setParsedTitle] = useState('');
  const [parsedAmount, setParsedAmount] = useState('');
  const [parsedType, setParsedType] = useState<'expense' | 'income'>('expense');
  const [parsedCategory, setParsedCategory] = useState<CategoryKey>('shopping');
  const [parsedWalletId, setParsedWalletId] = useState(wallets[0]?.id || 'w-main');
  const [parsedDate, setParsedDate] = useState(new Date().toISOString().slice(0, 10));
  const [parsedMerchant, setParsedMerchant] = useState('');
  const [isParsed, setIsParsed] = useState(false);

  if (!isOpen) return null;

  // Smart Parser Engine for SMS / Bank Messages
  const handleParseText = () => {
    if (!rawText.trim()) return;

    const text = rawText.trim();
    let detectedType: 'expense' | 'income' = 'expense';
    let detectedAmount = '';
    let detectedMerchant = '';
    let detectedCategory: CategoryKey = 'shopping';
    let detectedWalletId = wallets[0]?.id || 'w-main';
    let detectedDate = new Date().toISOString().slice(0, 10);

    // 1. Detect Type (Income vs Expense keywords)
    if (/\b(deposited|credit|received|salary|payout|refund|earned|inflow)\b/i.test(text)) {
      detectedType = 'income';
    } else {
      detectedType = 'expense';
    }

    // 2. Extract Amount (handles $, €, £, ₹, or currency codes)
    const amountMatch = text.match(/(?:[$€£₹]|USD|EUR|GBP|INR|CAD|AUD)\s?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)|([0-9]+(?:\.[0-9]{1,2})?)\s?(?:USD|EUR|GBP|INR|CAD|AUD)/i) ||
                        text.match(/(?:amount|rs|inr|usd|total|spent|paid|for)\s?[:=-]?\s?[$€£₹]?\s?([0-9]+(?:\.[0-9]{1,2})?)/i) ||
                        text.match(/([0-9]+\.[0-9]{2})/);

    if (amountMatch) {
      const amtStr = (amountMatch[1] || amountMatch[2] || amountMatch[0]).replace(/,/g, '').replace(/[^0-9.]/g, '');
      if (amtStr) detectedAmount = amtStr;
    }

    // 3. Extract Merchant / Payee
    const atMerchantMatch = text.match(/\b(?:at|to|for|via|from)\s+([A-Z0-9][A-Za-z0-9\s&'-]{2,30})/i);
    if (atMerchantMatch) {
      detectedMerchant = atMerchantMatch[1].trim().replace(/\s+(on|for|using|with|via)$/i, '');
    }

    // 4. Extract Matching Wallet by Account Digits (e.g., "ending in 4892")
    const cardDigitsMatch = text.match(/(?:ending\s(?:in|with)?|card|acct|acc|a\/c)\s*[:#]?\s*([0-9]{4})/i);
    if (cardDigitsMatch) {
      const digits = cardDigitsMatch[1];
      const matchedWallet = wallets.find(w => w.accountNumberMasked && w.accountNumberMasked.includes(digits));
      if (matchedWallet) {
        detectedWalletId = matchedWallet.id;
      }
    }

    // 5. Intelligent Category Classification
    const lower = text.toLowerCase();
    if (/uber|lyft|taxi|train|metro|flight|gas|fuel|tesla|supercharg/i.test(lower)) {
      detectedCategory = 'transportation';
    } else if (/food|restaurant|starbucks|mcdonald|dinner|cafe|grocer|whole foods|market|coffee/i.test(lower)) {
      detectedCategory = 'food';
    } else if (/rent|apartment|mortgage|housing|landlord/i.test(lower)) {
      detectedCategory = 'housing';
    } else if (/steam|game|netflix|spotify|cinema|movie|playstation|xbox/i.test(lower)) {
      detectedCategory = 'entertainment';
    } else if (/internet|wifi|verizon|electricity|water|utility|fios|openai|aws|figma/i.test(lower)) {
      detectedCategory = 'utilities';
    } else if (/apple|amazon|store|target|walmart|clothing|shoes|hardware/i.test(lower)) {
      detectedCategory = 'shopping';
    } else if (/gym|equinox|doctor|pharmacy|health|hospital|fitness/i.test(lower)) {
      detectedCategory = 'healthcare';
    } else if (/course|udemy|coursera|university|tuition|school/i.test(lower)) {
      detectedCategory = 'education';
    } else if (/crypto|eth|btc|staking|dividend|stock|yield/i.test(lower)) {
      detectedCategory = 'investment';
    } else if (/salary|paycheck|payroll|employer/i.test(lower)) {
      detectedCategory = 'salary';
    } else if (/freelance|client|invoice|consulting/i.test(lower)) {
      detectedCategory = 'freelance';
    }

    // 6. Extract Date (YYYY-MM-DD or DD/MM/YYYY)
    const dateMatch = text.match(/\b(202[0-9]-[0-1][0-9]-[0-3][0-9])\b/) || text.match(/\b([0-3][0-9]\/[0-1][0-9]\/202[0-9])\b/);
    if (dateMatch) {
      detectedDate = dateMatch[1];
    }

    setParsedType(detectedType);
    setParsedAmount(detectedAmount);
    setParsedMerchant(detectedMerchant);
    setParsedCategory(detectedCategory);
    setParsedWalletId(detectedWalletId);
    setParsedDate(detectedDate);
    setParsedTitle(detectedMerchant ? `${detectedMerchant} Purchase` : detectedType === 'income' ? 'Direct Deposit' : 'Card Transaction');
    setIsParsed(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(parsedAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !parsedTitle.trim()) {
      alert('Please verify title and amount before saving.');
      return;
    }

    onSave({
      title: parsedTitle.trim(),
      amount: numAmount / currency.rateAgainstUSD,
      type: parsedType,
      category: parsedCategory,
      walletId: parsedWalletId,
      date: parsedDate,
      merchant: parsedMerchant.trim() || undefined,
      notes: `Parsed from message: "${rawText.slice(0, 150)}"`,
      tags: ['smart-read', 'sms-parsed'],
    });

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    onClose();
  };

  const handleUseExample = (sampleText: string) => {
    setRawText(sampleText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F3E4F1] border border-[#E6C6E1] flex items-center justify-center text-purple-950 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Smart Message Reader</h3>
              <p className="text-xs text-stone-500">Paste bank SMS or alert to auto-extract transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="my-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-stone-500" />
              Paste Bank SMS / Message Text
            </label>
            <span className="text-[10px] text-stone-400">Auto-detects merchant, amount, category & account</span>
          </div>

          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. Your Apex card ending in 2309 was charged $89.90 at Valve Steam Store on 2026-08-14"
            className="input resize-none text-xs leading-relaxed"
          />

          {/* Quick Example Chips */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px]">
            <span className="text-stone-400 flex items-center gap-0.5 flex-shrink-0">
              <HelpCircle className="w-3 h-3" /> Examples:
            </span>
            <button
              type="button"
              onClick={() => handleUseExample("Your card ending in 2309 was charged $174.50 at Whole Foods Market on 2026-08-24")}
              className="px-2 py-0.5 rounded-md bg-[#FAFAEB] border border-stone-200 text-stone-700 hover:border-stone-400 transition-all flex-shrink-0"
            >
              Grocery SMS
            </button>
            <button
              type="button"
              onClick={() => handleUseExample("Direct deposit received of $2,200.00 from Stripe Payout for Freelance")}
              className="px-2 py-0.5 rounded-md bg-[#FAFAEB] border border-stone-200 text-stone-700 hover:border-stone-400 transition-all flex-shrink-0"
            >
              Salary Deposit
            </button>
            <button
              type="button"
              onClick={() => handleUseExample("Uber receipt: $48.20 charged to checking 4892 on 2026-08-25")}
              className="px-2 py-0.5 rounded-md bg-[#FAFAEB] border border-stone-200 text-stone-700 hover:border-stone-400 transition-all flex-shrink-0"
            >
              Ride Receipt
            </button>
          </div>

          <button
            type="button"
            onClick={handleParseText}
            disabled={!rawText.trim()}
            className="btn-primary w-full py-2 mt-2 text-xs disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Parse & Extract Record</span>
          </button>
        </div>

        {/* Parsed Fields Preview & Edit */}
        {isParsed && (
          <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-stone-100 space-y-3 animate-slide-up">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Extracted Transaction Details</span>
              <span className="badge badge-sage text-[10px]">Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={parsedTitle}
                  onChange={(e) => setParsedTitle(e.target.value)}
                  className="input py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                  Amount ({currency.symbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={parsedAmount}
                  onChange={(e) => setParsedAmount(e.target.value)}
                  className="input py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Type</label>
                <select
                  value={parsedType}
                  onChange={(e) => setParsedType(e.target.value as any)}
                  className="input py-1.5 text-xs"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Category</label>
                <select
                  value={parsedCategory}
                  onChange={(e) => setParsedCategory(e.target.value as any)}
                  className="input py-1.5 text-xs"
                >
                  {Object.values(CATEGORIES).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Account</label>
                <select
                  value={parsedWalletId}
                  onChange={(e) => setParsedWalletId(e.target.value)}
                  className="input py-1.5 text-xs"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Payee / Merchant</label>
                <input
                  type="text"
                  value={parsedMerchant}
                  onChange={(e) => setParsedMerchant(e.target.value)}
                  className="input py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Date</label>
                <input
                  type="date"
                  value={parsedDate}
                  onChange={(e) => setParsedDate(e.target.value)}
                  className="input py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Ledger</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
