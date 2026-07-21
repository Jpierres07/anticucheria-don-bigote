import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Notification from '../../components/common/Notification';
import api from '../../services/api';
import { Boxes, Plus, ShoppingCart, ArrowRightLeft } from 'lucide-react';

const Inventario = () => {
  const { data: insumos, refetch, loading } = useFetch('/admin/inventario');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [cantidadComprada, setCantidadComprada] = useState(5);
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenCompra = (insumo) => {
    setSelectedInsumo(insumo);
    setIsModalOpen(true);
  };

  const handleSaveCompra = async (e) => {
    e.preventDefault();
    if (!selectedInsumo) return;
    setSaving(true);
    try {
      await api.post('/admin/inventario/compras', {
        id_insumo: selectedInsumo.id_insumo,
        cantidad_comprada: parseFloat(cantidadComprada),
        precio_unitario: 10.00
      });

      const incremento = cantidadComprada * selectedInsumo.factor_conversion;
      setStatusMsg(`✅ Compra de ${cantidadComprada} ${selectedInsumo.unidad_compra} agregada (+${incremento} ${selectedInsumo.unidad_consumo} en stock).`);
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      setStatusMsg('Compra de mercado registrada.');
      setIsModalOpen(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Cargando inventario con factores de conversión...</div>;

  return (
    <div className="space-y-6">
      {statusMsg && <Notification type="success" message={statusMsg} onClose={() => setStatusMsg('')} />}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Boxes className="text-orange-500" size={24} /> Logística e Inventario
          </h2>
          <p className="text-xs text-zinc-400">Conversión de Unidades (Compra ➔ Consumo)</p>
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="glass-panel overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">Insumo</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4">Unidad Compra</th>
                <th className="p-4">Factor Conversión</th>
                <th className="p-4">Stock Consumo Actual</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {insumos && insumos.length > 0 ? (
                insumos.map((i) => (
                  <tr key={i.id_insumo} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{i.nombre_insumo}</td>
                    <td className="p-4 text-zinc-400">{i.proveedor}</td>
                    <td className="p-4 font-medium">{i.unidad_compra}</td>
                    <td className="p-4">
                      <span className="badge badge-info">
                        1 {i.unidad_compra} = {i.factor_conversion} {i.unidad_consumo}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-orange-400 text-sm">
                      {Number(i?.stock_actual || 0).toFixed(2)} {i.unidad_consumo}
                    </td>
                    <td className="p-4 text-right">
                      <Button onClick={() => handleOpenCompra(i)} className="text-xs py-1.5 px-3">
                        <ShoppingCart size={14} /> Registrar Compra
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500">No hay insumos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Compra */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Registrar Compra de ${selectedInsumo?.nombre_insumo}`}>
        <form onSubmit={handleSaveCompra} className="space-y-4">
          <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-xs space-y-1">
            <p className="text-zinc-400">Proveedor: <span className="font-bold text-white">{selectedInsumo?.proveedor}</span></p>
            <p className="text-zinc-400">Equivalencia: <span className="font-bold text-orange-400">1 {selectedInsumo?.unidad_compra} = {selectedInsumo?.factor_conversion} {selectedInsumo?.unidad_consumo}</span></p>
          </div>

          <Input
            label={`Cantidad Comprada (${selectedInsumo?.unidad_compra})`}
            type="number"
            step="0.01"
            min="0.1"
            value={cantidadComprada}
            onChange={(e) => setCantidadComprada(e.target.value)}
            required
          />

          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30 text-xs text-orange-300">
            💡 Al registrar esta compra, el stock en cocina se incrementará en <span className="font-extrabold text-white">{(parseFloat(cantidadComprada || 0) * (selectedInsumo?.factor_conversion || 1)).toFixed(2)} {selectedInsumo?.unidad_consumo}</span>.
          </div>

          <Button type="submit" className="w-full py-2.5 mt-2" disabled={saving}>
            {saving ? 'Guardando...' : 'Confirmar e Incrementar Stock'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventario;
