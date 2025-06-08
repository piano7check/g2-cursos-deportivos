import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaPlus, FaSignOutAlt, FaHome, FaBars, FaTimes, FaTags, FaSearch, FaRedo } from 'react-icons/fa';

import { useUsuarioContext } from '../../context/UsuarioContext';
import { getCursos, createCurso, updateCurso, deleteCurso, getProfesores, buscarCursos } from '../../services/cursosService';
import { getAllCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/categoriasService';
import { logoutUser, getAllUsers, createUserAdmin, updateUserAdmin, deleteUserAdmin, getTotalUsersCount } from '../../services/userService';

import CursosTable from '../../components/admin/cursos/CursosTable';
import CourseModal from '../../components/admin/cursos/CourseModal';
import CategoriasTable from '../../components/admin/categorias/CategoriasTable';
import CategoriaModal from '../../components/admin/categorias/CategoriaModal';
import MessageModal from '../../components/common/MessageModal';
import UserProfileWidget from '../../components/common/UserProfileWidget';
import UsersTable from '../../components/admin/users/UsersTable';
import UserModal from '../../components/admin/users/UserModal';

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

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [totalUsersCount, setTotalUsersCount] = useState(0);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('info');
    const [statusModalOnConfirm, setStatusModalOnConfirm] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [searchTermCourseName, setSearchTermCourseName] = useState('');
    const [searchTermCourseCategory, setSearchTermCourseCategory] = useState('');
    const [searchTermCourseProfessor, setSearchTermCourseProfessor] = useState('');

    const [searchTermUserName, setSearchTermUserName] = useState('');
    const [searchTermUserLastname, setSearchTermUserLastname] = useState('');
    const [searchTermUserEmail, setSearchTermUserEmail] = useState('');

    const debounceTimeoutRef = useRef(null);
    const debounceTimeoutUserSearchRef = useRef(null);

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

    const fetchUsers = useCallback(async (page, limit, name = '', lastname = '', email = '') => {
        setLoadingUsers(true);
        setErrorUsers(null);
        try {
            const offset = (page - 1) * limit;
            const response = await getAllUsers(limit, offset, name, lastname, email);
            if (response && response.usuarios) {
                setUsers(response.usuarios);
            } else {
                setUsers([]);
                console.warn("No se encontraron usuarios o el formato de datos es incorrecto:", response);
            }
        } catch (err) {
            setStatusModalMessage(err.message || 'Error al cargar los usuarios. Por favor, intente de nuevo.');
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingUsers(false);
        }
    }, [navigate]);

    const fetchTotalUsers = useCallback(async (name = '', lastname = '', email = '') => {
        try {
            const response = await getTotalUsersCount(name, lastname, email);
            if (response && typeof response.total_users === 'number') {
                setTotalUsersCount(response.total_users);
            } else {
                console.warn("No se pudo obtener el conteo total de usuarios o el formato es incorrecto:", response);
                setTotalUsersCount(0);
            }
        } catch (err) {
            console.error('Error al obtener el conteo total de usuarios:', err);
            setTotalUsersCount(0);
        }
    }, []);

    useEffect(() => {
        if (!cargandoContext) {
            if (contextUsuario) {
                fetchCourses();
                fetchProfessors();
                fetchCategories();
                fetchTotalUsers(); 
            } else {
                navigate('/login');
            }
        }
    }, [cargandoContext, contextUsuario, fetchCourses, fetchProfessors, fetchCategories, fetchTotalUsers, navigate]);

    useEffect(() => {
        if (activeTab === 'users' && contextUsuario) {
            fetchUsers(currentPage, usersPerPage, searchTermUserName, searchTermUserLastname, searchTermUserEmail);
            fetchTotalUsers(searchTermUserName, searchTermUserLastname, searchTermUserEmail);
        }
    }, [activeTab, currentPage, usersPerPage, fetchUsers, fetchTotalUsers, contextUsuario, searchTermUserName, searchTermUserLastname, searchTermUserEmail]);


    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (searchTermCourseName || searchTermCourseCategory || searchTermCourseProfessor) {
            debounceTimeoutRef.current = setTimeout(() => {
                fetchCourses(searchTermCourseName, searchTermCourseCategory, searchTermCourseProfessor);
            }, 500);
        } else {
            fetchCourses();
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchTermCourseName, searchTermCourseCategory, searchTermCourseProfessor, fetchCourses]);

    const handleNewUserClick = () => {
        setEditingUser(null);
        setShowUserModal(true);
    };

    const handleEditUserClick = (user) => {
        setEditingUser(user);
        setShowUserModal(true);
    };

    const handleSaveUser = async (userData) => {
        try {
            if (editingUser) {
                await updateUserAdmin(editingUser.id, userData);
                setStatusModalMessage(`El usuario "${userData.name} ${userData.lastname}" se actualizó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            } else {
                const response = await createUserAdmin(userData);
                setStatusModalMessage(`El usuario "${response.name || userData.name}" se creó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
            }
            setShowUserModal(false);
            setEditingUser(null);
            fetchUsers(currentPage, usersPerPage, searchTermUserName, searchTermUserLastname, searchTermUserEmail);
            fetchTotalUsers(searchTermUserName, searchTermUserLastname, searchTermUserEmail);
        } catch (err) {
            const errorMessage = err.data?.error || err.message || 'Error desconocido al guardar usuario.';
            setStatusModalMessage(`Error al guardar usuario: ${errorMessage}`);
            setStatusModalType('error');
            setShowStatusModal(true);
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        setStatusModalMessage('¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible.');
        setStatusModalType('confirm');
        setStatusModalOnConfirm(() => async () => {
            closeStatusModal();
            try {
                await deleteUserAdmin(userId);
                setStatusModalMessage(`El usuario se eliminó correctamente.`);
                setStatusModalType('success');
                setShowStatusModal(true);
                fetchUsers(currentPage, usersPerPage, searchTermUserName, searchTermUserLastname, searchTermUserEmail);
                fetchTotalUsers(searchTermUserName, searchTermUserLastname, searchTermUserEmail);
            } catch (err) {
                const errorMessage = err.data?.error || err.message || 'Error desconocido al eliminar usuario.';
                setStatusModalMessage(`Error al eliminar usuario: ${errorMessage}`);
                setStatusModalType('error');
                setShowStatusModal(true);
                if (err.status === 401) {
                    navigate('/login');
                }
            }
        });
        setShowStatusModal(true);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClearUserSearch = () => {
        setSearchTermUserName('');
        setSearchTermUserLastname('');
        setSearchTermUserEmail('');
        setCurrentPage(1);
    };


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
            profesor_id: course.profesor_id ? String(course.profesor_id) : '',
            categoria_id: course.categoria_id ? String(course.categoria_id) : '',
            horarios: course.horarios && course.horarios.length > 0
                ? course.horarios.map(h => ({
                    dia: h.dia,
                    hora_inicio: h.hora_inicio,
                    hora_fin: h.hora_fin
                }))
                : [{ dia: '', hora_inicio: '', hora_fin: '' }],
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
            fetchCourses(searchTermCourseName, searchTermCourseCategory, searchTermCourseProfessor);
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
                fetchCourses(searchTermCourseName, searchTermCourseCategory, searchTermCourseProfessor);
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

    const handleClearCourseSearch = () => {
        setSearchTermCourseName('');
        setSearchTermCourseCategory('');
        setSearchTermCourseProfessor('');
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
                                <StatCard title="Usuarios Totales" value={totalUsersCount} icon={<FaUsers />} />
                                <StatCard title="Profesores Activos" value={professors.length} icon={<FaChalkboardTeacher />} />
                                <StatCard title="Cursos Publicados" value={courses.length} icon={<FaBookOpen />} />
                                <StatCard title="Categorías Registradas" value={categories.length} icon={<FaTags />} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <SectionCard>
                            <div className={styles.sectionHeader}>
                                <button className={styles.addButton} onClick={handleNewUserClick}>
                                    <FaPlus /> Nuevo Usuario
                                </button>
                            </div>
                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre"
                                    value={searchTermUserName}
                                    onChange={(e) => setSearchTermUserName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por apellido"
                                    value={searchTermUserLastname}
                                    onChange={(e) => setSearchTermUserLastname(e.target.value)}
                                />
                                <input
                                    type="email"
                                    placeholder="Buscar por email"
                                    value={searchTermUserEmail}
                                    onChange={(e) => setSearchTermUserEmail(e.target.value)}
                                />
                                <button className={styles.clearSearchButton} onClick={handleClearUserSearch}>
                                    <FaRedo /> Limpiar Búsqueda
                                </button>
                            </div>
                            <UsersTable
                                users={users}
                                loading={loadingUsers}
                                error={errorUsers}
                                onEdit={handleEditUserClick}
                                onDelete={handleDeleteUser}
                                currentPage={currentPage}
                                itemsPerPage={usersPerPage}
                                totalItems={totalUsersCount}
                                onPageChange={handlePageChange}
                            />
                        </SectionCard>
                    )}
                    {activeTab === 'professors' && (
                        <SectionCard>
                            <p className={styles.text}>Aquí irá la tabla y gestión de profesores. (Los datos de profesores ya se cargan y se usan en el resumen)</p>
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
                                    value={searchTermCourseName}
                                    onChange={(e) => setSearchTermCourseName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por categoría"
                                    value={searchTermCourseCategory}
                                    onChange={(e) => setSearchTermCourseCategory(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por profesor"
                                    value={searchTermCourseProfessor}
                                    onChange={(e) => setSearchTermCourseProfessor(e.target.value)}
                                />
                                <button className={styles.clearSearchButton} onClick={handleClearCourseSearch}>
                                    <FaRedo /> Limpiar Búsqueda
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

            {showUserModal && (
                <UserModal
                    editingUser={editingUser}
                    onClose={() => { setShowUserModal(false); setEditingUser(null); }}
                    onSave={handleSaveUser}
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
