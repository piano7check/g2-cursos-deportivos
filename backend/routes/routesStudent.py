from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import ControllerCursos 

routes_student = Blueprint("studentRoute", __name__) 

@routes_student.route('/cursosEstudiantes', methods = ['GET'])
@token_requerido
@rol_requerido(['estudiante','profesor', 'admin'])
def cursosEstudiantes():
    return ControllerCursos.mostrarCursos() 
