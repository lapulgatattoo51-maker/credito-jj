
import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, MapPin, UserCheck, Loader2, X, Map as MapIcon, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Client, ClientStatus, ClientType, Route } from '../types';
import { STATUS_COLORS } from '../constants';
import { supabase } from '../lib/supabase';

const ClientModule: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, routesRes] = await Promise.all([
        supabase.from('clients').select('*').order('name', { ascending: true }),
        supabase.from('routes').select('*').order('name', { ascending: true })
      ]);
      
      if (clientsRes.data) setClients(clientsRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('clients').insert([{
      name: formData.name,
      nickname: formData.nickname,
      document_id: formData.document_id,
      address: formData.address,
      phones: [formData.phone],
      type: formData.type,
      route_id: formData.route_id || null,
      status: ClientStatus.ACTIVO
    }]);

    if (!error) {
      setIsModalOpen(false);
      setFormData({ name: '', nickname: '', document_id: '', address: '', phone: '', type: ClientType.NORMAL, route_id: '' });
      setMessage({ text: 'Cliente registrado con éxito', type: 'success' });
      fetchData();
    } else {
      setMessage({ text: 'Error al registrar: ' + error.message, type: 'error' });
    }
    setSaving(false);
  };

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    document_id: '',
    address: '',
    phone: '',
    type: ClientType.NORMAL,
    route_id: ''
  });

  const handleDeleteClient = async (id: string, name: string) => {
    const confirmed = window.confirm(`¿Estás seguro de eliminar a "${name}"? Se borrarán también todos sus préstamos y pagos.`);
    
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const { error, status } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') {
          setMessage({ 
            text: 'No se puede eliminar: Aplica primero el código SQL en Supabase para habilitar el borrado en cascada.', 
            type: 'error' 
          });
        } else {
          setMessage({ text: `Error ${error.code}: ${error.message}`, type: 'error' });
        }
      } else if (status === 204 || status === 200) {
        setClients(prev => prev.filter(c => c.id !== id));
        setMessage({ text: `Cliente "${name}" eliminado correctamente`, type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: 'Error de conexión al intentar eliminar.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.document_id.includes(searchTerm) || 
                          (c.nickname && c.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRoute = routeFilter === 'ALL' || c.route_id === routeFilter;
    return matchesSearch && matchesRoute;
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20">
      {/* Toast de Mensajes */}
      {message && (
        <div className={`fixed top-20 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center animate-in slide-in-from-right duration-300 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="mr-2" size={20} /> : <AlertCircle className="mr-2" size={20} />}
          <p className="text-xs font-bold">{message.text}</p>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clientes</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Directorio de deudores</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={18} className="mr-2" />
            Nuevo
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, apodo o cédula..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select 
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 outline-none shadow-sm min-w-[140px]"
          >
            <option value="ALL">Todas las Rutas</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs font-bold uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative hover:border-indigo-100 transition-all group overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-lg border border-indigo-100">
                    {client.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-bold text-slate-900">{client.name}</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{client.nickname || 'Sin apodo'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${STATUS_COLORS[client.status as keyof typeof STATUS_COLORS] || 'bg-slate-100'}`}>
                    {client.status}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClient(client.id, client.name);
                    }}
                    disabled={deletingId === client.id}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Eliminar Cliente"
                  >
                    {deletingId === client.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-50">
                <div className="flex items-center text-slate-500">
                  <Phone size={12} className="mr-2" />
                  <span className="text-[11px] font-bold">{client.phones?.[0] || 'N/A'}</span>
                </div>
                <div className="flex items-center text-slate-500">
                  <UserCheck size={12} className="mr-2" />
                  <span className="text-[11px] font-bold">{client.document_id}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center text-slate-400">
                <MapPin size={12} className="mr-2 shrink-0" />
                <span className="text-[10px] truncate">{client.address}</span>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <AlertCircle size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay resultados</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Registrar Cliente</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cédula</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.document_id} onChange={e => setFormData({...formData, document_id: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                <textarea required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-20 resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <button disabled={saving} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 hover:bg-indigo-700 active:scale-95 transition-all">
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientModule;
