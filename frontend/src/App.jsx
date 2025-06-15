import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/home/Home.jsx';
import Login from './components/login/Login.jsx';
import Registro from './components/registro/Registro.jsx';
import StudentDashboard from './routes/estudiante/StudentDashboard.jsx';
import AdminDashboard from './routes/admin/AdminDashboard.jsx';
import ProfesorDashboard from './routes/profesor/ProfesorDashboard.jsx'; 
import UserProfilePage from './routes/user/UserProfilePage.jsx';
import ProtectedRoute from './components/protected/ProtectedRoute.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registro />} />

            <Route
                path="/dashboardStudent"
                element={
                    <ProtectedRoute allowedRoles={['estudiante', 'profesor', 'admin']}>
                        <StudentDashboard />
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

            <Route
                path="/dashboardProfesor"
                element={
                    <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                        <ProfesorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute allowedRoles={['estudiante', 'profesor', 'admin']}>
                        <UserProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
