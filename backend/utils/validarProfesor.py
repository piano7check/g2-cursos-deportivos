from utils.buscarUsuario import buscarUsuarioById
from models.cursosModels import CursosModel

def validar_profesor(profesor_id):

    if not isinstance(profesor_id, int) or profesor_id <= 0:
        return False
    
    profesor = buscarUsuarioById(profesor_id)
    
    if isinstance(profesor, dict) and 'error' in profesor:
        return False
    
    return profesor is not None and profesor.get('rol') == 'profesor'

def verificar_disponibilidad_profesor(profesor_id, horarios):

    if not validar_profesor(profesor_id):
        return False, "El profesor especificado no existe o no tiene el rol correcto"
    
    cursos_profesor = CursosModel.obtener_cursos_por_profesor(profesor_id)
    
    if not cursos_profesor:
        return True, None
    
    for nuevo_horario in horarios:
        dia = nuevo_horario['dia']
        inicio_nuevo = nuevo_horario['hora_inicio']
        fin_nuevo = nuevo_horario['hora_fin']
        
        for curso in cursos_profesor:
            for horario_existente in curso['horarios']:
                if horario_existente['dia'] == dia:
                    if not (fin_nuevo <= horario_existente['hora_inicio'] or 
                          inicio_nuevo >= horario_existente['hora_fin']):
                        curso_conflicto = curso['nombre']
                        return False, (
                            f"Conflicto de horario con el curso '{curso_conflicto}' "
                            f"el {dia} ({horario_existente['hora_inicio']}-{horario_existente['hora_fin']})"
                        )
    return True, None