from schemas.reservas import validarReserva
from models.reservasModels import ReservasModel
from flask import g, jsonify, request

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

    @staticmethod
    def obtener_reservas_por_estudiante():
        current_user_id = g.usuario.get('id')

        if not current_user_id:
            return {"error": "ID de estudiante no encontrado en el token"}, 400

        resultado = ReservasModel.obtener_reservas_por_estudiante(current_user_id)

        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200

    @staticmethod
    def cancelar_reserva(reserva_id):
        current_user_id = g.usuario.get('id')

        if not current_user_id:
            return {"error": "ID de estudiante no encontrado en el token"}, 400

        reserva_data = ReservasModel.obtener_reserva_por_id(reserva_id)
        if "error" in reserva_data or not reserva_data.get("reserva"):
            return {"error": "Reserva no encontrada."}, reserva_data.get("status_code", 404)

        if reserva_data["reserva"]["estudiante_id"] != current_user_id:
            return {"error": "No autorizado para cancelar esta reserva."}, 403

        if reserva_data["reserva"]["estado_reserva"] == 'validado':
            return {"error": "No se puede cancelar una reserva ya validada."}, 400
        
        if reserva_data["reserva"]["estado_reserva"] == 'cancelado':
            return {"error": "Esta reserva ya ha sido cancelada."}, 400


        resultado = ReservasModel.actualizar_estado_reserva(reserva_id, 'cancelado')

        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200

    @staticmethod
    def confirmar_pago(reserva_id, data):
        current_user_id = g.usuario.get('id')

        if not current_user_id:
            return {"error": "ID de estudiante no encontrado en el token"}, 400

        if not data or 'archivo_url' not in data:
            return {"error": "URL del archivo de pago es requerida."}, 400
        
        reserva_data = ReservasModel.obtener_reserva_por_id(reserva_id)
        if "error" in reserva_data or not reserva_data.get("reserva"):
            return {"error": "Reserva no encontrada."}, reserva_data.get("status_code", 404)

        if reserva_data["reserva"]["estudiante_id"] != current_user_id:
            return {"error": "No autorizado para confirmar el pago de esta reserva."}, 403

        if reserva_data["reserva"]["estado_reserva"] == 'validado':
            return {"error": "El pago de esta reserva ya ha sido validado."}, 400
        
        if reserva_data["reserva"]["estado_reserva"] == 'cancelado':
            return {"error": "No se puede confirmar el pago de una reserva cancelada."}, 400


        archivo_url = data['archivo_url']
        resultado = ReservasModel.actualizar_estado_pago_reserva(reserva_id, archivo_url)

        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200
