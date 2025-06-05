import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminDashboard.module.css';
import { FaUsers, FaChalkboardTeacher, FaClipboardCheck, FaBookOpen, FaPlus, FaSignOutAlt, FaHome, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { getCursos, createCurso, updateCurso, deleteCurso, getProfesores } from '../../services/cursosService';
import CursosTable from '../../components/admin/cursos/CursosTable';
import CourseModal from '../../components/admin/cursos/CourseModal';
import MessageModal from '../../components/common/MessageModal';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [professors, setProfessors] = useState([]); 
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const navigate = useNavigate();

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('info');
    const [statusModalOnConfirm, setStatusModalOnConfirm] = useState(null);

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
        fetchCourses();
        fetchProfessors();
    }, [fetchCourses, fetchProfessors]);


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
                
                const response = await updateCurso(editingCourse.id, dataToSendForPatch); 
                setStatusModalMessage(`Curso "${response.curso?.nombre || courseData.nombre}" actualizado exitosamente.`); 
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
        setStatusModalMessage('¿Estás seguro de que quieres eliminar este curso?');
        setStatusModalType('confirm');
        setStatusModalOnConfirm(() => async () => {
            closeStatusModal();
            try {
                await deleteCurso(courseId); 
                setStatusModalMessage(`Curso ${courseId} eliminado exitosamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
                fetchCourses();
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

    const handleLogout = () => {
        document.cookie = 'access_token=; Max-Age=0; path=/;'; 
        navigate('/login');
    };

    return (
        <div className={styles.adminDashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Admin Panel</h2>
                </div>
                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FaHome /> Resumen
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'courses' ? styles.active : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        <FaBookOpen /> Cursos
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => setActiveTab('users')}
                        disabled={true} 
                    >
                        <FaUsers /> Usuarios (No implementado)
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'payments' ? styles.active : ''}`}
                        onClick={() => setActiveTab('payments')}
                        disabled={true} 
                    >
                        <FaClipboardCheck /> Validaciones de Pago (No implementado)
                    </button>
                    <button
                        className={styles.navItem}
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Bienvenido, Administrador</h1>
                    <div className={styles.userInfo}>
                        <span></span>
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
