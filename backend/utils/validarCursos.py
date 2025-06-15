from datetime import datetime, time
from models.cursosModels import CursosModel
from models.categoriasModels import CategoriasModel
from utils.buscarUsuario import buscarUsuarioById

def parse_time_strings_to_datetime_time(horarios_list):
    """
    Convierte las cadenas de 'hora_inicio' y 'hora_fin' a objetos datetime.time.
    Si hay un error de formato, devuelve un diccionario con un error.
    """
    parsed_horarios = []
    for horario in horarios_list:
        try:      
            hora_inicio_obj = datetime.strptime(horario['hora_inicio'], "%H:%M:%S").time()
            hora_fin_obj = datetime.strptime(horario['hora_fin'], "%H:%M:%S").time()

            parsed_horarios.append({
                'dia': horario['dia'],
                'hora_inicio': hora_inicio_obj,
                'hora_fin': hora_fin_obj
            })
        except ValueError as e:
            return {"error": f"Error de formato de hora en el horario: {horario}. Detalle: {str(e)}"}
        except KeyError as e:
            return {"error": f"Falta clave en el objeto horario: {str(e)} para {horario}"}
    return parsed_horarios

def validar_horarios_y_disponibilidad_curso(profesor_id, horarios_a_validar, curso_id_a_ignorar=None):
    horarios_parseados = horarios_a_validar 

    for horario in horarios_parseados:
        if horario['hora_inicio'] >= horario['hora_fin']:
            return False, f"La hora de inicio debe ser anterior a la hora de fin para el día {horario['dia']}."

    cursos_del_profesor_respuesta = CursosModel.obtener_cursos_por_profesor(profesor_id)

    if isinstance(cursos_del_profesor_respuesta, dict) and "error" in cursos_del_profesor_respuesta:
        return False, f"Error al verificar disponibilidad del profesor: {cursos_del_profesor_respuesta['error']}"

    if not isinstance(cursos_del_profesor_respuesta, dict) or "cursos" not in cursos_del_profesor_respuesta:
        return False, "Error interno: Formato inesperado de datos al obtener cursos del profesor."

    cursos_del_profesor = cursos_del_profesor_respuesta.get("cursos", []) 


    for curso_existente in cursos_del_profesor:
        if curso_id_a_ignorar and curso_existente['id'] == curso_id_a_ignorar:
            continue

        if not isinstance(curso_existente.get('horarios'), list):
            return False, f"Error interno: Horarios del curso existente con ID {curso_existente.get('id')} no son una lista válida."

        for horario_existente in curso_existente['horarios']:
            try:
                exist_start = datetime.strptime(horario_existente['hora_inicio'], "%H:%M:%S").time()
                exist_end = datetime.strptime(horario_existente['hora_fin'], "%H:%M:%S").time()
            except ValueError:
                return False, f"Error interno al convertir horarios existentes de la DB a time: {horario_existente}"
            except KeyError as e:
                 return False, f"Falta clave en el objeto horario existente: {str(e)} para {horario_existente}"


            for nuevo_horario in horarios_parseados:
                if nuevo_horario['dia'] == horario_existente['dia']:
                    if not (nuevo_horario['hora_fin'] <= exist_start or nuevo_horario['hora_inicio'] >= exist_end):
                        return False, f"El profesor no está disponible el {nuevo_horario['dia']} de {nuevo_horario['hora_inicio'].strftime('%H:%M')} a {nuevo_horario['hora_fin'].strftime('%H:%M')} debido a un conflicto con otro curso."
    
    return True, "Horarios válidos y profesor disponible."

def validar_profesor(profesor_id):
    """Verifica si un usuario con el ID dado existe y tiene el rol de 'profesor'."""
    profesor = buscarUsuarioById(profesor_id)
    if not profesor:
        return False, "Profesor no encontrado."
    if profesor.get('rol') != 'profesor':
        return False, "El ID proporcionado no corresponde a un profesor."
    return True, "Profesor válido."

def validar_categoria_existente(categoria_id):
    """Verifica si una categoría con el ID dado existe."""
    categoria = CategoriasModel.obtener_categoria_por_id(categoria_id)
    if not categoria:
        return False, "La categoría especificada no existe."

    if isinstance(categoria, dict) and "error" in categoria:
        return False, categoria["error"]
    return True, "Categoría válida."
