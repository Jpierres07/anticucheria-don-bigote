import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import PerfilModal from './PerfilModal';
import { Flame, ShoppingBag, LogOut, User, LayoutDashboard, Utensils, Calendar, Menu, X, FileText, Boxes, Snowflake, DollarSign } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = cart.reduce((acc, i) => acc + i.cantidad, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomePath = () => {
    if (!user) return '/';
    if (user.rol === 'Mozo') return '/salon/mesas';
    if (user.rol === 'Admin') return '/admin/dashboard';
    if (user.rol === 'Cocina' || user.rol === 'Parrillera') return '/cocina/parrilla';
    return '/';
  };

  const getPerfilPath = () => {
    if (!user) return '/login';
    if (user.rol === 'Atención al Cliente y Limpieza' || user.rol === 'Mozo') return '/salon/perfil';
    if (user.rol === 'Administradora, Parrillera y Ventas' || user.rol === 'Admin') return '/admin/perfil';
    return '/cliente/perfil';
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="container-custom flex items-center justify-between">
        {/* Brand Logo - Redirección según Rol */}
        <Link to={getHomePath()} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-ember flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="text-white fill-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              DON BIGOTE <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">PARRILLAS</span>
            </h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Anticuchería Tradicional</p>
          </div>
        </Link>

        {/* Desktop Navigation according to Role */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {(!user || user.rol === 'Cliente') && (
            <>
              <Link to="/cliente/carta" className="text-zinc-300 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                <Utensils size={16} /> Carta Digital
              </Link>
              <Link to="/cliente/mis-pedidos" className="text-zinc-300 hover:text-orange-400 transition-colors">
                Mis Pedidos
              </Link>
              <Link to="/cliente/reservas" className="text-zinc-300 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                <Calendar size={16} /> Reservas
              </Link>
            </>
          )}

          {user && (user.rol === 'Atención al Cliente y Limpieza' || user.rol?.includes('Mozo')) && (
            <>
              <Link to="/salon/mesas" className="text-zinc-300 hover:text-orange-400 transition-colors">
                Salón & Mesas
              </Link>
              <Link to="/salon/tomar-pedido" className="text-zinc-300 hover:text-orange-400 transition-colors">
                Tomar Pedido
              </Link>
            </>
          )}

          {user && (user.rol === 'Administradora, Parrillera y Ventas' || user.rol === 'Admin') && (
            <>
              <Link to="/admin/dashboard" className="text-zinc-300 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/cocina/parrilla" className="text-orange-400 font-bold hover:text-orange-300 transition-colors flex items-center gap-1.5">
                <Flame size={16} /> Parrilla KDS
              </Link>
              <Link to="/salon/cobro" className="text-zinc-300 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                <DollarSign size={16} className="text-emerald-400" /> Caja & Cobro
              </Link>
              <Link to="/admin/inventario" className="text-zinc-300 hover:text-orange-400 transition-colors">
                Inventario
              </Link>
              <Link to="/admin/congeladora" className="text-zinc-300 hover:text-orange-400 transition-colors">
                Congeladora
              </Link>
              <Link to="/admin/reportes" className="text-zinc-300 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                <FileText size={16} className="text-amber-400" /> Reportes PDF
              </Link>
            </>
          )}
        </nav>

        {/* User / Cart Control & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {(!user || user.rol === 'Cliente') && (
            <Link to="/cliente/carta" className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 bg-zinc-900/80 border border-zinc-800 rounded-full pl-3 pr-1.5 py-1">
              <Link
                to={getPerfilPath()}
                title="Ir a Mi Perfil (Editar Datos y Cambiar Contraseña)"
                className="flex flex-col text-right hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <User size={12} className="text-orange-400" /> {user.nombre_completo || user.username}
                </span>
                <span className="text-[10px] text-orange-400 font-medium truncate max-w-[100px]">{user.rol}</span>
              </Link>
              <button 
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-rose-600/30 hover:text-rose-400 flex items-center justify-center text-zinc-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-xs py-2 px-3">
              <User size={16} /> Ingresar
            </Link>
          )}

          {/* Botón Menú Hamburguesa en Pantallas Móviles */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Abrir Menú Móvil"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/95 border-t border-white/10 mt-3 pt-3 pb-4 px-2 space-y-2 text-sm font-medium animate-fade-in">
          {(!user || user.rol === 'Cliente') && (
            <>
              <Link 
                to="/cliente/carta" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <Utensils size={16} className="text-orange-400" /> Carta Digital
              </Link>
              <Link 
                to="/cliente/mis-pedidos" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <ShoppingBag size={16} className="text-orange-400" /> Mis Pedidos
              </Link>
              <Link 
                to="/cliente/reservas" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <Calendar size={16} className="text-orange-400" /> Reservas
              </Link>
            </>
          )}

          {user && (user.rol === 'Atención al Cliente y Limpieza' || user.rol?.includes('Mozo')) && (
            <>
              <Link 
                to="/salon/mesas" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                🪑 Salón & Mesas por Piso
              </Link>
              <Link 
                to="/salon/tomar-pedido" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                📝 Tomar Comanda Rápidamente
              </Link>
            </>
          )}

          {user && (user.rol === 'Administradora, Parrillera y Ventas' || user.rol === 'Admin') && (
            <>
              <Link 
                to="/admin/dashboard" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <LayoutDashboard size={16} className="text-orange-400" /> Dashboard Financiero
              </Link>
              <Link 
                to="/admin/reportes" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <FileText size={16} className="text-amber-400" /> Reportes PDF & Ventas
              </Link>
              <Link 
                to="/cocina/parrilla" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-orange-400 font-bold hover:bg-orange-500/20"
              >
                <Flame size={16} className="text-orange-500" /> Parrilla KDS (Cocina)
              </Link>
              <Link 
                to="/admin/inventario" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <Boxes size={16} className="text-orange-400" /> Gestión de Insumos (3FN)
              </Link>
              <Link 
                to="/admin/congeladora" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-200 hover:bg-orange-500/20 hover:text-orange-400"
              >
                <Snowflake size={16} className="text-cyan-400" /> Cierre Congeladora
              </Link>
            </>
          )}
        </div>
      )}

      {/* Modal de Mi Perfil y Cambiar Contraseña */}
      <PerfilModal isOpen={isPerfilOpen} onClose={() => setIsPerfilOpen(false)} />
    </header>
  );
};

export default Navbar;
