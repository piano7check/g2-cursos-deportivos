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
        'regex': r'^\d{2}:\d{2}$'
    },
    'hora_fin': {
        'type': 'string',
        'required': True,
        'regex': r'^\d{2}:\d{2}$'
    }
}

esquemaCursoParcial = {
    'nombre': {
        'type': 'string',
        'minlength': 3,
        'maxlength': 100,
        'nullable': True
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
    'categoria_id': {
        'type': 'integer',
        'min': 1,
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

