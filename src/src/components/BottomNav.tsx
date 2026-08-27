import React from 'react';
import { 
  BarChart3, 
  Rotate3d, 
  Wallet, 
  BookOpen, 
  ShieldCheck, 
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
}) => {
  const tabs = [
    { id: 'dashboard', label: '3D', icon: Rotate3d },
    { id: 'transactions', label: 'Ledger', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: ShieldCheck },
    { id: 'guide', label: 'Guide', icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAEB]/95 backdrop-blur-xl border-t border-stone-200/90 shadow-dropdown pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] ${
                isActive
                  ? 'text-stone-900 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#D5EBDA] border border-[#8CCA9A]' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-900' : 'text-stone-500'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Quick Action Button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex flex-col items-center justify-center py-1 px-2"
        >
          <div className="w-8 h-8 rounded-full bg-[#D5EBDA] border border-[#8CCA9A] flex items-center justify-center text-stone-900 shadow-sm active:scale-95 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 text-stone-700 font-semibold">Add</span>
        </button>
      </div>
    </nav>
  );
};
