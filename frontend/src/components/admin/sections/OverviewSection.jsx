import React from 'react';
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaTags } from 'react-icons/fa';
import StatCard from '../layout/StatCard'; 
import styles from '../../../routes/admin/AdminDashboard.module.css'; 


const OverviewSection = ({ totalUsersCount, professorsCount, coursesCount, categoriesCount }) => {
    return (
        <div className={styles.overviewSection}>
            <div className={styles.statsGrid}>
                <StatCard title="Usuarios Totales" value={totalUsersCount} icon={<FaUsers />} />
                <StatCard title="Profesores Activos" value={professorsCount} icon={<FaChalkboardTeacher />} />
                <StatCard title="Cursos Publicados" value={coursesCount} icon={<FaBookOpen />} />
                <StatCard title="Categorías Registradas" value={categoriesCount} icon={<FaTags />} />
            </div>
        </div>
    );
};

export default OverviewSection;
