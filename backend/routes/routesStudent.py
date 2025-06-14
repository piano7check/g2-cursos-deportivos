from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import ControllerCursos
from controllers.controllerReservas import ReservasController

routes_student = Blueprint("studentRoute", __name__)

@routes_student.route('/cursosEstudiantes', methods = ['GET'])
@token_requerido
@rol_requerido(['estudiante','profesor', 'admin'])
def cursosEstudiantes():
    return ControllerCursos.mostrarCursos()

@routes_student.route('/reservas/<int:reserva_id>/ocultar', methods=['PATCH'])
@token_requerido
@rol_requerido(['estudiante'])
def ocultar_reserva_estudiante(reserva_id):
    resultado, status_code = ReservasController.ocultar_reserva_estudiante(reserva_id)
    return jsonify(resultado), status_code
