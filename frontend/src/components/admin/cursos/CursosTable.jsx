import React from 'react';
import styles from '../../../routes/admin/AdminDashboard.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CursosTable = ({ courses, loading, error, onEdit, onDelete }) => {
    if (loading) {
        return <p>Cargando cursos...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    if (courses.length === 0) {
        return <p>No hay cursos disponibles. Crea uno nuevo.</p>;
    }

    return (
        <table className={styles.dataTable}>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Profesor</th>
                    <th>Cupos</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {courses.map(course => (
                    <tr key={course.id}>
                        <td>{course.name}</td>
                        <td>{course.professor_name}</td>
                        <td>{course.capacity}</td>
                        <td className={styles.actionsCell}>
                            <button
                                className={styles.actionBtnIcon}
                                onClick={() => onEdit(course)}
                                title="Editar"
                            >
                                <FaEdit />
                            </button>
                            <button
                                className={`${styles.actionBtnIcon} ${styles.deleteBtn}`}
                                onClick={() => onDelete(course.id)}
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CursosTable;
