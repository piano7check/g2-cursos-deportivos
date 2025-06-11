import React, { useState } from 'react';
import styles from './PaymentUploadModal.module.css';

const PaymentUploadModal = ({ isOpen, onClose, onConfirm }) => {
    const [archivoUrl, setArchivoUrl] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (archivoUrl.trim()) {
            onConfirm(archivoUrl.trim());
            setArchivoUrl(''); 
        } else {
            alert('Por favor, ingresa una URL para el comprobante.');
        }
    };

    const handleClose = () => {
        setArchivoUrl(''); 
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Adjuntar Comprobante de Pago</h2>
                <p className={styles.modalInstructions}>
                    Por favor, pega o escribe la URL de tu comprobante de pago:
                </p>
                <input
                    type="text"
                    className={styles.urlInput}
                    value={archivoUrl}
                    onChange={(e) => setArchivoUrl(e.target.value)}
                    placeholder="Ej: https://mis-imagenes.com/comprobante123.jpg"
                />
                <div className={styles.modalActions}>
                    <button className={styles.confirmButton} onClick={handleSubmit}>
                        Enviar Comprobante
                    </button>
                    <button className={styles.cancelButton} onClick={handleClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentUploadModal;
