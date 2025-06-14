import React from 'react';
import styles from '../../../routes/admin/AdminDashboard.module.css'; 

const SectionCard = ({ children }) => (
    <div className={styles.dashboardSection}>
        {children}
    </div>
);

export default SectionCard;
