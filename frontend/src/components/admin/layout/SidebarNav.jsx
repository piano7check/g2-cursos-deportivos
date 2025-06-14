import React from 'react';
import { FaHome, FaUsers, FaBookOpen, FaTags, FaSignOutAlt, FaTimes, FaMoneyCheckAlt } from 'react-icons/fa';
import UserProfileWidget from '../../common/UserProfileWidget';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const MenuItem = ({ icon, text, onClick, active }) => (
    <li
        className={`${styles.navItem} ${active ? styles.active : ''}`}
        onClick={onClick}
    >
        {icon}
        <span className={styles.navText}>{text}</span>
    </li>
);

const SidebarNav = ({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, handleLogout }) => {
    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
            <button
                className={styles.closeSidebarButton}
                onClick={() => setIsSidebarOpen(false)}
            >
                <FaTimes />
            </button>
            <div className={styles.sidebarHeader}>
                <h2>Admin Panel</h2>
                <UserProfileWidget />
            </div>
            <nav className={styles.nav}>
                <ul>
                    <MenuItem
                        icon={<FaHome />}
                        text="Resumen"
                        onClick={() => setActiveTab('overview')}
                        active={activeTab === 'overview'}
                    />
                    <MenuItem
                        icon={<FaUsers />}
                        text="Gestión de Usuarios"
                        onClick={() => setActiveTab('users')}
                        active={activeTab === 'users'}
                    />
                    <MenuItem
                        icon={<FaBookOpen />}
                        text="Gestión de Cursos"
                        onClick={() => setActiveTab('courses')}
                        active={activeTab === 'courses'}
                    />
                    <MenuItem
                        icon={<FaTags />}
                        text="Gestión de Categorías"
                        onClick={() => setActiveTab('categories')}
                        active={activeTab === 'categories'}
                    />
                    <MenuItem
                        icon={<FaMoneyCheckAlt />}
                        text="Validación de Pagos"
                        onClick={() => setActiveTab('payment-validation')}
                        active={activeTab === 'payment-validation'}
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

export default SidebarNav;
