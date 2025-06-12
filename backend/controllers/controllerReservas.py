import os
import uuid
from schemas.reservas import validarReserva
from models.reservasModels import ReservasModel
from flask import g, jsonify, request, current_app
from werkzeug.utils import secure_filename

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
    def confirmar_pago(reserva_id):
        if not request.content_type:
            return {"error": "Content-Type header faltante"}, 400

        try:
            current_user_id = g.usuario.get('id')
            if not current_user_id:
                return {"error": "ID de estudiante no encontrado"}, 400

            reserva_data = ReservasModel.obtener_reserva_por_id(reserva_id)
            if "error" in reserva_data:
                return reserva_data, reserva_data.get("status_code", 404)

            if 'multipart/form-data' in request.content_type:
                if 'comprobante' not in request.files:
                    return {"error": "Archivo 'comprobante' requerido"}, 400
                
                file = request.files['comprobante']
                if file.filename == '':
                    return {"error": "Nombre de archivo vacío"}, 400

                filename = secure_filename(file.filename)
                if not ('.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']):
                    return {"error": "Tipo de archivo no permitido"}, 400

                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(filepath)
                archivo_url = f"/uploads/{unique_filename}"

            elif 'application/json' in request.content_type:
                data = request.get_json()
                archivo_url = data.get('archivo_url')
                if not archivo_url:
                    return {"error": "URL de archivo requerida"}, 400

            else:
                return {"error": "Content-Type no soportado"}, 415

            resultado = ReservasModel.actualizar_estado_pago_reserva(reserva_id, archivo_url)
            return resultado, 200 if "error" not in resultado else resultado.get("status_code", 500)

        except Exception as e:
            current_app.logger.error(f"Error en confirmar_pago: {str(e)}")
            return {"error": "Error interno del servidor"}, 500

    @staticmethod
    def obtener_validaciones_pago_admin():
        resultado = ReservasModel.obtener_validaciones_pago_admin()
        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200

    @staticmethod
    def aprobar_pago(validacion_id):
        resultado = ReservasModel.actualizar_estado_validacion_pago(validacion_id, 'aprobado')
        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200

    @staticmethod
    def rechazar_pago(validacion_id):
        resultado = ReservasModel.actualizar_estado_validacion_pago(validacion_id, 'rechazado')
        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200

    @staticmethod
    def ocultar_reserva_estudiante(reserva_id):
        current_user_id = g.usuario.get('id')
        if not current_user_id:
            return {"error": "ID de estudiante no encontrado en el token"}, 400
        
        data = request.get_json()
        ocultar_estado = data.get('ocultar', True) 
        resultado = ReservasModel.actualizar_oculto_reserva_estudiante(reserva_id, current_user_id, ocultar_estado)
        if "error" in resultado:
            return resultado, resultado.get("status_code", 500)
        else:
            return resultado, 200
