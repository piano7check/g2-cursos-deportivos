import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import styles from '../../routes/admin/AdminDashboard.module.css';

const MessageModal = ({ message, type, onClose, onConfirm }) => {
    let icon = null;
    let title = '';
    
    switch (type) {
        case 'success':
            icon = <FaCheckCircle />; 
            title = 'Éxito';
            break;
        case 'error':
            icon = <FaTimesCircle />; 
            title = 'Error';
            break;
        case 'confirm':
            icon = <FaExclamationCircle />;
            title = 'Confirmación Necesaria';
            break;
        default:
            icon = <FaExclamationCircle />; 
            title = 'Información';
            break;
    }

    const modalTypeClass = styles[`${type}Modal`]; 
    const buttonTypeClass = styles[`${type}Button`];
    const cancelButtonTypeClass = styles[`cancelConfirmButton`];

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.messageModal} ${modalTypeClass}`}>
                <div className={styles.messageIcon}> 
                    {icon}
                </div>
                <h4 className={styles.messageTitle}>{title}</h4> 
                <p className={styles.messageText}>{message}</p> 

                {type === 'confirm' ? (
                    <div className={styles.messageActions}>
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
                    <div className={styles.messageActions}> 
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
