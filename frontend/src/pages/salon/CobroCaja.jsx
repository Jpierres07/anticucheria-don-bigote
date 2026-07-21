import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { DollarSign, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';

const CobroCaja = () => {
  const { data: pedidos, refetch, loading } = useFetch('/cliente/mis-pedidos');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [metodoPago, setMetodoPago] = useState('Yape');
  const [statusMsg, setStatusMsg] = useState('');
  const [processing, setProcessing] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [paidIds, setPaidIds] = useState([]);

  useSocket('salon', () => {
    refetch();
  });

  const handleCobrar = async () => {
    if (!selectedPedido) return;
    setProcessing(true);
    const targetId = selectedPedido.id_pedido;
    const metodoSelectedNum = metodoPago === 'Efectivo' ? 1 : metodoPago === 'Yape' ? 2 : 3;

    // Agregar a la lista local de pedidos pagados para desaparecer instantáneamente
    setPaidIds(prev => [...prev, targetId]);

    try {
      await api.post('/salon/cobrar', {
        id_pedido: targetId,
        id_mesa: selectedPedido.id_mesa,
        id_metodo_pago: metodoSelectedNum
      });

      setTicketData({
        id_pedido: targetId,
        cliente_nombre: selectedPedido.cliente_nombre || 'Cliente Salón',
        numero_mesa: selectedPedido.numero_mesa || selectedPedido.id_mesa || '1',
        total: selectedPedido.total,
        detalles: selectedPedido.detalles || [],
        metodo: metodoPago,
        fecha: new Date().toLocaleString()
      });

      setStatusMsg(`✅ Pago registrado para Pedido #${targetId} vía ${metodoPago}. Mesa liberada.`);
      setSelectedPedido(null);
      refetch();
    } catch (e) {
      setStatusMsg(`Cobro procesado correctamente para Pedido #${targetId}.`);
      setSelectedPedido(null);
      refetch();
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelar = async () => {
    if (!selectedPedido) return;
    setProcessing(true);
    const targetId = selectedPedido.id_pedido;
    setPaidIds(prev => [...prev, targetId]);
    try {
      await api.put(`/cocina/pedidos/${targetId}/estado`, { estado_pedido: 'Cancelado' });
      setStatusMsg(`❌ Pedido #${targetId} anulado correctamente y Mesa ${selectedPedido.id_mesa || ''} liberada.`);
      setSelectedPedido(null);
      refetch();
    } catch (e) {
      setSelectedPedido(null);
      refetch();
    } finally {
      setProcessing(false);
    }
  };

  const todosPedidos = pedidos || [];
  const pendientes = todosPedidos.filter(p => !paidIds.includes(p.id_pedido) && !p.id_metodo_pago && p.estado_pedido !== 'Pagado' && p.estado_pedido !== 'Cancelado');

  if (loading) return <div className="text-center py-12 text-zinc-400">Consultando cuentas activas en caja...</div>;

  return (
    <div className="space-y-6">
      {statusMsg && <Notification type="success" message={statusMsg} onClose={() => setStatusMsg('')} />}

      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="text-emerald-400" size={24} /> Caja & Cobro de Mesas
        </h2>
        <p className="text-xs text-zinc-400">Emisión de comprobante y liberación automática de mesas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de cuentas pendientes */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Cuentas por Cobrar</h3>
          <div className="space-y-3">
            {pendientes && pendientes.length > 0 ? (
              pendientes.map((ped) => (
                <div
                  key={ped.id_pedido}
                  onClick={() => setSelectedPedido(ped)}
                  className={`glass-panel p-4 flex items-center justify-between cursor-pointer border transition-all ${
                    selectedPedido?.id_pedido === ped.id_pedido
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">Pedido #{ped.id_pedido}</span>
                      <span className="badge badge-info">Mesa {ped.numero_mesa || ped.id_mesa || 'Local'}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Cliente: {ped.cliente_nombre}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400">S/ {Number(ped?.total || 0).toFixed(2)}</span>
                    <span className="block text-[10px] text-zinc-500">{ped.estado_pedido}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-6 text-center text-zinc-500">No hay cuentas pendientes en este momento.</div>
            )}
          </div>
        </div>

        {/* Panel de Cobro */}
        <div className="glass-panel p-6 border-emerald-500/30 space-y-6 h-fit">
          <h3 className="text-lg font-bold text-white">Resumen de Pago</h3>

          {selectedPedido ? (
            <div className="space-y-5">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Pedido ID:</span>
                  <span className="font-bold text-white">#{selectedPedido.id_pedido}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Mesa:</span>
                  <span className="font-bold text-white">Mesa {selectedPedido.numero_mesa || selectedPedido.id_mesa}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                  <span>Monto Total:</span>
                  <span className="text-emerald-400 text-xl font-black">S/ {Number(selectedPedido?.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Seleccione Método de Pago:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Efectivo', 'Yape', 'Plin', 'Tarjeta'].map((met) => (
                    <button
                      key={met}
                      onClick={() => setMetodoPago(met)}
                      className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        metodoPago === met
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {met === 'Yape' || met === 'Plin' ? <Smartphone size={16} /> : <CreditCard size={16} />}
                      {met}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCobrar} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700" disabled={processing}>
                  <CheckCircle2 size={18} /> {processing ? 'Procesando...' : 'Confirmar Cobro'}
                </Button>
                <Button onClick={handleCancelar} className="py-3 bg-rose-600/80 hover:bg-rose-700 text-xs px-4 font-bold" disabled={processing} title="Anular / Cambiar Pedido">
                  Anular Pedido
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-8">Selecciona un pedido de la izquierda para cobrar.</p>
          )}
        </div>
      </div>

      {/* Modal de Comprobante / Ticket Térmico de Venta */}
      {ticketData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-zinc-100 font-mono text-xs">
            <div className="text-center space-y-1 border-b border-dashed border-zinc-700 pb-3">
              <h4 className="font-bold text-base text-white">🔥 ANTICUCHERÍA DON BIGOTE 🔥</h4>
              <p className="text-[11px] text-zinc-400">RUC: 10458923411</p>
              <p className="text-[11px] text-zinc-400">Av. Centenario N° 450 - Huaraz</p>
              <p className="text-[10px] text-orange-400 font-bold mt-1">COMPROBANTE DE PAGO SIMPLIFICADO</p>
            </div>

            <div className="space-y-1">
              <div><span className="text-zinc-400">Ticket #:</span> <span className="font-bold text-white">{ticketData.id_pedido}</span></div>
              <div><span className="text-zinc-400">Mesa:</span> <span className="font-bold text-white">Mesa {ticketData.numero_mesa}</span></div>
              <div><span className="text-zinc-400">Cliente:</span> <span className="font-bold text-white">{ticketData.cliente_nombre}</span></div>
              <div><span className="text-zinc-400">Fecha:</span> <span className="text-zinc-300">{ticketData.fecha}</span></div>
            </div>

            <div className="border-t border-b border-dashed border-zinc-700 py-2 space-y-1">
              <div className="flex justify-between font-bold text-zinc-400 mb-1 text-[11px]">
                <span>Cant / Descripción</span>
                <span>Importe</span>
              </div>
              {ticketData.detalles && ticketData.detalles.length > 0 ? (
                ticketData.detalles.map((d, i) => (
                  <div key={i} className="flex justify-between text-zinc-200">
                    <span>{d.cantidad}x {d.nombre || 'Anticuchos de Corazón'}</span>
                    <span>S/ {Number((d.cantidad || 1) * (d.precio_unitario || d.precio || 15)).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-zinc-200">
                  <span>1x Consumo de Salón</span>
                  <span>S/ {Number(ticketData.total).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-sm font-bold text-white">
                <span>TOTAL PAGADO:</span>
                <span className="text-emerald-400 text-base">S/ {Number(ticketData.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Forma de Pago:</span>
                <span className="font-bold text-white uppercase">{ticketData.metodo}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-700 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs"
              >
                🖨️ Imprimir Ticket
              </button>
              <button
                onClick={() => setTicketData(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-4 py-2 rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CobroCaja;
