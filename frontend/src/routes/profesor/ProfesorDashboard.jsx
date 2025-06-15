import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioContext } from '../../context/UsuarioContext';
import styles from './ProfesorDashboard.module.css';
import ProfesorSidebarNav from '../../components/profesor/layout/ProfesorSidebarNav';
import AttendanceManagementSection from '../../components/profesor/sections/AttendanceManagementSection';
import AttendanceHistorySection from '../../components/profesor/sections/AttendanceHistorySection';

const ProfesorDashboard = () => {
    const { usuario, cargando, error, logout } = useUsuarioContext();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('attendance');
    const [attendanceSubView, setAttendanceSubView] = useState('overview');
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [dateToEdit, setDateToEdit] = useState(null);

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

    const navigateToEditAttendance = useCallback((courseId, date) => {
        setCourseToEdit(courseId);
        setDateToEdit(date);
        setActiveSection('attendance');
        setAttendanceSubView('edit-specific-date');
    }, []);

    const handleBackToAttendanceOverview = useCallback(() => {
        setAttendanceSubView('overview');
        setCourseToEdit(null);
        setDateToEdit(null);
    }, []);

    useEffect(() => {
        if (activeSection !== 'attendance') {
            setAttendanceSubView('overview');
            setCourseToEdit(null);
            setDateToEdit(null);
        }
    }, [activeSection]);


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
                {activeSection === 'attendance' && (
                    <>
                        {attendanceSubView === 'overview' && (
                            <div className={styles.attendanceOverview}>
                                <h2 className={styles.sectionTitle}>Gestión de Asistencias</h2>
                                <p className={styles.overviewDescription}>Selecciona una opción para gestionar la asistencia de tus cursos.</p>
                                <div className={styles.attendanceOptions}>
                                    <button
                                        className={styles.attendanceOptionButton}
                                        onClick={() => setAttendanceSubView('daily-register')}
                                    >
                                        📝 Registrar Asistencia Diaria
                                    </button>
                                    <button
                                        className={styles.attendanceOptionButton}
                                        onClick={() => setAttendanceSubView('history')}
                                    >
                                        📅 Ver Historial de Asistencias
                                    </button>
                                </div>
                            </div>
                        )}

                        {attendanceSubView === 'daily-register' && (
                            <>
                                <button
                                    className={styles.backButton}
                                    onClick={handleBackToAttendanceOverview}
                                >
                                    ← Volver a Opciones de Asistencia
                                </button>
                                <AttendanceManagementSection mode="new-register" />
                            </>
                        )}

                        {attendanceSubView === 'history' && (
                            <>
                                <button
                                    className={styles.backButton}
                                    onClick={handleBackToAttendanceOverview}
                                >
                                    ← Volver a Opciones de Asistencia
                                </button>
                                <AttendanceHistorySection onEditAttendance={navigateToEditAttendance} />
                            </>
                        )}

                        {attendanceSubView === 'edit-specific-date' && courseToEdit && dateToEdit && (
                            <>
                                <button
                                    className={styles.backButton}
                                    onClick={handleBackToAttendanceOverview}
                                >
                                    ← Volver a Opciones de Asistencia
                                </button>
                                <AttendanceManagementSection
                                    mode="edit-history"
                                    initialCourseId={courseToEdit}
                                    initialDate={dateToEdit}
                                />
                            </>
                        )}
                    </>
                )}
                {activeSection === 'my-courses' && <div><h2>Mis Cursos (próximamente)</h2></div>}
            </main>
        </div>
    );
};

export default ProfesorDashboard;
