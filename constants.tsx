
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  Receipt, 
  Wallet, 
  Settings, 
  Route as RouteIcon,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'SUPERVISOR', 'COBRADOR'] },
  { id: 'clients', label: 'Clientes', icon: <Users size={20} />, roles: ['ADMIN', 'SUPERVISOR'] },
  { id: 'loans', label: 'Préstamos', icon: <HandCoins size={20} />, roles: ['ADMIN', 'SUPERVISOR'] },
  { id: 'collections', label: 'Cobranza Diaria', icon: <Receipt size={20} />, roles: ['ADMIN', 'SUPERVISOR', 'COBRADOR'] },
  { id: 'cashflow', label: 'Caja y Cuadre', icon: <Wallet size={20} />, roles: ['ADMIN', 'SUPERVISOR'] },
  { id: 'routes', label: 'Rutas', icon: <RouteIcon size={20} />, roles: ['ADMIN'] },
  { id: 'settings', label: 'Configuración', icon: <Settings size={20} />, roles: ['ADMIN'] },
];

export const MOCK_USER = {
  id: 'u1',
  username: 'admin',
  role: 'ADMIN',
  name: 'Administrador Principal'
};

export const MOCK_ROUTES = [
  { id: 'r1', name: 'Norte - Sector A', description: 'Zona comercial norte' },
  { id: 'r2', name: 'Sur - Sector B', description: 'Zona residencial sur' },
];

export const STATUS_COLORS = {
  ACTIVO: 'bg-green-100 text-green-800',
  AL_DIA: 'bg-blue-100 text-blue-800',
  ATRASADO: 'bg-amber-100 text-amber-800',
  VENCIDO: 'bg-red-100 text-red-800',
  CANCELADO: 'bg-slate-100 text-slate-800',
  MOROSO: 'bg-orange-100 text-orange-800',
  BLOQUEADO: 'bg-red-200 text-red-900',
};
