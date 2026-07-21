import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  UtensilsCrossed, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  Tag, 
  X, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Anticuchos Corazón', url: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pollo Parrilla', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Rachi Rachi', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mollejitas', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chorizo Parrillero', url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bebida Helada', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' }
];

const PlatillosPage = () => {
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    id_categoria: 1,
    imagen_url: ''
  });

  // Action State
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchPlatillos();
  }, []);

  const fetchPlatillos = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get('/admin/platillos');
        setPlatillos(res.data || []);
      } catch (err) {
        const fallback = await api.get('/cliente/carta');
        setPlatillos(fallback.data?.productos || []);
      }
    } catch (error) {
      console.error('Error al cargar platillos:', error);
      mostrarNotificacion('error', 'No se pudieron cargar los platillos.');
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje({ tipo: '', texto: '' });
    }, 4000);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        precio: item.precio !== undefined ? item.precio : '',
        id_categoria: item.id_categoria || (item.categoria === 'Bebidas' ? 3 : 1),
        imagen_url: item.imagen_url || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        id_categoria: 1,
        imagen_url: PRESET_IMAGES[0].url
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarNotificacion('error', 'Por favor ingresa el nombre del platillo.');
      return;
    }

    if (!formData.precio || isNaN(formData.precio) || Number(formData.precio) < 0) {
      mostrarNotificacion('error', 'Por favor ingresa un precio válido.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        id_categoria: parseInt(formData.id_categoria, 10),
        imagen_url: formData.imagen_url.trim()
      };

      if (editingItem) {
        await api.put(`/admin/platillos/${editingItem.id_producto}`, payload);
        mostrarNotificacion('exito', '¡Platillo actualizado exitosamente!');
      } else {
        await api.post('/admin/platillos', payload);
        mostrarNotificacion('exito', '¡Nuevo platillo agregado a la carta!');
      }

      handleCloseModal();
      fetchPlatillos();
    } catch (error) {
      console.error('Error al guardar platillo:', error);
      mostrarNotificacion('error', error.response?.data?.message || 'Error al guardar el platillo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/platillos/${id}`);
      mostrarNotificacion('exito', 'Platillo eliminado correctamente.');
      setDeleteConfirmId(null);
      fetchPlatillos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarNotificacion('error', 'Error al eliminar el platillo.');
    }
  };

  // Filtrado de Platillos
  const platillosFiltrados = platillos.filter(p => {
    const matchesSearch = (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoriaFiltro === 'todos') return matchesSearch;
    if (categoriaFiltro === 'platillos') return matchesSearch && (p.id_categoria === 1 || p.categoria === 'Platillos' || !p.categoria);
    if (categoriaFiltro === 'bebidas') return matchesSearch && (p.id_categoria === 3 || p.categoria === 'Bebidas');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
              <UtensilsCrossed size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Gestión de Platillos & Carta</h1>
              <p className="text-zinc-400 text-sm">
                Administra los platillos de la carta digital, actualiza sus precios e imágenes en tiempo real.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          <span>Añadir Nuevo Platillo</span>
        </button>
      </div>

      {/* Alerta de notificación */}
      {mensaje.texto && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
          mensaje.tipo === 'exito' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {mensaje.tipo === 'exito' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{mensaje.texto}</span>
          </div>
          <button onClick={() => setMensaje({ tipo: '', texto: '' })} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-zinc-800">
        {/* Barra de búsqueda */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-all placeholder:text-zinc-500"
          />
        </div>

        {/* Categorías Filtro */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos los Platillos' },
            { id: 'platillos', label: 'Platillos & Parrilla' },
            { id: 'bebidas', label: 'Bebidas & Refrescos' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoriaFiltro === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Platillos */}
      {loading ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-zinc-800">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-3"></div>
          <p className="text-zinc-400 text-sm">Cargando carta digital...</p>
        </div>
      ) : platillosFiltrados.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-zinc-800">
          <UtensilsCrossed size={48} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-300">No se encontraron platillos</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mt-1">
            No hay platillos registrados con ese filtro. Haz clic en "Añadir Nuevo Platillo" para crear uno.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {platillosFiltrados.map((item) => (
            <div 
              key={item.id_producto}
              className="glass-panel rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-orange-500/40 transition-all group flex flex-col justify-between"
            >
              {/* Contenedor Imagen */}
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                <img
                  src={item.imagen_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                  alt={item.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                {/* Badge Categoria */}
                <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-700/60 text-zinc-300 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Tag size={12} className="text-orange-400" />
                  {item.categoria || (item.id_categoria === 3 ? 'Bebidas' : 'Platillos')}
                </span>

                {/* Badge Precio */}
                <span className="absolute bottom-3 right-3 bg-orange-500 text-white font-bold text-sm px-3 py-1 rounded-xl shadow-lg shadow-orange-500/30">
                  S/ {parseFloat(item.precio || 0).toFixed(2)}
                </span>
              </div>

              {/* Contenido Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {item.nombre}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {item.descripcion || 'Deliciosa preparación artesanal Don Bigote a la parrilla.'}
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800/80 hover:bg-orange-500/20 hover:text-orange-400 border border-zinc-700/50 hover:border-orange-500/30 text-zinc-300 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Edit3 size={14} />
                    <span>Editar</span>
                  </button>

                  {deleteConfirmId === item.id_producto ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id_producto)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all"
                        title="Confirmar eliminación"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="bg-zinc-800 text-zinc-300 px-2 py-2 rounded-xl text-xs transition-all"
                        title="Cancelar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item.id_producto)}
                      className="p-2 bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 border border-zinc-700/50 hover:border-red-500/30 text-zinc-400 rounded-xl transition-all"
                      title="Eliminar platillo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulario Crear/Editar (Flexible y Scrollable) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl relative max-h-[90vh] flex flex-col my-auto overflow-hidden">
            {/* Modal Header (Fijo) */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-5 bg-zinc-900/90 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {editingItem ? 'Editar Platillo' : 'Nuevo Platillo a la Carta'}
                </h2>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario con Scroll Interno */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Nombre del Platillo / Bebida *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Anticucho de Corazón Especial"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Categoría y Precio */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Categoría *
                    </label>
                    <select
                      value={formData.id_categoria}
                      onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                    >
                      <option value={1}>Platillo / Parrilla</option>
                      <option value={3}>Bebida / Refresco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Precio (S/) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">S/</span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        required
                        placeholder="0.00"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white pl-9 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-bold text-orange-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Descripción / Acompañamiento
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Servido con papas doradas, choclo tierno y ají tradicional macerado."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                {/* URL de Imagen */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    URL de la Imagen del Platillo
                  </label>
                  <div className="relative">
                    <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imagen_url}
                      onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Galería de imágenes rápidas preset */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    O elige una foto sugerida:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imagen_url: img.url })}
                        className={`relative h-12 rounded-lg overflow-hidden border transition-all ${
                          formData.imagen_url === img.url 
                            ? 'border-orange-500 ring-2 ring-orange-500/50' 
                            : 'border-zinc-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-medium px-1 text-center leading-tight">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Previsualización rápida */}
                {formData.imagen_url && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-3">
                    <img
                      src={formData.imagen_url}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div className="text-xs">
                      <p className="text-white font-bold">{formData.nombre || 'Nombre del platillo'}</p>
                      <p className="text-orange-400 font-semibold mt-0.5">S/ {parseFloat(formData.precio || 0).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con Botones (Fijo al final) */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Actualizar Platillo' : 'Guardar Platillo'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatillosPage;
