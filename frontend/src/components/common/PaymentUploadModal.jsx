import React, { useState } from 'react';
import styles from './PaymentUploadModal.module.css';

const PaymentUploadModal = ({ isOpen, onClose, onConfirm }) => {
    const [archivoUrl, setArchivoUrl] = useState('');
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivoSeleccionado(file);
            setArchivoUrl('');
        } else {
            setArchivoSeleccionado(null);
        }
    };

    const handleUrlChange = (e) => {
        setArchivoUrl(e.target.value);
        setArchivoSeleccionado(null);
    };

    const handleSubmit = () => {
        if (archivoSeleccionado) {
            onConfirm(archivoSeleccionado);
            setArchivoSeleccionado(null);
            setArchivoUrl('');
        } else if (archivoUrl.trim()) {
            onConfirm(archivoUrl.trim());
            setArchivoUrl('');
        } else {
            alert('Por favor, selecciona un archivo o ingresa una URL para el comprobante.');
        }
    };

    const handleClose = () => {
        setArchivoUrl('');
        setArchivoSeleccionado(null);
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Adjuntar Comprobante de Pago</h2>
                <p className={styles.modalInstructions}>
                    Selecciona un archivo PDF o imagen, o pega una URL de comprobante:
                </p>

                <div className={styles.fileInputContainer}>
                    <label htmlFor="file-upload" className={styles.fileInputLabel}>
                        {archivoSeleccionado ? archivoSeleccionado.name : 'Seleccionar Archivo (PDF/Imagen)'}
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*, application/pdf"
                        onChange={handleFileChange}
                        className={styles.hiddenFileInput}
                    />
                </div>

                <p className={styles.orSeparator}>O</p>

                <input
                    type="text"
                    className={styles.urlInput}
                    value={archivoUrl}
                    onChange={handleUrlChange}
                    placeholder="Pega la URL del comprobante aquí (Ej: https://mis-imagenes.com/comprobante.jpg)"
                />
                {archivoSeleccionado && (
                    <p className={styles.selectedFileName}>Archivo seleccionado: {archivoSeleccionado.name}</p>
                )}
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