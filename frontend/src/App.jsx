import React from 'react';
import { Routes, Route } from 'react-router-dom'; 

import Home from './components/home/Home.jsx';
import Login from './components/login/Login.jsx';
import Registro from './components/registro/Registro.jsx';
import CursosEstudiantes from './routes/estudiante/CursosEstudiantes.jsx';
import ProtectedRoute from './components/protected/ProtectedRoute.jsx';
import AdminDashboard from './routes/admin/AdminDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registro />} />

      <Route
        path="/cursosEstudiantes"
        element={
          <ProtectedRoute allowedRoles={['estudiante', 'profesor', 'admin']}>
            <CursosEstudiantes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboardAdmin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
