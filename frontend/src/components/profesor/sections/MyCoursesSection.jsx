import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getCursosByProfessor } from '../../../services/cursosService';
import styles from './MyCoursesSection.module.css';
import { useUsuarioContext } from '../../../context/UsuarioContext';
import MessageModal from '../../common/MessageModal';

const FieldWithFallback = ({ value, fallback = "No definido", children }) => {
    return value ? (children || value) : fallback;
};

const MyCoursesSection = ({ onViewStudents }) => {
    const { usuario, cargando: usuarioCargando } = useUsuarioContext();
    const [profesorCourses, setProfesorCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState('info');
    const [expandedCourseId, setExpandedCourseId] = useState(null);

    const showInfoModal = useCallback((message, type = 'info') => {
        setModalMessage(message);
        setMessageType(type);
        setShowModal(true);
    }, []);

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
        setMessageType('info');
    };

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getCursosByProfessor();
                const cursosValidados = Array.isArray(data?.cursos)
                    ? data.cursos.map(curso => ({
                        ...curso,
                        horarios: Array.isArray(curso.horarios) ? curso.horarios : [],
                    }))
                    : [];
                setProfesorCourses(cursosValidados);
            } catch (err) {
                console.error("Error al cargar los cursos del profesor:", err);
                setError(err.message || "Error al cargar los cursos.");
                showInfoModal(err.message || "Error al cargar los cursos. Intente recargar la página.", 'error');
            } finally {
                setLoading(false);
            }
        };

        if (!usuarioCargando && usuario?.id) {
            fetchCourses();
        }
    }, [usuario, usuarioCargando, showInfoModal]);

    const toggleDetails = (courseId) => {
        setExpandedCourseId(prevId => prevId === courseId ? null : courseId);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        return String(timeString).split(':').slice(0, 2).join(':');
    };

    if (usuarioCargando || loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando cursos asignados...</p>
            </div>
        );
    }

    if (!usuario) {
        return <div className={styles.errorContainer}><p>Acceso denegado. Por favor, inicie sesión.</p></div>;
    }

    if (!loading && profesorCourses.length === 0 && !error) {
        return (
            <section className={styles.myCoursesSection}>
                <h2 className={styles.sectionTitle}>Mis Cursos Asignados</h2>
                <div className={styles.emptyState}>
                    <p>No se encontraron cursos asignados a este profesor.</p>
                    <p>Por favor, contacte al administrador si cree que esto es un error.</p>
                </div>
                {showModal && (
                    <MessageModal
                        show={showModal}
                        message={modalMessage}
                        type={messageType}
                        onClose={closeModal}
                    />
                )}
            </section>
        );
    }

    return (
        <section className={styles.myCoursesSection}>
            <h2 className={styles.sectionTitle}>Mis Cursos Asignados</h2>
            <div className={styles.courseCardsGrid}>
                {profesorCourses.map(course => {
                    const isExpanded = expandedCourseId === course.id;
                    return (
                        <div
                            key={course.id}
                            className={`${styles.courseCard} ${isExpanded ? styles.expanded : ''}`}
                        >
                            <div className={styles.courseHeader}>
                                <h3 className={styles.courseTitle}>
                                    <FieldWithFallback value={course.nombre} fallback="Curso sin nombre" />
                                </h3>
                                <div className={styles.courseSummary}>
                                    <div className={styles.infoContainer}>
                                        <p>
                                            <strong>Estudiantes Inscritos:</strong>{' '}
                                            <FieldWithFallback value={course.current_students_count} fallback="0" />
                                        </p>
                                        <p>
                                            <strong>Cupos Disponibles:</strong>{' '}
                                            <FieldWithFallback value={course.cupos} fallback="N/A" />
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleDetails(course.id)}
                                        className={styles.detailsButton}
                                        aria-expanded={isExpanded}
                                        aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                                    >
                                        {isExpanded ? (
                                            <>
                                                Ocultar <FaChevronUp />
                                            </>
                                        ) : (
                                            <>
                                                Ver detalles <FaChevronDown />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className={styles.courseDetailsExpanded}>
                                    <p className={styles.courseDescription}>
                                        <FieldWithFallback value={course.descripcion} fallback="No hay descripción disponible" />
                                    </p>

                                    <p className={styles.categoryInfo}>
                                        <strong>Categoría:</strong>{' '}
                                        <FieldWithFallback value={course.categoria_nombre} fallback="Sin categoría" />
                                    </p>
                                    
                                    <div className={styles.horariosContainer}>
                                        <p><strong>Horarios:</strong></p>
                                        {course.horarios && course.horarios.length > 0 ? (
                                            <ul className={styles.horariosList}>
                                                {course.horarios.map((horario, index) => (
                                                    <li key={index}>
                                                        <span className={styles.day}>
                                                            <FieldWithFallback value={horario.dia} fallback="Día no especificado" />:
                                                        </span>
                                                        <span className={styles.times}>
                                                            {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className={styles.noHorarios}>No hay horarios definidos</p>
                                        )}
                                    </div>

                                    <div className={styles.actionsContainer}>
                                        <button
                                            className={styles.viewStudentsButton}
                                            onClick={() => onViewStudents(course.id, course.nombre, course.categoria_nombre)}
                                        >
                                            Ver Estudiantes
                                            <span className={styles.buttonArrow}>→</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <MessageModal
                    show={showModal}
                    message={modalMessage}
                    type={messageType}
                    onClose={closeModal}
                />
            )}
        </section>
    );
};

export default MyCoursesSection;
