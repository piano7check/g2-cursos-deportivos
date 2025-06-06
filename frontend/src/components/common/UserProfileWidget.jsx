import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioContext } from '../../context/UsuarioContext';
import { logoutUser } from '../../services/authService';
import styles from './UserProfileWidget.module.css'; 
import perfilIcon from '../../assets/images/icon-perfil.webp';

const UserProfileWidget = () => {
    const { usuario, cargando, setUsuario } = useUsuarioContext(); 
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false); 

    const handleLogout = async () => {
        try {
            await logoutUser();
            setUsuario(null); 
            navigate('/login');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            navigate('/login'); 
        }
    };

    const handleProfileClick = () => {
        navigate('/profile'); 
        setDropdownOpen(false);
    };

    if (cargando) {
        return null; 
    }

    if (!usuario) {
        return null; 
    }

    return (
        <div className={styles.profileWidget}>
            <button className={styles.profileToggleButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
                <img 
                    src={perfilIcon} 
                    alt="Icono de perfil" 
                    className={styles.profileIcon} 
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/cccccc/000000?text=Perfil"; }} 
                />
                <span className={styles.userName}>
                    {usuario.name && usuario.lastname 
                        ? `${usuario.name} ${usuario.lastname}` 
                        : usuario.email}
                </span>
            </button>

            {dropdownOpen && (
                <div className={styles.profileDropdown}>
                    <p className={styles.dropdownInfo}>
                        <strong>Email:</strong> {usuario.email}
                    </p>
                    <p className={styles.dropdownInfo}>
                        <strong>Rol:</strong> {usuario.rol}
                    </p>
                    <button className={styles.dropdownItem} onClick={handleProfileClick}>
                        Ver mi Perfil
                    </button>
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfileWidget;
