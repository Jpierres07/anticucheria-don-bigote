import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutGrid, ClipboardList, Flame, BellRing } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import Notification from '../components/common/Notification';
import api from '../services/api';

const LayoutMozo = () => {
  const location = useLocation();
  const [alertMsg, setAlertMsg] = useState('');

  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  useSocket('salon', (eventType, data) => {
    if (eventType === 'comanda_lista_mozo' || eventType === 'cambio_estado_parrilla' || eventType === 'cambio_estado') {
      const est = data?.estado_pedido;
      if (!est || est === 'Listo' || est === 'Servido' || est === 'Listo Servido' || est === 'Entregado') {
        playAlertSound();
        const mesaNum = data?.numero_mesa || data?.id_mesa || '1';
        setAlertMsg(`🔔 ¡PLATO LISTO, PARA ENTREGAR! 🔥 Mesa ${mesaNum}`);
      }
    }
  });

  // Polling de respaldo automático cada 3 segundos
  useEffect(() => {
    const checkReadyOrders = async () => {
      try {
        const res = await api.get('/cocina/pedidos');
        const listos = res.data?.filter(p => p.estado_pedido === 'Listo' || p.estado_pedido === 'Servido' || p.estado_pedido === 'Listo Servido');
        if (listos && listos.length > 0) {
          const ultimo = listos[0];
          const mesaNum = ultimo.id_mesa || '1';
          setAlertMsg(`🔔 ¡PLATO LISTO, PARA ENTREGAR! 🔥 Mesa ${mesaNum}`);
        }
      } catch (e) {}
    };
    const interval = setInterval(checkReadyOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { path: '/salon/mesas', label: 'Mapa Mesas', icon: <LayoutGrid size={20} /> },
    { path: '/salon/tomar-pedido', label: 'Comanda', icon: <ClipboardList size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20 md:pb-0">
      <Navbar />
      <main className="flex-1 container-custom py-4">
        {alertMsg && (
          <div className="mb-4 animate-pulse">
            <Notification type="success" message={alertMsg} onClose={() => setAlertMsg('')} />
          </div>
        )}
        <Outlet />
      </main>

      {/* Bottom Bar para Mozos en Celular */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 md:hidden flex justify-around py-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold ${
                isActive ? 'text-orange-400 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default LayoutMozo;
