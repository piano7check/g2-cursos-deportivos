from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import ControllerCursos
from controllers.controllerUser import controllerUsuario

routesAdmin = Blueprint("adminRoute", __name__)


@routesAdmin.route("/cursos", methods=['GET']) 
@token_requerido
@rol_requerido(['admin'])
def mostrarCursos():
    return ControllerCursos.obtener_cursos() 

@routesAdmin.route('/cursos', methods=['POST'])
@token_requerido
@rol_requerido(['admin'])
def crear_curso(): 
    return ControllerCursos.crear_curso() 

@routesAdmin.route('/cursos/<int:id>', methods=['DELETE'])
@token_requerido
@rol_requerido(['admin'])
def eliminar_curso(id): 
    return ControllerCursos.eliminar_curso(id) 

@routesAdmin.route('/usuarios', methods=['GET'])
@token_requerido
@rol_requerido(['admin'])
def mostrar_usuarios():
    return controllerUsuario.mostrarUsuarios()
 

@routesAdmin.route('/usuarios/buscar', methods=['GET'])
@token_requerido
@rol_requerido(['admin'])
def buscar_usuario():
    return controllerUsuario.buscarUsuarioPorCampo()

@routesAdmin.route('/profesores', methods=['GET'])
@token_requerido
def obtener_profesores_admin():
    return controllerUsuario.obtener_profesores()