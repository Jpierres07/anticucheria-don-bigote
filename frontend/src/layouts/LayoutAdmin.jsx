import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutDashboard, Flame, Boxes, Snowflake, FileText, DollarSign } from 'lucide-react';

const LayoutAdmin = () => {
  const location = useLocation();

  const links = [
    { path: '/admin/dashboard', label: 'Dashboard Financiero', icon: <LayoutDashboard size={18} /> },
    { path: '/cocina/parrilla', label: 'Parrilla KDS (Cocina)', icon: <Flame size={18} className="text-orange-500" /> },
    { path: '/salon/cobro', label: 'Caja & Cobro de Mesas', icon: <DollarSign size={18} className="text-emerald-400" /> },
    { path: '/admin/inventario', label: 'Gestión de Insumos', icon: <Boxes size={18} /> },
    { path: '/admin/congeladora', label: 'Cierre Congeladora', icon: <Snowflake size={18} className="text-cyan-400" /> },
    { path: '/admin/reportes', label: 'Reportes PDF & Ventas', icon: <FileText size={18} className="text-amber-400" /> }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row container-custom py-6 gap-6">
        {/* Sidebar Administradora (Sra. Norma) */}
        <aside className="w-full md:w-64 glass-panel p-4 h-fit flex flex-col gap-2">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Módulos Sra. Norma
          </div>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
