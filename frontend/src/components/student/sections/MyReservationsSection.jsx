import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDollarSign, FaBan, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { useUsuarioContext } from '../../../context/UsuarioContext';
import MessageModal from '../../common/MessageModal';
import PaymentUploadModal from '../../common/PaymentUploadModal';
import useAdminMessages from '../../../hooks/common/useAdminMessages';
import { obtenerReservasPorEstudiante, cancelarReserva, confirmarPago } from '../../../services/reservasService';

import styles from './MyReservationsSection.module.css';

const FieldWithFallback = ({ value, fallback = "No definido", children }) => {
    return value ? (children || value) : fallback;
};

const MyReservationsSection = () => {
    const { usuario, cargando, error: authErrorContext } = useUsuarioContext();
    const [reservas, setReservas] = useState([]);
    const [loadingReservations, setLoadingReservations] = useState(true);
    const [errorReservations, setErrorReservations] = useState(null);
    const [expandedReservationId, setExpandedReservationId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false); 
    const [currentReservationToPay, setCurrentReservationToPay] = useState(null); 
    const navigate = useNavigate();

    const {
        showStatusModal,
        statusModalMessage,
        statusModalType,
        statusModalOnConfirm,
        closeStatusModal,
        showMessage
    } = useAdminMessages();

    const fetchReservas = useCallback(async () => {
        setLoadingReservations(true);
        setErrorReservations(null);
        try {
            const data = await obtenerReservasPorEstudiante();
            const reservasValidadas = Array.isArray(data?.reservas) ? data.reservas : [];
            setReservas(reservasValidadas);
        } catch (err) {
            setErrorReservations(err.message || 'Error desconocido al cargar reservas');
            if (err.message.includes('No autorizado') || err.cause === 'unauthorized') {
                navigate('/login');
            }
        } finally {
            setLoadingReservations(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!cargando && usuario) {
            fetchReservas();
        }
    }, [cargando, usuario, fetchReservas]);

    const toggleDetails = (reservaId) => {
        setExpandedReservationId(prevId => prevId === reservaId ? null : reservaId);
    };

    const handleCancelarReserva = async (reservaId, cursoNombre) => {
        showMessage({
            message: `¿Estás seguro de que deseas cancelar la reserva del curso "${cursoNombre}"? Esta acción no se puede deshacer y el cupo se liberará.`,
            type: 'confirm',
            onConfirm: async () => {
                try {
                    const result = await cancelarReserva(reservaId);
                    showMessage({
                        message: result.mensaje || `Reserva del curso "${cursoNombre}" cancelada con éxito.`,
                        type: 'success'
                    });
                    fetchReservas();
                } catch (error) {
                    showMessage({
                        message: error.message || `Error al cancelar la reserva del curso "${cursoNombre}".`,
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleOpenPaymentModal = (reservaId, cursoNombre) => {
        setCurrentReservationToPay({ id: reservaId, nombre: cursoNombre });
        setShowPaymentModal(true);
    };

    const handleConfirmPaymentSubmit = async (archivoUrl) => {
        setShowPaymentModal(false); 
        if (!currentReservationToPay) return;

        try {
            const result = await confirmarPago(currentReservationToPay.id, archivoUrl);
            showMessage({
                message: result.mensaje || `Comprobante de pago para "${currentReservationToPay.nombre}" enviado. Esperando validación.`,
                type: 'success'
            });
            fetchReservas(); 
        } catch (error) {
            showMessage({
                message: error.message || `Error al enviar el comprobante de pago para "${currentReservationToPay.nombre}".`,
                type: 'error'
            });
        } finally {
            setCurrentReservationToPay(null);
        }
    };

    const getStatusClass = (estadoReserva, estadoPago) => {
        if (estadoReserva === 'validado') return styles.statusValidado;
        if (estadoReserva === 'cancelado') return styles.statusCancelado;
        if (estadoReserva === 'expirado') return styles.statusExpirado;
        if (estadoReserva === 'pendiente' && estadoPago === 'pendiente') return styles.statusPagoPendiente;
        return styles.statusPendiente;
    };

    const getStatusText = (estadoReserva, estadoPago) => {
        if (estadoReserva === 'validado') return 'Validado';
        if (estadoReserva === 'cancelado') return 'Cancelado';
        if (estadoReserva === 'expirado') return 'Expirado';
        if (estadoReserva === 'pendiente' && estadoPago === 'pendiente') return 'Pago en Revisión';
        return 'Pendiente de Pago';
    };

    const getStatusIcon = (estadoReserva, estadoPago) => {
        if (estadoReserva === 'validado') return <FaCheckCircle />;
        if (estadoReserva === 'cancelado') return <FaTimesCircle />;
        if (estadoReserva === 'expirado') return <FaBan />;
        if (estadoReserva === 'pendiente' && estadoPago === 'pendiente') return <FaClock />;
        return <FaInfoCircle />;
    };


    if (loadingReservations) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando tus reservas...</p>
            </div>
        );
    }

    if (errorReservations) return <div className={styles.error}>Error: {errorReservations}</div>;

    if (reservas.length === 0) return <div className={styles.emptyState}>No tienes reservas activas.</div>;

    return (
        <div className={styles.myReservationsSection}>
            <h2 className={styles.sectionTitle}>Mis Reservas</h2>
            <div className={styles.reservasGrid}>
                {reservas.map(reserva => {
                    const isExpanded = expandedReservationId === reserva.reserva_id;
                    const canCancel = reserva.estado_reserva === 'pendiente';
                    const canConfirmPayment = reserva.estado_reserva === 'pendiente' && reserva.estado_pago !== 'pendiente';
                    const isPaymentPendingReview = reserva.estado_reserva === 'pendiente' && reserva.estado_pago === 'pendiente';

                    return (
                        <div
                            key={reserva.reserva_id}
                            className={`${styles.reservaCard} ${isExpanded ? styles.expanded : ''}`}
                        >
                            <div className={styles.reservaHeader}>
                                <h3 className={styles.cursoNombre}>
                                    <FieldWithFallback value={reserva.curso_nombre} fallback="Curso no encontrado" />
                                </h3>
                                <div className={styles.reservaInfo}>
                                    <p>
                                        <strong>Fecha Reserva:</strong>{' '}
                                        <FieldWithFallback value={new Date(reserva.fecha_reserva).toLocaleDateString()} />
                                    </p>
                                    <p>
                                        <strong>Costo:</strong> ${' '}
                                        <FieldWithFallback value={parseFloat(reserva.curso_coste).toFixed(2)} fallback="N/A" />
                                    </p>
                                    <p className={getStatusClass(reserva.estado_reserva, reserva.estado_pago)}>
                                        {getStatusIcon(reserva.estado_reserva, reserva.estado_pago)}{' '}
                                        <strong>Estado:</strong> {getStatusText(reserva.estado_reserva, reserva.estado_pago)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleDetails(reserva.reserva_id)}
                                    className={styles.detailsButton}
                                    aria-expanded={isExpanded}
                                    aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                                >
                                    {isExpanded ? (
                                        <>Ocultar <FaChevronUp /></>
                                    ) : (
                                        <>Ver detalles <FaChevronDown /></>
                                    )}
                                </button>
                            </div>

                            {isExpanded && (
                                <div className={styles.reservaDetalles}>
                                    <p className={styles.cursoDescripcion}>
                                        <FieldWithFallback value={reserva.curso_descripcion} fallback="No hay descripción disponible" />
                                    </p>
                                    <p className={styles.profesorInfo}>
                                        <strong>Profesor:</strong>{' '}
                                        <FieldWithFallback value={`${reserva.profesor_nombre || ''} ${reserva.profesor_apellido || ''}`.trim()} />
                                    </p>
                                    <p className={styles.categoriaInfo}>
                                        <strong>Categoría:</strong>{' '}
                                        <FieldWithFallback value={reserva.categoria_nombre} fallback="Sin categoría" />
                                    </p>
                                    
                                    {reserva.comprobante_url && (
                                        <p className={styles.comprobanteLink}>
                                            <strong>Comprobante:</strong>{' '}
                                            <a href={reserva.comprobante_url} target="_blank" rel="noopener noreferrer">Ver Comprobante</a>
                                        </p>
                                    )}

                                    <div className={styles.actionsContainer}>
                                        {canConfirmPayment && (
                                            <button
                                                className={`${styles.actionButton} ${styles.confirmPaymentButton}`}
                                                onClick={() => handleOpenPaymentModal(reserva.reserva_id, reserva.curso_nombre)}
                                            >
                                                <FaDollarSign /> Confirmar Pago
                                            </button>
                                        )}
                                        {isPaymentPendingReview && (
                                            <button
                                                className={`${styles.actionButton} ${styles.pendingReviewButton}`}
                                                disabled
                                            >
                                                <FaClock /> Pago en Revisión
                                            </button>
                                        )}
                                        {canCancel && (
                                            <button
                                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                                onClick={() => handleCancelarReserva(reserva.reserva_id, reserva.curso_nombre)}
                                            >
                                                <FaBan /> Cancelar Reserva
                                            </button>
                                        )}
                                        {!canCancel && !canConfirmPayment && !isPaymentPendingReview && reserva.estado_reserva === 'validado' && (
                                            <span className={styles.finalizedStatus}>
                                                <FaCheckCircle /> Reserva Validada
                                            </span>
                                        )}
                                        {reserva.estado_reserva === 'expirado' && (
                                            <span className={styles.finalizedStatus}>
                                                <FaBan /> Reserva Expirada
                                            </span>
                                        )}
                                        {reserva.estado_reserva === 'cancelado' && (
                                            <span className={styles.finalizedStatus}>
                                                <FaTimesCircle /> Reserva Cancelada
                                            </span>
                                        )}
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

            {/* Modal para adjuntar comprobante de pago */}
            {showPaymentModal && (
                <PaymentUploadModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handleConfirmPaymentSubmit}
                />
            )}
        </div>
    );
};

export default MyReservationsSection;
