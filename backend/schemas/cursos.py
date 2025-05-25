from cerberus import Validator

esquemaCurso = {
    'nombre' : {'type': 'string', 'maxlength': 100},
    'descripcion': {'type': 'string'},
    'cupos': {'type': 'integer'}
}

def validarCurso(data):
    v = Validator(esquemaCurso)
    esValido = v.validate(data)
    return esValido, v.errors