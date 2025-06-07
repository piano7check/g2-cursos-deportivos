from cerberus import Validator

esquema_categoria = {
    'nombre': {
        'type': 'string',
        'required': True,
        'empty': False,
        'maxlength': 100,
        'regex': r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$'
    }
}

def validarCategoria(data):
    v = Validator(esquema_categoria, purge_unknown=True)
    es_valido = v.validate(data)
    return es_valido, v.errors

