from cerberus import Validator

esquema_curso_completo = {
    'nombre': {
        'type': 'string',
        'required': True,
        'maxlength': 100,
        'empty': False,
        'regex': r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$'  
    },
    'descripcion': {
        'type': 'string',
        'required': True,
        'minlength': 10,
        'maxlength': 500,
        'empty': False
    },
    'cupos': {
        'type': 'integer',
        'required': True,
        'min': 1,
        'max': 100
    },
    'profesor_id': {
        'type': 'integer',
        'required': True,
        'min': 1  # IDs empiezan en 1
    },
    'horarios': {
        'type': 'list',
        'required': True,
        'minlength': 1,
        'maxlength': 7,  # Máximo 7 días
        'schema': {
            'type': 'dict',
            'schema': {
                'dia': {
                    'type': 'string',
                    'required': True,
                    'allowed': [
                        'Lunes', 'Martes', 'Miércoles',
                        'Jueves', 'Viernes', 'Sábado', 'Domingo'
                    ]
                },
                'hora_inicio': {
                    'type': 'string',
                    'required': True,
                    'regex': '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$'
                },
                'hora_fin': {
                    'type': 'string',
                    'required': True,
                    'regex': '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$'
                }
            }
        }
    }
}

def validarCurso(data):
    v = Validator(esquema_curso_completo, purge_unknown=True)  
    es_valido = v.validate(data)
    return es_valido, v.errors