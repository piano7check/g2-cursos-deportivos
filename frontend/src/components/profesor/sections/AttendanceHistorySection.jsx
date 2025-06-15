import React, { useState, useEffect, useCallback } from 'react';
import { getCursosByProfessor } from '../../../services/cursosService';
import { getAttendanceDatesByCourse } from '../../../services/asistenciasService';
import styles from './AttendanceHistorySection.module.css'; 
import { useUsuarioContext } from '../../../context/UsuarioContext';
import MessageModal from '../../common/MessageModal';

const AttendanceHistorySection = ({ onEditAttendance }) => {
    const { usuario, cargando: usuarioCargando } = useUsuarioContext();
    const [profesorCourses, setProfesorCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingDates, setLoadingDates] = useState(false);
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
        const fetchCourses = async () => {
            setLoadingCourses(true);
            setError(null);
            try {
                const data = await getCursosByProfessor();
                if (data.cursos && data.cursos.length > 0) {
                    setProfesorCourses(data.cursos);
                } else {
                    setProfesorCourses([]);
                    setSelectedCourse('');
                    showInfoModal("No se encontraron cursos asignados a este profesor. Por favor, contacte al administrador.", 'info');
                }
            } catch (err) {
                console.error("Error al cargar los cursos del profesor:", err);
                setError(err.message || "Error al cargar los cursos.");
                showInfoModal(err.message || "Error al cargar los cursos. Intente recargar la página.", 'error');
            } finally {
                setLoadingCourses(false);
            }
        };

        if (!usuarioCargando && usuario?.id) {
            fetchCourses();
        }
    }, [usuario, usuarioCargando, showInfoModal]);

    useEffect(() => {
        const fetchAttendanceDates = async () => {
            if (selectedCourse) {
                setLoadingDates(true);
                setError(null);
                try {
                    const data = await getAttendanceDatesByCourse(selectedCourse);
                    if (data.fechas && data.fechas.length > 0) {
                        setAttendanceDates(data.fechas);
                    } else {
                        setAttendanceDates([]);
                        showInfoModal("No se encontraron registros de asistencia para este curso.", 'info');
                    }
                } catch (err) {
                    console.error("Error al cargar fechas de asistencia:", err);
                    setError(err.message || "Error al cargar las fechas de asistencia.");
                    showInfoModal(err.message || "Error al cargar las fechas de asistencia.", 'error');
                    setAttendanceDates([]);
                } finally {
                    setLoadingDates(false);
                }
            } else {
                setAttendanceDates([]);
            }
        };

        fetchAttendanceDates();
    }, [selectedCourse, showInfoModal]);

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (usuarioCargando || loadingCourses) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando cursos...</p>
            </div>
        );
    }

    if (!usuario) {
        return <div className={styles.errorContainer}><p>Acceso denegado. Por favor, inicie sesión.</p></div>;
    }

    if (!loadingCourses && profesorCourses.length === 0 && !error) {
        return (
            <section className={styles.attendanceHistorySection}>
                <h2 className={styles.sectionTitle}>Historial de Asistencias</h2>
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
        <section className={styles.attendanceHistorySection}>
            <h2 className={styles.sectionTitle}>Historial de Asistencias</h2>
            <div className={styles.controlsContainer}>
                <div className={styles.selectControl}>
                    <label htmlFor="course-history-select">Selecciona un Curso:</label>
                    <select
                        id="course-history-select"
                        className={styles.selectInput}
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setAttendanceDates([]); 
                        }}
                        disabled={loadingDates}
                    >
                        <option value="">Selecciona un curso</option>
                        {profesorCourses.map(course => (
                            <option key={course.id} value={course.id}>{course.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedCourse && (
                <>
                    {loadingDates ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Cargando historial de fechas...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.error}><p>{error}</p></div>
                    ) : attendanceDates.length > 0 ? (
                        <div className={styles.datesListContainer}>
                            <h3 className={styles.listSubtitle}>Fechas de asistencia registradas para {profesorCourses.find(c => c.id == selectedCourse)?.nombre}</h3>
                            
                            <div className={styles.tableContainer}>
                                <table className={styles.attendanceTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.tableHeader}>Fecha</th>
                                            <th className={styles.tableHeader}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceDates.map(dateStr => (
                                            <tr key={dateStr} className={styles.tableRow}>
                                                <td className={styles.tableCell}>
                                                    {formatDisplayDate(dateStr)}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <button
                                                        className={styles.editButton}
                                                        onClick={() => onEditAttendance(selectedCourse, dateStr)}
                                                    >
                                                        Ver/Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No se encontraron registros de asistencia para el curso seleccionado.</p>
                        </div>
                    )}
                </>
            )}

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

export default AttendanceHistorySection;