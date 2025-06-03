import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/home/Home.jsx';
import Login from './components/login/Login.jsx';
import Registro from './components/registro/Registro.jsx';
import CursosEstudiantes from './routes/estudiante/CursosEstudiantes.jsx';
import ProtectedRoute from './components/protected/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/cursosEstudiantes" element={ <ProtectedRoute allowedRoles={['estudiante', 'profesor', 'admin']}> <CursosEstudiantes /></ProtectedRoute>} />      
  </Routes>
    </Router>
  );
}

export default App;
