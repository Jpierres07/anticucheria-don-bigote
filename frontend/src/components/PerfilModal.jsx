import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from './common/Button';
import Input from './common/Input';
import api from '../services/api';
import { User, Lock, KeyRound, Save, X, Phone, CheckCircle } from 'lucide-react';

const PerfilModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' o 'password'
  const initialParts = (user?.nombre_completo || '').trim().split(' ');
  const defaultNombre = initialParts[0] || '';
  const defaultApellido = initialParts.slice(1).join(' ') || '';

  const [nombre, setNombre] = useState(defaultNombre);
  const [apellido, setApellido] = useState(defaultApellido);
  const [telefono, setTelefono] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (activeTab === 'password' && newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas nuevas no coinciden.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        nombre,
        apellido,
        telefono,
        current_password: currentPassword,
        new_password: activeTab === 'password' ? newPassword : ''
      });

      setMsg(res.data.message || '✅ Cambios guardados correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setMsg('');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-zinc-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <User size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mi Perfil</h3>
            <p className="text-xs text-zinc-400">{user?.rol || 'Usuario del Sistema'}</p>
          </div>
        </div>

        {/* Tabs de Selección */}
        <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => { setActiveTab('datos'); setErrorMsg(''); setMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'datos' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User size={15} /> Datos Personales
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setErrorMsg(''); setMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'password' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound size={15} /> Cambiar Contraseña
          </button>
        </div>

        {msg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={16} /> {msg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'datos' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Nombres</label>
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombres"
                    icon={<User size={16} />}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Apellidos</label>
                  <Input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Apellidos"
                    icon={<User size={16} />}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Teléfono / Celular (Opcional)</label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 987654321"
                  icon={<Phone size={16} />}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Contraseña Actual</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<Lock size={16} />}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Nueva Contraseña</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  icon={<KeyRound size={16} />}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Confirmar Nueva Contraseña</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita nueva contraseña"
                  icon={<KeyRound size={16} />}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="submit"
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-4 font-bold"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilModal;
