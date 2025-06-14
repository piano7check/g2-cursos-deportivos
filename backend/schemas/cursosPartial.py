from cerberus import Validator

esquemaHorarioParcial = {
    'dia': {
        'type': 'string',
        'required': True,
        'allowed': ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    },
    'hora_inicio': {
        'type': 'string',
        'required': True,
        'regex': r'^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9])?$'
    },
    'hora_fin': {
        'type': 'string',
        'required': True,
        'regex': r'^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9])?$'
    }
}

esquemaCursoParcial = {
    'nombre': {
        'type': 'string',
        'maxlength': 100,
        'nullable': True
    },
    'descripcion': {
        'type': 'string',
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
    'categoria_id': {
        'type': 'integer',
        'min': 1,
        'nullable': True
    },
    'coste': {
        'type': 'float', 
        'min': 0.0,
        'max': 999999.99, 
        'nullable': True
    },
    'horarios': {
        'type': 'list',
        'schema': {'type': 'dict', 'schema': esquemaHorarioParcial},
        'empty': True,
        'nullable': True
    }
}

def validarCursoParcial(data):
    v = Validator(esquemaCursoParcial, require_all=False, purge_unknown=True)
    esValido = v.validate(data)
    return esValido, v.errors, v.document
