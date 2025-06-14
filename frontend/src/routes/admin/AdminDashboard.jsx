import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

import useAdminMessages from '../../hooks/common/useAdminMessages';

import { useUsuarioContext } from '../../context/UsuarioContext';
import { logoutUser } from '../../services/userService';
import { getProfesores, getCursos } from '../../services/cursosService';
import { getAllCategorias } from '../../services/categoriasService';
import { getTotalUsersCount } from '../../services/userService';

import SidebarNav from '../../components/admin/layout/SidebarNav';
import OverviewSection from '../../components/admin/sections/OverviewSection';
import UsersManagementSection from '../../components/admin/sections/UsersManagementSection';
import CoursesManagementSection from '../../components/admin/sections/CoursesManagementSection';
import CategoriesManagementSection from '../../components/admin/sections/CategoriesManagementSection';
import PaymentValidationSection from '../../components/admin/sections/PaymentValidationSection';

import MessageModal from '../../components/common/MessageModal';

import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const { usuario: contextUsuario, cargando: cargandoContext, setUsuario } = useUsuarioContext();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const {
        showStatusModal,
        statusModalMessage,
        statusModalType,
        statusModalOnConfirm,
        closeStatusModal,
        showMessage
    } = useAdminMessages();

    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [professorsCount, setProfessorsCount] = useState(0);
    const [coursesCount, setCoursesCount] = useState(0);
    const [categoriesCount, setCategoriesCount] = useState(0);

    const fetchOverviewData = useCallback(async () => {
        try {
            const usersResponse = await getTotalUsersCount();
            if (usersResponse && typeof usersResponse.total_users === 'number') {
                setTotalUsersCount(usersResponse.total_users);
            } else {
                setTotalUsersCount(0);
            }

            const professorsResponse = await getProfesores();
            if (professorsResponse && professorsResponse.profesores) {
                setProfessorsCount(professorsResponse.profesores.length);
            } else {
                setProfessorsCount(0);
            }

            const coursesResponse = await getCursos();
            if (coursesResponse && coursesResponse.cursos) {
                setCoursesCount(coursesResponse.cursos.length);
            } else {
                setCoursesCount(0);
            }

            const categoriesResponse = await getAllCategorias();
            if (categoriesResponse && categoriesResponse.categorias) {
                setCategoriesCount(categoriesResponse.categorias.length);
            } else {
                setCategoriesCount(0);
            }

        } catch (err) {
            console.error("Error al cargar datos del resumen:", err);
        }
    }, []);
    
    useEffect(() => {
        if (!cargandoContext) {
            if (contextUsuario) {
                fetchOverviewData();
            } else {
                navigate('/login');
            }
        }
    }, [cargandoContext, contextUsuario, fetchOverviewData, navigate]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            setUsuario(null);
            navigate('/login');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            showMessage({ message: `Error al cerrar sesión: ${err.message || 'Error desconocido'}`, type: 'error' });
        }
    };

    const getActiveTabTitle = () => {
        switch (activeTab) {
            case 'overview': return 'Resumen del Panel';
            case 'users': return 'Gestión de Usuarios';
            case 'courses': return 'Gestión de Cursos';
            case 'categories': return 'Gestión de Categorías';
            case 'payment-validation': return 'Validación de Pagos';
            default: return 'Panel de Administración';
        }
    };

    if (cargandoContext) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando panel de administración...</p>
            </div>
        );
    }

    if (!contextUsuario || contextUsuario.rol !== 'admin') {
        return (
            <div className={styles.errorContainer}>
                <p>Acceso denegado. No tienes permisos de administrador.</p>
                <button onClick={() => navigate('/login')} className={styles.backButton}>
                    Volver al inicio de sesión
                </button>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <SidebarNav
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <FaBars />
                    </button>
                    <h1>{getActiveTabTitle()}</h1>
                </header>

                <main className={styles.dashboardContent}>
                    {activeTab === 'overview' && (
                        <OverviewSection
                            totalUsersCount={totalUsersCount}
                            professorsCount={professorsCount}
                            coursesCount={coursesCount}
                            categoriesCount={categoriesCount}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersManagementSection
                            showMessage={showMessage}
                            contextUsuario={contextUsuario}
                            navigate={navigate}
                        />
                    )}
                    {activeTab === 'courses' && (
                        <CoursesManagementSection
                            showMessage={showMessage}
                            contextUsuario={contextUsuario}
                            navigate={navigate}
                        />
                    )}
                    {activeTab === 'categories' && (
                        <CategoriesManagementSection
                            showMessage={showMessage}
                            contextUsuario={contextUsuario}
                            navigate={navigate}
                        />
                    )}
                    {activeTab === 'payment-validation' && (
                        <PaymentValidationSection
                            showMessage={showMessage}
                        />
                    )}
                </main>
            </div>

            {showStatusModal && (
                <MessageModal
                    message={statusModalMessage}
                    type={statusModalType}
                    onClose={closeStatusModal}
                    onConfirm={statusModalOnConfirm}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
