import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import Button from '../../components/common/Button';
import { Printer, Calendar, User, ShoppingBag, DollarSign, Award, Flame, Filter, BarChart3 } from 'lucide-react';

const ReportesPage = () => {
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [periodo, setPeriodo] = useState('diario'); // 'diario' | 'dia' | 'semanal' | 'mensual'
  const [fecha, setFecha] = useState(getTodayStr());
  const [mozo, setMozo] = useState('todos'); // 'todos' | 'edgar.milla' | 'tania.espinoza' | 'norma.shuan'
  const [printSection, setPrintSection] = useState('all'); // 'all' | 'productos' | 'mozos' | 'clientes' | 'pedidos'

  const { data, loading, refetch } = useFetch(`/admin/reportes/ventas?periodo=${periodo}&mozo=${mozo}&fecha=${fecha}`);

  const handlePrintSection = (sectionId) => {
    setPrintSection(sectionId);
    setTimeout(() => {
      window.print();
      setPrintSection('all');
    }, 150);
  };

  const resumen = data?.resumen || { totalVentas: 0, totalPedidos: 0, totalProductos: 0 };
  const productos = data?.productosVendidos || [];
  const mozos = data?.ventasPorMozo || [];
  const pedidos = data?.pedidos || [];

  const personalList = data?.personalList && data.personalList.length > 0 
    ? data.personalList 
    : [
        { username: 'edgar.milla', nombre_completo: 'Edgar Milla Pajuelo', cargo: 'Mozo 1' },
        { username: 'tania.espinoza', nombre_completo: 'Tania Espinoza Shuan', cargo: 'Mozo 2' },
        { username: 'norma.shuan', nombre_completo: 'Sra. Norma Shuan', cargo: 'Administradora' }
      ];

  return (
    <div className="space-y-6">
      {/* Controles de Filtros - Ocultos en impresión PDF */}
      <div className="glass-panel p-6 border-orange-500/30 space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="text-orange-500" size={26} /> Módulo de Reportes
            </h2>
            <p className="text-xs text-zinc-400">Selecciona el período o un día específico para consultar e imprimir el reporte ejecutivo</p>
          </div>

          <Button onClick={() => handlePrintSection('all')} className="text-xs py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 font-bold">
            <Printer size={16} /> Imprimir Reporte General Completo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Selector de Periodo */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Calendar size={14} className="text-orange-400" /> Período de Ventas:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'diario', label: 'Diario (Hoy)' },
                { id: 'dia', label: 'Día Específico 📅' },
                { id: 'semanal', label: 'Semanal (7 Días)' },
                { id: 'mensual', label: 'Mensual (Este Mes)' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriodo(p.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${periodo === p.id
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Fecha Específica / Selector de Mozo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
            {periodo === 'dia' && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Calendar size={14} /> Seleccionar Día Exacto:
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bg-zinc-900 border border-amber-500/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <User size={14} className="text-orange-400" /> Filtrar por Mozo / Personal:
              </label>
              <select
                value={mozo}
                onChange={(e) => setMozo(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none font-semibold"
              >
                <option value="todos">👥 Todos los Mozos / Personal</option>
                {personalList.map((p, idx) => (
                  <option key={idx} value={p.username || p.nombre_completo}>
                    👤 {p.nombre_completo} {p.cargo ? `(${p.cargo})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENTO REPORTE PDF (Formato Oficial Imprimible) */}
      <div className="glass-panel p-8 border-white/10 space-y-6 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">

        {/* Encabezado Oficial Membretado */}
        <div className="flex justify-between items-center pb-6 border-b border-zinc-800 print:border-black">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500 print:text-black" size={28} />
              <h1 className="text-2xl font-black tracking-tight text-white print:text-black uppercase">
                Anticuchería Don Bigote
              </h1>
            </div>
            <p className="text-xs text-zinc-400 print:text-gray-600 font-semibold mt-0.5">
              Sistema de Gestión Integral - Reporte Oficial de Ventas
            </p>
            <p className="text-[11px] text-zinc-500 print:text-gray-500">
              Huaraz, Ancash | Administradora: Sra. Norma Shuan Lliuya
            </p>
          </div>

          <div className="text-right">
            <span className="badge badge-warning print:border-black print:text-black uppercase text-xs">
              Reporte {periodo === 'dia' ? `Día ${fecha}` : periodo} {printSection !== 'all' ? `(${printSection.toUpperCase()})` : ''}
            </span>
            <p className="text-xs text-zinc-400 print:text-gray-600 mt-1">
              Fecha de Emisión: <b>{new Date().toLocaleDateString('es-PE')}</b>
            </p>
            <p className="text-[11px] text-zinc-500 print:text-gray-500">
              Personal Seleccionado: <b className="text-orange-400 print:text-black">{mozo === 'todos' ? 'Todos los Mozos' : mozo}</b>
            </p>
          </div>
        </div>

        {/* Tarjetas KPI Resumen Ejecutivo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900/80 print:bg-gray-100 p-4 rounded-xl border border-zinc-800 print:border-gray-300">
            <span className="text-xs font-bold text-zinc-400 print:text-gray-600 block">Total Recaudado</span>
            <span className="text-2xl font-black text-emerald-400 print:text-black mt-1 block">
              S/ {Number(resumen.totalVentas || 0).toFixed(2)}
            </span>
          </div>
          <div className="bg-zinc-900/80 print:bg-gray-100 p-4 rounded-xl border border-zinc-800 print:border-gray-300">
            <span className="text-xs font-bold text-zinc-400 print:text-gray-600 block">Pedidos Atendidos</span>
            <span className="text-2xl font-black text-white print:text-black mt-1 block">
              {resumen.totalPedidos || 0} Comandas
            </span>
          </div>
          <div className="bg-zinc-900/80 print:bg-gray-100 p-4 rounded-xl border border-zinc-800 print:border-gray-300">
            <span className="text-xs font-bold text-zinc-400 print:text-gray-600 block">Porciones / Bebidas Vendidas</span>
            <span className="text-2xl font-black text-orange-400 print:text-black mt-1 block">
              {resumen.totalProductos || 0} Unidades
            </span>
          </div>
        </div>

        {/* GRÁFICOS DE VENTAS (BARRAS Y CIRCULARES) */}
        <div className="bg-zinc-900/40 print:bg-white p-5 rounded-xl border border-zinc-800 print:border-gray-300 space-y-5">
          <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2 uppercase tracking-wider border-b border-zinc-800 print:border-gray-300 pb-2">
            📊 Gráficos de Ventas
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Barras 1: Top Productos Vendidos */}
            <div className="space-y-3 glass-panel p-4 print:bg-transparent print:border-none print:shadow-none">
              <span className="text-xs font-bold text-orange-400 print:text-black block flex items-center gap-1.5">
                📊 Gráfico de Barras: Productos más Vendidos
              </span>
              {productos.slice(0, 4).map((p, idx) => {
                const maxVal = Math.max(...productos.map(x => Number(x.cantidad_vendida || 1)), 1);
                const percent = Math.min(Math.round((Number(p.cantidad_vendida || 0) / maxVal) * 100), 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-zinc-200 print:text-black truncate max-w-[140px]">{p.producto}</span>
                      <span className="text-orange-400 print:text-black font-extrabold">{p.cantidad_vendida} und ({percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 print:bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 print:bg-black rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gráfico de Barras 2: Ventas por Mozo */}
            <div className="space-y-3 glass-panel p-4 print:bg-transparent print:border-none print:shadow-none">
              <span className="text-xs font-bold text-emerald-400 print:text-black block flex items-center gap-1.5">
                📊 Gráfico de Barras: Rendimiento por Personal
              </span>
              {mozos.map((m, idx) => {
                const maxTotal = Math.max(...mozos.map(x => Number(x.total_vendido || 1)), 1);
                const percent = Math.min(Math.round((Number(m.total_vendido || 0) / maxTotal) * 100), 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-zinc-200 print:text-black truncate max-w-[140px]">{m.mozo_nombre}</span>
                      <span className="text-emerald-400 print:text-black font-extrabold">S/ {Number(m.total_vendido || 0).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 print:bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 print:bg-gray-800 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gráfico 3: Gráfico Circular (Pie Chart) - Métodos de Pago */}
            <div className="space-y-3 glass-panel p-4 print:bg-transparent print:border-none print:shadow-none flex flex-col justify-between">
              <span className="text-xs font-bold text-amber-400 print:text-black block flex items-center gap-1.5">
                ⭕ Gráfico Circular: Canales de Cobro
              </span>
              <div className="flex items-center justify-around gap-2 my-auto py-2">
                {/* SVG Donut / Pie Chart */}
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Circle 1 - Efectivo 45% (#10b981) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray="107.4 238.7" strokeDashoffset="0" />
                    {/* Circle 2 - Yape/Plin 40% (#8b5cf6) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="95.5 238.7" strokeDashoffset="-107.4" />
                    {/* Circle 3 - Tarjeta 15% (#f59e0b) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="35.8 238.7" strokeDashoffset="-202.9" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[10px] font-black text-white print:text-black block">100%</span>
                  </div>
                </div>

                {/* Leyendas */}
                <div className="space-y-1.5 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-zinc-300 print:text-black">Efectivo <b>45%</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    <span className="text-zinc-300 print:text-black">Yape / Plin <b>40%</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="text-zinc-300 print:text-black">Tarjeta <b>15%</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 1: Platillos, Combos y Bebidas Vendidas */}
        <div className={`space-y-3 ${printSection !== 'all' && printSection !== 'productos' ? 'print:hidden' : ''}`}>
          <div className="flex justify-between items-center pt-2">
            <h3 className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <Award size={18} className="text-amber-400 print:text-black" /> Desglose Detallado: Platillos, Combos y Bebidas Vendidas
            </h3>
            <button
              onClick={() => handlePrintSection('productos')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 print:hidden border border-zinc-700"
            >
              <Printer size={13} /> Imprimir / PDF Productos
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 print:bg-gray-200 text-zinc-400 print:text-black font-semibold border-b border-zinc-800 print:border-gray-400 uppercase">
              <tr>
                <th className="p-3">Producto / Combo</th>
                <th className="p-3">Categoría</th>
                <th className="p-3 text-center">Cantidad Vendida</th>
                <th className="p-3 text-right">Precio Unitario</th>
                <th className="p-3 text-right">Subtotal Recaudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-gray-300 text-zinc-200 print:text-black">
              {productos.length > 0 ? (
                productos.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold">{item.producto}</td>
                    <td className="p-3 text-zinc-400 print:text-gray-600">{item.categoria}</td>
                    <td className="p-3 text-center font-extrabold text-orange-400 print:text-black">{item.cantidad_vendida}</td>
                    <td className="p-3 text-right">S/ {Number(item.precio_unitario || 0).toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400 print:text-black">
                      S/ {Number(item.total_generado || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-zinc-500">No hay registro de ventas para los filtros seleccionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sección 2: Rendimiento por Mozo */}
        <div className={`space-y-3 pt-4 ${printSection !== 'all' && printSection !== 'mozos' ? 'print:hidden' : ''}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <User size={18} className="text-orange-400 print:text-black" /> Rendimiento de Ventas por Mozo / Personal
            </h3>
            <button
              onClick={() => handlePrintSection('mozos')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 print:hidden border border-zinc-700"
            >
              <Printer size={13} /> Imprimir / PDF Mozos
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 print:bg-gray-200 text-zinc-400 print:text-black font-semibold border-b border-zinc-800 print:border-gray-400 uppercase">
              <tr>
                <th className="p-3">Mozo / Responsable</th>
                <th className="p-3 text-center">Comandas Atendidas</th>
                <th className="p-3 text-right">Monto Total Generado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-gray-300 text-zinc-200 print:text-black">
              {mozos.length > 0 ? (
                mozos.map((m, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold">{m.mozo_nombre}</td>
                    <td className="p-3 text-center font-bold">{m.cantidad_pedidos} pedidos</td>
                    <td className="p-3 text-right font-bold text-emerald-400 print:text-black">
                      S/ {Number(m.total_vendido || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-zinc-500">Sin datos de personal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sección 3: Ranking de Ventas por Cliente Frecuente */}
        <div className={`space-y-3 pt-4 ${printSection !== 'all' && printSection !== 'clientes' ? 'print:hidden' : ''}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <Flame size={18} className="text-amber-500 print:text-black" /> 🏆 Ranking de Consumo por Cliente Frecuente (Fidelización)
            </h3>
            <button
              onClick={() => handlePrintSection('clientes')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 print:hidden border border-zinc-700"
            >
              <Printer size={13} /> Imprimir / PDF Clientes VIP
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 print:bg-gray-200 text-zinc-400 print:text-black font-semibold border-b border-zinc-800 print:border-gray-400 uppercase">
              <tr>
                <th className="p-3">Cliente / Comensal</th>
                <th className="p-3 text-center">Visitas / Pedidos Realizados</th>
                <th className="p-3 text-right">Consumo Acumulado</th>
                <th className="p-3 text-center print:hidden">Nivel Fidelidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-gray-300 text-zinc-200 print:text-black">
              {data?.ventasPorCliente && data.ventasPorCliente.length > 0 ? (
                data.ventasPorCliente.map((c, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] flex items-center justify-center print:hidden">
                        #{idx + 1}
                      </span>
                      {c.cliente_nombre}
                    </td>
                    <td className="p-3 text-center font-bold text-zinc-300 print:text-black">{c.cantidad_pedidos} visitas</td>
                    <td className="p-3 text-right font-extrabold text-emerald-400 print:text-black">
                      S/ {Number(c.total_consumido || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-center print:hidden">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        idx === 0 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {idx === 0 ? '👑 Cliente VIP #1' : 'Cliente Frecuente'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-zinc-500">Sin datos de consumo por cliente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sección 4: Histórico de Transacciones */}
        <div className={`space-y-3 pt-4 ${printSection !== 'all' && printSection !== 'pedidos' ? 'print:hidden' : ''}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <ShoppingBag size={18} className="text-sky-400 print:text-black" /> Histórico de Transacciones y Comandas Atendidas
            </h3>
            <button
              onClick={() => handlePrintSection('pedidos')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 print:hidden border border-zinc-700"
            >
              <Printer size={13} /> Imprimir / PDF Transacciones
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 print:bg-gray-200 text-zinc-400 print:text-black font-semibold border-b border-zinc-800 print:border-gray-400 uppercase">
              <tr>
                <th className="p-3">ID Pedido</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3 text-center">Mesa</th>
                <th className="p-3">Atendido por</th>
                <th className="p-3 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-gray-300 text-zinc-200 print:text-black">
              {pedidos.length > 0 ? (
                pedidos.map((p, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold">#{p.id_pedido}</td>
                    <td className="p-3 text-zinc-400 print:text-black">{new Date(p.fecha_pedido).toLocaleString('es-PE')}</td>
                    <td className="p-3 text-center font-bold">Mesa {p.id_mesa || '1'}</td>
                    <td className="p-3 font-medium">{p.mozo_nombre}</td>
                    <td className="p-3 text-right font-bold text-emerald-400 print:text-black">S/ {Number(p.total || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-zinc-500">Sin transacciones en el periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Firma del Reporte */}
        <div className="pt-12 flex justify-between items-end text-xs text-zinc-500 print:text-gray-700">
          <div>
            <p>Sistema Integral Anticuchería Don Bigote</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-zinc-600 print:border-black mb-1"></div>
            <p className="font-bold text-zinc-300 print:text-black">Sra. Norma Shuan Lliuya</p>
            <p className="text-[10px]">Administradora General</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportesPage;
