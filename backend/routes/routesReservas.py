from flask import Blueprint, request, jsonify
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
