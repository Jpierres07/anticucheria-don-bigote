import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Clock, CheckCircle2, Flame, AlertCircle } from 'lucide-react';

const MisPedidos = () => {
  const { data: pedidos, loading } = useFetch('/cliente/mis-pedidos');

  if (loading) return <div className="text-center py-12 text-zinc-400">Consultando historial de pedidos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Estado de Mis Pedidos</h2>
          <p className="text-xs text-zinc-400">Monitoreo en tiempo real desde la parrilla de la Sra. Norma</p>
        </div>
      </div>

      <div className="space-y-4">
        {pedidos && pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <div key={pedido.id_pedido} className="glass-panel p-5 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-white text-lg">Pedido #{pedido.id_pedido}</span>
                  <span className="text-xs text-zinc-400">Mesa {pedido.numero_mesa || pedido.id_mesa || 'Local'}</span>
                  {pedido.estado_pedido === 'En Proceso' && (
                    <span className="badge badge-warning">
                      <Clock size={12} /> En Parrilla
                    </span>
                  )}
                  {pedido.estado_pedido === 'Entregado' && (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Servido
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Fecha: {new Date(pedido.fecha_pedido).toLocaleTimeString()} | Cliente: {pedido.cliente_nombre}
                </p>
                <div className="mt-2 text-xs text-zinc-300">
                  {pedido.detalles?.map((d, i) => (
                    <span key={i} className="mr-3 inline-block">
                      • {d.cantidad}x {d.nombre || 'Platillo'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right flex md:flex-col justify-between items-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <span className="text-xs text-zinc-400">Total a Pagar</span>
                <span className="text-xl font-extrabold text-orange-400">S/ {Number(pedido?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-8 text-center text-zinc-500">
            No tienes pedidos activos en este momento.
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;
