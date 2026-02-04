
import React from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="h-14 lg:h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center">
        <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-black text-sm">P</span>
        </div>
        <h2 className="text-sm font-bold text-slate-800 lg:hidden truncate max-w-[120px]">Prestamos20</h2>
        
        {/* Only search on Desktop in Navbar to save space */}
        <div className="hidden lg:flex items-center max-w-xs ml-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-4 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
        
        <div className="h-6 w-px bg-slate-100"></div>
        
        <div className="flex items-center">
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-[10px] font-bold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-0.5">{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
