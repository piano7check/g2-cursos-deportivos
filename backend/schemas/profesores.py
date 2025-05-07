from cerberus import Validator

esquemaProfesor = {
    'name': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'lastname': {'type': 'string', 'minlength': 2, 'maxlength': 50},
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

def validarProfesor(data):
    v = Validator(esquemaProfesor)
    esValido = v.validate(data)
    return esValido, v.errors
