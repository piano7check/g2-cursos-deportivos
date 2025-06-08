import React from 'react';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const UsersTable = ({ users, loading, error, onEdit, onDelete, currentPage, itemsPerPage, totalItems, onPageChange }) => {
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                <p>Error al cargar los usuarios: {error}</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className={styles.infoMessage}>
                <p>No hay usuarios registrados.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Nacimiento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.rol}</td>
                            <td>{user.birthdate ? user.birthdate.split('T')[0] : 'N/A'}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={`${styles.actionBtnIcon} ${styles.editActionBtn}`}
                                    onClick={() => onEdit(user)}
                                    title="Editar Usuario"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className={`${styles.actionBtnIcon} ${styles.deleteActionBtn}`}
                                    onClick={() => onDelete(user.id)}
                                    title="Eliminar Usuario"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalItems > itemsPerPage && (
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        <FaChevronLeft /> Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        Siguiente <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
