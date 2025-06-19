import React, { useState, useEffect, useCallback } from 'react';
import { getMyValidatedCourses } from '../../../services/reservasService';
import MessageModal from '../../common/MessageModal';
import styles from './MyValidatedCoursesSection.module.css';
import { FaBookOpen, FaCalendarAlt, FaChalkboardTeacher, FaDollarSign, FaClock } from 'react-icons/fa';
import { BsCheckCircleFill } from 'react-icons/bs';

const FieldWithFallback = ({ value, fallback = "No definido", children }) => {
    return value ? (children || value) : fallback;
};

const MyValidatedCoursesSection = () => {
    const [validatedCourses, setValidatedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState('info');

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
        const fetchValidatedCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMyValidatedCourses();
                setValidatedCourses(data.cursos || []);
            } catch (err) {
                console.error("Error al cargar cursos validados:", err);
                setError(err.message || "Error al cargar tus cursos validados.");
                showInfoModal(err.message || "Error al cargar tus cursos validados. Intenta recargar la página.", 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchValidatedCourses();
    }, [showInfoModal]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        // Asumiendo que timeString ya es un formato de tiempo válido como 'HH:MM:SS'
        return timeString.substring(0, 5); // Para obtener 'HH:MM'
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando tus cursos validados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <section className={styles.myValidatedCoursesSection}>
            <h2 className={styles.sectionTitle}>Mis Cursos Validados</h2>
            {validatedCourses.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No tienes cursos validados actualmente.</p>
                    <p>¡Inscríbete en nuevos cursos y completa tus pagos!</p>
                </div>
            ) : (
                <div className={styles.courseCardsGrid}>
                    {validatedCourses.map(course => (
                        <div key={course.reserva_id} className={styles.courseCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.courseName}>
                                    <FaBookOpen className={styles.cardIcon} />
                                    <FieldWithFallback value={course.curso_nombre} fallback="Curso sin nombre" />
                                </h3>
                                <span className={styles.categoryBadge}>
                                    <FieldWithFallback value={course.categoria_nombre} fallback="Sin categoría" />
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p className={styles.courseDescription}>
                                    <FieldWithFallback value={course.curso_descripcion} fallback="No hay descripción disponible." />
                                </p>
                                <div className={styles.courseDetails}>
                                    <p>
                                        <FaChalkboardTeacher className={styles.detailIcon} />
                                        <strong>Profesor:</strong> <FieldWithFallback value={`${course.profesor_nombre} ${course.profesor_apellido}`} fallback="No asignado" />
                                    </p>
                                    <p>
                                        <FaDollarSign className={styles.detailIcon} />
                                        <strong>Costo:</strong> <FieldWithFallback value={course.curso_coste ? `Bs. ${course.curso_coste}` : 'Gratis'} />
                                    </p>
                                    <p>
                                        <FaCalendarAlt className={styles.detailIcon} />
                                        <strong>Fecha de Reserva:</strong> {formatDate(course.fecha_reserva)}
                                    </p>
                                    <div className={styles.horariosContainer}>
                                        <p className={styles.horariosTitle}>
                                            <FaClock className={styles.detailIcon} />
                                            <strong>Horarios:</strong>
                                        </p>
                                        {course.horarios && course.horarios.length > 0 ? (
                                            <ul className={styles.horariosList}>
                                                {course.horarios.map((horario, index) => (
                                                    <li key={index} className={styles.horarioItem}>
                                                        {horario.dia}: {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className={styles.noHorarios}>No hay horarios definidos.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <span className={styles.statusBadgeValidado}>
                                    <BsCheckCircleFill className={styles.statusIcon} /> Validado
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showModal && (
                <MessageModal
                    message={modalMessage}
                    type={messageType}
                    onClose={closeModal}
                />
            )}
        </section>
    );
};

export default MyValidatedCoursesSection;
