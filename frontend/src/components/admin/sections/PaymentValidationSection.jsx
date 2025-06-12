import React, { useState, useEffect, useCallback } from 'react';
import reservasService from '../../../services/reservasService';
import MessageModal from '../../common/MessageModal';
import useAdminMessages from '../../../hooks/common/useAdminMessages';
import SectionCard from '../layout/SectionCard'; 
import styles from '../../../routes/admin/AdminDashboard.module.css'; 

const PaymentValidationSection = ({ showMessage }) => {
    const [validations, setValidations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showComprobanteModal, setShowComprobanteModal] = useState(false);
    const [currentComprobanteUrl, setCurrentComprobanteUrl] = useState('');

    const {
        showStatusModal,
        statusModalMessage,
        statusModalType,
        statusModalOnConfirm,
        closeStatusModal,
    } = useAdminMessages();

    const fetchValidations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reservasService.obtenerValidacionesPagoAdmin();
            setValidations(response.validaciones || []);
        } catch (err) {
            console.error("Error al obtener validaciones de pago:", err);
            setError(err.message || "Error al cargar las validaciones de pago.");
            showMessage({ message: `Error al cargar validaciones: ${err.message || 'Error desconocido'}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    useEffect(() => {
        fetchValidations();
    }, [fetchValidations]);

    const handleApprove = async (validacionId) => {
        showMessage({
            message: "¿Estás seguro de que quieres aprobar este pago?",
            type: "confirm",
            onConfirm: async () => {
                try {
                    await reservasService.aprobarPago(validacionId);
                    showMessage({ message: "Pago aprobado con éxito.", type: "success" });
                    fetchValidations();
                } catch (err) {
                    console.error("Error al aprobar pago:", err);
                    showMessage({ message: `Error al aprobar pago: ${err.message || 'Error desconocido'}`, type: 'error' });
                }
            }
        });
    };

    const handleReject = async (validacionId) => {
        showMessage({
            message: "¿Estás seguro de que quieres rechazar este pago?",
            type: "confirm",
            onConfirm: async () => {
                try {
                    await reservasService.rechazarPago(validacionId);
                    showMessage({ message: "Pago rechazado con éxito.", type: "success" });
                    fetchValidations();
                } catch (err) {
                    console.error("Error al rechazar pago:", err);
                    showMessage({ message: `Error al rechazar pago: ${err.message || 'Error desconocido'}`, type: 'error' });
                }
            }
        });
    };

    const handleViewComprobante = (url) => {
        setCurrentComprobanteUrl(url);
        setShowComprobanteModal(true);
    };

    const closeComprobanteModal = () => {
        setShowComprobanteModal(false);
        setCurrentComprobanteUrl('');
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando validaciones de pago...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                <p>Error: {error}</p>
                <button onClick={fetchValidations} className={styles.backButton}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <SectionCard>
            <h2 className={styles.sectionHeader}>Validación de Pagos</h2>
            
            {validations.length === 0 ? (
                <p className={styles.emptyState}>No hay validaciones de pago pendientes en este momento.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>ID Validación</th>
                                <th>Reserva ID</th>
                                <th>Estudiante</th>
                                <th>Email Estudiante</th>
                                <th>Curso</th>
                                <th>Costo</th>
                                <th>Fecha Envío</th>
                                <th>Estado Reserva Original</th>
                                <th>Comprobante</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {validations.map((val) => (
                                <tr key={val.validacion_id}>
                                    <td>{val.validacion_id}</td>
                                    <td>{val.reserva_id}</td>
                                    <td>{val.estudiante_nombre} {val.estudiante_apellido}</td>
                                    <td>{val.estudiante_email}</td>
                                    <td>{val.curso_nombre}</td>
                                    <td>${val.curso_coste}</td>
                                    <td>{new Date(val.fecha_envio).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${
                                            val.estado_reserva_original === 'pendiente' ? styles.statusPending :
                                            val.estado_reserva_original === 'validado' ? styles.statusValidated :
                                            styles.statusCancelled
                                        }`}>
                                            {val.estado_reserva_original}
                                        </span>
                                    </td>
                                    <td>
                                        {val.archivo_url ? (
                                            <button
                                                onClick={() => handleViewComprobante(`http://localhost:5000${val.archivo_url}`)}
                                                className={styles.actionBtnIcon} 
                                            >
                                                Ver Comprobante
                                            </button>
                                        ) : (
                                            <span className={styles.text}>N/A</span>
                                        )}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            onClick={() => handleApprove(val.validacion_id)}
                                            className={`${styles.actionBtnIcon} ${styles.editActionBtn}`} 
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => handleReject(val.validacion_id)}
                                            className={`${styles.actionBtnIcon} ${styles.deleteActionBtn}`} 
                                        >
                                            Rechazar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showStatusModal && (
                <MessageModal
                    message={statusModalMessage}
                    type={statusModalType}
                    onClose={closeStatusModal}
                    onConfirm={statusModalOnConfirm}
                />
            )}

            {showComprobanteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}> 
                            <h3 className={styles.modalH3}>Comprobante de Pago</h3>
                            <button
                                onClick={closeComprobanteModal}
                                className={styles.closeModalButton}
                            >
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalContent}> 
                            {currentComprobanteUrl.endsWith('.pdf') ? (
                                <iframe src={currentComprobanteUrl} className={styles.pdfIframe}></iframe>
                            ) : (
                                <img src={currentComprobanteUrl} alt="Comprobante de Pago" className={styles.imageComprobante} />
                            )}
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                onClick={closeComprobanteModal}
                                className={`${styles.saveButton} ${styles.cancelConfirmButton}`}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SectionCard>
    );
};

export default PaymentValidationSection;
