import React from 'react';
import { Navigate } from 'react-router-dom';
import useUsuario from '../../hooks/useUsuario';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { usuario, loading } = useUsuario();

  if (loading) {
    return <p>Cargando...</p>; 
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
