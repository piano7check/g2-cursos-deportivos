from flask import Blueprint, request, jsonify, g
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerReservas import ReservasController

reservas_bp = Blueprint('reservas_bp', __name__)

@reservas_bp.route('/reservas', methods=['POST'])
@token_requerido
@rol_requerido(['estudiante'])
def crear_reserva_route():
    data = request.get_json()
    resultado, status_code = ReservasController.crear_reserva(data)
    return jsonify(resultado), status_code

@reservas_bp.route('/reservas/estudiante', methods=['GET'])
@token_requerido
@rol_requerido(['estudiante', 'admin'])
def obtener_reservas_estudiante_route():
    resultado, status_code = ReservasController.obtener_reservas_por_estudiante()
    return jsonify(resultado), status_code

@reservas_bp.route('/reservas/<int:reserva_id>/cancelar', methods=['PATCH'])
@token_requerido
@rol_requerido(['estudiante'])
def cancelar_reserva_route(reserva_id):
    resultado, status_code = ReservasController.cancelar_reserva(reserva_id)
    return jsonify(resultado), status_code

@reservas_bp.route('/reservas/<int:reserva_id>/confirmar-pago', methods=['PATCH'])
@token_requerido
@rol_requerido(['estudiante'])
def confirmar_pago_route(reserva_id):
    if request.content_type and 'multipart/form-data' not in request.content_type and 'application/json' not in request.content_type:
        return jsonify({"error": "Content-Type no soportado. Use multipart/form-data o application/json"}), 415
    
    try:
        resultado, status_code = ReservasController.confirmar_pago(reserva_id)
        return jsonify(resultado), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
