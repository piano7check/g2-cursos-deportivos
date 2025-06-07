import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaClipboardCheck, FaBookOpen, FaPlus, FaSignOutAlt, FaHome, FaBars, FaTimes, FaTags } from 'react-icons/fa';

import { useUsuarioContext } from '../../context/UsuarioContext';
import { getCursos, createCurso, updateCurso, deleteCurso, getProfesores } from '../../services/cursosService';
import { getAllCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/categoriasService';
import { logoutUser } from '../../services/userService';

import CursosTable from '../../components/admin/cursos/CursosTable';
import CourseModal from '../../components/admin/cursos/CourseModal';
import CategoriasTable from '../../components/admin/categorias/CategoriasTable';
import CategoriaModal from '../../components/admin/categorias/CategoriaModal';
import MessageModal from '../../components/common/MessageModal';
import UserProfileWidget from '../../components/common/UserProfileWidget';

import styles from './AdminDashboard.module.css'; // Importa tus estilos CSS Modules

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

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('info'); // 'info', 'success', 'error', 'confirm'
    const [statusModalOnConfirm, setStatusModalOnConfirm] = useState(null); // Callback para el modal de confirmación

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Función para cerrar el modal de estado/confirmación
    const closeStatusModal = () => {
        setShowStatusModal(false);
        setStatusModalMessage('');
        setStatusModalType('info');
        setStatusModalOnConfirm(null);
    };

    // --- Funciones de carga de datos ---

    const fetchCourses = useCallback(async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const response = await getCursos();
            const fetchedCourses = response.cursos.map(course => ({
                id: course.id,
                nombre: course.nombre, // Aseguramos que sea 'nombre'
                descripcion: course.descripcion, // Aseguramos que sea 'descripcion'
                cupos: course.cupos, // Aseguramos que sea 'cupos'
                profesor_id: course.profesor_id, 
                profesor_nombre: `${course.profesor_nombre || ''} ${course.profesor_apellido || ''}`.trim(), // Para mostrar en tabla
                horarios: course.horarios,
                categoria_id: course.categoria_id,
                categoria_nombre: course.categoria_nombre
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
            if (fetchedProfs && fetchedProfs.profesores) {
                setProfessors(fetchedProfs.profesores);
            } else {
                setProfessors([]); 
                console.warn("No se encontraron profesores o el formato de datos es incorrecto:", fetchedProfs);
            }
        } catch (err) {
            setStatusModalMessage(err.message || 'Error cargando profesores.');
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        }
    }, [navigate]);

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        setErrorCategories(null);
        try {
            const response = await getAllCategorias();
            if (response && response.categorias) {
                 setCategories(response.categorias);
            } else {
                 setCategories([]); 
                 console.warn("No se encontraron categorías o el formato de datos es incorrecto:", response);
            }
        } catch (err) {
            setStatusModalMessage(err.message || 'Error al cargar las categorías. Por favor, intente de nuevo.');
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingCategories(false);
        }
    }, [navigate]);

    // --- Efecto para cargar datos al iniciar ---
    useEffect(() => {
        if (!cargandoContext) {
            if (contextUsuario) {
                fetchCourses();
                fetchProfessors();
                fetchCategories();
            } else {
                navigate('/login');
            }
        }
    }, [cargandoContext, contextUsuario, fetchCourses, fetchProfessors, fetchCategories, navigate]);

    // --- Manejo de Cursos ---

    const handleNewCourseClick = () => {
        setEditingCourse(null);
        setShowCourseModal(true);
    };

    const handleEditCourseClick = (course) => {
        // CORRECCIÓN CLAVE: Mapear las propiedades del curso para que coincidan
        // con las propiedades esperadas en el estado 'courseData' de CourseModal.jsx
        setEditingCourse({
            id: course.id,
            nombre: course.nombre, // Usar 'nombre' de los datos ya mapeados en fetchCourses
            descripcion: course.descripcion, // Usar 'descripcion'
            cupos: course.cupos, // Usar 'cupos'
            profesor_id: course.profesor_id, // Usar 'profesor_id'
            categoria_id: course.categoria_id, // Usar 'categoria_id'
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
                    categoria_id: courseData.categoria_id,
                    horarios: courseData.horarios,
                };

                await updateCurso(editingCourse.id, dataToSendForPatch);
                setStatusModalMessage(`El curso "${courseData.nombre}" se actualizó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            } else {
                const dataToSend = {
                    nombre: courseData.nombre,
                    descripcion: courseData.descripcion,
                    cupos: courseData.cupos,
                    profesor_id: courseData.profesor_id,
                    categoria_id: courseData.categoria_id,
                    horarios: courseData.horarios,
                };
                const response = await createCurso(dataToSend);
                setStatusModalMessage(`El curso "${response.nombre}" se creó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            fetchCourses(); 
            triggerCoursesUpdate(); 
        } catch (err) {
            const errorMessage = err.data?.detalle || err.message || 'Error desconocido al guardar curso.';
            setStatusModalMessage(`Error al guardar curso: ${errorMessage}`);
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        setStatusModalMessage('¿Está seguro de que desea eliminar este curso? Esta acción es irreversible.');
        setStatusModalType('confirm');
        setStatusModalOnConfirm(() => async () => {
            closeStatusModal(); 
            try {
                await deleteCurso(courseId);
                setStatusModalMessage(`El curso se eliminó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
                fetchCourses(); 
                triggerCoursesUpdate();
            } catch (err) {
                const errorMessage = err.data?.detalle || err.message || 'Error desconocido al eliminar curso.';
                setStatusModalMessage(`Error al eliminar curso: ${errorMessage}`);
                setStatusModalType('error');
                setShowStatusModal(true);
                if (err.status === 401) {
                    navigate('/login');
                }
            }
        });
        setShowStatusModal(true); 
    };

    // --- Manejo de Categorías ---

    const handleNewCategoryClick = () => {
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const handleEditCategoryClick = (category) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            if (editingCategory) {
                await updateCategoria(editingCategory.id, categoryData);
                setStatusModalMessage(`La categoría "${categoryData.nombre}" se actualizó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            } else {
                const response = await createCategoria(categoryData);
                setStatusModalMessage(`La categoría "${response.nombre}" se creó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            const errorMessage = err.data?.detalle || err.message || 'Error desconocido al guardar categoría.';
            setStatusModalMessage(`Error al guardar categoría: ${errorMessage}`);
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        setStatusModalMessage('¿Está seguro de que desea eliminar esta categoría? Esta acción es irreversible.');
        setStatusModalType('confirm');
        setStatusModalOnConfirm(() => async () => {
            closeStatusModal();
            try {
                await deleteCategoria(categoryId);
                setStatusModalMessage(`La categoría se eliminó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
                fetchCategories();
            } catch (err) {
                const errorMessage = err.data?.detalle || err.message || 'Error desconocido al eliminar categoría.';
                setStatusModalMessage(`Error al eliminar categoría: ${errorMessage}`);
                setStatusModalType('error');
                setShowStatusModal(true);
                if (err.status === 401) {
                    navigate('/login');
                }
            }
        });
        setShowStatusModal(true); 
    };

    // --- Manejo de Sesión ---

    const handleLogout = async () => {
        try {
            await logoutUser();
            setUsuario(null); 
            navigate('/login'); 
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            setStatusModalMessage(`Error al cerrar sesión: ${err.message || 'Error desconocido'}`);
            setStatusModalType('error');
            setShowStatusModal(true);
        }
    };

    // --- Carga y Restricción de Acceso ---

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

    // --- Renderizado del Dashboard ---

    return (
        <div className={styles.adminDashboard}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <button
                    className={styles.closeSidebarButton} 
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <FaTimes />
                </button>
                <div className={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                </div>
                <nav className={styles.nav}> 
                    <MenuItem icon={<FaHome />} text="Resumen" onClick={() => setActiveTab('overview')} active={activeTab === 'overview'} />
                    <MenuItem icon={<FaUsers />} text="Gestión de Usuarios" onClick={() => setActiveTab('users')} active={activeTab === 'users'} />
                    <MenuItem icon={<FaChalkboardTeacher />} text="Gestión de Profesores" onClick={() => setActiveTab('professors')} active={activeTab === 'professors'} />
                    <MenuItem icon={<FaBookOpen />} text="Gestión de Cursos" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
                    <MenuItem icon={<FaTags />} text="Gestión de Categorías" onClick={() => setActiveTab('categories')} active={activeTab === 'categories'} />
                </nav>
                <div className={styles.sidebarFooter}>
                    <UserProfileWidget />
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        <FaSignOutAlt className={styles.logoutIcon} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className={styles.mainContent}>
                <header className={styles.header}> 
                    <button
                        className={styles.menuButton} 
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <FaBars />
                    </button>
                    <h1>
                        {
                            activeTab === 'overview' ? 'Resumen del Panel' :
                            activeTab === 'users' ? 'Gestión de Usuarios' :
                            activeTab === 'professors' ? 'Gestión de Profesores' :
                            activeTab === 'courses' ? 'Gestión de Cursos' :
                            activeTab === 'categories' ? 'Gestión de Categorías' : ''
                        }
                    </h1>
                </header>

                <main className={styles.dashboardContent}>
                    {activeTab === 'overview' && (
                        <div className={styles.overviewSection}>
                            <div className={styles.statsGrid}>
                                <StatCard title="Usuarios Totales" value="150" icon={<FaUsers />} />
                                <StatCard title="Profesores Activos" value={professors.length} icon={<FaChalkboardTeacher />} />
                                <StatCard title="Cursos Publicados" value={courses.length} icon={<FaBookOpen />} />
                                <StatCard title="Categorías Registradas" value={categories.length} icon={<FaTags />} />
                            </div>
                            {/* Actividad Reciente placeholder */}
                            <div className={styles.recentActivity}>
                                <h3>Actividad Reciente</h3>
                                <ul>
                                    <li>Nuevo curso añadido: Programación Avanzada</li>
                                    <li>Usuario 'Juan Perez' registrado</li>
                                    <li>Categoría 'Fitness' actualizada</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <SectionCard title="Gestión de Usuarios">
                            <p className={styles.text}>Aquí irá la tabla y gestión de usuarios.</p> 
                        </SectionCard>
                    )}
                    {activeTab === 'professors' && (
                        <SectionCard title="Gestión de Profesores">
                            <p className={styles.text}>Aquí irá la tabla y gestión de profesores.</p> 
                        </SectionCard>
                    )}
                    {activeTab === 'courses' && (
                        <SectionCard title="Gestión de Cursos">
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
                        </SectionCard>
                    )}
                    {activeTab === 'categories' && (
                        <SectionCard title="Gestión de Categorías">
                            <div className={styles.sectionHeader}>
                                <h2>Gestión de Categorías</h2>
                                <button className={styles.addButton} onClick={handleNewCategoryClick}>
                                    <FaPlus /> Nueva Categoría
                                </button>
                            </div>
                            <CategoriasTable
                                categories={categories}
                                loading={loadingCategories}
                                error={errorCategories}
                                onEdit={handleEditCategoryClick}
                                onDelete={handleDeleteCategory}
                            />
                        </SectionCard>
                    )}
                </main>
            </div>

            {/* Modals */}
            {showCourseModal && (
                <CourseModal
                    editingCourse={editingCourse}
                    professors={professors} 
                    categories={categories} 
                    onClose={() => { setShowCourseModal(false); setEditingCourse(null); }}
                    onSave={handleSaveCourse}
                />
            )}

            {showCategoryModal && (
                <CategoriaModal
                    editingCategory={editingCategory}
                    onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                    onSave={handleSaveCategory}
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

// Componente auxiliar para elementos del menú lateral
const MenuItem = ({ icon, text, onClick, active }) => (
    <li
        className={`${styles.navItem} ${active ? styles.active : ''}`} 
        onClick={onClick}
    >
        {icon}
        <span className={styles.navText}>{text}</span> 
    </li>
);

// Componente auxiliar para tarjetas de estadísticas
const StatCard = ({ title, value, icon }) => (
    <div className={styles.statCard}> 
        <h3>{title}</h3>
        <p>{value}</p>
        <div className={styles.statIcon}> 
            {icon}
        </div>
    </div>
);

// Componente auxiliar para secciones del dashboard
const SectionCard = ({ title, children }) => (
    <div className={styles.dashboardSection}> 
        <h2 className={styles.sectionHeaderH2}> 
            {title}
        </h2>
        {children}
    </div>
);

export default AdminDashboard;
