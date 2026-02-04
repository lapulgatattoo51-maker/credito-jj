
import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, Loader2, Camera, Navigation, ArrowRight, X, Ban, AlertTriangle, User, History } from 'lucide-react';
import { User as UserType, Loan, LoanStatus } from '../types';
import { supabase } from '../lib/supabase';

const CollectionModule: React.FC<{ user: UserType }> = ({ user }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [noPaymentMode, setNoPaymentMode] = useState(false);
  const [noPaymentReason, setNoPaymentReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  const fetchCollections = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const loansRes = await supabase
      .from('loans')
      .select('*, clients(name, nickname, address)')
      .eq('status', LoanStatus.ACTIVO)
      .order('created_at', { ascending: true });

    const paymentsTodayRes = await supabase
      .from('payments')
      .select('loan_id')
      .gte('payment_date', today);

    const visitedIds = new Set(paymentsTodayRes.data?.map(p => p.loan_id) || []);
    
    if (loansRes.data) {
      const sorted = loansRes.data.map(l => ({
        ...l,
        isVisited: visitedIds.has(l.id)
      })).sort((a, b) => (a.isVisited === b.isVisited) ? 0 : a.isVisited ? 1 : -1);
      
      setLoans(sorted as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const captureGPS = () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización");
    
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      alert("📍 Ubicación capturada con éxito");
    }, (err) => {
      alert("Error al capturar GPS: " + err.message);
    });
  };

  const handleAction = async (isNoPayment = false) => {
    if (!selectedLoan) return;
    if (!isNoPayment && paymentAmount <= 0) return;
    if (isNoPayment && !noPaymentReason) return alert("Por favor selecciona un motivo");

    setSubmitting(true);

    const { error: pError } = await supabase.from('payments').insert([{
      loan_id: selectedLoan.id,
      client_id: selectedLoan.client_id,
      amount: isNoPayment ? 0 : paymentAmount,
      collector_id: user.id,
      type: isNoPayment ? 'NO_PAGO' : (paymentAmount >= selectedLoan.installment_value ? 'COMPLETO' : 'PARCIAL'),
      observation: isNoPayment ? noPaymentReason : 'Pago regular',
      latitude: coords?.lat,
      longitude: coords?.lng
    }]);

    if (!pError) {
      if (!isNoPayment) {
        await supabase.from('cash_transactions').insert([{
          type: 'INGRESO',
          category: 'COBRO',
          amount: paymentAmount,
          description: `Cobro a ${(selectedLoan.clients as any)?.name}`,
          user_id: user.id
        }]);

        const newBalance = selectedLoan.balance - paymentAmount;
        const newStatus = newBalance <= 0 ? LoanStatus.CANCELADO : LoanStatus.ACTIVO;
        
        await supabase.from('loans').update({ 
          balance: newBalance,
          status: newStatus 
        }).eq('id', selectedLoan.id);
      }

      setSelectedLoan(null);
      setNoPaymentMode(false);
      setNoPaymentReason('');
      setCoords(null);
      fetchCollections();
    } else {
      alert("Error: " + pError.message);
    }
    setSubmitting(false);
  };

  const filteredLoans = loans.filter(l => 
    l.clients?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = loans.filter(l => !(l as any).isVisited).length;
  const visitedCount = loans.length - pendingCount;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-6">Hoja de Cobro</h1>
          <div className="grid grid-cols-2 gap-6 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
            <div>
              <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest mb-1">Pendientes</p>
              <p className="text-3xl font-black">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest mb-1">Visitados</p>
              <p className="text-3xl font-black text-emerald-400">{visitedCount}</p>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative group">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" placeholder="Buscar por nombre..."
          className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs font-bold uppercase tracking-widest">Organizando ruta...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <div 
              key={loan.id} 
              className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center group shadow-sm ${
                (loan as any).isVisited 
                ? 'bg-slate-50 border-slate-100 opacity-60' 
                : 'bg-white border-slate-100 hover:border-indigo-200 active:scale-[0.98]'
              }`}
              onClick={() => {
                if (!(loan as any).isVisited) {
                  setSelectedLoan(loan);
                  setPaymentAmount(loan.installment_value);
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                  (loan as any).isVisited ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {(loan.clients as any)?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{(loan.clients as any)?.name}</h3>
                  <div className="flex items-center text-[11px] text-slate-400 font-bold mt-0.5">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate max-w-[150px]">{(loan.clients as any)?.address}</span>
                  </div>
                  <div className="flex items-center mt-2 space-x-3">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase">
                      Cuota: ${loan.installment_value}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Saldo: ${loan.balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {(loan as any).isVisited ? (
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div className="bg-indigo-600 text-white p-2.5 rounded-2xl group-hover:shadow-lg group-hover:shadow-indigo-100 transition-all">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-xl">
                <History size={14} className="text-indigo-600 mr-2" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ficha de Cobro</span>
              </div>
              <button onClick={() => { setSelectedLoan(null); setNoPaymentMode(false); }} className="p-2 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"><X size={28}/></button>
            </div>
            
            <div className="mb-8 text-center">
              <h4 className="text-2xl font-black text-slate-900">{(selectedLoan.clients as any)?.name}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Saldo: ${selectedLoan.balance.toLocaleString()}</p>
            </div>

            {!noPaymentMode ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Monto Recibido</label>
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-black text-slate-300 mr-2">$</span>
                    <input 
                      type="number" 
                      className="w-full max-w-[200px] bg-transparent text-center text-5xl font-black text-slate-900 outline-none placeholder:text-slate-200" 
                      value={paymentAmount || ''} 
                      onChange={e => setPaymentAmount(Number(e.target.value))}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center py-4 bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"><Camera size={18} className="mr-2"/>Foto</button>
                  <button 
                    onClick={captureGPS}
                    className={`flex items-center justify-center py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors border ${coords ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
                  >
                    <Navigation size={18} className="mr-2"/>{coords ? 'GPS OK' : 'GPS'}
                  </button>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setNoPaymentMode(true)}
                    className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-colors flex items-center justify-center"
                  >
                    <Ban size={18} className="mr-2" /> No Pagó
                  </button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleAction(false)}
                    className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    {submitting ? 'Registrando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                  <h5 className="font-black text-[11px] uppercase tracking-widest text-rose-700 mb-4 flex items-center">
                    <AlertTriangle size={14} className="mr-2" /> Motivo del No Pago
                  </h5>
                  <div className="space-y-3">
                    {['No estaba', 'No tiene dinero', 'Se negó', 'Falleció/Huyó', 'Cerrado'].map(reason => (
                      <button 
                        key={reason}
                        onClick={() => setNoPaymentReason(reason)}
                        className={`w-full p-4 rounded-2xl text-left text-sm font-bold transition-all border ${
                          noPaymentReason === reason ? 'bg-rose-600 text-white border-rose-600 shadow-lg' : 'bg-white text-rose-900 border-rose-100 hover:border-rose-300'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { setNoPaymentMode(false); setNoPaymentReason(''); }}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Volver
                  </button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleAction(true)}
                    className="flex-[2] py-5 bg-rose-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-rose-100 disabled:opacity-50 hover:bg-rose-700 active:scale-95 transition-all"
                  >
                    {submitting ? 'Procesando...' : 'Guardar Reporte'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionModule;
