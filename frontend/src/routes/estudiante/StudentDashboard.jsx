import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';

import { useUsuarioContext } from '../../context/UsuarioContext';
import UserProfileWidget from '../../components/common/UserProfileWidget';
import { logoutUser } from '../../services/userService';

import StudentDashboardStyles from './StudentDashboard.module.css';

import AvailableCoursesSection from '../../components/student/sections/AvailableCoursesSection';
import MyReservationsSection from '../../../../frontend/src/components/student/sections/MyReservationsSection'; 

const StudentDashboard = () => {
    const { usuario, cargando, error: authErrorContext, setUsuario } = useUsuarioContext();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('availableCourses'); 

    useEffect(() => {
        if (!cargando && !usuario && !authErrorContext) {
            navigate('/login');
        } else if (authErrorContext) {
            console.error("Error de autenticación en StudentDashboard:", authErrorContext);
            navigate('/login');
        }
    }, [cargando, usuario, authErrorContext, navigate]);

    const handleLogout = useCallback(async () => {
        try {
            await logoutUser();
            setUsuario(null);
            navigate('/login');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        }
    }, [setUsuario, navigate]);

    const handleProfileClick = () => {
        navigate('/profile'); 
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'availableCourses':
                return <AvailableCoursesSection />;
            case 'myReservations':
                return <MyReservationsSection />;
            default:
                return <AvailableCoursesSection />;
        }
    };

    if (cargando) {
        return (
            <div className={StudentDashboardStyles.loadingContainer}>
                <div className={StudentDashboardStyles.spinner}></div>
                <p>Cargando información del usuario...</p>
            </div>
        );
    }

    if (!usuario) {
        navigate('/login');
        return null;
    }

    if (authErrorContext) return <div className={StudentDashboardStyles.errorContainer}>Error: {authErrorContext}</div>;

    return (
        <div className={StudentDashboardStyles.studentDashboard}>
            <header className={StudentDashboardStyles.header}>
                <h1 className={StudentDashboardStyles.title}>Dashboard del Estudiante</h1>
                <nav className={StudentDashboardStyles.mainNav}>
                    <button
                        className={`${StudentDashboardStyles.navButton} ${activeTab === 'availableCourses' ? StudentDashboardStyles.active : ''}`}
                        onClick={() => setActiveTab('availableCourses')}
                    >
                        Cursos Disponibles
                    </button>
                    <button
                        className={`${StudentDashboardStyles.navButton} ${activeTab === 'myReservations' ? StudentDashboardStyles.active : ''}`}
                        onClick={() => setActiveTab('myReservations')}
                    >
                        Mis Reservas
                    </button>
                    <button
                        className={StudentDashboardStyles.navButton} 
                        onClick={handleProfileClick} 
                    >
                        Mi Perfil
                    </button>
                    <button
                        className={StudentDashboardStyles.navButton}
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </button>
                </nav>
                <div className={StudentDashboardStyles.userInfo}>
                    <UserProfileWidget />
                </div>
            </header>

            <div className={StudentDashboardStyles.dashboardContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default StudentDashboard;
