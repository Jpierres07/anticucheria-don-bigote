import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Flame, Clock, CheckCircle, RefreshCw, ArrowLeft, Bell } from 'lucide-react';

const Comandera = () => {
  const navigate = useNavigate();
  const { data: pedidos, refetch, loading } = useFetch('/cocina/pedidos');
  const [statusMsg, setStatusMsg] = useState('');

  // Auto-refresco automático cada 3 segundos (Respaldo en tiempo real)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  // WebSockets en tiempo real instantáneos
  useSocket('cocina', (eventType, data) => {
    if (eventType === 'nuevo_pedido') {
      setStatusMsg(`🔔 ¡NUEVO PEDIDO RECIBIDO! Mesa ${data?.numero_mesa || data?.id_mesa || 'Salón'}`);
      refetch();
    } else if (eventType === 'cambio_estado') {
      refetch();
    }
  });

  const displayPedidos = pedidos || [];

  const handleChangeState = async (id_pedido, nuevoEstado) => {
    try {
      await api.put(`/cocina/pedidos/${id_pedido}/estado`, { estado_pedido: nuevoEstado });
      setStatusMsg(`Comanda #${id_pedido} actualizada a ${nuevoEstado}`);
      refetch();
    } catch (e) {
      refetch();
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Iniciando Pantalla KDS de Parrilla...</div>;

  return (
    <div className="space-y-6">
      {statusMsg && <Notification type="warning" message={statusMsg} onClose={() => setStatusMsg('')} />}

      {/* Header Cocina KDS */}
      <div className="glass-panel p-6 border-orange-500/40 bg-orange-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={28} />
            <h2 className="text-3xl font-black text-white tracking-tight">PARRILLA & COCINA KDS</h2>
          </div>
          <p className="text-xs text-orange-300 font-semibold mt-1">
            Pantalla Táctil en Tiempo Real - Sra. Norma Shuan Lliuya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary" className="text-xs">
            <ArrowLeft size={14} /> Volver Atrás
          </Button>
          <Button onClick={refetch} variant="secondary" className="text-xs">
            <RefreshCw size={14} /> Actualizar Pantalla
          </Button>
        </div>
      </div>

      {/* Grid de Comandas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPedidos && displayPedidos.length > 0 ? (
          displayPedidos.map((ped) => {
            const isEnProceso = ped.estado_pedido === 'En Proceso';

            return (
              <div
                key={ped.id_pedido}
                className={`glass-panel p-5 border-2 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                  isEnProceso ? 'border-orange-500 bg-orange-950/20' : 'border-zinc-700 bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                      <span className="text-2xl font-black text-white">Mesa {ped.numero_mesa || ped.id_mesa || 'Local'}</span>
                      <span className="block text-[11px] text-zinc-400">Comanda #{ped.id_pedido}</span>
                    </div>
                    <span className={`badge ${isEnProceso ? 'badge-warning' : 'badge-success'}`}>
                      <Clock size={12} /> {ped.estado_pedido}
                    </span>
                  </div>

                  {/* Lista de Platillos & Bebidas con indicación de ubicación */}
                  <div className="py-4 space-y-2">
                    {ped.detalles && ped.detalles.length > 0 ? (
                      ped.detalles.map((det, idx) => {
                        const isDrink = (det.nombre || '').toLowerCase().includes('gaseosa') || 
                                        (det.nombre || '').toLowerCase().includes('chicha') || 
                                        (det.categoria || '').toLowerCase().includes('bebida');

                        return (
                          <div key={idx} className="flex justify-between items-center text-sm font-bold text-zinc-100 bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
                            <div className="flex flex-col">
                              <span>{det.nombre || 'Anticuchos de Corazón'}</span>
                              <span className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${isDrink ? 'text-cyan-400' : 'text-orange-400'}`}>
                                {isDrink ? '🧊 Vitrina 2do Piso (Despacho Directo por Mozo)' : '🔥 Parrilla 1er Piso (Parrillera)'}
                              </span>
                            </div>
                            <span className="text-orange-400 font-black text-base">x{det.cantidad}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-zinc-400 space-y-1">
                        <div className="flex justify-between bg-zinc-900/80 p-2 rounded">
                          <div>
                            <span>Anticuchos de Corazón</span>
                            <span className="block text-[10px] text-orange-400">🔥 Preparación Brasa (1er Piso)</span>
                          </div>
                          <span className="font-bold text-orange-400">x2</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Estado */}
                <div className="pt-3 border-t border-white/10 flex gap-2">
                  {isEnProceso ? (
                    <>
                      <Button
                        onClick={() => handleChangeState(ped.id_pedido, 'Entregado')}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                      >
                        <CheckCircle size={16} /> ¡LISTO / SERVIDO!
                      </Button>
                      <Button
                        onClick={() => handleChangeState(ped.id_pedido, 'Cancelado')}
                        className="py-2.5 bg-rose-600/80 hover:bg-rose-700 text-xs font-bold px-3"
                        title="Anular / Cambiar Pedido"
                      >
                        Anular
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleChangeState(ped.id_pedido, 'En Proceso')}
                      variant="secondary"
                      className="w-full py-2.5 text-xs"
                    >
                      Reabrir Comanda
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass-panel p-12 text-center text-zinc-500">
            <Flame size={48} className="mx-auto text-zinc-700 mb-3" />
            <p className="font-bold text-lg text-zinc-400">No hay comandas pendientes en la parrilla.</p>
            <p className="text-xs text-zinc-600 mt-1">Los pedidos ingresados por los mozos o código QR aparecerán al instante.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comandera;
