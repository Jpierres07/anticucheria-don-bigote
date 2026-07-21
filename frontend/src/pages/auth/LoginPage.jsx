import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import { Flame, UserPlus, LogIn, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Campos adicionales para Registro
  const [tipoUsuario, setTipoUsuario] = useState('Cliente'); // 'Cliente' | 'Trabajador'
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingReg, setLoadingReg] = useState(false);

  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const result = await login(username, password);

    if (result.success) {
      const role = result.user.rol;
      if (role === 'Administradora, Parrillera y Ventas' || role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (role?.includes('Atención') || role?.includes('Mozo')) {
        navigate('/salon/mesas');
      } else {
        navigate('/cliente/carta');
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingReg(true);

    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        tipo_usuario: tipoUsuario,
        nombre,
        apellido,
        dni: dni || username,
        telefono
      });

      setSuccessMsg(res.data.message);
      if (tipoUsuario === 'Cliente') {
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('¡Registro exitoso! Por favor inicia sesión.');
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al procesar el registro.');
    } finally {
      setLoadingReg(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Decorativo de Parrilla */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 border border-orange-500/20 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-ember flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
            <Flame className="text-white fill-white animate-glow" size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">ANTICUCHERÍA</h2>
          <h3 className="text-xl font-bold text-gradient">DON BIGOTE</h3>
        </div>

        {/* Switcher de Modo: Iniciar Sesión / Registrarse */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn size={14} /> Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} /> Crear Cuenta
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Usuario / DNI"
              type="text"
              allowType="alphanumeric"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: norma.shuan"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? 'Autenticando...' : 'Ingresar al Sistema'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">Tipo de Registro:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoUsuario('Cliente')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    tipoUsuario === 'Cliente' 
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  👤 Cliente Web
                </button>
                <button
                  type="button"
                  onClick={() => setTipoUsuario('Trabajador')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    tipoUsuario === 'Trabajador' 
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  💼 Trabajador
                </button>
              </div>
            </div>

            {tipoUsuario === 'Trabajador' && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Los trabajadores se registran con el rol <b>Atención al Cliente</b> y requieren <b>Aprobación previa de la Administradora (Sra. Norma)</b> para poder ingresar.
                </span>
              </div>
            )}

            <Input
              label="Nombres"
              type="text"
              allowType="letters"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan"
              required
            />

            <Input
              label="Apellidos"
              type="text"
              allowType="letters"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ej: Perez"
            />

            <Input
              label="DNI (8 dígitos)"
              type="text"
              allowType="numeric"
              maxLength={8}
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 71234567"
              required
            />

            <Input
              label="Usuario para Iniciar Sesión"
              type="text"
              allowType="alphanumeric"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: angel.milla"
              required
            />

            <Input
              label="Teléfono / Celular"
              type="text"
              allowType="numeric"
              maxLength={9}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 987654321"
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full py-3 text-base mt-2" disabled={loadingReg}>
              {loadingReg ? 'Procesando Registro...' : `Registrar como ${tipoUsuario}`}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
