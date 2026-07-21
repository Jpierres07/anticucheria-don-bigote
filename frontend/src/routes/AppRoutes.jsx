import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Layouts
import LayoutAdmin from '../layouts/LayoutAdmin';
import LayoutMozo from '../layouts/LayoutMozo';
import LayoutCliente from '../layouts/LayoutCliente';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import CartaQR from '../pages/cliente/CartaQR';
import MisPedidos from '../pages/cliente/MisPedidos';
import Reservas from '../pages/cliente/Reservas';
import MesasPiso from '../pages/salon/MesasPiso';
import TomarPedido from '../pages/salon/TomarPedido';
import CobroCaja from '../pages/salon/CobroCaja';
import Comandera from '../pages/cocina/Comandera';
import Dashboard from '../pages/admin/Dashboard';
import ReportesPage from '../pages/admin/ReportesPage';
import Inventario from '../pages/admin/Inventario';
import Congeladora from '../pages/admin/Congeladora';

// Guard
import ProtectedRoute from '../components/ProtectedRoute';

// Componente para Redirección Inicial Inteligente al Login
const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.rol === 'Atención al Cliente y Limpieza' || user.rol === 'Mozo') {
    return <Navigate to="/salon/mesas" replace />;
  }

  if (user.rol === 'Administradora, Parrillera y Ventas' || user.rol === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <LayoutCliente />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Ruta Raíz con Redirección Inteligente al Login */}
      <Route path="/" element={<RootRoute />}>
        <Route index element={<CartaQR />} />
      </Route>

      {/* Rutas Cliente Web / QR */}
      <Route path="/cliente" element={<LayoutCliente />}>
        <Route index element={<Navigate to="/cliente/carta" replace />} />
        <Route path="carta" element={<CartaQR />} />
        <Route path="mis-pedidos" element={<MisPedidos />} />
        <Route path="reservas" element={<Reservas />} />
      </Route>

      {/* Rutas Salón / Mozos (Edgar & Tania) */}
      <Route
        path="/salon"
        element={
          <ProtectedRoute allowedRoles={['Atención al Cliente y Limpieza', 'Administradora, Parrillera y Ventas']}>
            <LayoutMozo />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/salon/mesas" replace />} />
        <Route path="mesas" element={<MesasPiso />} />
        <Route path="tomar-pedido" element={<TomarPedido />} />
        <Route path="cobro" element={<CobroCaja />} />
      </Route>

      {/* Vista Cocina / Parrilla KDS (Sra. Norma) */}
      <Route
        path="/cocina/parrilla"
        element={
          <ProtectedRoute allowedRoles={['Administradora, Parrillera y Ventas', 'Atención al Cliente y Limpieza']}>
            <Comandera />
          </ProtectedRoute>
        }
      />

      {/* Rutas Administración / Sra. Norma */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Administradora, Parrillera y Ventas']}>
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="congeladora" element={<Congeladora />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
