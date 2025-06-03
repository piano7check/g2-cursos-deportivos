from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import ControllerCursos

cursosEstudiante = Blueprint("courses", __name__)

@cursosEstudiante.route('/cursosEstudiantes', methods = ['GET'])
@token_requerido
@rol_requerido(['estudiante','profesor', 'admin'])
def cursosEstudiantes():
    return ControllerCursos.obtener_cursos()

