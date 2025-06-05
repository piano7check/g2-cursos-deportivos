from datetime import datetime
from utils.validarProfesor import verificar_disponibilidad_profesor

def validar_horarios_y_disponibilidad_curso(profesor_id, horarios_data, curso_id_a_ignorar=None):
    if not isinstance(horarios_data, list):
        return False, "Los horarios deben ser una lista de objetos."

    if not horarios_data:
        return True, None

    for horario in horarios_data:
        if not all(k in horario for k in ['dia', 'hora_inicio', 'hora_fin']):
            return False, "Cada horario debe tener 'dia', 'hora_inicio' y 'hora_fin'."

        dia_str = horario['dia']
        inicio_str = horario['hora_inicio']
        fin_str = horario['hora_fin']

        try:
            hora_inicio_obj = datetime.strptime(inicio_str, '%H:%M').time()
            hora_fin_obj = datetime.strptime(fin_str, '%H:%M').time()

            if hora_inicio_obj >= hora_fin_obj:
                return False, f"Horario inválido: La hora de inicio ({inicio_str}) debe ser anterior a la hora de fin ({fin_str}) para el {dia_str}."
        except ValueError:
            return False, f"Formato de hora inválido para el {dia_str}. Use HH:MM."

    disponible, mensaje_conflicto = verificar_disponibilidad_profesor(
        profesor_id,
        horarios_data,
        curso_id_a_ignorar=curso_id_a_ignorar
    )

    if not disponible:
        return False, mensaje_conflicto

    return True, None
