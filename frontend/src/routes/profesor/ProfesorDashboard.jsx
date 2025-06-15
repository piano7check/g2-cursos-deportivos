import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioContext } from '../../context/UsuarioContext';
import styles from './ProfesorDashboard.module.css';
import ProfesorSidebarNav from '../../components/profesor/layout/ProfesorSidebarNav'; 
import AttendanceManagementSection from '../../components/profesor/sections/AttendanceManagementSection';

const ProfesorDashboard = () => {
    const { usuario, cargando, error, logout } = useUsuarioContext(); 
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('attendance'); 

    useEffect(() => {
        if (!cargando) {
            if (!usuario || (usuario.rol !== 'profesor' && usuario.rol !== 'admin')) {
                navigate('/login');
            }
        }
    }, [usuario, cargando, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (cargando) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando datos del usuario...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>Error: {error}. Por favor, intente recargar la página o contacte a soporte.</p>
            </div>
        );
    }

    if (!usuario || (usuario.rol !== 'profesor' && usuario.rol !== 'admin')) {
        return null; 
    }

    return (
        <div className={styles.profesorDashboard}>
            <ProfesorSidebarNav 
                isSidebarOpen={true} 
                setIsSidebarOpen={() => {}} 
                userName={`${usuario.name} ${usuario.lastname}`}
                handleLogout={handleLogout}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <main className={styles.mainContent}>
                {activeSection === 'attendance' && <AttendanceManagementSection />}
                {activeSection === 'my-courses' && <div><h2>Mis Cursos (próximamente)</h2></div>} 
            </main>
        </div>
    );
};

export default ProfesorDashboard;
