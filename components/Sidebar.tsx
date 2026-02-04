
import React from 'react';
import { MENU_ITEMS } from '../constants';
import { User, UserRole } from '../types';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          {isOpen ? (
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Prestamos20
            </h1>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-500"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              {isOpen && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Badge */}
        <div className="p-4 border-t border-slate-100">
          {isOpen ? (
            <div className="bg-slate-50 p-3 rounded-xl flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
