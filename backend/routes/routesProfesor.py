from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import ControllerCursos
from controllers.controllerAsistencias import ControllerAsistencias

routes_profesor = Blueprint("profesorRoute", __name__)

@routes_profesor.route('/cursos', methods=['GET'])
@token_requerido
@rol_requerido(['profesor', 'admin']) 
def obtener_cursos_profesor():
    return ControllerCursos.obtener_cursos_por_profesor()

@routes_profesor.route('/cursos/<int:curso_id>/estudiantes', methods=['GET'])
@token_requerido
@rol_requerido(['profesor', 'admin'])
def obtener_estudiantes_de_curso(curso_id):
    return ControllerAsistencias.obtener_estudiantes_por_curso(curso_id)

@routes_profesor.route('/asistencias', methods=['POST'])
@token_requerido
@rol_requerido(['profesor', 'admin'])
def registrar_asistencia_clase():
    return ControllerAsistencias.registrar_o_actualizar_asistencia()

@routes_profesor.route('/asistencias/<int:curso_id>/<string:fecha_str>', methods=['GET'])
@token_requerido
@rol_requerido(['profesor', 'admin'])
def consultar_asistencia_clase(curso_id, fecha_str):
    return ControllerAsistencias.obtener_asistencia_curso_fecha(curso_id, fecha_str)

