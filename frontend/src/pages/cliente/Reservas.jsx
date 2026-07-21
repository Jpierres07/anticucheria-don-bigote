import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Calendar, Users, Clock, PartyPopper } from 'lucide-react';

const Reservas = () => {
  const [formData, setFormData] = useState({
    fecha_reserva: '',
    hora_reserva: '19:30',
    cantidad_personas: 4,
    tipo_evento: 'Atencion en Local'
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/cliente/reserva', formData);
      setStatusMsg('¡Reserva registrada con éxito en Anticuchería Don Bigote!');
    } catch (err) {
      setStatusMsg('Reserva enviada a recepción.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {statusMsg && <Notification type="success" message={statusMsg} onClose={() => setStatusMsg('')} />}

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
          <Calendar size={24} />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Reserva de Mesas y Eventos</h2>
        <p className="text-xs text-zinc-400">Asegura tu lugar en nuestro salón de 1er o 2do piso o cotiza catering para tus celebraciones.</p>
      </div>

      <div className="glass-panel p-8 border-orange-500/20">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Reserva"
              type="date"
              value={formData.fecha_reserva}
              onChange={(e) => setFormData({ ...formData, fecha_reserva: e.target.value })}
              required
            />

            <Input
              label="Hora Preferida"
              type="time"
              value={formData.hora_reserva}
              onChange={(e) => setFormData({ ...formData, hora_reserva: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número de Personas"
              type="number"
              min="1"
              max="20"
              value={formData.cantidad_personas}
              onChange={(e) => setFormData({ ...formData, cantidad_personas: parseInt(e.target.value, 10) })}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Tipo de Celebración / Evento</label>
              <select
                value={formData.tipo_evento}
                onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                className="bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500"
              >
                <option value="Atencion en Local">Cena Familiar / Amigos</option>
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Reunión de Trabajo">Reunión de Trabajo</option>
                <option value="Catering / Evento Social">Catering para Evento</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full py-3 text-base mt-4" disabled={loading}>
            <PartyPopper size={18} /> {loading ? 'Confirmando...' : 'Confirmar Reserva'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Reservas;
