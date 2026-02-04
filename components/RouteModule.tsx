
import React, { useState, useEffect } from 'react';
import { Plus, Map, Edit2, Trash2, Loader2, X, MapPin } from 'lucide-react';
import { Route } from '../types';
import { supabase } from '../lib/supabase';

const RouteModule: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    const { data } = await supabase.from('routes').select('*').order('name', { ascending: true });
    if (data) setRoutes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('routes').insert([{ name, description }]);
    if (!error) {
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchRoutes();
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rutas de Cobro</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Organiza tus zonas de operación</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center font-bold text-sm shadow-lg shadow-indigo-100"
        >
          <Plus size={18} className="mr-2" /> Crear Ruta
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map(route => (
            <div key={route.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Map size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{route.name}</h3>
                  <p className="text-xs text-slate-400">{route.description || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18}/></button>
                <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Nueva Ruta</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-4">
              <input 
                required placeholder="Nombre de la ruta (Ej: Zona Norte)" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                value={name} onChange={e => setName(e.target.value)}
              />
              <textarea 
                placeholder="Descripción breve..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-24 resize-none"
                value={description} onChange={e => setDescription(e.target.value)}
              />
              <button 
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
              >
                {saving ? 'Guardando...' : 'Crear Ruta'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RouteModule;
