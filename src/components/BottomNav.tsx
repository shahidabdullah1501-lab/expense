import React from 'react';
import { 
  Rotate3d, 
  Receipt, 
  BarChart3, 
  ShieldCheck, 
  Download,
  Plus
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onOpenExportModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTransaction,
  onOpenExportModal,
}) => {
  const tabs = [
    { id: 'dashboard', label: '3D View', icon: Rotate3d },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[60px] min-h-[48px] rounded-xl transition-all ${
                isActive
                  ? 'text-brand-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-brand-500/15' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Quick Action Button in Bottom Nav */}
        <button
          onClick={onOpenNewTransaction}
          className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-glow-teal -translate-y-3 min-h-[50px] min-w-[50px] active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Export Tab */}
        <button
          onClick={onOpenExportModal}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-w-[60px] min-h-[48px] rounded-xl text-slate-400 hover:text-brand-400 transition-all"
        >
          <div className="p-1 rounded-lg">
            <Download className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Export</span>
        </button>
      </div>
    </nav>
  );
};
