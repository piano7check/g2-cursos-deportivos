import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioContext } from '../../context/UsuarioContext';
import { updateCurrentUser, deleteCurrentUser } from '../../services/userService';
import MessageModal from '../../components/common/MessageModal';
import { FaUserCircle, FaEnvelope, FaIdCard, FaBuilding, FaEdit, FaTrash, FaSave, FaTimes, FaLock, FaArrowLeft } from 'react-icons/fa';
import styles from './UserProfilePage.module.css';

const UserProfilePage = () => {
    const { usuario, cargando, error, setUsuario } = useUsuarioContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        current_password: '',
    });
    const [statusModal, setStatusModal] = useState({
        show: false,
        message: '',
        type: 'info',
        onConfirm: null,
    });

    useEffect(() => {
        if (!cargando && usuario && !isEditing) {
            setFormData({
                name: usuario.name || '',
                lastname: usuario.lastname || '',
                email: usuario.email || '',
                password: '',
                current_password: '',
            });
        }
        
        if (!cargando && !usuario) {
            navigate('/login');
        }
    }, [usuario, isEditing, cargando, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showModal = (message, type, onConfirm = null) => {
        setStatusModal({ show: true, message, type, onConfirm });
    };

    const closeModal = () => {
        setStatusModal({ ...statusModal, show: false });
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (usuario) {
            setFormData({
                name: usuario.name || '',
                lastname: usuario.lastname || '',
                email: usuario.email || '',
                password: '',
                current_password: '',
            });
        }
    };

    const handleSaveProfile = async () => {
        if (formData.password && formData.password.length < 6) {
            showModal('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }
        if (formData.password && !formData.current_password) {
            showModal('Debe proporcionar su contraseña actual para cambiarla.', 'error');
            return;
        }

        const dataToUpdate = {
            name: formData.name,
            lastname: formData.lastname,
            email: formData.email,
        };

        if (formData.password) {
            dataToUpdate.password = formData.password;
            if (formData.current_password) {
                dataToUpdate.current_password = formData.current_password;
            }
        }

        try {
            const response = await updateCurrentUser(dataToUpdate);
            setUsuario(response.usuario);
            setIsEditing(false);
            showModal('Perfil actualizado exitosamente.', 'success');
        } catch (err) {
            console.error('Error al guardar perfil:', err);
            showModal(`Error al actualizar perfil: ${err.data?.error || err.message || 'Error desconocido'}`, 'error');
        }
    };

    const handleDeleteAccount = () => {
        showModal(
            '¿Está seguro de que desea eliminar su cuenta? Esta acción es irreversible.',
            'confirm',
            async () => {
                closeModal();
                try {
                    await deleteCurrentUser();
                    setUsuario(null);
                    showModal('Cuenta eliminada exitosamente.', 'success');
                    navigate('/login');
                } catch (err) {
                    console.error('Error al eliminar cuenta:', err);
                    showModal(`Error al eliminar cuenta: ${err.data?.error || err.message || 'Error desconocido'}`, 'error');
                }
            }
        );
    };

    const handleGoBack = () => {
        if (usuario && usuario.rol === 'admin') {
            navigate('/dashboardAdmin');
        } else if (usuario && (usuario.rol === 'estudiante' || usuario.rol === 'profesor')) {
            navigate('/cursosEstudiantes');
        } else
            navigate('/');
        
    };

    if (cargando) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (error) {
        return <div className={styles.errorContainer}><p>Error al cargar el perfil: {error}</p></div>;
    }

    if (!usuario) {
        return <div className={styles.errorContainer}><p>No autorizado. Por favor inicie sesión.</p></div>;
    }

    return (
        <div className={styles.profilePageContainer}>
            <header className={styles.pageHeader}>
                <button onClick={handleGoBack} className={styles.backButton}>
                    <FaArrowLeft /> Atrás
                </button>
                <h1>Perfil de Usuario</h1>
            </header>

            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <FaUserCircle className={styles.profileAvatar} />
                    <h2>{usuario.name || 'Usuario'} {usuario.lastname || ''}</h2>
                    <p className={styles.userRole}>Rol: {usuario.rol}</p>
                </div>
                {!isEditing ? (
                    <div className={styles.profileDetails}>
                        <div className={styles.detailItem}>
                            <FaUserCircle className={styles.detailIcon} />
                            <span><strong>Nombre:</strong> {usuario.name || 'No definido'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <FaUserCircle className={styles.detailIcon} />
                            <span><strong>Apellido:</strong> {usuario.lastname || 'No definido'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <FaEnvelope className={styles.detailIcon} />
                            <span><strong>Email:</strong> {usuario.email}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <FaIdCard className={styles.detailIcon} />
                            <span><strong>ID:</strong> {usuario.id}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <FaBuilding className={styles.detailIcon} />
                            <span><strong>Rol:</strong> {usuario.rol}</span>
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.editButton} onClick={handleEditClick}>
                                <FaEdit /> Editar Perfil
                            </button>
                            <button className={styles.deleteButton} onClick={handleDeleteAccount}>
                                <FaTrash /> Eliminar Cuenta
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.editForm}>
                        <h3>Editar Perfil</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Nombre:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="lastname">Apellido:</label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={true}
                            />
                        </div>
                        <h4 className={styles.passwordSectionTitle}>Cambiar Contraseña (opcional)</h4>
                        <div className={styles.formGroup}>
                            <label htmlFor="current_password">Contraseña Actual:</label>
                            <div className={styles.inputWithIcon}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    type="password"
                                    id="current_password"
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    placeholder="Requiere para cambiar contraseña"
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Nueva Contraseña:</label>
                            <div className={styles.inputWithIcon}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.saveButton} onClick={handleSaveProfile}>
                                <FaSave /> Guardar Cambios
                            </button>
                            <button className={styles.cancelButton} onClick={handleCancelEdit}>
                                <FaTimes /> Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {statusModal.show && (
                <MessageModal
                    message={statusModal.message}
                    type={statusModal.type}
                    onClose={closeModal}
                    onConfirm={statusModal.onConfirm}
                />
            )}
        </div>
    );
};

export default UserProfilePage;
