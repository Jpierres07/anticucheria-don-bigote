/**
 * Middleware para la matriz de permisos por Cargo (PermisoCargo / RBAC)
 * Roles disponibles: 'Administradora, Parrillera y Ventas', 'Atención al Cliente y Limpieza', 'Cliente'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const userRole = req.user.rol || req.user.cargo;

    // Si el usuario es administrador, siempre tiene permiso total
    if (userRole === 'Administradora, Parrillera y Ventas' || userRole === 'Admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Acceso prohibido. El rol '${userRole}' no tiene permisos para este recurso.`
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
