import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import styles from '../../../routes/admin/AdminDashboard.module.css';

const CourseModal = ({ editingCourse, professors, categories, onClose, onSave }) => {
    const [courseData, setCourseData] = useState({
        nombre: '',
        descripcion: '',
        cupos: '',
        profesor_id: '',
        categoria_id: '',
        coste: '',
        horarios: [{ dia: '', hora_inicio: '', hora_fin: '' }],
    });

    const formatTimeToSeconds = (timeString) => {
        if (!timeString) return '';
        return timeString.length === 5 ? `${timeString}:00` : timeString;
    };

    const formatTimeForInput = (timeString) => {
        if (!timeString) return '';
        return timeString.length === 8 ? timeString.substring(0, 5) : timeString;
    };

    useEffect(() => {
        if (editingCourse) {
            setCourseData({
                nombre: editingCourse.nombre || '',
                descripcion: editingCourse.descripcion || '',
                cupos: editingCourse.cupos || '',
                profesor_id: editingCourse.profesor_id ? String(editingCourse.profesor_id) : '',
                categoria_id: editingCourse.categoria_id ? String(editingCourse.categoria_id) : '',
                coste: editingCourse.coste !== undefined && editingCourse.coste !== null ? String(editingCourse.coste) : '',
                horarios: editingCourse.horarios && editingCourse.horarios.length > 0
                    ? editingCourse.horarios.map(h => ({
                        dia: h.dia,
                        hora_inicio: formatTimeToSeconds(h.hora_inicio),
                        hora_fin: formatTimeToSeconds(h.hora_fin)
                    }))
                    : [{ dia: '', hora_inicio: '', hora_fin: '' }],
            });
        } else {
            setCourseData({
                nombre: '',
                descripcion: '',
                cupos: '',
                profesor_id: '',
                categoria_id: '',
                coste: '',
                horarios: [{ dia: '', hora_inicio: '', hora_fin: '' }],
            });
        }
    }, [editingCourse, professors, categories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleHorarioChange = (index, e) => {
        const { name, value } = e.target;
        const newHorarios = [...courseData.horarios];
        if (name === 'dia') {
            newHorarios[index] = { ...newHorarios[index], [name]: value };
        } else {
            newHorarios[index] = { ...newHorarios[index], [name]: formatTimeToSeconds(value) };
        }
        setCourseData(prevData => ({ ...prevData, horarios: newHorarios }));
    };

    const addHorario = () => {
        setCourseData(prevData => ({
            ...prevData,
            horarios: [...prevData.horarios, { dia: '', hora_inicio: '', hora_fin: '' }],
        }));
    };

    const removeHorario = (index) => {
        setCourseData(prevData => ({
            ...prevData,
            horarios: prevData.horarios.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = {
            ...courseData,
            cupos: parseInt(courseData.cupos, 10),
            profesor_id: parseInt(courseData.profesor_id, 10),
            categoria_id: courseData.categoria_id ? parseInt(courseData.categoria_id, 10) : null,
            coste: parseFloat(courseData.coste),
        };
        onSave(dataToSave);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <button className={styles.closeModalButton} onClick={onClose}>
                    <FaTimes />
                </button>
                <h3>{editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={courseData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="descripcion">Descripción:</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={courseData.descripcion}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="cupos">Cupos:</label>
                        <input
                            type="number"
                            id="cupos"
                            name="cupos"
                            value={courseData.cupos}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="coste">Costo:</label>
                        <input
                            type="number"
                            id="coste"
                            name="coste"
                            value={courseData.coste}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="profesor_id">Profesor:</label>
                        <select
                            id="profesor_id"
                            name="profesor_id"
                            value={courseData.profesor_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un profesor</option>
                            {professors.map(prof => (
                                <option key={prof.id} value={String(prof.id)}>
                                    {prof.name} {prof.lastname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="categoria_id">Categoría:</label>
                        <select
                            id="categoria_id"
                            name="categoria_id"
                            value={courseData.categoria_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione una categoría (opcional)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={String(cat.id)}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h4 className={styles.horariosTitle}>Horarios:</h4>
                    {courseData.horarios.map((horario, index) => (
                        <div key={index} className={styles.horarioItem}>
                            <div className={styles.formGroup}>
                                <label htmlFor={`dia-${index}`}>Día:</label>
                                <select
                                    id={`dia-${index}`}
                                    name="dia"
                                    value={horario.dia}
                                    onChange={(e) => handleHorarioChange(index, e)}
                                    required
                                >
                                    <option value="">Seleccione un día</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sábado">Sábado</option>
                                    <option value="Domingo">Domingo</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor={`hora_inicio-${index}`}>Hora Inicio:</label>
                                <input
                                    type="time"
                                    id={`hora_inicio-${index}`}
                                    name="hora_inicio"
                                    value={formatTimeForInput(horario.hora_inicio)}
                                    onChange={(e) => handleHorarioChange(index, e)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor={`hora_fin-${index}`}>Hora Fin:</label>
                                <input
                                    type="time"
                                    id={`hora_fin-${index}`}
                                    name="hora_fin"
                                    value={formatTimeForInput(horario.hora_fin)}
                                    onChange={(e) => handleHorarioChange(index, e)}
                                    required
                                />
                            </div>
                            {courseData.horarios.length > 1 && (
                                <button type="button" onClick={() => removeHorario(index)} className={styles.removeHorarioBtn}>
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addHorario} className={styles.addHorarioBtn}>
                        <FaPlus /> Añadir Horario
                    </button>

                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.saveButton}>
                            <FaSave /> Guardar
                        </button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseModal;
