import React from 'react';
import { FaEdit, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '../../../routes/admin/AdminDashboard.module.css'; 

const UsersTable = ({ users, loading, error, onEdit, onDelete, currentPage, itemsPerPage, totalItems, onPageChange, selectedRoleFilter }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return <p className={styles.errorMessage}>Error al cargar usuarios: {error}</p>;
    }

    if (users.length === 0 && !selectedRoleFilter && !totalItems) {
        return <p className={styles.emptyState}>No hay usuarios registrados.</p>;
    }

    if (users.length === 0 && (selectedRoleFilter || totalItems > 0)) {
        return <p className={styles.infoMessage}>No se encontraron usuarios que coincidan con la búsqueda o filtro.</p>;
    }


    return (
        <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Fecha Nacimiento</th>
                        <th>Rol</th>
                        <th>Cursos Asociados</th>
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
                            <td>{user.birthdate}</td>
                            <td>{user.rol}</td>
                            <td>
                                {user.rol === 'estudiante' && user.cursos_inscritos && (
                                    user.cursos_inscritos.length > 0 ? (
                                        user.cursos_inscritos.map(curso => curso.curso_nombre).join(', ')
                                    ) : (
                                        'No inscrito en cursos validados.'
                                    )
                                )}
                                {user.rol === 'profesor' && user.cursos_asignados && (
                                    user.cursos_asignados.length > 0 ? (
                                        user.cursos_asignados.map(curso => curso.nombre).join(', ')
                                    ) : (
                                        'No tiene cursos asignados.'
                                    )
                                )}
                                {user.rol === 'admin' && 'N/A'} 
                            </td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={`${styles.actionBtnIcon} ${styles.editActionBtn}`}
                                    onClick={() => onEdit(user)}
                                    title="Editar usuario"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className={`${styles.actionBtnIcon} ${styles.deleteActionBtn}`}
                                    onClick={() => onDelete(user.id)}
                                    title="Eliminar usuario"
                                >
                                    <FaTrashAlt />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {totalItems > itemsPerPage && (
                <div className={styles.paginationControls}>
                    <button
                        className={styles.paginationButton}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft /> Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        className={styles.paginationButton}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
