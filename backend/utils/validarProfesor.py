from utils.buscarUsuario import buscarUsuarioById
from models.cursosModels import CursosModel
from datetime import datetime, time, timedelta 

def validar_profesor(profesor_id):
    if not isinstance(profesor_id, int) or profesor_id <= 0:
        return False
    
    profesor = buscarUsuarioById(profesor_id)
    
    if isinstance(profesor, dict) and 'error' in profesor:
        return False
    
    return profesor is not None and profesor.get('rol') == 'profesor'

def _convert_timedelta_to_time(td_obj):
    if isinstance(td_obj, timedelta):
        total_seconds = int(td_obj.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        return time(hours, minutes, seconds)
    return td_obj 

def verificar_disponibilidad_profesor(profesor_id, horarios_nuevos, curso_id_a_ignorar=None):
    if not validar_profesor(profesor_id):
        return False, "El profesor especificado no existe o no tiene el rol correcto."
    
    cursos_profesor_data = CursosModel.obtener_cursos_por_profesor(profesor_id)
    
    if isinstance(cursos_profesor_data, dict) and 'error' in cursos_profesor_data:
        return False, f"Error al verificar disponibilidad del profesor: {cursos_profesor_data['error']}"
    
    cursos_existentes = cursos_profesor_data 
    
    processed_existing_horarios = []
    for curso in cursos_existentes: 
        if curso_id_a_ignorar and curso['id'] == curso_id_a_ignorar:
            continue

        for horario_existente_data in curso.get('horarios', []):
            try:
                h_inicio_existente = _convert_timedelta_to_time(horario_existente_data['hora_inicio'])
                h_fin_existente = _convert_timedelta_to_time(horario_existente_data['hora_fin'])

                if not isinstance(h_inicio_existente, time) or not isinstance(h_fin_existente, time):
                    raise ValueError(f"La conversión de hora existente a datetime.time falló para: {horario_existente_data}")

                processed_existing_horarios.append({
                    'dia': horario_existente_data['dia'],
                    'hora_inicio': h_inicio_existente,
                    'hora_fin': h_fin_existente,
                    'curso_nombre': curso['nombre'] 
                })
            except Exception as e:
                print(f"Advertencia: Error al procesar horario existente: {horario_existente_data}. Detalle: {e}")
                return False, f"Error interno al procesar un horario existente del profesor. Detalle: {e}"

    for nuevo_horario_data in horarios_nuevos:
        dia_nuevo = nuevo_horario_data.get('dia')
        inicio_nuevo_str = nuevo_horario_data.get('hora_inicio')
        fin_nuevo_str = nuevo_horario_data.get('hora_fin')

        if not (dia_nuevo and inicio_nuevo_str and fin_nuevo_str):
            return False, "Todos los campos de horario (día, hora_inicio, hora_fin) son requeridos para cada nuevo horario."

        try:
            inicio_nuevo = datetime.strptime(inicio_nuevo_str, '%H:%M').time()
            fin_nuevo = datetime.strptime(fin_nuevo_str, '%H:%M').time()
        except ValueError:
            return False, "Formato de hora inválido para el nuevo horario. Use HH:MM (ej. '09:00')."

        for horario_existente_processed in processed_existing_horarios:
            if horario_existente_processed['dia'] == dia_nuevo:
                h_inicio_existente = horario_existente_processed['hora_inicio']
                h_fin_existente = horario_existente_processed['hora_fin']
                curso_conflicto_nombre = horario_existente_processed['curso_nombre']

                if not (fin_nuevo <= h_inicio_existente or inicio_nuevo >= h_fin_existente):
                    return False, (
                        f"Conflicto de horario con el curso '{curso_conflicto_nombre}' "
                        f"el {dia_nuevo} de {h_inicio_existente.strftime('%H:%M')} a {h_fin_existente.strftime('%H:%M')}."
                    )
    
    return True, None

