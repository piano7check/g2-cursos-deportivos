import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUsuarioContext } from "../../context/UsuarioContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { usuario, cargando } = useUsuarioContext();

  if (cargando) {
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
