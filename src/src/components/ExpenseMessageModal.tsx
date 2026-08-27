import React, { useState, useEffect } from 'react';
import { Transaction, Wallet, Currency } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Calendar, 
  Store, 
  CreditCard, 
  Receipt,
  Share2
} from 'lucide-react';

interface ExpenseMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  wallets: Wallet[];
  currency: Currency;
}

export const ExpenseMessageModal: React.FC<ExpenseMessageModalProps> = ({
  isOpen,
  onClose,
  transaction,
  wallets,
  currency,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Stop speech synthesis if modal closes
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const category = CATEGORIES[transaction.category] || CATEGORIES.other;
  const wallet = wallets.find(w => w.id === transaction.walletId);
  const isExpense = transaction.type === 'expense';
  const formattedAmount = formatCurrency(transaction.amount, currency);

  // Generate natural language message string
  const naturalLanguageMessage = `${isExpense ? 'Expense of' : 'Income deposit of'} ${formattedAmount} for "${transaction.title}"${
    transaction.merchant ? ` at ${transaction.merchant}` : ''
  } in category ${category.name}, recorded on ${formatDate(transaction.date)}${
    wallet ? ` from account ${wallet.name}` : ''
  }.${transaction.notes ? ` Notes: "${transaction.notes}".` : ''}`;

  // Voice Audio Reader using Web Speech API
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(naturalLanguageMessage);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(naturalLanguageMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Expense Receipt: ${transaction.title}`,
          text: naturalLanguageMessage,
        });
      } catch {
        handleCopyMessage();
      }
    } else {
      handleCopyMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAFAEB] border border-stone-200 flex items-center justify-center text-stone-800 shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Expense Message Slip</h3>
              <p className="text-xs text-stone-500">Read & listen to formatted transaction breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Status Card */}
        <div className="my-4 p-4 rounded-2xl bg-[#FAFAEB] border border-stone-200 text-center">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5 ${
            isExpense ? 'bg-[#EAD3D4] text-rose-950 border border-[#D7AEB0]' : 'bg-[#D5EBDA] text-emerald-950 border border-[#B2DCBC]'
          }`}>
            {transaction.type}
          </span>
          <div className={`text-3xl font-extrabold tracking-tight ${
            isExpense ? 'text-[#8B4246]' : 'text-[#3D9251]'
          }`}>
            {isExpense ? '-' : '+'}{formattedAmount}
          </div>
          <p className="text-sm font-semibold text-stone-800 mt-1">{transaction.title}</p>
        </div>

        {/* Audio Speech Reader Toolbar */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-stone-700">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-stone-400'}`} />
            <span className="font-medium">
              {isSpeaking ? 'Reading transaction aloud...' : 'Audio Voice Reader'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeech}
              className={`btn px-3 py-1.5 text-xs font-semibold ${
                isSpeaking 
                  ? 'bg-[#EAD3D4] text-rose-950 border border-[#D7AEB0]' 
                  : 'bg-[#D5EBDA] text-stone-900 border border-[#8CCA9A]'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="space-y-2.5 text-xs text-stone-700">
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-stone-500 font-medium">Category</span>
            <div className="flex items-center gap-1.5 font-semibold text-stone-900">
              <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: category.color }} />
              <span>{category.name}</span>
            </div>
          </div>

          {transaction.merchant && (
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <Store className="w-3 h-3" /> Payee / Merchant
              </span>
              <span className="font-semibold text-stone-900">{transaction.merchant}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date & Time
            </span>
            <span className="font-semibold text-stone-900">
              {formatDate(transaction.date)} {transaction.time ? `• ${transaction.time}` : ''}
            </span>
          </div>

          {wallet && (
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Account
              </span>
              <span className="font-semibold text-stone-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border border-stone-300" style={{ backgroundColor: wallet.color }} />
                {wallet.name}
              </span>
            </div>
          )}

          {transaction.notes && (
            <div className="py-2 border-b border-stone-100">
              <span className="text-stone-500 font-medium block mb-1">Notes</span>
              <p className="text-stone-800 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                "{transaction.notes}"
              </p>
            </div>
          )}

          {transaction.tags && transaction.tags.length > 0 && (
            <div className="py-2 border-b border-stone-100">
              <span className="text-stone-500 font-medium block mb-1">Tags</span>
              <div className="flex flex-wrap gap-1">
                {transaction.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAFAEB] border border-stone-200 text-stone-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formatted Readable Narrative Message Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div className="flex items-center justify-between text-stone-500 font-semibold uppercase tracking-wider text-[10px] mb-1.5">
            <span>Readable Message Summary</span>
            <button
              onClick={handleCopyMessage}
              className="text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <p className="text-stone-800 leading-relaxed select-all">
            {naturalLanguageMessage}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            onClick={handleShare}
            className="btn-secondary text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Slip</span>
          </button>

          <button
            onClick={onClose}
            className="btn-primary text-xs"
          >
            Close Slip
          </button>
        </div>

      </div>
    </div>
  );
};
