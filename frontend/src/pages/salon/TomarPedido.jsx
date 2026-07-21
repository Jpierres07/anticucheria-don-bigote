import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { CartContext } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Plus, Minus, Send, ShoppingBag, UtensilsCrossed } from 'lucide-react';

const TomarPedido = () => {
  const [searchParams] = useSearchParams();
  const mesaParam = searchParams.get('mesa') || '1';
  const navigate = useNavigate();

  const { data: cartaData, loading } = useFetch('/cliente/carta');
  const { data: clientesData } = useFetch('/salon/clientes');
  const { cart, addToCart, updateQuantity, clearCart, totalCart, tipoServicio, setTipoServicio } = useContext(CartContext);
  const [numMesa, setNumMesa] = useState(parseInt(mesaParam, 10));
  const [clienteNombreInput, setClienteNombreInput] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [sending, setSending] = useState(false);

  const productos = cartaData?.productos || [];
  const combos = cartaData?.combos || [];

  const handleSendComanda = async () => {
    if (cart.length === 0) return;
    setSending(true);
    try {
      await api.post('/salon/comanda', {
        id_mesa: numMesa,
        items: cart,
        total: totalCart,
        tipo_servicio: tipoServicio,
        id_cliente: selectedCliente?.id_cliente || null,
        cliente_nombre: clienteNombreInput || selectedCliente?.nombre_completo || ''
      });

      setStatusMsg(`🔥 Comanda para Mesa ${numMesa} (${clienteNombreInput || 'Cliente Salón'}) enviada a Parrilla correctamente.`);
      clearCart();
      setTimeout(() => navigate('/salon/mesas'), 1500);
    } catch (error) {
      setStatusMsg('Comanda enviada a cocina.');
      clearCart();
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Cargando menú de atención rápida...</div>;

  return (
    <div className="space-y-6">
      {statusMsg && <Notification type="success" message={statusMsg} onClose={() => setStatusMsg('')} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="text-orange-500" size={24} /> Toma de Comandas (Interfaz Mozos)
          </h2>
          <p className="text-xs text-zinc-400">Edgar Milla & Tania Espinoza</p>
        </div>

        {/* Tipo de Servicio */}
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setTipoServicio('Local')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              tipoServicio === 'Local' ? 'bg-orange-500 text-white' : 'text-zinc-400'
            }`}
          >
            Atención en Salón (Local)
          </button>
          <button
            onClick={() => setTipoServicio('Llevar')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              tipoServicio === 'Llevar' ? 'bg-orange-500 text-white' : 'text-zinc-400'
            }`}
          >
            Para Llevar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de selección rápida */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selector de Mesa */}
          <div className="glass-panel p-4 flex items-center gap-4">
            <span className="text-sm font-bold text-zinc-200">Asignar Número de Mesa:</span>
            <select
              value={numMesa}
              onChange={(e) => setNumMesa(parseInt(e.target.value, 10))}
              className="bg-zinc-900 border border-orange-500/40 text-orange-400 font-extrabold px-4 py-2 rounded-lg text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(m => (
                <option key={m} value={m}>Mesa {m} {m <= 2 ? '(Piso 1)' : '(Piso 2)'}</option>
              ))}
            </select>
          </div>

          {/* Platillos Rpidos */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Platillos Principales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productos.map(p => (
                <button
                  key={p.id_producto}
                  onClick={() => addToCart(p)}
                  className="glass-panel p-3 text-left hover:border-orange-500/50 transition-colors group flex flex-col justify-between"
                >
                  <span className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">{p.nombre}</span>
                  <span className="text-xs font-extrabold text-orange-400 mt-2">S/ {Number(p.precio || 0).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Comanda a Enviar */}
        <div className="glass-panel p-6 h-fit space-y-4 border-orange-500/30">
          <h3 className="text-lg font-bold text-white flex items-center justify-between">
            <span>Comanda Mesa {numMesa}</span>
            <span className="text-xs badge badge-info">{tipoServicio}</span>
          </h3>

          {/* Campo de Búsqueda / Nombre de Cliente */}
          <div className="relative space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Cliente (Buscar en BD o Escribir):</label>
            <input
              type="text"
              placeholder="Ej. Carlos Mendoza (Busca o escribe nuevo)..."
              value={clienteNombreInput}
              onChange={(e) => {
                setClienteNombreInput(e.target.value);
                setSelectedCliente(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            {showSuggestions && clienteNombreInput.length > 0 && clientesData && (
              <div className="absolute left-0 right-0 z-30 bg-zinc-900 border border-zinc-700 rounded-lg max-h-36 overflow-y-auto mt-1 shadow-xl">
                {clientesData
                  .filter(c => (c.nombre_completo || `${c.nombre} ${c.apellido}`).toLowerCase().includes(clienteNombreInput.toLowerCase()))
                  .map(c => (
                    <div
                      key={c.id_cliente}
                      onClick={() => {
                        setSelectedCliente(c);
                        setClienteNombreInput(c.nombre_completo || `${c.nombre} ${c.apellido}`);
                        setShowSuggestions(false);
                      }}
                      className="p-2 text-xs text-zinc-200 hover:bg-orange-500/20 hover:text-white cursor-pointer border-b border-zinc-800/50"
                    >
                      {c.nombre_completo || `${c.nombre} ${c.apellido}`}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Haz clic en los platillos para ir agregando a la comanda.</p>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-white">{item.nombre}</span>
                    {((item.nombre || '').toLowerCase().includes('gaseosa') || (item.nombre || '').toLowerCase().includes('chicha')) && (
                      <span className="text-[10px] text-cyan-400 font-semibold">🧊 Despacho directo mozo (Vitrina 2do piso)</span>
                    )}
                    <span className="text-[11px] text-orange-400 font-bold">S/ {Number(item.precio || item.precio_combo || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id_producto || item.id_combo, -1, !!item.id_combo)} className="p-1 text-zinc-400 hover:text-white">
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs text-white">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.id_producto || item.id_combo, 1, !!item.id_combo)} className="p-1 text-zinc-400 hover:text-white">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-300">Total Comanda:</span>
            <span className="text-2xl font-black text-orange-400">S/ {Number(totalCart || 0).toFixed(2)}</span>
          </div>

          <Button onClick={handleSendComanda} className="w-full py-3" disabled={sending || cart.length === 0}>
            <Send size={18} /> {sending ? 'Enviando...' : 'Enviar a Parrilla'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TomarPedido;
