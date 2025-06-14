import React from 'react';
import styles from '../../../routes/admin/AdminDashboard.module.css'; 

const StatCard = ({ title, value, icon }) => (
    <div className={styles.statCard}>
        <h3>{title}</h3>
        <p>{value}</p>
        <div className={styles.statIcon}>
            {icon}
        </div>
    </div>
);

export default StatCard;
