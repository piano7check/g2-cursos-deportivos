import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getReservasEstudiantesByCourse, cancelarInscripcionEstudiante } from '../../../services/reservasService';
import MessageModal from '../../common/MessageModal';
import { FaPrint, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import styles from './CourseStudentsSection.module.css';

const CourseStudentsSection = ({ courseId, onBack, courseName, courseCategory }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('info'); 
    const [showModal, setShowModal] = useState(false);
    const [reservaToCancel, setReservaToCancel] = useState(null);
    const printableRef = useRef();

    const showMessage = useCallback((message, type = 'info') => {
        setModalMessage(message);
        setModalType(type);
        setShowModal(true);
    }, []);

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
        setModalType('info');
        setReservaToCancel(null);
    };

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getReservasEstudiantesByCourse(courseId);
            setStudents(data.estudiantes || []);
        } catch (err) {
            console.error("Error al cargar estudiantes:", err);
            setError(err.message || "Error al cargar los estudiantes.");
            showMessage(err.message || "Error al cargar los estudiantes. Intente recargar la página.", 'error');
        } finally {
            setLoading(false);
        }
    }, [courseId, showMessage]);

    useEffect(() => {
        if (courseId) {
            fetchStudents();
        }
    }, [courseId, fetchStudents]);

    const handleCancelEnrollmentClick = (reservaId) => {
        setReservaToCancel(reservaId);
        setModalMessage("¿Está seguro de que desea cancelar la inscripción de este estudiante? Esta acción revertirá un cupo al curso.");
        setModalType('confirm');
        setShowModal(true);
    };

    const confirmCancelEnrollment = async () => {
        if (!reservaToCancel) return;

        closeModal();
        try {
            const result = await cancelarInscripcionEstudiante(reservaToCancel);
            showMessage(result.mensaje || "Inscripción cancelada exitosamente.", 'success');
            fetchStudents();
        } catch (err) {
            console.error("Error al cancelar inscripción:", err);
            showMessage(err.message || "Error al cancelar la inscripción. Por favor, intente de nuevo.", 'error');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showMessage('Por favor, permite ventanas emergentes para imprimir.', 'warning');
            return;
        }

        let tableContent = '';
        if (printableRef.current) {
            const printableClone = printableRef.current.cloneNode(true);
            
            const rows = printableClone.querySelectorAll('tr');
            rows.forEach(row => {
                const lastCell = row.lastElementChild;
                if (lastCell) {
                    lastCell.remove();
                }
            });
            tableContent = printableClone.innerHTML;
        }

        const printHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Lista de Estudiantes - ${courseName || 'Curso sin Nombre'}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
                    h1 { text-align: center; color: #2980b9; margin-bottom: 5px; font-size: 24px; }
                    h2.printCategory { text-align: center; color: #3498db; margin-top: 0; font-size: 18px; font-weight: 600; }
                    p.printDate { text-align: center; font-size: 14px; color: #666; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; color: #333; font-weight: bold; }
                    .statusBadge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 0.8em;
                        font-weight: 600;
                        text-transform: capitalize;
                        color: white;
                    }
                    .statusBadge.validado { background-color: #28a745; }
                    .statusBadge.pendiente { background-color: #ffc107; }
                    .statusBadge.cancelado, .statusBadge.expirado { background-color: #6c757d; }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1>Lista de Estudiantes del Curso: ${courseName || 'Curso sin Nombre'}</h1>
                    <h2 class="printCategory">Categoría: ${courseCategory || 'Sin Categoría'}</h2>
                    <p class="printDate">Fecha de impresión: ${new Date().toLocaleDateString()}</p>
                </div>
                ${tableContent}
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
        printWindow.focus();
        
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500); 
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando lista de estudiantes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={onBack} className={styles.backButton}>
                    <FaArrowLeft /> Volver a Mis Cursos
                </button>
            </div>
        );
    }

    return (
        <section className={styles.courseStudentsSection}>
            <div className={styles.headerContainer}>
                <button onClick={onBack} className={styles.backButton}>
                    <FaArrowLeft /> Volver a Mis Cursos
                </button>
                <h2 className={styles.sectionTitle}>
                    Estudiantes de: <span className={styles.courseNameHighlight}>{courseName}</span>
                </h2>
                <button onClick={handlePrint} className={styles.printButton}>
                    <FaPrint /> Imprimir Lista
                </button>
            </div>

            <div ref={printableRef} className={styles.printableContent}>
                {students.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No hay estudiantes inscritos en este curso.</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.studentsTable}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Email</th>
                                    <th>Estado Reserva</th>
                                    <th className={styles.actionsHeader}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.reserva_id}>
                                        <td>{index + 1}</td>
                                        <td>{student.estudiante_nombre}</td>
                                        <td>{student.estudiante_apellido}</td>
                                        <td>{student.estudiante_email}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[student.estado_reserva]}`}>
                                                {student.estado_reserva}
                                            </span>
                                        </td>
                                        <td>
                                            {student.estado_reserva !== 'cancelado' && (
                                                <button
                                                    onClick={() => handleCancelEnrollmentClick(student.reserva_id)}
                                                    className={styles.actionButtonCancel}
                                                    title="Cancelar inscripción"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <MessageModal
                    message={modalMessage}
                    type={modalType}
                    onClose={closeModal}
                    onConfirm={modalType === 'confirm' ? confirmCancelEnrollment : null}
                />
            )}
        </section>
    );
};

export default CourseStudentsSection;
