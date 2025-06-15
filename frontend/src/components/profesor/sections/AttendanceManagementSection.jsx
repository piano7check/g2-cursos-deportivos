import React, { useState, useEffect, useCallback } from 'react';
import { getCursosByProfessor } from '../../../services/cursosService';
import { getStudentsByCourse, registerAttendance, getAttendanceByCourseAndDate } from '../../../services/asistenciasService';
import styles from './AttendanceManagementSection.module.css';
import { useUsuarioContext } from '../../../context/UsuarioContext';
import MessageModal from '../../common/MessageModal';

const AttendanceManagementSection = ({ mode, initialCourseId, initialDate }) => {
    const { usuario, cargando: usuarioCargando } = useUsuarioContext(); 
    const [profesorCourses, setProfesorCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(mode === 'edit-history' ? initialCourseId : '');
    const [selectedDate, setSelectedDate] = useState(mode === 'edit-history' ? initialDate : '');
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
                    if (mode !== 'edit-history') { 
                        setSelectedCourse('');
                    }
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
    }, [usuario, usuarioCargando, showInfoModal, mode]);

    const loadStudentsAndAttendance = useCallback(async (courseId, date) => {
        setLoading(true); 
        setError(null);
        try {
            const studentsData = await getStudentsByCourse(courseId);
            const attendanceData = await getAttendanceByCourseAndDate(courseId, date);

            if (studentsData.estudiantes && studentsData.estudiantes.length > 0) {
                const initialStudents = studentsData.estudiantes.map(s => ({
                    id: s.estudiante_id,
                    nombre: s.estudiante_nombre,
                    apellido: s.estudiante_apellido,
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
    }, [showInfoModal]);

    useEffect(() => {
        if (mode === 'edit-history' && initialCourseId && initialDate && !usuarioCargando && usuario?.id) {
            loadStudentsAndAttendance(initialCourseId, initialDate);
        }
    }, [mode, initialCourseId, initialDate, loadStudentsAndAttendance, usuario, usuarioCargando]);

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
    
    if (!loading && profesorCourses.length === 0 && !error) { 
        return (
            <section className={styles.attendanceManagementSection}>
                <h2 className={styles.sectionTitle}>Gestión de Asistencias</h2>
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
        <section className={styles.attendanceManagementSection}>
            <h2 className={styles.sectionTitle}>{mode === 'new-register' ? 'Registrar Asistencia Diaria' : 'Modificar Asistencia'}</h2>
            <div className={styles.controlsContainer}>
                <div className={styles.selectControl}>
                    <label htmlFor="course-select">Selecciona un Curso:</label>
                    <select
                        id="course-select"
                        className={styles.selectInput}
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setSelectedDate(''); 
                            setStudents([]); 
                            setAttendanceRecords({}); 
                        }}
                        disabled={loading || mode === 'edit-history'} 
                    >
                        <option value="">Selecciona un curso</option>
                        {profesorCourses.map(course => (
                            <option key={course.id} value={course.id}>{course.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectControl}>
                    <label htmlFor="date-select-new">Fecha:</label>
                    <input
                        type="date"
                        id="date-select-new"
                        className={styles.dateInput}
                        value={selectedDate} 
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setStudents([]); 
                            setAttendanceRecords({}); 
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={loading || !selectedCourse || mode === 'edit-history'} 
                    />
                </div>
                <button
                    className={styles.loadStudentsButton}
                    onClick={() => loadStudentsAndAttendance(selectedCourse, selectedDate)}
                    disabled={!selectedCourse || !selectedDate || loading} 
                >
                    {loading && selectedCourse && selectedDate ? 'Cargando...' : 'Cargar Lista de Asistencia'}
                </button>
            </div>

            {loading && selectedCourse && selectedDate && mode === 'edit-history' ? ( 
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando asistencia para la fecha seleccionada...</p>
                </div>
            ) : loading && selectedCourse && selectedDate && mode === 'new-register' ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando estudiantes...</p>
                </div>
            ) : error && selectedCourse && selectedDate ? ( 
                <div className={styles.error}><p>{error}</p></div>
            ) : selectedCourse && selectedDate && students.length > 0 ? ( 
                <div className={styles.attendanceListContainer}>
                    <h3 className={styles.listTitle}>Asistencia para {profesorCourses.find(c => c.id == selectedCourse)?.nombre} el {formatDisplayDate(selectedDate)}</h3>
                    
                    <div className={styles.studentsListHeader}>
                        <span className={styles.headerItem}>N°</span>
                        <span className={styles.headerItem}>Nombre</span>
                        <span className={styles.headerItem}>Apellido</span>
                        <span className={styles.headerItem}>Correo</span>
                        <span className={styles.headerItem}>Estado</span>
                    </div>

                    <ul className={styles.studentsList}>
                        {students.map((student, index) => (
                            <li key={student.id} className={styles.studentItem}>
                                <div className={styles.studentListItemNumber}>{index + 1}</div>
                                <div className={styles.studentListName}>{student.nombre}</div>
                                <div className={styles.studentListLastName}>{student.apellido}</div>
                                <div className={styles.studentListEmail}>{student.email}</div>
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
