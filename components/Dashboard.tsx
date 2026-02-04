
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  Calendar,
  CheckCircle,
  MapPin,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const MetricCard = ({ title, value, subtitle, icon, color }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">{title}</p>
    <h3 className="text-xl font-bold text-slate-900">{value}</h3>
    <p className="text-slate-400 text-[9px] font-medium mt-0.5">{subtitle}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    activeLoans: 0,
    totalLent: 0,
    collectedToday: 0,
    pendingToday: 0,
    visitedCount: 0,
    totalToVisit: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const [clientsRes, loansRes, paymentsRes] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact' }),
      supabase.from('loans').select('amount, status, balance, installment_value').eq('status', 'ACTIVO'),
      supabase.from('payments').select('amount, loan_id').gte('payment_date', today)
    ]);

    const activeLoansCount = loansRes.data?.length || 0;
    const totalLent = loansRes.data?.reduce((acc, l) => acc + l.amount, 0) || 0;
    const collectedToday = paymentsRes.data?.reduce((acc, p) => acc + p.amount, 0) || 0;
    
    // Calcular visitados hoy (clientes que tienen un registro en payments hoy, sea pago o no pago)
    const visitedLoanIds = new Set(paymentsRes.data?.map(p => p.loan_id));
    const visitedCount = visitedLoanIds.size;
    const pendingToday = (loansRes.data?.reduce((acc, l) => acc + l.installment_value, 0) || 0) - collectedToday;

    setMetrics({
      totalClients: clientsRes.count || 0,
      activeLoans: activeLoansCount,
      totalLent,
      collectedToday,
      pendingToday: Math.max(0, pendingToday),
      visitedCount,
      totalToVisit: activeLoansCount
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const visitPercentage = metrics.totalToVisit > 0 ? Math.round((metrics.visitedCount / metrics.totalToVisit) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumen de Operaciones</p>
        </div>
        <button onClick={fetchMetrics} className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-sm active:scale-95 transition-transform">
           <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Cobrado Hoy" 
          value={`$${metrics.collectedToday.toLocaleString()}`} 
          subtitle="Capital + Interés" 
          icon={<CheckCircle size={20} className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <MetricCard 
          title="Por Cobrar" 
          value={`$${metrics.pendingToday.toLocaleString()}`} 
          subtitle="Pendiente hoy" 
          icon={<DollarSign size={20} className="text-indigo-600" />} 
          color="bg-indigo-50"
        />
        <MetricCard 
          title="Visitas" 
          value={`${metrics.visitedCount}/${metrics.totalToVisit}`} 
          subtitle={`${visitPercentage}% completado`} 
          icon={<MapPin size={20} className="text-amber-600" />} 
          color="bg-amber-50"
        />
        <MetricCard 
          title="Cartera Total" 
          value={`$${metrics.totalLent.toLocaleString()}`} 
          subtitle="Capital en calle" 
          icon={<TrendingUp size={20} className="text-blue-600" />} 
          color="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">Rendimiento de Cobro</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500 uppercase">Eficiencia de Ruta</span>
                <span className="text-indigo-600">{visitPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${visitPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{metrics.totalClients}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Clientes Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{metrics.activeLoans}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Préstamos Activos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Estado de Ganancias</h3>
              <p className="text-sm text-indigo-200 mb-6">Proyección del 20% sobre cartera activa.</p>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Ganancia Esperada</p>
                <p className="text-4xl font-black">${(metrics.totalLent * 0.2).toLocaleString()}</p>
              </div>
           </div>
           <div className="absolute -bottom-10 -right-10 opacity-10">
              <DollarSign size={200} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
