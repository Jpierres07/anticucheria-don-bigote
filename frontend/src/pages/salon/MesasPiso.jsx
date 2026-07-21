import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSocket } from '../../hooks/useSocket';
import { LayoutGrid, Users, CheckCircle, Clock, Lock, Flame } from 'lucide-react';
import Button from '../../components/common/Button';

const MesasPiso = () => {
  const { data: mesasData, loading, refetch } = useFetch('/salon/mesas');
  const [selectedPiso, setSelectedPiso] = useState(1);

  useSocket('salon', (eventType) => {
    if (eventType === 'comanda_lista_mozo' || eventType === 'mesa_liberada' || eventType === 'nuevo_pedido') {
      refetch();
    }
  });

  const defaultMesas = [
    { id_mesa: 1, numero_mesa: 1, capacidad: 4, piso: 1, estado_mesa: 'Ocupada' },
    { id_mesa: 2, numero_mesa: 2, capacidad: 4, piso: 1, estado_mesa: 'Libre' },
    { id_mesa: 3, numero_mesa: 3, capacidad: 4, piso: 2, estado_mesa: 'Libre' },
    { id_mesa: 4, numero_mesa: 4, capacidad: 4, piso: 2, estado_mesa: 'Ocupada' },
    { id_mesa: 5, numero_mesa: 5, capacidad: 6, piso: 2, estado_mesa: 'Reservada' },
    { id_mesa: 6, numero_mesa: 6, capacidad: 4, piso: 2, estado_mesa: 'Libre' },
    { id_mesa: 7, numero_mesa: 7, capacidad: 2, piso: 2, estado_mesa: 'Libre' }
  ];

  const listMesas = (mesasData && Array.isArray(mesasData) && mesasData.length > 0) ? mesasData : defaultMesas;
  const mesasDelPiso = listMesas.filter(m => parseInt(m.piso, 10) === selectedPiso);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Libre':
        return <span className="badge badge-success"><CheckCircle size={12} /> Libre</span>;
      case 'Ocupada':
        return <span className="badge badge-danger"><Clock size={12} /> Ocupada</span>;
      case 'Reservada':
        return <span className="badge badge-warning"><Lock size={12} /> Reservada</span>;
      default:
        return <span className="badge badge-info">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="text-orange-500" size={24} /> Mapa Físico de Salón por Pisos
          </h2>
          <p className="text-xs text-zinc-400">Distribución oficial de la Anticuchería Don Bigote</p>
        </div>

        {/* Tab de Selector de Piso */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setSelectedPiso(1)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedPiso === 1 ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Primer Piso (2 Mesas)
          </button>
          <button
            onClick={() => setSelectedPiso(2)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedPiso === 2 ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Segundo Piso (5 Mesas)
          </button>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mesasDelPiso.map((mesa) => {
          const isOcupada = mesa.estado_mesa === 'Ocupada';
          const isReservada = mesa.estado_mesa === 'Reservada';

          return (
            <div
              key={mesa.id_mesa}
              className={`glass-panel p-6 flex flex-col justify-between border transition-all ${
                isOcupada
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : isReservada
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl font-black text-white">Mesa {mesa.numero_mesa}</span>
                  {getStatusBadge(mesa.estado_mesa)}
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
                  <Users size={14} className="text-zinc-400" /> Capacidad: <span className="font-bold text-white">{mesa.capacidad} personas</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Ubicación: Piso {mesa.piso}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                {isOcupada && (
                  <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 text-center flex items-center justify-center gap-1">
                    <Lock size={12} /> Mesa Ocupada: Bloqueada para nuevo cliente hasta ser cobrada en Caja
                  </div>
                )}
                <Button
                  onClick={() => window.location.href = `/salon/tomar-pedido?mesa=${mesa.numero_mesa}`}
                  className="w-full text-xs py-2"
                  variant={isOcupada ? 'secondary' : 'primary'}
                >
                  {isOcupada ? '➕ Adicional a Comanda Activa' : 'Tomar Pedido'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MesasPiso;
