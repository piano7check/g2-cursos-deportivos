# backend/schemas/cursosPartial.py
from cerberus import Validator

# Definir el esquema para un único horario dentro de la lista de horarios
esquemaHorarioParcial = {
    'dia': {
        'type': 'string',
        'required': True, # El día es requerido para cada horario
        'allowed': ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    },
    'hora_inicio': {
        'type': 'string',
        'required': True, # La hora de inicio es requerida para cada horario
        'regex': r'^\d{2}:\d{2}$' # Formato HH:MM
    },
    'hora_fin': {
        'type': 'string',
        'required': True, # La hora de fin es requerida para cada horario
        'regex': r'^\d{2}:\d{2}$' # Formato HH:MM
    }
}

# Definir el esquema para la actualización parcial de un curso
# Todos los campos son opcionales (no 'required') ya que es un PATCH
esquemaCursoParcial = {
    'nombre': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 100,
        'nullable': True # Permitir que sea null si se quiere 'limpiar'
    },
    'descripcion': {
        'type': 'string',
        'minlength': 5,
        'maxlength': 500,
        'nullable': True
    },
    'cupos': {
        'type': 'integer',
        'min': 1,
        'nullable': True
    },
    'profesor_id': {
        'type': 'integer',
        'min': 1,
        'nullable': True
    },
    'horarios': {
        'type': 'list',
        'schema': {'type': 'dict', 'schema': esquemaHorarioParcial},
        'empty': True, # Permitir lista vacía (para borrar todos los horarios)
        'nullable': True # Permitir que el campo 'horarios' no esté presente si no se quiere modificar
    }
}

def validarCursoParcial(data):
    """
    Valida un diccionario de datos para la actualización parcial de un curso.
    
    Args:
        data (dict): El diccionario de datos a validar (del cuerpo de la petición PATCH).

    Returns:
        tuple: (bool, dict, dict)
            - True si los datos son válidos, False en caso contrario.
            - Un diccionario con los errores de validación (vacío si es válido).
            - Un diccionario con los datos validados y limpiados (solo campos del esquema).
    """
    # require_all=False: Permite que no todos los campos estén presentes
    # purge_unknown=True: Elimina campos que no están en el esquema
    v = Validator(esquemaCursoParcial, require_all=False, purge_unknown=True)
    esValido = v.validate(data)
    return esValido, v.errors, v.document

