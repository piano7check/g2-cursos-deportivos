import React from 'react';
import styles from '../../../routes/admin/AdminDashboard.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa'; 

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
        return <p className={`${styles.errorMessage} ${styles.centeredMessage}`}>{error}</p>;
    }

    if (courses.length === 0) {
        return <p className={`${styles.infoMessage} ${styles.centeredMessage}`}>No hay cursos disponibles. Crea uno nuevo.</p>;
    }

    return (
        <div className={styles.tableContainer}>
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
