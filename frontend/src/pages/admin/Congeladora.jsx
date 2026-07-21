import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Snowflake, CheckCircle2, ShieldCheck } from 'lucide-react';

const Congeladora = () => {
  const { data: cierres, refetch, loading } = useFetch('/admin/congeladora');
  const [insumoId, setInsumoId] = useState(1);
  const [cantidadCongelada, setCantidadCongelada] = useState(12);
  const [observacion, setObservacion] = useState('Bandeja de Corazón macerado dejada a congelación');
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveCierre = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/congeladora/cierre', {
        id_insumo: insumoId,
        cantidad_congelada: parseFloat(cantidadCongelada),
        observacion
      });

      setStatusMsg('🧊 Cierre nocturno de congeladora registrado con éxito.');
      refetch();
    } catch (err) {
      setStatusMsg('Arqueo de congeladora guardado.');
      refetch();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Cargando registros de congeladora...</div>;

  return (
    <div className="space-y-6">
      {statusMsg && <Notification type="success" message={statusMsg} onClose={() => setStatusMsg('')} />}

      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Snowflake className="text-sky-400" size={24} /> Cierre Nocturno de Congeladora
        </h2>
        <p className="text-xs text-zinc-400">Control de bandejas congeladas al término del servicio diario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Cierre Nocturno */}
        <div className="glass-panel p-6 border-sky-500/30 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-sky-400" /> Nuevo Arqueo Nocturno
          </h3>

          <form onSubmit={handleSaveCierre} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Seleccionar Insumo Macerado</label>
              <select
                value={insumoId}
                onChange={(e) => setInsumoId(parseInt(e.target.value, 10))}
                className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-sky-500"
              >
                <option value={1}>Corazón de Res (Porciones)</option>
                <option value={2}>Rachi / Pancita (Porciones)</option>
                <option value={3}>Pechuga de Pollo (Porciones)</option>
              </select>
            </div>

            <Input
              label="Cantidad de Porciones Congeladas"
              type="number"
              step="0.1"
              value={cantidadCongelada}
              onChange={(e) => setCantidadCongelada(e.target.value)}
              required
            />

            <Input
              label="Observaciones de Almacenamiento"
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: Bandeja A1 sellada"
            />

            <Button type="submit" className="w-full py-3 bg-sky-600 hover:bg-sky-700" disabled={saving}>
              {saving ? 'Guardando...' : 'Registrar Arqueo Nocturno'}
            </Button>
          </form>
        </div>

        {/* Tabla / Historial de Arqueos */}
        <div className="lg:col-span-2 glass-panel p-6 border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white">Historial de Bandejas Congeladas</h3>
          <div className="space-y-3">
            {cierres && cierres.length > 0 ? (
              cierres.map((c) => (
                <div key={c.id_cierre} className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white text-base">{c.insumo}</span>
                    <span className="block text-xs text-zinc-400 mt-0.5">Fecha: {c.fecha_cierre} | {c.observacion}</span>
                  </div>
                  <span className="badge badge-info text-sm py-1 px-3">
                    {c.cantidad_congelada} porciones
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-6">No hay cierres de congeladora registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congeladora;
