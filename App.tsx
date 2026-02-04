
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ClientModule from './components/ClientModule';
import LoanModule from './components/LoanModule';
import CollectionModule from './components/CollectionModule';
import AccountingModule from './components/AccountingModule';
import RouteModule from './components/RouteModule';
import BottomNav from './components/BottomNav';
import { User, UserRole } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Auth states
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Escuchar cambios de sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setError('');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setAuthLoading(true);

    try {
      if (isRegistering) {
        // --- PROCESO DE REGISTRO ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: UserRole.ADMIN
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setError('Este correo ya está registrado. Intenta iniciar sesión.');
            setIsRegistering(false); // Cambiar a modo login automáticamente
          } else {
            setError(signUpError.message);
          }
        } else if (data.user && data.session) {
          // Registro exitoso con login automático
          setSession(data.session);
        } else if (data.user && !data.session) {
          // Requiere confirmación por correo (Configuración por defecto de Supabase)
          setError('¡Cuenta creada! Por seguridad, DEBES revisar tu correo y confirmar tu cuenta antes de poder entrar.');
        }
      } else {
        // --- PROCESO DE LOGIN ---
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Correo o contraseña incorrectos. Verifica tus datos o regístrate si no tienes cuenta.');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o SPAM.');
          } else {
            setError(signInError.message);
          }
        }
      }
    } catch (err: any) {
      setError('Error de conexión. Revisa tu internet e inténtalo de nuevo.');
      console.error('Auth error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iniciando Prestamos20...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 sm:p-0">
        <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200 -rotate-3 hover:rotate-0 transition-transform duration-300">
               <span className="text-white text-4xl font-black">20</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isRegistering ? 'Únete Gratis' : 'Bienvenido'}
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">
              {isRegistering ? 'Gestión Profesional de Cobranza' : 'Sistema de Préstamos al 20%'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className={`p-4 rounded-2xl border text-center animate-in zoom-in duration-300 ${error.includes('Cuenta creada') ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                <p className="text-[11px] font-bold leading-tight">
                  {error}
                </p>
              </div>
            )}
            
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                  placeholder="Ej: Pedro Martínez"
                  required={isRegistering}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                placeholder="tu@correo.com"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 mt-6 active:scale-95 disabled:opacity-50 flex items-center justify-center"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isRegistering ? 'Crear mi cuenta ahora' : 'Ingresar al sistema'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
            >
              {isRegistering ? '¿Ya eres usuario? Inicia sesión' : '¿Nuevo aquí? Crea tu cuenta gratis'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user: User = {
    id: session.user.id,
    username: session.user.email?.split('@')[0] || 'usuario',
    name: session.user.user_metadata?.full_name || session.user.email,
    role: (session.user.user_metadata?.role as UserRole) || UserRole.ADMIN
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <ClientModule />;
      case 'loans': return <LoanModule />;
      case 'collections': return <CollectionModule user={user} />;
      case 'cashflow': return <AccountingModule />;
      case 'routes': return <RouteModule />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <div className="hidden lg:block">
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pb-24 lg:pb-0`}>
        <Navbar user={user} onLogout={handleLogout} />
        <main className="p-4 sm:p-6 lg:p-10 flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <BottomNav user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
