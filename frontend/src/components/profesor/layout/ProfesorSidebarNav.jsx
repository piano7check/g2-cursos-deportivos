import React from 'react';
import { FaUserCheck, FaBook, FaSignOutAlt, FaTimes, FaUserCircle } from 'react-icons/fa'; 
import UserProfileWidget from '../../common/UserProfileWidget'; 
import styles from '../../../routes/profesor/ProfesorDashboard.module.css'; 

const MenuItem = ({ icon, text, onClick, active }) => (
    <li
        className={`${styles.navItem} ${active ? styles.active : ''}`}
        onClick={onClick}
    >
        {icon}
        <span className={styles.navText}>{text}</span>
    </li>
);

const ProfesorSidebarNav = ({ isSidebarOpen, setIsSidebarOpen, activeSection, setActiveSection, handleLogout, userName }) => {
    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
            <button
                className={styles.closeSidebarButton}
                onClick={() => setIsSidebarOpen(false)}
            >
                <FaTimes />
            </button>
            <div className={styles.sidebarHeader}>
                <h2>Panel de Profesor</h2> 
                <UserProfileWidget userName={userName} /> 
            </div>
            <nav className={styles.nav}>
                <ul>
                    <MenuItem
                        icon={<FaUserCheck />}
                        text="Gestión de Asistencias"
                        onClick={() => setActiveSection('attendance')}
                        active={activeSection === 'attendance'}
                    />
                    <MenuItem
                        icon={<FaBook />}
                        text="Mis Cursos"
                        onClick={() => setActiveSection('my-courses')}
                        active={activeSection === 'my-courses'}
                    />
                </ul>
            </nav>
            <div className={styles.sidebarFooter}>
                <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    <FaSignOutAlt className={styles.logoutIcon} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default ProfesorSidebarNav;
