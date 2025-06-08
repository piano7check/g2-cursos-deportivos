import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const UserModal = ({ editingUser, onClose, onSave }) => {
    const [userData, setUserData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        rol: '',
        birthdate: ''
    });

    useEffect(() => {
        if (editingUser) {
            setUserData({
                name: editingUser.name || '',
                lastname: editingUser.lastname || '',
                email: editingUser.email || '',
                password: '',
                rol: editingUser.rol || '',
                birthdate: editingUser.birthdate ? editingUser.birthdate.split('T')[0] : ''
            });
        } else {
            setUserData({
                name: '',
                lastname: '',
                email: '',
                password: '',
                rol: '',
                birthdate: ''
            });
        }
    }, [editingUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...userData };

        if (editingUser && dataToSave.password === '') {
            delete dataToSave.password;
        }

        onSave(dataToSave);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <button className={styles.closeModalButton} onClick={onClose}>
                    <FaTimes />
                </button>
                <h3>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={userData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lastname">Apellido:</label>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={userData.lastname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email" 
                            id="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}:</label>
                        <input
                            type="password" 
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            required={!editingUser}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="rol">Rol:</label>
                        <select
                            id="rol"
                            name="rol"
                            value={userData.rol}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un rol</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="profesor">Profesor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="birthdate">Fecha de Nacimiento:</label>
                        <input
                            type="date" 
                            id="birthdate"
                            name="birthdate"
                            value={userData.birthdate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.saveButton}>
                            <FaSave /> Guardar
                        </button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;