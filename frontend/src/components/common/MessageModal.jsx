import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import styles from '../../routes/admin/AdminDashboard.module.css';

const MessageModal = ({ message, type, onClose, onConfirm }) => {
    let icon = null;
    let title = '';
    
    // No necesitamos bgColor, textColor, borderColor aquí porque los controlaremos completamente con CSS Modules
    // a través de las clases específicas como styles.successModal, styles.errorModal, etc.

    switch (type) {
        case 'success':
            icon = <FaCheckCircle />; // Icono sin clases Tailwind aquí
            title = 'Éxito';
            break;
        case 'error':
            icon = <FaTimesCircle />; // Icono sin clases Tailwind aquí
            title = 'Error';
            break;
        case 'confirm':
            icon = <FaExclamationCircle />; // Icono sin clases Tailwind aquí
            title = 'Confirmación Necesaria';
            break;
        default: // 'info'
            icon = <FaExclamationCircle />; // Icono sin clases Tailwind aquí
            title = 'Información';
            break;
    }

    // Aplicar la clase de estilo del tipo de modal dinámicamente
    const modalTypeClass = styles[`${type}Modal`]; // Ej: styles.confirmModal, styles.errorModal
    const buttonTypeClass = styles[`${type}Button`]; // Ej: styles.confirmButton, styles.infoButton
    const cancelButtonTypeClass = styles[`cancelConfirmButton`]; // Clase para el botón de cancelar en confirmación

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.messageModal} ${modalTypeClass}`}>
                <div className={styles.messageIcon}> {/* Nuevo div para el icono */}
                    {icon}
                </div>
                <h4 className={styles.messageTitle}>{title}</h4> {/* Usando clases de CSS Modules */}
                <p className={styles.messageText}>{message}</p> {/* Usando clases de CSS Modules */}

                {type === 'confirm' ? (
                    <div className={styles.messageActions}> {/* Usando clase de CSS Modules */}
                        <button
                            onClick={onConfirm}
                            className={`${styles.messageButton} ${buttonTypeClass}`}
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={onClose}
                            className={`${styles.messageButton} ${cancelButtonTypeClass}`}
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div className={styles.messageActions}> {/* Usando clase de CSS Modules */}
                        <button
                            onClick={onClose}
                            className={`${styles.messageButton} ${buttonTypeClass}`}
                        >
                            Aceptar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageModal;
