
import React from 'react';
import { MENU_ITEMS } from '../constants';
import { User } from '../types';

interface BottomNavProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ user, activeTab, setActiveTab }) => {
  // Solo mostramos los 5 items más importantes en móviles
  const mobileMenu = MENU_ITEMS.filter(item => item.roles.includes(user.role)).slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {mobileMenu.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl transition-all ${
            activeTab === item.id 
            ? 'text-indigo-600' 
            : 'text-slate-400'
          }`}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-50' : ''}`}>
            {item.icon}
          </div>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">
            {item.label === 'Cobranza Diaria' ? 'Cobros' : item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
