import React, { useState, useEffect, useCallback } from 'react';
import { getCursosByProfessor } from '../../../services/cursosService';
import { getStudentsByCourse, registerAttendance, getAttendanceByCourseAndDate } from '../../../services/asistenciasService';
import styles from './AttendanceManagementSection.module.css';
import { useUsuarioContext } from '../../../context/UsuarioContext';
import MessageModal from '../../common/MessageModal';

const AttendanceManagementSection = () => {
    const { usuario, cargando: usuarioCargando } = useUsuarioContext(); 
    const [profesorCourses, setProfesorCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
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
        const fetchCourses = async () => {
            setLoading(true); 
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
                setLoading(false); 
            }
        };

        if (!usuarioCargando && usuario?.id) {
            fetchCourses();
        }
    }, [usuario, usuarioCargando, showInfoModal]);

    const loadStudentsAndAttendance = useCallback(async () => {
        if (!selectedCourse || !selectedDate || !usuario?.id) {
            showInfoModal("Por favor, selecciona un curso y una fecha para cargar la lista de asistencia.", 'warning');
            setStudents([]); 
            setAttendanceRecords({});
            return;
        }

        setLoading(true); 
        setError(null);
        try {
            const studentsData = await getStudentsByCourse(selectedCourse);
            const attendanceData = await getAttendanceByCourseAndDate(selectedCourse, selectedDate);

            if (studentsData.estudiantes && studentsData.estudiantes.length > 0) {
                const initialStudents = studentsData.estudiantes.map(s => ({
                    id: s.estudiante_id,
                    nombre: `${s.estudiante_nombre} ${s.estudiante_apellido}`,
                    email: s.estudiante_email,
                }));
                setStudents(initialStudents);

                const records = {};
                attendanceData.asistencias.forEach(record => {
                    records[record.estudiante_id] = record.estado_asistencia;
                });
                setAttendanceRecords(records);
            } else {
                setStudents([]);
                setAttendanceRecords({});
            }

        } catch (err) {
            console.error("Error al cargar estudiantes o asistencia:", err);
            setError(err.message || "Error al cargar estudiantes o asistencia para la fecha seleccionada.");
            showInfoModal(err.message || "Error al cargar estudiantes o asistencia para la fecha seleccionada.", 'error');
            setStudents([]);
            setAttendanceRecords({});
        } finally {
            setLoading(false); 
        }
    }, [selectedCourse, selectedDate, usuario?.id, showInfoModal]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceRecords(prevRecords => ({
            ...prevRecords,
            [studentId]: status,
        }));
    };

    const handleSubmitAttendance = async () => {
        if (!selectedCourse || !selectedDate || students.length === 0) {
            showInfoModal("Por favor, selecciona un curso y una fecha, y asegúrate de que haya estudiantes para registrar asistencia.", 'warning');
            return;
        }

        const attendanceList = students.map(student => ({
            estudiante_id: student.id,
            estado_asistencia: attendanceRecords[student.id] || 'ausente',
        }));

        const payload = {
            curso_id: parseInt(selectedCourse),
            fecha: selectedDate,
            lista_asistencia: attendanceList,
        };

        setLoading(true);
        try {
            const result = await registerAttendance(payload);
            showInfoModal(result.mensaje || "Asistencia guardada exitosamente.", 'success');
        } catch (err) {
            console.error("Error al guardar asistencia:", err);
            showInfoModal(err.message || "Error al guardar la asistencia.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceDisplay = (status) => {
        switch (status) {
            case 'presente':
                return 'Presente';
            case 'ausente':
                return 'Ausente';
            case 'tarde':
                return 'Tarde';
            default:
                return 'No Marcado';
        }
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00'); 
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (usuarioCargando) { 
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando información del usuario...</p>
            </div>
        );
    }

    if (!usuario) {
        return <div className={styles.errorContainer}><p>Acceso denegado. Por favor, inicie sesión.</p></div>;
    }
    
    if (!loading && (profesorCourses.length === 0 || error)) {
        return (
            <section className={styles.attendanceManagementSection}>
                <h2 className={styles.sectionTitle}>Gestión de Asistencias</h2>
                <div className={styles.emptyState}>
                    <p>{error || "No se encontraron cursos asignados a este profesor."}</p>
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
        <section className={styles.attendanceManagementSection}>
            <h2 className={styles.sectionTitle}>Gestión de Asistencias</h2>
            <div className={styles.controlsContainer}>
                <div className={styles.selectControl}>
                    <label htmlFor="course-select">Selecciona un Curso:</label>
                    <select
                        id="course-select"
                        className={styles.selectInput}
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setStudents([]); 
                            setAttendanceRecords({}); 
                        }}
                        disabled={loading} 
                    >
                        <option value="">Selecciona un curso</option>
                        {profesorCourses.map(course => (
                            <option key={course.id} value={course.id}>{course.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectControl}>
                    <label htmlFor="date-select">Selecciona la Fecha:</label>
                    <input
                        type="date"
                        id="date-select"
                        className={styles.dateInput}
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setStudents([]); 
                            setAttendanceRecords({}); 
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={loading} 
                    />
                </div>
                <button
                    className={styles.loadStudentsButton}
                    onClick={loadStudentsAndAttendance}
                    disabled={!selectedCourse || !selectedDate || loading} 
                >
                    {loading ? 'Cargando...' : 'Cargar Lista de Asistencia'}
                </button>
            </div>

            {loading && selectedCourse && selectedDate ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando lista de estudiantes...</p>
                </div>
            ) : error && selectedCourse && selectedDate ? (
                <div className={styles.error}><p>{error}</p></div>
            ) : selectedCourse && selectedDate && students.length > 0 ? (
                <div className={styles.attendanceListContainer}>
                    {/* APLICAR EL FORMATO AQUÍ */}
                    <h3 className={styles.listTitle}>Asistencia para {profesorCourses.find(c => c.id == selectedCourse)?.nombre} el {formatDisplayDate(selectedDate)}</h3>
                    <>
                        <ul className={styles.studentsList}>
                            {students.map(student => (
                                <li key={student.id} className={styles.studentItem}>
                                    <div className={styles.studentInfo}>
                                        <span className={styles.studentName}>{student.nombre}</span>
                                        <span className={styles.studentEmail}>{student.email}</span>
                                    </div>
                                    <div className={styles.attendanceControls}>
                                        <button
                                            className={`${styles.attendanceButton} ${attendanceRecords[student.id] === 'presente' ? styles.activePresent : ''}`}
                                            onClick={() => handleAttendanceChange(student.id, 'presente')}
                                        >
                                            Presente
                                        </button>
                                        <button
                                            className={`${styles.attendanceButton} ${attendanceRecords[student.id] === 'ausente' ? styles.activeAbsent : ''}`}
                                            onClick={() => handleAttendanceChange(student.id, 'ausente')}
                                        >
                                            Ausente
                                        </button>
                                        <button
                                            className={`${styles.attendanceButton} ${attendanceRecords[student.id] === 'tarde' ? styles.activeLate : ''}`}
                                            onClick={() => handleAttendanceChange(student.id, 'tarde')}
                                        >
                                            Tarde
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.actionsContainer}>
                            <button
                                className={styles.submitButton}
                                onClick={handleSubmitAttendance}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Asistencia'}
                            </button>
                        </div>
                    </>
                </div>
            ) : selectedCourse && selectedDate && students.length === 0 && !loading && !error ? (
                <div className={styles.emptyState}>
                    <p>No hay estudiantes inscritos con reserva validada para este curso o no hay asistencias registradas para la fecha seleccionada.</p>
                </div>
            ) : null 
            }

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

export default AttendanceManagementSection;
