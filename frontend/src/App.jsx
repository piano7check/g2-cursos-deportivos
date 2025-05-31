import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registro from './components/registro/Registro.jsx';
import Home from './components/home/Home.jsx';
import Login from './components/login/Login.jsx'; 
import CursosEstudiantes from './CursosEstudiantes.jsx';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/cursosEstudiantes" 
          element={
            <ProtectedRoute allowedRoles={['estudiante', 'admin', 'profesor']}>
              <CursosEstudiantes />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
