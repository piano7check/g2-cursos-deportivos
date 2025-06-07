import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaClipboardCheck, FaBookOpen, FaPlus, FaSignOutAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';

import { useUsuarioContext } from '../../context/UsuarioContext';
import { getCursos, createCurso, updateCurso, deleteCurso, getProfesores } from '../../services/cursosService';
import { logoutUser } from '../../services/userService';
import CursosTable from '../../components/admin/cursos/CursosTable';
import CourseModal from '../../components/admin/cursos/CourseModal';
import MessageModal from '../../components/common/MessageModal';
import UserProfileWidget from '../../components/common/UserProfileWidget';

import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const { usuario: contextUsuario, cargando: cargandoContext, triggerCoursesUpdate, setUsuario } = useUsuarioContext();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [professors, setProfessors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('info');
    const [statusModalOnConfirm, setStatusModalOnConfirm] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setStatusModalMessage('');
        setStatusModalType('info');
        setStatusModalOnConfirm(null);
    };

    const fetchCourses = useCallback(async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const response = await getCursos();
            const fetchedCourses = response.cursos.map(course => ({
                id: course.id,
                name: course.nombre,
                description: course.descripcion,
                capacity: course.cupos,
                professor_id: course.profesor_id,
                professor_name: `${course.profesor_nombre} ${course.profesor_apellido || ''}`.trim(),
                horarios: course.horarios
            }));
            setCourses(fetchedCourses);
        } catch (err) {
            setStatusModalMessage(err.message || 'Error al cargar los cursos. Por favor, intente de nuevo.');
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingCourses(false);
        }
    }, [navigate]);

    const fetchProfessors = useCallback(async () => {
        try {
            const fetchedProfs = await getProfesores();
            setProfessors(fetchedProfs);
        } catch (err) {
            setStatusModalMessage(err.message || 'Error cargando profesores.');
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (!cargandoContext) {
            if (contextUsuario) {
                fetchCourses();
                fetchProfessors();
            } else {
                navigate('/login');
            }
        }
    }, [cargandoContext, contextUsuario, fetchCourses, fetchProfessors, navigate]);

    const handleNewCourseClick = () => {
        setEditingCourse(null);
        setShowCourseModal(true);
    };

    const handleEditCourseClick = (course) => {
        setEditingCourse({
            id: course.id,
            nombre: course.name,
            descripcion: course.description,
            cupos: course.capacity,
            profesor_id: course.professor_id,
            horarios: course.horarios && course.horarios.length > 0 ? course.horarios : [{ dia: '', hora_inicio: '', hora_fin: '' }],
        });
        setShowCourseModal(true);
    };

    const handleSaveCourse = async (courseData) => {
        try {
            if (editingCourse) {
                const dataToSendForPatch = {
                    nombre: courseData.nombre,
                    descripcion: courseData.descripcion,
                    cupos: courseData.cupos,
                    profesor_id: courseData.profesor_id,
                    horarios: courseData.horarios,
                };

                await updateCurso(editingCourse.id, dataToSendForPatch);
                setStatusModalMessage(`Curso "${courseData.nombre}" actualizado exitosamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            } else {
                const dataToSend = {
                    nombre: courseData.nombre,
                    descripcion: courseData.descripcion,
                    cupos: courseData.cupos,
                    profesor_id: courseData.profesor_id,
                    horarios: courseData.horarios,
                };
                const response = await createCurso(dataToSend);
                setStatusModalMessage(`Curso "${response.nombre}" creado exitosamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            fetchCourses();
            triggerCoursesUpdate();
        } catch (err) {
            setStatusModalMessage(`Error al guardar el curso: ${err.data?.detalle || err.message || 'Error desconocido'}`);
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        setStatusModalMessage('¿Estás seguro de que quieres eliminar este curso?.');
        setStatusModalType('confirm');
        setStatusModalOnConfirm(() => async () => {
            closeStatusModal();
            try {
                await deleteCurso(courseId);
                setStatusModalMessage(`Curso ${courseId} eliminado exitosamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
                fetchCourses();
                triggerCoursesUpdate();
            } catch (err) {
                setStatusModalMessage(`Error al eliminar el curso: ${err.data?.detalle || err.message || 'Error desconocido'}`);
                setStatusModalType('error');
                setShowStatusModal(true);
                if (err.status === 401) {
                    navigate('/login');
                }
            }
        });
        setShowStatusModal(true);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            setUsuario(null);
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setStatusModalMessage(`Error al cerrar sesión: ${error.message || 'Error desconocido'}`);
            setStatusModalType('error');
            setShowStatusModal(true);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (cargandoContext) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando panel de administrador...</p>
            </div>
        );
    }

    if (!contextUsuario || contextUsuario.rol !== 'admin') {
        return <div className={styles.error}>Acceso denegado. Por favor, inicie sesión como administrador.</div>;
    }

    return (
        <div className={`${styles.adminDashboard} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
            {isSidebarOpen && <div className={styles.mobileBackdrop} onClick={toggleSidebar}></div>}

            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <h2>Admin Panel</h2>
                    </div>
                    <button className={styles.closeSidebarButton} onClick={toggleSidebar}>
                        <FaTimes />
                    </button>
                </div>
                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                    >
                        <FaHome /> <span className={styles.navText}>Resumen</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'courses' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }}
                    >
                        <FaBookOpen /> <span className={styles.navText}>Cursos</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                        disabled={true}
                    >
                        <FaUsers /> <span className={styles.navText}>Usuarios (No implementado)</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'payments' ? styles.active : ''}`}
                        onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}
                        disabled={true}
                    >
                        <FaClipboardCheck /> <span className={styles.navText}>Validaciones de Pago (No implementado)</span>
                    </button>
                    <button
                        className={styles.navItem}
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt /> <span className={styles.navText}>Cerrar Sesión</span>
                    </button>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <h1>Bienvenido, Administrador</h1>
                    <div className={styles.userInfo}>
                        <UserProfileWidget />
                    </div>
                </header>

                <section className={styles.dashboardSection}>
                    {activeTab === 'overview' && (
                        <div className={styles.overview}>
                            <h2>Resumen General</h2>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <h3>Cursos Activos</h3>
                                    <p>{courses.length}</p>
                                </div>
                                <div className={styles.statCard}>
                                    <h3>Profesores Registrados</h3>
                                    <p>{professors.length}</p>
                                </div>
                            </div>
                            <div className={styles.quickActions}>
                                <button className={styles.actionButton} onClick={handleNewCourseClick}><FaPlus /> Crear Nuevo Curso</button>
                                <button className={styles.actionButton} onClick={() => setActiveTab('payments')} disabled><FaClipboardCheck /> Revisar Pagos</button>
                                <button className={styles.actionButton} onClick={() => setActiveTab('users')} disabled><FaUsers /> Gestionar Usuarios</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className={styles.coursesManagement}>
                            <div className={styles.sectionHeader}>
                                <h2>Gestión de Cursos</h2>
                                <button className={styles.addButton} onClick={handleNewCourseClick}>
                                    <FaPlus /> Nuevo Curso
                                </button>
                            </div>
                            <CursosTable
                                courses={courses}
                                loading={loadingCourses}
                                error={errorCourses}
                                onEdit={handleEditCourseClick}
                                onDelete={handleDeleteCourse}
                            />
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className={styles.usersManagement}>
                            <div className={styles.sectionHeader}>
                                <h2>Gestión de Usuarios (No implementado)</h2>
                                <p>Esta sección se conectará a la API de usuarios en el futuro.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className={styles.paymentsValidation}>
                            <h2>Validación de Pagos (No implementado)</h2>
                            <p>Esta sección se conectará a la API de pagos en el futuro.</p>
                        </div>
                    )}
                </section>
            </main>

            {showCourseModal && (
                <CourseModal
                    editingCourse={editingCourse}
                    professors={professors}
                    onClose={() => setShowCourseModal(false)}
                    onSave={handleSaveCourse}
                />
            )}

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
