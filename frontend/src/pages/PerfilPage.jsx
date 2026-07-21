import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../services/api';
import { User, Lock, KeyRound, Save, Phone, CheckCircle, ShieldCheck, BadgeCheck, ShieldAlert } from 'lucide-react';

const PerfilPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' o 'password'

  // Form Datos Personales
  const [nombre, setNombre] = useState(user?.nombre_completo || '');
  const [telefono, setTelefono] = useState('');
  
  // Form Cambiar Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateDatos = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        nombre,
        telefono
      });
      setMsg(res.data.message || '✅ Datos personales actualizados correctamente.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al actualizar datos personales.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Por favor ingrese su contraseña actual.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setMsg(res.data.message || '✅ Contraseña actualizada exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al cambiar contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/10">
            <User size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Gestión de Mi Perfil <BadgeCheck className="text-orange-400" size={20} />
            </h2>
            <p className="text-xs text-zinc-400">Actualiza tus datos personales de contacto y credenciales de acceso al sistema</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" size={18} />
          <span className="text-zinc-300">Rol Activo: <strong className="text-orange-400">{user?.rol || 'Usuario'}</strong></span>
        </div>
      </div>

      {/* Tabs Principales de Navegación */}
      <div className="flex gap-3 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800">
        <button
          type="button"
          onClick={() => { setActiveTab('datos'); setErrorMsg(''); setMsg(''); }}
          className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'datos' 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <User size={18} /> Pestaña 1: Mis Datos Personales
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('password'); setErrorMsg(''); setMsg(''); }}
          className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'password' 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <KeyRound size={18} /> Pestaña 2: Cambiar Contraseña
        </button>
      </div>

      {/* Mensajes Globales */}
      {msg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle size={20} /> {msg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <ShieldAlert size={20} /> {errorMsg}
        </div>
      )}

      {/* Contenido Pestaña 1: Datos Personales */}
      {activeTab === 'datos' && (
        <div className="glass-panel p-8 space-y-6 border-zinc-800">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Editar Datos Personales</h3>
            <p className="text-xs text-zinc-400">Modifica tus nombres y datos de contacto en la base de datos de la anticuchería</p>
          </div>

          <form onSubmit={handleUpdateDatos} className="space-y-6 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Nombre Completo</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del trabajador o cliente"
                icon={<User size={18} />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Número de Teléfono / Celular</label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 943881245"
                icon={<Phone size={18} />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Nombre de Usuario (Identificador)</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 text-sm cursor-not-allowed font-mono"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">El nombre de usuario es tu identificador único de cuenta.</span>
            </div>

            <Button
              type="submit"
              className="py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Guardando Datos...' : 'Guardar Datos Personales'}
            </Button>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 2: Cambiar Contraseña */}
      {activeTab === 'password' && (
        <div className="glass-panel p-8 space-y-6 border-zinc-800">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Seguridad y Cambio de Contraseña</h3>
            <p className="text-xs text-zinc-400">Actualiza tu contraseña para mantener protegida tu cuenta en el sistema</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Contraseña Actual</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu clave actual"
                icon={<Lock size={18} />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Nueva Contraseña</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Escribe la nueva contraseña"
                icon={<KeyRound size={18} />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Confirmar Nueva Contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                icon={<KeyRound size={18} />}
              />
            </div>

            <Button
              type="submit"
              className="py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Actualizando Clave...' : 'Actualizar Mi Contraseña'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PerfilPage;
