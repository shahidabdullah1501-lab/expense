import React, { useState } from 'react';
import { 
  BookOpen, 
  Rotate3d, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  BarChart3, 
  Download, 
  CreditCard, 
  Repeat, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Command, 
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';

interface UserGuideViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenNewTransaction: () => void;
  onOpenSmartParser: () => void;
  onOpenExportModal: () => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({
  onNavigateTab,
  onOpenNewTransaction,
  onOpenSmartParser,
  onOpenExportModal,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeGuideSection, setActiveGuideSection] = useState<string>('all');

  const faqs = [
    {
      q: 'Where is my financial data stored? Is it secure?',
      a: 'Your data is 100% stored locally on your device in your browser’s LocalStorage. No transactions or account details are sent to external servers or third-party trackers. You can also export a full encrypted JSON backup anytime.',
    },
    {
      q: 'How does the "Read Expense / Audio Voice" feature work?',
      a: 'Each transaction in the Ledger has a "Read Message" button. Clicking "Read Aloud" uses your browser’s built-in Web Speech API to speak the transaction details aloud, creating a seamless audio receipt experience.',
    },
    {
      q: 'How does the Smart Message Parser work?',
      a: 'You can copy and paste any bank SMS notification, debit alert, or email receipt into the Smart Message Reader. It automatically parses the merchant, amount, category, date, and matched account digits with zero manual typing.',
    },
    {
      q: 'How is the Financial Health Score calculated?',
      a: 'The 0–100 Health Score weighs 60% on your monthly Savings Rate (income minus expenses) and 40% on your Budget Adherence (staying within category limits). Scores above 85 are categorized as "Elite".',
    },
    {
      q: 'Can I import and export my statements into Excel or Google Sheets?',
      a: 'Yes! The Universal Exporter lets you generate Executive PDF statements, structured Google Sheets CSV files (hardened against CSV injection), Excel XLSX workbooks, high-res 3D PNG snapshots, and raw JSON database files.',
    },
  ];

  const guideSections = [
    {
      id: '3d-visualizer',
      title: '3D Interactive Visualizer',
      icon: Rotate3d,
      badge: 'Interactive',
      badgeClass: 'badge-sage',
      desc: 'Explore and analyze your spending patterns across multiple 3D visual environments with real-time raycasting.',
      features: [
        {
          name: '4 Visual Modes',
          detail: 'Switch between 3D Ring (category donut), Towers (comparative 3D bar columns), Vault (spherical asset geometry), and Cosmos (orbiting particle constellation).',
        },
        {
          name: 'Orbit, Zoom & Pan',
          detail: 'Click and drag to orbit around your financial universe. Scroll or pinch to zoom. Double-click to focus.',
        },
        {
          name: 'Interactive Slices',
          detail: 'Clicking any 3D segment instantly filters your entire ledger, budget views, and analytics to that specific category.',
        },
        {
          name: 'Camera Tools & Snapshot',
          detail: 'Use the right-hand stack to toggle auto-rotation, switch to isometric or top-down radar view, or capture high-res PNG snapshots.',
        },
      ],
      actionLabel: 'Open 3D Visualizer',
      actionTab: 'dashboard',
    },
    {
      id: 'message-reader',
      title: 'Smart Message Reader & Voice Audio',
      icon: Volume2,
      badge: 'New Feature',
      badgeClass: 'badge-lavender',
      desc: 'Read, listen, and auto-parse bank SMS alerts and transaction receipts in natural language.',
      features: [
        {
          name: 'Audio Voice Playback',
          detail: 'Click "Read Message" on any transaction row to open the receipt slip and listen to the details spoken aloud via text-to-speech.',
        },
        {
          name: 'Bank SMS Paste Parser',
          detail: 'Click "Smart SMS Reader" to paste any raw debit/credit SMS text. The parser extracts the merchant, amount, category, account, and date in seconds.',
        },
        {
          name: 'Receipt Slips & Quick Share',
          detail: 'Generate clean formatted message slips with notes, tags, timestamps, and 1-click text copying.',
        },
      ],
      actionLabel: 'Try Smart Message Reader',
      actionFn: onOpenSmartParser,
    },
    {
      id: 'budgets-analytics',
      title: 'Budget Caps & Health Intelligence',
      icon: ShieldCheck,
      badge: 'Fintech Analytics',
      badgeClass: 'badge-peach',
      desc: 'Maintain financial discipline with dynamic monthly caps, daily burn velocity, and audit recommendations.',
      features: [
        {
          name: 'Category Budget Caps',
          detail: 'Set monthly expense limits per category. Progress bars visually warn you when you approach 80% or exceed 100% capacity.',
        },
        {
          name: 'Financial Health Index',
          detail: 'Real-time diagnostic score (0–100) evaluating savings rate, budget compliance, and daily burn rate with actionable recommendations.',
        },
        {
          name: 'Cashflow Inflow vs Outflow',
          detail: 'Comparative dual-bar timeline illustrating monthly income deposits vs expense outflows.',
        },
      ],
      actionLabel: 'View Budget Governance',
      actionTab: 'budgets',
    },
    {
      id: 'export-privacy',
      title: 'Universal Exporter & Data Security',
      icon: Download,
      badge: 'Multi-Format',
      badgeClass: 'badge-blush',
      desc: 'Download reports across formats or back up and restore your entire financial database offline.',
      features: [
        {
          name: 'Executive PDF Statement',
          detail: 'Generates a clean multi-page executive financial statement with summary KPI boxes and formatted transaction tables.',
        },
        {
          name: 'Google Sheets CSV & Excel XLSX',
          detail: 'Clean data exports ready for spreadsheet modeling with built-in formula injection escaping.',
        },
        {
          name: 'Zero-Telemetry Privacy',
          detail: 'Operates entirely client-side in your browser. No third-party servers, no cookies, no tracking.',
        },
      ],
      actionLabel: 'Open Export Center',
      actionFn: onOpenExportModal,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-white via-[#FCFCF7] to-[#FAFAEB] border-stone-200/90 shadow-card">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-sage text-xs font-semibold">
              Comprehensive Guide
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Version 1.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            How to Use OMNI 3D Expense Tracker
          </h1>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            Welcome to your minimalist, privacy-first 3D financial workspace. Discover how to visualize your cashflow in 3D, parse bank SMS messages, listen to voice receipts, manage multi-vault accounts, and export professional statements.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="btn-primary text-xs"
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>Launch 3D Visualizer</span>
            </button>

            <button
              onClick={onOpenSmartParser}
              className="btn-secondary text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart SMS Reader</span>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="btn-secondary text-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick-Start 4-Step Walkthrough */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D5EBDA] border border-[#8CCA9A]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Quick Start in 4 Easy Steps
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              step: '01',
              title: 'Record or Parse',
              desc: 'Add transactions manually or paste your bank SMS text into the Smart Reader.',
              icon: Zap,
              color: '#D5EBDA',
            },
            {
              step: '02',
              title: 'Explore in 3D',
              desc: 'Orbit around your spending rings, towers, and vault geometry in real-time.',
              icon: Rotate3d,
              color: '#F3E4F1',
            },
            {
              step: '03',
              title: 'Set Budget Caps',
              desc: 'Define monthly category limits and monitor your financial health index.',
              icon: ShieldCheck,
              color: '#F4DACD',
            },
            {
              step: '04',
              title: 'Export & Backup',
              desc: 'Download executive PDF statements, Google Sheets CSV, Excel, or JSON backups.',
              icon: Download,
              color: '#EAD3D4',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="card p-5 hover:border-stone-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-400 font-mono">{item.step}</span>
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-900 border border-stone-200 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Deep-Dives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Feature Deep-Dives & Tutorials
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {guideSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.id} className="card p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FAFAEB] border border-stone-200 flex items-center justify-center text-stone-900 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">{sec.title}</h3>
                        <span className={`badge ${sec.badgeClass} text-[10px] mt-0.5`}>
                          {sec.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 mb-4 leading-relaxed">{sec.desc}</p>

                  {/* Bulleted feature points */}
                  <div className="space-y-2.5 mb-5">
                    {sec.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 bg-[#FAFAEB]/60 p-2.5 rounded-xl border border-stone-200/80 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D9251] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-stone-900 block font-semibold">{f.name}</strong>
                          <span className="text-stone-600 text-[11px] leading-normal">{f.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-stone-100">
                  <button
                    onClick={() => {
                      if (sec.actionTab) onNavigateTab(sec.actionTab);
                      if (sec.actionFn) sec.actionFn();
                    }}
                    className="btn-secondary w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>{sec.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro-Tips & Keyboard Shortcuts */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Command className="w-4 h-4 text-stone-600" />
          <h3 className="text-sm font-bold text-stone-900">Pro-Tips & Keyboard Shortcuts</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/80 border border-stone-200 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-white border border-stone-300 font-mono text-[11px] font-bold text-stone-800 shadow-xs">
              ⌘K / Ctrl+K
            </span>
            <div className="text-xs">
              <strong className="text-stone-900 block font-semibold">Global Search</strong>
              <span className="text-stone-500 text-[11px]">Instant filter by merchant, title, tag, or note.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/80 border border-stone-200 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-white border border-stone-300 font-mono text-[11px] font-bold text-stone-800 shadow-xs">
              Click Slice
            </span>
            <div className="text-xs">
              <strong className="text-stone-900 block font-semibold">3D Raycast Filter</strong>
              <span className="text-stone-500 text-[11px]">Click any 3D ring or tower to filter the entire ledger.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAEB]/80 border border-stone-200 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-white border border-stone-300 font-mono text-[11px] font-bold text-stone-800 shadow-xs">
              Audio Icon
            </span>
            <div className="text-xs">
              <strong className="text-stone-900 block font-semibold">Voice Speech Readout</strong>
              <span className="text-stone-500 text-[11px]">Click the volume icon on any row to hear it aloud.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-stone-600" />
          <h3 className="text-sm font-bold text-stone-900">Frequently Asked Questions</h3>
        </div>

        <div className="divide-y divide-stone-100">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-stone-500 flex-shrink-0 ml-2" /> : <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0 ml-2" />}
                </button>

                {isOpen && (
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed pr-6 animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
