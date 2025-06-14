import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const CursosTable = ({ courses, loading, error, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando cursos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                <p>Error al cargar los cursos: {error}</p>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className={styles.infoMessage}>
                <p>No hay cursos registrados.</p>
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
                        <th>Descripción</th>
                        <th>Cupos</th>
                        <th>Costo</th>
                        <th>Profesor</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.nombre}</td>
                            <td>{course.descripcion}</td>
                            <td>{course.cupos}</td>
                            <td>
                                {
                                    !isNaN(parseFloat(course.coste)) ?
                                        `${parseFloat(course.coste).toFixed(2)} bs.` :
                                        '0.00 bs'
                                }
                            </td>
                            <td>{course.profesor_nombre}</td>
                            <td>{course.categoria_nombre}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={`${styles.actionBtnIcon} ${styles.editActionBtn}`}
                                    onClick={() => onEdit(course)}
                                    title="Editar Curso"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className={`${styles.actionBtnIcon} ${styles.deleteActionBtn}`}
                                    onClick={() => onDelete(course.id)}
                                    title="Eliminar Curso"
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

export default CursosTable;
