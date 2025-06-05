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
                nombre: editingCourse.nombre || '', 
                descripcion: editingCourse.descripcion || '',
                cupos: editingCourse.cupos || '', 
                profesor_id: editingCourse.profesor_id || '',
                horarios: editingCourse.horarios && editingCourse.horarios.length > 0
                    ? editingCourse.horarios.map(h => ({
                        dia: h.dia || '',
                        hora_inicio: h.hora_inicio ? h.hora_inicio.substring(0, 5) : '', 
                        hora_fin: h.hora_fin ? h.hora_fin.substring(0, 5) : ''
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
            horarios: newHorarios.length > 0 ? newHorarios : [{ dia: '', hora_inicio: '', hora_fin: '' }] 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let errors = {};

        if (!formData.nombre.trim()) {
            errors.nombre = 'El nombre es obligatorio.';
        }
        if (!formData.cupos || parseInt(formData.cupos) <= 0) {
            errors.cupos = 'Los cupos deben ser un número positivo.';
        }
        if (!formData.profesor_id) {
            errors.profesor_id = 'Debe seleccionar un profesor.';
        }

        const validHorarios = formData.horarios.filter(h =>
            h.dia && h.hora_inicio && h.hora_fin
        );

        if (!editingCourse && validHorarios.length === 0) {
            errors.horarios = 'Para crear un curso, debe ingresar al menos un horario completo.';
        }

        if (Object.keys(errors).length > 0) {
            const errorMessage = Object.values(errors).join('\n');
            alert(`Por favor, corrija los siguientes errores:\n${errorMessage}`); 
            return;
        }

        const courseData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            cupos: parseInt(formData.cupos),
            profesor_id: parseInt(formData.profesor_id),
            horarios: validHorarios.length > 0 ? validHorarios : [], 
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
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="profesor_id">Profesor asignado:</label>
                        <select
                            id="profesor_id"
                            name="profesor_id"
                            value={formData.profesor_id}
                            onChange={handleChange}
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
                                />
                                <span>-</span>
                                <input
                                    type="time"
                                    name="hora_fin"
                                    value={horario.hora_fin}
                                    onChange={(e) => handleHorarioChange(index, e)}
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
