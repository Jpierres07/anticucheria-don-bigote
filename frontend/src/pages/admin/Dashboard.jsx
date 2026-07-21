import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { DollarSign, ShoppingBag, AlertTriangle, Calendar, TrendingUp, Award, Flame, UserCheck, Printer } from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const Dashboard = () => {
  const { data, loading, error } = useFetch('/admin/dashboard');

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Cargando métricas financieras para Sra. Norma...</div>;
  if (error) return <div className="text-center py-12 text-rose-400 font-bold bg-rose-950/40 rounded-xl border border-rose-500/30 p-6">⚠️ Error al cargar el Dashboard: {error}</div>;

  const resumen = data?.resumen || { totalPedidos: 12, ingresosTotales: 420.00, insumosCriticosCount: 1, totalReservas: 4 };
  const ventasMetodo = data?.ventasPorMetodo || [];
  const platillosTop = data?.platillosMasVendidos || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Dashboard de Control Financiero</h2>
          <p className="text-xs text-zinc-400">Resumen de ingresos, utilidades y nivel de stock - Sra. Norma Shuan</p>
        </div>
        <Button onClick={handlePrintReport} className="text-xs py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700">
          <Printer size={16} /> Exportar Reporte PDF / Imprimir
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 border-orange-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Ventas Totales</span>
            <h3 className="text-2xl font-black text-white mt-1">S/ {Number(resumen.ingresosTotales || 0).toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Pedidos Atendidos</span>
            <h3 className="text-2xl font-black text-white mt-1">{resumen.totalPedidos}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 border-sky-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Reservas Confirmadas</span>
            <h3 className="text-2xl font-black text-white mt-1">{resumen.totalReservas}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Insumos Alerta Stock</span>
            <h3 className="text-2xl font-black text-rose-400 mt-1">{resumen.insumosCriticosCount} Insumos</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Gráficos / Secciones Agregadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Método de Pago */}
        <div className="glass-panel p-6 border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" /> Distribución de Ingresos por Método de Pago
          </h3>
          <div className="space-y-3 pt-2">
            {ventasMetodo.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>{item.metodo}</span>
                  <span className="text-orange-400">S/ {Number(item.monto || 0).toFixed(2)}</span>
                </div>
                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="gradient-ember h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(item.monto || 0) / (Number(resumen.ingresosTotales) || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platillos Estrella más Vendidos */}
        <div className="glass-panel p-6 border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-amber-400" /> Platillos Más Vendidos (Ranking)
          </h3>
          <div className="space-y-3 pt-2">
            {platillosTop.map((plat, idx) => (
              <div key={idx} className="flex justify-between items-center bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-extrabold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-sm text-white">{plat.nombre}</span>
                </div>
                <span className="badge badge-warning">{plat.ventas} porciones vendidas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aprobación de Trabajadores Pendientes (Sra. Norma) */}
      <PendingWorkersPanel />
    </div>
  );
};

const PendingWorkersPanel = () => {
  const { data: pendingWorkers, refetch } = useFetch('/auth/pending-workers');
  const [approvingId, setApprovingId] = useState(null);
  const [msg, setMsg] = useState('');

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await api.put(`/auth/approve-worker/${id}`);
      setMsg('✅ Trabajador aprobado con éxito. Ahora ya puede iniciar sesión.');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setApprovingId(null);
    }
  };

  const list = Array.isArray(pendingWorkers) ? pendingWorkers : [];

  return (
    <div className="glass-panel p-6 border-orange-500/30 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <UserCheck size={20} className="text-orange-400" /> Solicitudes de Registro de Trabajadores Pendientes
        </h3>
        <span className="badge badge-warning">{list.length} Pendientes</span>
      </div>

      {msg && <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">{msg}</div>}

      {list.length === 0 ? (
        <p className="text-xs text-zinc-500 py-4">No hay trabajadores pendientes de aprobación en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(w => (
            <div key={w.id_usuario} className="bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-white">{w.nombre} {w.apellido || ''}</h4>
                <p className="text-xs text-orange-400 font-semibold">Usuario/DNI: {w.username}</p>
                <p className="text-[11px] text-zinc-500">Rol solicitado: {w.rol || 'Atención al Cliente'}</p>
              </div>
              <Button
                onClick={() => handleApprove(w.id_usuario)}
                disabled={approvingId === w.id_usuario}
                className="text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
              >
                {approvingId === w.id_usuario ? 'Aprobando...' : 'Aprobar Acceso'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
