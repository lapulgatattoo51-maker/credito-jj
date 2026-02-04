
import React, { useState, useEffect, useRef } from 'react';
import { Plus, HandCoins, Info, FileText, Loader2, X, Share2, CheckCircle2, TrendingUp, Trash2 } from 'lucide-react';
import { Loan, LoanFrequency, LoanStatus, Client } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../lib/supabase';

const LoanModule: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    amount: 0,
    installments: 20,
    frequency: LoanFrequency.DIARIO
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [loansRes, clientsRes] = await Promise.all([
        supabase.from('loans').select('*, clients(name, nickname, document_id, address)').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name').order('name', { ascending: true })
      ]);
      
      if (loansRes.data) setLoans(loansRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || formData.amount <= 0) return;
    setSaving(true);

    const interest = formData.amount * 0.2;
    const total_to_pay = formData.amount + interest;
    const installment_value = total_to_pay / formData.installments;

    const { data: loanData, error } = await supabase.from('loans').insert([{
      client_id: formData.client_id,
      amount: formData.amount,
      interest: interest,
      total_to_pay: total_to_pay,
      installments: formData.installments,
      installment_value: Math.ceil(installment_value),
      frequency: formData.frequency,
      balance: total_to_pay,
      status: LoanStatus.ACTIVO
    }]).select();

    if (!error && loanData) {
      const clientName = clients.find(c => c.id === formData.client_id)?.name;
      await supabase.from('cash_transactions').insert([{
        type: 'EGRESO',
        category: 'PRESTAMO',
        amount: formData.amount,
        description: `Desembolso préstamo a ${clientName}`,
      }]);

      setIsModalOpen(false);
      setFormData({ client_id: '', amount: 0, installments: 20, frequency: LoanFrequency.DIARIO });
      fetchInitialData();
    } else {
      alert("Error: " + error?.message);
    }
    setSaving(false);
  };

  const handleDeleteLoan = async (id: string) => {
    const confirmed = window.confirm("¿Estás seguro de eliminar este préstamo? Esto también borrará el historial de pagos asociado.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      // Nota: Si configuraste "Cascade Delete" en Supabase, esto borrará los pagos también.
      const { error, status } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Error al eliminar: " + error.message);
      } else if (status === 204 || status === 200) {
        setLoans(prev => prev.filter(l => l.id !== id));
        setSelectedLoan(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsSigning(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const pos = getPos(e);
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSigning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const totalBalance = loans.reduce((acc, l) => acc + l.balance, 0);
  const totalInterest = loans.reduce((acc, l) => acc + l.interest, 0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Préstamos</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión 20%</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center font-bold text-sm shadow-lg shadow-indigo-100"
        >
          <Plus size={18} className="mr-2" /> NUEVO
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">En calle</p>
          <p className="text-2xl font-black">${totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-600 p-5 rounded-3xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Ganancia</p>
          <p className="text-2xl font-black">${totalInterest.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <div 
              key={loan.id} 
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all cursor-pointer relative"
              onClick={() => setSelectedLoan(loan)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <FileText size={18} />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-slate-900">{(loan.clients as any)?.name}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase">ID: {loan.id.slice(0, 6)}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${STATUS_COLORS[loan.status as keyof typeof STATUS_COLORS] || 'bg-slate-100'}`}>
                  {loan.status}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black mb-0.5">Saldo</p>
                  <p className="text-lg font-black text-indigo-600">${loan.balance.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-400 uppercase font-black mb-0.5">Cuota</p>
                  <p className="text-xs font-bold text-slate-700">${loan.installment_value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Préstamo remains identical but consistent in styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Nuevo Desembolso</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-4">
              <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required placeholder="Capital" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                <input type="number" required placeholder="Cuotas" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})} />
              </div>
              <div className="bg-indigo-900 p-5 rounded-2xl text-white text-center">
                <p className="text-[9px] font-black uppercase text-indigo-300">Total a Pagar (20%)</p>
                <p className="text-2xl font-black">${(formData.amount * 1.2).toLocaleString()}</p>
              </div>
              <button disabled={saving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">
                {saving ? 'Procesando...' : 'Desembolsar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visor de Pagaré / Detalle de Préstamo */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-3">
                    <FileText size={20} />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tighter">Detalle de Préstamo</h2>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><X size={28}/></button>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <div>
                  <h4 className="text-rose-900 font-bold text-sm">Zona de Peligro</h4>
                  <p className="text-rose-600 text-[10px] font-medium">Borrar el préstamo eliminará todos los registros de cobro.</p>
                </div>
                <button 
                  onClick={() => handleDeleteLoan(selectedLoan.id)}
                  disabled={deletingId === selectedLoan.id}
                  className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center"
                >
                  {deletingId === selectedLoan.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} className="mr-2" />}
                  Eliminar Préstamo
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm leading-relaxed">
                Pagaré a favor de <span className="font-bold">Prestamos20</span> suscrito por <span className="font-bold">{(selectedLoan.clients as any)?.name}</span> por el valor de <span className="font-bold">${selectedLoan.total_to_pay.toLocaleString()}</span>.
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Firma Digital</p>
                <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 overflow-hidden h-40 relative touch-none">
                   <canvas 
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={() => setIsSigning(false)}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                   />
                   <button 
                    onClick={clearSignature}
                    className="absolute bottom-4 right-4 text-[10px] font-black bg-white border border-slate-200 px-3 py-1.5 rounded-lg uppercase text-slate-400"
                   >Limpiar</button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const msg = `*COMPROBANTE PRESTAMOS20*\n\nCliente: ${(selectedLoan.clients as any)?.name}\nSaldo: $${selectedLoan.balance}\nCuota: $${selectedLoan.installment_value}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center"
                >
                  <Share2 size={16} className="mr-2" /> WhatsApp
                </button>
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center"
                >
                  <CheckCircle2 size={16} className="mr-2" /> Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanModule;
