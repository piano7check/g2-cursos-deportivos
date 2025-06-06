from cerberus import Validator

esquemaUsuarioParcial = {
    'name': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'lastname': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'birthdate': {
        'type': 'string',
        'regex': r'^\d{4}-\d{2}-\d{2}$'
    },
    'password': {
        'type': 'string',
        'minlength': 6,
        'maxlength': 32,
    }
}

def validarUsuarioParcial(data):
    v = Validator(esquemaUsuarioParcial, require_all=False, purge_unknown=True)
    esValido = v.validate(data)
    return esValido, v.errors, v.document 
