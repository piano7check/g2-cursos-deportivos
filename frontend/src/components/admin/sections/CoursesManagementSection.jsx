import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlus, FaRedo } from 'react-icons/fa';
import { getCursos, createCurso, updateCurso, deleteCurso, buscarCursos, getProfesores } from '../../../services/cursosService';
import { getAllCategorias } from '../../../services/categoriasService';
import CursosTable from '../cursos/CursosTable';
import CourseModal from '../cursos/CourseModal';
import SectionCard from '../layout/SectionCard';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const CoursesManagementSection = ({ showMessage, contextUsuario, navigate }) => {
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const [professors, setProfessors] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchTermCourseName, setSearchTermCourseName] = useState('');
    const [searchTermCourseCategory, setSearchTermCourseCategory] = useState('');
    const [searchTermCourseProfessor, setSearchTermCourseProfessor] = useState('');

    const debounceTimeoutRef = useRef(null);

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
                categoria_nombre: course.categoria_nombre,
                coste: course.coste 
            }));
            setCourses(fetchedCourses);
        } catch (err) {
            showMessage({ message: err.message || 'Error al cargar los cursos. Por favor, intente de nuevo.', type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingCourses(false);
        }
    }, [showMessage, navigate]);

    const fetchProfessors = useCallback(async () => {
        try {
            const fetchedProfs = await getProfesores();
            if (fetchedProfs && fetchedProfs.profesores) {
                setProfessors(fetchedProfs.profesores);
            } else {
                setProfessors([]);
            }
        } catch (err) {
            showMessage({ message: err.message || 'Error cargando profesores para el modal de cursos.', type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        }
    }, [showMessage, navigate]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getAllCategorias();
            if (response && response.categorias) {
                setCategories(response.categorias);
            } else {
                setCategories([]);
            }
        } catch (err) {
            showMessage({ message: err.message || 'Error al cargar las categorías para el modal de cursos.', type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        }
    }, [showMessage, navigate]);

    useEffect(() => {
        if (contextUsuario) {
            fetchCourses();
            fetchProfessors();
            fetchCategories();
        }
    }, [contextUsuario, fetchCourses, fetchProfessors, fetchCategories]);


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
            coste: course.coste !== undefined && course.coste !== null ? String(course.coste) : '',
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
                    coste: courseData.coste, 
                    horarios: courseData.horarios,
                };

                await updateCurso(editingCourse.id, dataToSendForPatch);
                showMessage({ message: `El curso "${courseData.nombre}" se actualizó correctamente.`, type: 'success' });
            } else {
                const dataToSend = {
                    nombre: courseData.nombre,
                    descripcion: courseData.descripcion,
                    cupos: courseData.cupos,
                    profesor_id: courseData.profesor_id,
                    categoria_id: courseData.categoria_id,
                    coste: courseData.coste, 
                    horarios: courseData.horarios,
                };
                const response = await createCurso(dataToSend);
                showMessage({ message: `El curso "${response.nombre}" se creó correctamente.`, type: 'success' });
            }
            setShowCourseModal(false);
            setEditingCourse(null);
            fetchCourses(searchTermCourseName, searchTermCourseCategory, searchTermCourseProfessor);
        } catch (err) {
            const errorMessage = err.data?.detalle || err.message || 'Error desconocido al guardar curso.';
            showMessage({ message: `Error al guardar curso: ${errorMessage}`, type: 'error' });
            if (err.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        showMessage({
            message: '¿Está seguro de que desea eliminar este curso? Esta acción es irreversible.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    await deleteCurso(courseId);
                    showMessage({ message: `El curso se eliminó correctamente.`, type: 'success' });
                    fetchCourses(searchTermCourseName, searchTermCourseCategory, searchTermCourseProfessor);
                } catch (err) {
                    const errorMessage = err.data?.detalle || err.message || 'Error desconocido al eliminar curso.';
                    showMessage({ message: `Error al eliminar curso: ${errorMessage}`, type: 'error' });
                    if (err.status === 401) {
                        navigate('/login');
                    }
                }
            }
        });
    };

    const handleClearCourseSearch = () => {
        setSearchTermCourseName('');
        setSearchTermCourseCategory('');
        setSearchTermCourseProfessor('');
    };

    return (
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
            {showCourseModal && (
                <CourseModal
                    editingCourse={editingCourse}
                    professors={professors}
                    categories={categories}
                    onClose={() => { setShowCourseModal(false); setEditingCourse(null); }}
                    onSave={handleSaveCourse}
                />
            )}
        </SectionCard>
    );
};

export default CoursesManagementSection;
