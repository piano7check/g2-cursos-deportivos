import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import styles from '../../routes/admin/AdminDashboard.module.css'; 

const MessageModal = ({ message, type, onClose, onConfirm }) => {
    let icon = null;
    let title = '';
    let bgColor = '';
    let textColor = '';
    let borderColor = '';

    switch (type) {
        case 'success':
            icon = <FaCheckCircle className="text-green-500" />;
            title = 'Éxito';
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            borderColor = 'border-green-400';
            break;
        case 'error':
            icon = <FaTimesCircle className="text-red-500" />;
            title = 'Error';
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            borderColor = 'border-red-400';
            break;
        case 'confirm':
            icon = <FaExclamationCircle className="text-yellow-500" />;
            title = 'Confirmación Necesaria';
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            borderColor = 'border-yellow-400';
            break;
        default:
            icon = <FaExclamationCircle className="text-blue-500" />;
            title = 'Información';
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            borderColor = 'border-blue-400';
            break;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modal} p-6 rounded-lg shadow-xl max-w-sm w-full mx-auto 
                             ${bgColor} border ${borderColor} flex flex-col items-center text-center`}>
                <div className="text-4xl mb-4">
                    {icon}
                </div>
                <h4 className={`text-xl font-bold mb-3 ${textColor}`}>{title}</h4>
                <p className={`mb-6 ${textColor}`}>{message}</p>

                {type === 'confirm' ? (
                    <div className="flex gap-4">
                        <button
                            onClick={onConfirm}
                            className={`${styles.saveButton} px-6 py-2 rounded-md transition-all duration-300 ease-in-out
                                       hover:scale-105 active:scale-95`}
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={onClose}
                            className={`${styles.cancelButton} px-6 py-2 rounded-md transition-all duration-300 ease-in-out
                                       hover:scale-105 active:95`}
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onClose}
                        className={`${styles.saveButton} px-6 py-2 rounded-md transition-all duration-300 ease-in-out
                                   hover:scale-105 active:scale-95`}
                    >
                        Aceptar
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageModal;
