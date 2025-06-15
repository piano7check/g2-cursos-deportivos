import React from 'react';
import styles from '../../../routes/profesor/ProfesorDashboard.module.css';
import UserProfileWidget from '../../common/UserProfileWidget';
import { FaCalendarCheck, FaBookOpen, FaSignOutAlt } from 'react-icons/fa';

const ProfesorSidebarNav = ({ isSidebarOpen, setIsSidebarOpen, userName, handleLogout, activeSection, setActiveSection }) => {
    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
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
                        <FaCalendarCheck className={styles.navIcon} />
                        <span className={styles.navText}>Gestión de Asistencias</span>
                    </li>
                    <li
                        className={`${styles.navItem} ${activeSection === 'my-courses' ? styles.active : ''}`}
                        onClick={() => setActiveSection('my-courses')}
                    >
                        <FaBookOpen className={styles.navIcon} />
                        <span className={styles.navText}>Mis Cursos</span>
                    </li>
                </ul>
            </nav>

            <div className={styles.sidebarFooter}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <FaSignOutAlt className={styles.logoutIcon} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default ProfesorSidebarNav;
