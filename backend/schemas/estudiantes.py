from cerberus import Validator

esquemaUsuario = {
    'name': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'lastname': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'birthdate': {
        'type': 'string',
        'regex': r'^\d{4}-\d{2}-\d{2}$',  
    },
    'email': {
        'type': 'string',
        'regex': r'^\S+@\S+\.\S+$'
    },
    'password': {
        'type': 'string',
        'minlength': 8,
        'maxlength': 32,
        'regex': r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,32}$'
    }
}

def validarUsuario(data):
    v = Validator(esquemaUsuario)
    esValido = v.validate(data)
    return esValido, v.errors