import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaPlus, FaSignOutAlt, FaHome, FaBars, FaTimes, FaTags, FaSearch, FaRedo } from 'react-icons/fa';

import { useUsuarioContext } from '../../context/UsuarioContext';
import { getCursos, createCurso, updateCurso, deleteCurso, getProfesores, buscarCursos } from '../../services/cursosService';
import { getAllCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/categoriasService';
import { logoutUser } from '../../services/userService';

import CursosTable from '../../components/admin/cursos/CursosTable';
import CourseModal from '../../components/admin/cursos/CourseModal';
import CategoriasTable from '../../components/admin/categorias/CategoriasTable';
import CategoriaModal from '../../components/admin/categorias/CategoriaModal';
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

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('info');
    const [statusModalOnConfirm, setStatusModalOnConfirm] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [searchTermNombre, setSearchTermNombre] = useState('');
    const [searchTermCategoria, setSearchTermCategoria] = useState('');
    const [searchTermProfesor, setSearchTermProfesor] = useState('');

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setStatusModalMessage('');
        setStatusModalType('info');
        setStatusModalOnConfirm(null);
    };

    const fetchCourses = useCallback(async (nombre = '', categoria = '', profesor = '') => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            let response;
            if (nombre || categoria || profesor) {
                response = await buscarCursos(nombre, categoria, profesor);
            } else {
                response = await getCursos();
            }
            const fetchedCourses = response.cursos.map(course => ({
                id: course.id,
                nombre: course.nombre, 
                descripcion: course.descripcion, 
                cupos: course.cupos, 
                profesor_id: course.profesor_id, 
                profesor_nombre: `${course.profesor_nombre || ''} ${course.profesor_apellido || ''}`.trim(), 
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

    const handleNewCourseClick = () => {
        setEditingCourse(null);
        setShowCourseModal(true);
    };

    const handleEditCourseClick = (course) => {
        setEditingCourse({
            id: course.id,
            nombre: course.nombre, 
            descripcion: course.descripcion, 
            cupos: course.cupos, 
            profesor_id: course.profesor_id, 
            categoria_id: course.categoria_id, 
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

    const getActiveTabTitle = () => {
        switch (activeTab) {
            case 'overview': return 'Resumen del Panel';
            case 'users': return 'Gestión de Usuarios';
            case 'professors': return 'Gestión de Profesores';
            case 'courses': return 'Gestión de Cursos';
            case 'categories': return 'Gestión de Categorías';
            default: return 'Panel de Administración';
        }
    };

    const handleSearchCourses = () => {
        fetchCourses(searchTermNombre, searchTermCategoria, searchTermProfesor);
    };

    const handleClearSearch = () => {
        setSearchTermNombre('');
        setSearchTermCategoria('');
        setSearchTermProfesor('');
        fetchCourses('', '', '');
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
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <button
                    className={styles.closeSidebarButton} 
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <FaTimes />
                </button>
                <div className={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                    <UserProfileWidget />
                </div>
                <nav className={styles.nav}> 
                    <MenuItem icon={<FaHome />} text="Resumen" onClick={() => setActiveTab('overview')} active={activeTab === 'overview'} />
                    <MenuItem icon={<FaUsers />} text="Gestión de Usuarios" onClick={() => setActiveTab('users')} active={activeTab === 'users'} />
                    <MenuItem icon={<FaChalkboardTeacher />} text="Gestión de Profesores" onClick={() => setActiveTab('professors')} active={activeTab === 'professors'} />
                    <MenuItem icon={<FaBookOpen />} text="Gestión de Cursos" onClick={() => setActiveTab('courses')} active={activeTab === 'courses'} />
                    <MenuItem icon={<FaTags />} text="Gestión de Categorías" onClick={() => setActiveTab('categories')} active={activeTab === 'categories'} />
                </nav>
                <div className={styles.sidebarFooter}>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        <FaSignOutAlt className={styles.logoutIcon} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

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
                        <div className={styles.overviewSection}>
                            <div className={styles.statsGrid}>
                                <StatCard title="Usuarios Totales" value="150" icon={<FaUsers />} />
                                <StatCard title="Profesores Activos" value={professors.length} icon={<FaChalkboardTeacher />} />
                                <StatCard title="Cursos Publicados" value={courses.length} icon={<FaBookOpen />} />
                                <StatCard title="Categorías Registradas" value={categories.length} icon={<FaTags />} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <SectionCard>
                            <p className={styles.text}>Aquí irá la tabla y gestión de usuarios.</p> 
                        </SectionCard>
                    )}
                    {activeTab === 'professors' && (
                        <SectionCard>
                            <p className={styles.text}>Aquí irá la tabla y gestión de profesores.</p> 
                        </SectionCard>
                    )}
                    {activeTab === 'courses' && (
                        <SectionCard> 
                            <div className={styles.sectionHeader}>
                                <button className={styles.addButton} onClick={handleNewCourseClick}>
                                    <FaPlus /> Nuevo Curso
                                </button>
                            </div>
                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre de curso"
                                    value={searchTermNombre}
                                    onChange={(e) => setSearchTermNombre(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por categoría"
                                    value={searchTermCategoria}
                                    onChange={(e) => setSearchTermCategoria(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por profesor"
                                    value={searchTermProfesor}
                                    onChange={(e) => setSearchTermProfesor(e.target.value)}
                                />
                                <button className={styles.searchButton} onClick={handleSearchCourses}>
                                    <FaSearch /> Buscar
                                </button>
                                <button className={styles.clearSearchButton} onClick={handleClearSearch}>
                                    <FaRedo /> Limpiar
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
                        <SectionCard> 
                            <div className={styles.sectionHeader}>
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

const MenuItem = ({ icon, text, onClick, active }) => (
    <li
        className={`${styles.navItem} ${active ? styles.active : ''}`} 
        onClick={onClick}
    >
        {icon}
        <span className={styles.navText}>{text}</span> 
    </li>
);

const StatCard = ({ title, value, icon }) => (
    <div className={styles.statCard}> 
        <h3>{title}</h3>
        <p>{value}</p>
        <div className={styles.statIcon}> 
            {icon}
        </div>
    </div>
);

const SectionCard = ({ children }) => (
    <div className={styles.dashboardSection}> 
        {children}
    </div>
);

export default AdminDashboard;
