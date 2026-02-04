
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Printer, Share2, Calculator, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AccountingModule: React.FC = () => {
  const [data, setData] = useState({
    ingresos: 0,
    egresos: 0,
    transactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const fetchAccounting = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const { data: trans, error } = await supabase
      .from('cash_transactions')
      .select('*')
      .gte('created_at', today)
      .order('created_at', { ascending: false });

    if (!error && trans) {
      const ingresos = trans.filter(t => t.type === 'INGRESO').reduce((acc, t) => acc + t.amount, 0);
      const egresos = trans.filter(t => t.type === 'EGRESO').reduce((acc, t) => acc + t.amount, 0);
      setData({ ingresos, egresos, transactions: trans });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounting();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuadre de Caja</h1>
          <p className="text-slate-500">Transacciones de hoy: {new Date().toLocaleDateString()}</p>
        </div>
        <button onClick={fetchAccounting} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
           <Calculator size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center text-emerald-600 mb-1">
                <ArrowDownCircle size={14} className="mr-1" />
                <span className="text-[10px] font-bold uppercase">Ingresos</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">${data.ingresos.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center text-rose-600 mb-1">
                <ArrowUpCircle size={14} className="mr-1" />
                <span className="text-[10px] font-bold uppercase">Egresos</span>
              </div>
              <p className="text-2xl font-bold text-rose-700">${data.egresos.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historial de Hoy</h4>
            <div className="divide-y divide-slate-100">
              {data.transactions.length > 0 ? data.transactions.map((t, i) => (
                <div key={i} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">{t.description}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{t.category}</span>
                  </div>
                  <span className={`text-sm font-bold ${t.type === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'INGRESO' ? '+' : '-'}${t.amount.toLocaleString()}
                  </span>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-400 text-sm italic">No hay movimientos registrados hoy.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Balance Neto en Caja</p>
                <p className="text-3xl font-bold">${(data.ingresos - data.egresos).toLocaleString()}</p>
              </div>
              <Wallet size={32} className="text-indigo-400 opacity-50" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
            <Share2 size={32} className="text-indigo-600 mb-4" />
            <h4 className="font-bold text-indigo-900 mb-2">Enviar Reporte</h4>
            <p className="text-xs text-indigo-700 mb-4 leading-relaxed">
              Comparte el balance del día con el supervisor vía WhatsApp.
            </p>
            <button 
              onClick={() => {
                const msg = `*CIERRE DE CAJA - ${new Date().toLocaleDateString()}*\n\nIngresos: $${data.ingresos}\nEgresos: $${data.egresos}\nBalance Neto: $${data.ingresos - data.egresos}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md"
            >
              Enviar a WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingModule;
