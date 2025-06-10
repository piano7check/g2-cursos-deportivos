from schemas.reservas import validarReserva
from models.reservasModels import ReservasModel
from flask import g 

class ReservasController:
    @staticmethod
    def crear_reserva(data):
        current_user_id = g.usuario.get('id')

        if data is None:
            data = {}
        elif not isinstance(data, dict):
            return {"error": "Formato de datos JSON inválido"}, 400

        data['estudiante_id'] = current_user_id

        es_valido, errores = validarReserva(data)

        if not es_valido:
            return {"error": "Datos de reserva inválidos", "detalles": errores}, 400

        estudiante_id = data['estudiante_id']
        curso_id = data['curso_id']

        resultado = ReservasModel.crear_reserva(estudiante_id, curso_id)

        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 201 
