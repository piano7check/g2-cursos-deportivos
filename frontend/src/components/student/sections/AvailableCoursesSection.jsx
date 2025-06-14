import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { useUsuarioContext } from '../../../context/UsuarioContext';
import MessageModal from '../../common/MessageModal';
import useAdminMessages from '../../../hooks/common/useAdminMessages';
import { getCursosEstudiantes } from '../../../services/cursosService';
import { reservarCurso } from '../../../services/reservasService';

import styles from './AvailableCoursesSection.module.css'; 

const FieldWithFallback = ({ value, fallback = "No definido", children }) => {
    return value ? (children || value) : fallback;
};

const AvailableCoursesSection = () => {
    const { usuario, cargando, error: authErrorContext, coursesLastUpdated } = useUsuarioContext();
    const [cursos, setCursos] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const navigate = useNavigate();

    const {
        showStatusModal,
        statusModalMessage,
        statusModalType,
        statusModalOnConfirm,
        closeStatusModal,
        showMessage
    } = useAdminMessages();

    const fetchCursosEstudiantes = useCallback(async () => {
        setLoadingCourses(true);
        setErrorCourses(null);
        try {
            const data = await getCursosEstudiantes();
            const cursosValidados = Array.isArray(data?.cursos)
                ? data.cursos.map(curso => ({
                    ...curso,
                    horarios: Array.isArray(curso.horarios) ? curso.horarios : [],
                }))
                : [];
            setCursos(cursosValidados);
        } catch (err) {
            setErrorCourses(err.message || 'Error desconocido al cargar cursos');
            if (err.message.includes('No autorizado') || err.cause === 'unauthorized') {
                navigate('/login');
            }
        } finally {
            setLoadingCourses(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!cargando && usuario) {
            fetchCursosEstudiantes();
        } else if (!cargando && !usuario) {
        }
    }, [cargando, usuario, fetchCursosEstudiantes, coursesLastUpdated]);


    const toggleDetails = (courseId) => {
        setExpandedCourseId(prevId => prevId === courseId ? null : courseId);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        return timeString.split(':').slice(0, 2).join(':');
    };

    const handleReservarCurso = async (cursoId, cursoNombre) => {
        showMessage({
            message: `¿Deseas reservar un cupo en el curso "${cursoNombre}"? Esta acción asegura tu lugar, pero deberás validar el pago posteriormente.`,
            type: 'confirm',
            onConfirm: async () => {
                try {
                    const result = await reservarCurso(cursoId);
                    showMessage({
                        message: result.mensaje || `¡Has reservado el curso "${cursoNombre}" con éxito!`,
                        type: 'success'
                    });
                    setCursos(prevCursos =>
                        prevCursos.map(curso =>
                            curso.id === cursoId
                                ? {
                                    ...curso,
                                    is_reserved_by_student: true,
                                    cupos: Math.max(0, curso.cupos - 1)
                                }
                                : curso
                        )
                    );
                } catch (error) {
                    showMessage({
                        message: error.message || `Error al reservar el curso "${cursoNombre}".`,
                        type: 'error'
                    });
                }
            }
        });
    };

    if (loadingCourses) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando cursos...</p>
            </div>
        );
    }

    if (errorCourses) return <div className={styles.error}>Error: {errorCourses}</div>;

    if (cursos.length === 0) return <div className={styles.emptyState}>No hay cursos disponibles</div>;

    return (
        <div className={styles.availableCoursesSection}>
            <h2 className={styles.sectionTitle}>Cursos Disponibles</h2>
            <div className={styles.cursosGrid}>
                {cursos.map(curso => {
                    const isExpanded = expandedCourseId === curso.id;

                    return (
                        <div
                            key={curso.id}
                            className={`${styles.cursoCard} ${isExpanded ? styles.expanded : ''}`}
                        >
                            <div className={styles.cursoHeader}>
                                <h3 className={styles.cursoNombre}>
                                    <FieldWithFallback value={curso.nombre} fallback="Curso sin nombre" />
                                </h3>
                                <div className={styles.cursoResumen}>
                                    <div className={styles.infoContainer}>
                                        <p>
                                            <strong>Cupos:</strong>
                                            <FieldWithFallback value={curso.cupos} fallback="N/A" />
                                        </p>
                                        <p>
                                            <strong>Costo:</strong> bs{' '}
                                            <FieldWithFallback value={parseFloat(curso.coste).toFixed(2)} fallback="N/A" />
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleDetails(curso.id)}
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
                                <div className={styles.cursoDetalles}>
                                    <p className={styles.cursoDescripcion}>
                                        <FieldWithFallback value={curso.descripcion} fallback="No hay descripción disponible" />
                                    </p>

                                    <p className={styles.categoriaInfo}>
                                        <strong>Categoría:</strong>{' '}
                                        <FieldWithFallback value={curso.categoria_nombre} fallback="Sin categoría" />
                                    </p>

                                    <p className={styles.profesorInfo}>
                                        <strong>Profesor:</strong>{' '}
                                        <FieldWithFallback value={`${curso.profesor_nombre || ''} ${curso.profesor_apellido || ''}`.trim()} />
                                    </p>

                                    <div className={styles.horariosContainer}>
                                        <p><strong>Horarios:</strong></p>
                                        {curso.horarios.length > 0 ? (
                                            <ul className={styles.horariosList}>
                                                {curso.horarios.map((horario, index) => (
                                                    <li key={index}>
                                                        <span className={styles.dia}>
                                                            <FieldWithFallback value={horario.dia} fallback="Día no especificado" />:
                                                        </span>
                                                        <span className={styles.horas}>
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
                                            className={`${styles.reserveButton} ${curso.is_reserved_by_student ? styles.reserved : ''}`}
                                            onClick={() => handleReservarCurso(curso.id, curso.nombre)}
                                            disabled={curso.cupos <= 0 || curso.is_reserved_by_student}
                                        >
                                            {curso.is_reserved_by_student ? (
                                                <>
                                                    <FaCheckCircle /> Cupo Reservado
                                                </>
                                            ) : (
                                                <>
                                                    <FaBookmark /> Reservar Cupo
                                                </>
                                            )}
                                            {curso.cupos <= 0 && !curso.is_reserved_by_student && ' (Sin cupos)'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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

export default AvailableCoursesSection;
