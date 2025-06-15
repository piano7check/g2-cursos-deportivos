import React from 'react';
import styles from '../../../routes/profesor/ProfesorDashboard.module.css'; // Usaremos los estilos del dashboard para el sidebar
import UserProfileWidget from '../../common/UserProfileWidget'; // Si usas este componente para el perfil

const ProfesorSidebarNav = ({ isSidebarOpen, setIsSidebarOpen, userName, handleLogout, activeSection, setActiveSection }) => {
    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
            {/* Si tienes un botón para cerrar el sidebar en móvil, incluirlo aquí */}
            {/* <button onClick={() => setIsSidebarOpen(false)} className={styles.closeSidebarButton}>X</button> */}

            <div className={styles.sidebarHeader}>
                <h2>Panel de Profesor</h2>
                <UserProfileWidget userName={userName} />
            </div>

            <nav className={styles.nav}>
                <ul>
                    <li
                        className={`${styles.navItem} ${activeSection === 'attendance' ? styles.active : ''}`}
                        onClick={() => setActiveSection('attendance')}
                    >
                        {/* Puedes añadir un icono aquí */}
                        <span className={styles.navText}>Gestión de Asistencias</span>
                    </li>
                    <li
                        className={`${styles.navItem} ${activeSection === 'my-courses' ? styles.active : ''}`}
                        onClick={() => setActiveSection('my-courses')}
                    >
                        {/* Puedes añadir un icono aquí */}
                        <span className={styles.navText}>Mis Cursos</span>
                    </li>
                </ul>
            </nav>

            <div className={styles.sidebarFooter}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    {/* Puedes añadir un icono de logout aquí */}
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default ProfesorSidebarNav;
