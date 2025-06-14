from cerberus import Validator

esquema_reserva = {
    'estudiante_id': {
        'type': 'integer',
        'required': True,
        'min': 1
    },
    'curso_id': {
        'type': 'integer',
        'required': True,
        'min': 1
    }
}

def validarReserva(data):
    """
    Valida los datos de entrada para la creación de una reserva.
    """
    v = Validator(esquema_reserva, purge_unknown=True)
    es_valido = v.validate(data)
    return es_valido, v.errors
