from cerberus import Validator

esquemaUsuario = {
    'nombre': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'apellido': {'type': 'string', 'minlength': 2, 'maxlength': 50},
    'edad': {'type': 'integer', 'min': 6},
    'correo': {
        'type': 'string',
        'regex': r'^\S+@\S+\.\S+$'
    },
    'contrasena': {
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

