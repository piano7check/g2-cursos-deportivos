import { useState, useCallback } from 'react';

const useAdminMessages = () => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalMessage, setStatusModalMessage] = useState('');
    const [statusModalType, setStatusModalType] = useState('info');
    const [statusModalOnConfirm, setStatusModalOnConfirm] = useState(null);

    
    const closeStatusModal = useCallback(() => {
        setShowStatusModal(false);
        setStatusModalMessage('');
        setStatusModalType('info');
        setStatusModalOnConfirm(null);
    }, []);

    
    
    const showMessage = useCallback(({ message, type = 'info', onConfirm = null }) => {
        setStatusModalMessage(message);
        setStatusModalType(type);
        setStatusModalOnConfirm(() => onConfirm);
        setShowStatusModal(true);
    }, []);

    return {
        showStatusModal,
        statusModalMessage,
        statusModalType,
        statusModalOnConfirm,
        closeStatusModal,
        showMessage,
    };
};

export default useAdminMessages;
