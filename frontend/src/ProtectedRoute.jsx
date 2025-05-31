import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  // Obtener token desde localStora
  const token = localStorage.getItem('token');

  if (!token) {
    // No hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }

  try {
    // Decodificar payload del token
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Verificar si el rol está en allowedRoles
    if (allowedRoles.includes(payload.rol)) {
      return children; // Permitir acceso
    } else {
      // Rol no autorizado
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    // Token inválido o error al decodificar
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
