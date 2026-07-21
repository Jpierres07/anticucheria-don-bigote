import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Calendar, Users, Clock, PartyPopper } from 'lucide-react';

const Reservas = () => {
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  const [formData, setFormData] = useState({
    fecha_reserva: todayStr,
    hora_reserva: '18:00',
    cantidad_personas: 4,
    tipo_evento: 'Atencion en Local'
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    // Validar fecha mínima (Fecha actual en adelante)
    if (formData.fecha_reserva < todayStr) {
      setErrorMsg('La fecha de reserva no puede ser anterior a la fecha actual.');
      return;
    }

    // Validar rango de hora (6:00 PM / 18:00 a 11:00 PM / 23:00)
    if (formData.hora_reserva < '18:00' || formData.hora_reserva > '23:00') {
      setErrorMsg('El horario de atención para reservas es desde las 6:00 PM (18:00) hasta las 11:00 PM (23:00).');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cliente/reserva', formData);
      setStatusMsg('¡Reserva registrada con éxito en Anticuchería Don Bigote!');
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setStatusMsg('Reserva enviada a recepción.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {statusMsg && <Notification type="success" message={statusMsg} onClose={() => setStatusMsg('')} />}
      {errorMsg && <Notification type="warning" message={errorMsg} onClose={() => setErrorMsg('')} />}

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
          <Calendar size={24} />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Reserva de Mesas y Eventos</h2>
        <p className="text-xs text-zinc-400">Asegura tu lugar en nuestro salón. Atendemos de 6:00 PM a 11:00 PM.</p>
      </div>

      <div className="glass-panel p-8 border-orange-500/20">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Fecha de Reserva"
                type="date"
                min={todayStr}
                value={formData.fecha_reserva}
                onChange={(e) => setFormData({ ...formData, fecha_reserva: e.target.value })}
                required
              />
              <span className="text-[11px] text-orange-400 font-medium block mt-1">📅 Reservas desde hoy en adelante</span>
            </div>

            <div>
              <Input
                label="Hora Preferida (6:00 PM - 11:00 PM)"
                type="time"
                min="18:00"
                max="23:00"
                value={formData.hora_reserva}
                onChange={(e) => setFormData({ ...formData, hora_reserva: e.target.value })}
                required
              />
              <span className="text-[11px] text-amber-400 font-medium block mt-1">⏰ Horario: 6:00 PM (18:00) a 11:00 PM (23:00)</span>
            </div>
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
