from cerberus import Validator
from datetime import datetime

esquema_usuario_completo = {
    'name': {'type': 'string', 'required': True, 'minlength': 2, 'maxlength': 50},
    'lastname': {'type': 'string', 'required': True, 'minlength': 2, 'maxlength': 50},
    'email': {'type': 'string', 'required': True, 'regex': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'},
    'password': {'type': 'string', 'required': True, 'minlength': 6},
    'rol': {'type': 'string', 'required': True, 'allowed': ['estudiante', 'profesor', 'admin']},
    'birthdate': {
        'type': 'string',
        'regex': r'^\d{4}-\d{2}-\d{2}$',
    },
}
esquema_usuario_parcial = {
    'name': {'type': 'string', 'minlength': 2, 'maxlength': 50, 'nullable': True},
    'lastname': {'type': 'string', 'minlength': 2, 'maxlength': 50, 'nullable': True},
    'email': {'type': 'string', 'regex': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', 'nullable': True},
    'password': {'type': 'string', 'minlength': 6, 'nullable': True},
    'rol': {'type': 'string', 'allowed': ['estudiante', 'profesor', 'admin'], 'nullable': True}, 
    'birthdate': {
        'type': 'string',
        'regex': r'^\d{4}-\d{2}-\d{2}$',
    },
}

def validarUsuarioCompleto(data):
    v = Validator(esquema_usuario_completo, purge_unknown=True)
    es_valido = v.validate(data)
    return es_valido, v.errors, v.document

def validarUsuarioParcial(data):
    v = Validator(esquema_usuario_parcial, require_all=False, purge_unknown=True)
    es_valido = v.validate(data)
    return es_valido, v.errors, v.document
