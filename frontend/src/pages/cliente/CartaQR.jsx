import React, { useState, useContext } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { CartContext } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Flame, ShoppingCart, Plus, Minus, Check, Star } from 'lucide-react';

const CartaQR = () => {
  const { data, loading, error } = useFetch('/cliente/carta');
  const { cart, addToCart, updateQuantity, clearCart, totalCart, selectedMesa, setSelectedMesa } = useContext(CartContext);
  const [activeTab, setActiveTab] = useState('todos');
  const [notification, setNotification] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [clienteNombreQR, setClienteNombreQR] = useState('');

  const handleAdd = (item) => {
    addToCart(item);
    setNotification(`¡${item.nombre} agregado al carrito!`);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    try {
      setOrderSent(true);
      await api.post('/cliente/pedido-qr', {
        id_mesa: selectedMesa,
        items: cart,
        total: totalCart,
        tipo_servicio: 'Local',
        cliente_nombre: clienteNombreQR
      });
      clearCart();
      setClienteNombreQR('');
      setNotification('🔥 ¡Pedido enviado exitosamente a la parrilla de la Sra. Norma!');
    } catch (e) {
      console.error('Error enviando pedido QR:', e);
      setNotification('Error al enviar el pedido a la parrilla. Intente nuevamente.');
    } finally {
      setOrderSent(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Cargando la carta sabrosa de Don Bigote...</div>;

  const productos = data?.productos || [];
  const combos = data?.combos || [];

  const filteredProductos = activeTab === 'todos' 
    ? productos 
    : activeTab === 'combos' 
    ? [] 
    : productos.filter(p => p.categoria?.toLowerCase() === activeTab);

  return (
    <div className="space-y-8">
      {notification && <Notification type="success" message={notification} onClose={() => setNotification('')} />}

      {/* Banner Gastronómico Principal */}
      <div className="relative rounded-2xl overflow-hidden gradient-dark-ember border border-orange-500/30 p-8 shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30 mb-4">
            <Flame size={14} className="fill-orange-400" /> Sabor Tradicional Huaracino desde 2015
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Nuestros Exquisitos <span className="text-gradient">Anticuchos & Parrillas</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-3">
            Corazón de res macerado con ají panca, rachi crujiente, mollejitas y refrescantes bebidas.
          </p>

          {/* Selector de Mesa para pedido por QR */}
          <div className="mt-6 flex items-center gap-3 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 w-fit">
            <span className="text-xs font-bold text-zinc-300">📍 Tu Mesa Asignada:</span>
            <select
              value={selectedMesa}
              onChange={(e) => setSelectedMesa(parseInt(e.target.value, 10))}
              className="bg-orange-500/20 text-orange-300 border border-orange-500/40 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none"
            >
              <option value={1}>Mesa 1 (Piso 1)</option>
              <option value={2}>Mesa 2 (Piso 1)</option>
              <option value={3}>Mesa 3 (Piso 2)</option>
              <option value={4}>Mesa 4 (Piso 2)</option>
              <option value={5}>Mesa 5 (Piso 2)</option>
              <option value={6}>Mesa 6 (Piso 2)</option>
              <option value={7}>Mesa 7 (Piso 2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categorías / Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['todos', 'platillos', 'combos', 'bebidas'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all whitespace-nowrap ${
              activeTab === cat 
                ? 'gradient-ember text-white shadow-lg shadow-orange-500/30' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Platillos */}
      {(activeTab === 'todos' || activeTab === 'platillos' || activeTab === 'bebidas') && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Flame size={20} className="text-orange-500" /> Platillos & Bebidas Individuales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProductos.map((prod) => (
              <div key={prod.id_producto} className="glass-panel glass-card-hover overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                    <img 
                      src={prod.imagen_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'} 
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    <span className="absolute bottom-2 left-3 text-[11px] font-bold tracking-wider text-orange-400 bg-orange-500/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-orange-500/30 uppercase">
                      {prod.categoria}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors">{prod.nombre}</h4>
                      <span className="text-orange-400 font-extrabold text-lg ml-2 whitespace-nowrap">S/ {Number(prod.precio || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-zinc-400 text-xs line-clamp-2">{prod.descripcion || 'Preparado a la parrilla con receta tradicional de Don Bigote.'}</p>
                  </div>
                </div>
                <div className="p-5 pt-0 flex items-center justify-end">
                  <Button onClick={() => handleAdd(prod)} className="text-xs py-2 px-3.5 w-full sm:w-auto">
                    <Plus size={14} /> Agregar al Pedido
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección Combos */}
      {(activeTab === 'todos' || activeTab === 'combos') && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star size={20} className="text-amber-400 fill-amber-400" /> Combos Don Bigote (Recomendados)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {combos.map((combo) => (
              <div key={combo.id_combo} className="glass-panel glass-card-hover overflow-hidden border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row group">
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-zinc-900">
                  <img 
                    src={combo.imagen_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'} 
                    alt={combo.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="absolute top-2 left-2 badge badge-warning shadow-md">PROMOCIÓN</span>
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-xl text-white group-hover:text-amber-400 transition-colors">{combo.nombre}</h4>
                      <span className="text-2xl font-black text-amber-400 whitespace-nowrap">S/ {Number(combo.precio_combo || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-zinc-300 text-sm mt-2">{combo.descripcion}</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => handleAdd(combo)} variant="primary" className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                      <Plus size={16} /> Pedir Combo
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carrito Flotante de Pedido */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-40 glass-panel p-5 border-orange-500/50 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShoppingCart size={18} className="text-orange-400" /> Tu Pedido (Mesa {selectedMesa})
            </h4>
            <span className="text-orange-400 font-extrabold text-lg">S/ {Number(totalCart || 0).toFixed(2)}</span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 mb-4 text-xs">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-zinc-900/60 p-2 rounded">
                <span className="text-zinc-200 font-medium truncate max-w-[180px]">{item.nombre}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id_producto || item.id_combo, -1, !!item.id_combo)} className="p-1 text-zinc-400 hover:text-white">
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-white">{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id_producto || item.id_combo, 1, !!item.id_combo)} className="p-1 text-zinc-400 hover:text-white">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Tu Nombre (Opcional para tu comanda)..."
            value={clienteNombreQR}
            onChange={(e) => setClienteNombreQR(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 mb-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />

          <Button onClick={handleConfirmOrder} className="w-full py-2.5" disabled={orderSent}>
            {orderSent ? 'Enviando a Parrilla...' : 'Enviar Pedido a Cocina'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartaQR;
