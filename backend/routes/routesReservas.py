from flask import Blueprint, request, jsonify
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido # Corrección del typo
from controllers.controllerReservas import ReservasController

reservas_bp = Blueprint('reservas_bp', __name__)

@reservas_bp.route('/reservas', methods=['POST'])
@token_requerido
@rol_requerido(['estudiante'])
def crear_reserva_route():
    data = request.get_json()

    resultado, status_code = ReservasController.crear_reserva(data)

    return jsonify(resultado), status_code

@reservas_bp.route('/reservas/estudiante/<int:estudiante_id>', methods=['GET'])
@token_requerido
@rol_requerido(['estudiante', 'admin'])
def obtener_reservas_estudiante_route(estudiante_id):
    # La lógica en el controlador ya toma el ID del estudiante del token (g.usuario.get('id')).
    # El 'estudiante_id' de la URL se mantiene en la ruta para una estructura RESTful clara,
    # pero para la seguridad y la consistencia con g.usuario, el controlador no lo usa directamente.
    # Si quisieras que el admin pudiera ver las reservas de OTROS estudiantes,
    # necesitarías adaptar la lógica en el controlador para usar 'estudiante_id'
    # de la URL si el usuario es admin y validarlo.
    resultado, status_code = ReservasController.obtener_reservas_por_estudiante()

    return jsonify(resultado), status_code
