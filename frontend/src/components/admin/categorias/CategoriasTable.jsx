    import React from 'react';
    import { FaEdit, FaTrash } from 'react-icons/fa';
    import styles from '../../../routes/admin/AdminDashboard.module.css'; 

    const CategoriasTable = ({ categories, loading, error, onEdit, onDelete }) => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando categorías...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.errorMessage}>
                    <p>Error al cargar las categorías: {error}</p>
                </div>
            );
        }

        if (!categories || categories.length === 0) {
            return (
                <div className={styles.infoMessage}>
                    <p>No hay categorías registradas.</p>
                </div>
            );
        }

        return (
            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.nombre}</td>
                                <td className={styles.actionsCell}>
                                    <button
                                        className={`${styles.actionBtnIcon} ${styles.editActionBtn}`}
                                        onClick={() => onEdit(category)}
                                        title="Editar Categoría"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className={`${styles.actionBtnIcon} ${styles.deleteActionBtn}`}
                                        onClick={() => onDelete(category.id)}
                                        title="Eliminar Categoría"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    export default CategoriasTable;
    