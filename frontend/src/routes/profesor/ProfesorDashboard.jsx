import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioContext } from '../../context/UsuarioContext';
import styles from './ProfesorDashboard.module.css';
import ProfesorSidebarNav from '../../components/profesor/layout/ProfesorSidebarNav';
import AttendanceManagementSection from '../../components/profesor/sections/AttendanceManagementSection';
import AttendanceHistorySection from '../../components/profesor/sections/AttendanceHistorySection';
import MyCoursesSection from '../../components/profesor/sections/MyCoursesSection';
import CourseStudentsSection from '../../components/profesor/sections/CourseStudentsSection';

const ProfesorDashboard = () => {
    const { usuario, cargando, error, logout } = useUsuarioContext();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('attendance');
    const [attendanceSubView, setAttendanceSubView] = useState('overview');
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [dateToEdit, setDateToEdit] = useState(null);
    const [myCoursesSubView, setMyCoursesSubView] = useState('list');
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
    const [selectedCourseNameForStudents, setSelectedCourseNameForStudents] = useState(null);
    const [selectedCourseCategoryForStudents, setSelectedCourseCategoryForStudents] = useState(null); // Nuevo estado para la categoría

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

    // Modificada para recibir también courseCategory
    const navigateToCourseStudents = useCallback((courseId, courseName, courseCategory) => {
        setSelectedCourseForStudents(courseId);
        setSelectedCourseNameForStudents(courseName || 'Nombre de Curso No Disponible');
        setSelectedCourseCategoryForStudents(courseCategory || 'Categoría No Disponible'); // Asegurar un fallback
        setActiveSection('my-courses');
        setMyCoursesSubView('students');
    }, []);

    const handleBackToMyCoursesList = useCallback(() => {
        setMyCoursesSubView('list');
        setSelectedCourseForStudents(null);
        setSelectedCourseNameForStudents(null);
        setSelectedCourseCategoryForStudents(null); // Resetear también la categoría
    }, []);

    useEffect(() => {
        if (activeSection !== 'attendance') {
            setAttendanceSubView('overview');
            setCourseToEdit(null);
            setDateToEdit(null);
        }
        if (activeSection !== 'my-courses') {
            setMyCoursesSubView('list');
            setSelectedCourseForStudents(null);
            setSelectedCourseNameForStudents(null);
            setSelectedCourseCategoryForStudents(null);
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
                
                {activeSection === 'my-courses' && (
                    <>
                        {myCoursesSubView === 'list' && (
                            <MyCoursesSection onViewStudents={navigateToCourseStudents} />
                        )}
                        {myCoursesSubView === 'students' && selectedCourseForStudents && (
                            <CourseStudentsSection
                                courseId={selectedCourseForStudents}
                                courseName={selectedCourseNameForStudents}
                                courseCategory={selectedCourseCategoryForStudents}
                                onBack={handleBackToMyCoursesList}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default ProfesorDashboard;
