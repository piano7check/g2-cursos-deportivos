import React, { useState, useEffect } from 'react';
import styles from '../../../routes/admin/AdminDashboard.module.css'; 
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa'; 

const CourseModal = ({ editingCourse, professors, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        cupos: '',
        profesor_id: '',
        horarios: [{ dia: '', hora_inicio: '', hora_fin: '' }], 
    });

    useEffect(() => {
        if (editingCourse) {
            setFormData({
                nombre: editingCourse.name || '',
                descripcion: editingCourse.description || '',
                cupos: editingCourse.capacity || '',
                profesor_id: editingCourse.professor_id || '',
                horarios: editingCourse.horarios && editingCourse.horarios.length > 0
                    ? editingCourse.horarios.map(h => ({
                        dia: h.dia || '',
                        hora_inicio: h.hora_inicio || '',
                        hora_fin: h.hora_fin || ''
                    }))
                    : [{ dia: '', hora_inicio: '', hora_fin: '' }],
            });
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                cupos: '',
                profesor_id: '',
                horarios: [{ dia: '', hora_inicio: '', hora_fin: '' }], 
            });
        }
    }, [editingCourse]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHorarioChange = (index, e) => {
        const { name, value } = e.target;
        const newHorarios = [...formData.horarios];
        newHorarios[index] = {
            ...newHorarios[index],
            [name]: value
        };
        setFormData(prev => ({
            ...prev,
            horarios: newHorarios
        }));
    };

    const addHorarioField = () => {
        setFormData(prev => ({
            ...prev,
            horarios: [...prev.horarios, { dia: '', hora_inicio: '', hora_fin: '' }]
        }));
    };

    const removeHorarioField = (index) => {
        const newHorarios = formData.horarios.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            horarios: newHorarios.length > 0 ? newHorarios : [{ dia: '', hora_inicio: '', hora_fin: '' }] // Asegura que siempre haya al menos uno
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validHorarios = formData.horarios.filter(h =>
            h.dia && h.hora_inicio && h.hora_fin
        );

        if (validHorarios.length === 0) {
            alert('Por favor, ingrese al menos un horario completo para el curso.');
            return;
        }

        const courseData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            cupos: parseInt(formData.cupos),
            profesor_id: parseInt(formData.profesor_id),
            horarios: validHorarios, 
        };

        onSave(courseData);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>{editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="nombre">Nombre del curso:</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="descripcion">Descripción:</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="cupos">Cupos disponibles:</label>
                        <input
                            type="number"
                            id="cupos"
                            name="cupos"
                            value={formData.cupos}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="profesor_id">Profesor asignado:</label>
                        <select
                            id="profesor_id"
                            name="profesor_id"
                            value={formData.profesor_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un profesor</option>
                            {professors.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} {p.lastname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Horarios:</label>
                        {formData.horarios.map((horario, index) => (
                            <div key={index} className={styles.horarioInputGroup}>
                                <select
                                    name="dia"
                                    value={horario.dia}
                                    onChange={(e) => handleHorarioChange(index, e)}
                                    required
                                >
                                    <option value="">Día</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sábado">Sábado</option>
                                    <option value="Domingo">Domingo</option>
                                </select>
                                <input
                                    type="time"
                                    name="hora_inicio"
                                    value={horario.hora_inicio}
                                    onChange={(e) => handleHorarioChange(index, e)}
                                    required
                                />
                                <span>-</span>
                                <input
                                    type="time"
                                    name="hora_fin"
                                    value={horario.hora_fin}
                                    onChange={(e) => handleHorarioChange(index, e)}
                                    required
                                />
                                {formData.horarios.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeHorarioField(index)}
                                        className={styles.removeHorarioBtn}
                                        title="Eliminar horario"
                                    >
                                        <FaMinusCircle />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addHorarioField}
                            className={styles.addHorarioBtn}
                            title="Añadir horario"
                        >
                            <FaPlusCircle /> Añadir otro horario
                        </button>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton}>
                            {editingCourse ? 'Guardar Cambios' : 'Crear Curso'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseModal;
