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

@routesAdmin.route('/usuarios/<int:id>', methods=['GET'])
@token_requerido
@rol_requerido(['admin'])
def mostrar_usuarios():
    return controllerUsuario.mostrarUsuarios()
 

@routesAdmin.route('/usuarios/buscar', methods=['GET'])
@token_requerido
@rol_requerido(['admin'])
def buscar_usuario():
    return controllerUsuario.buscarUsuarioPorCampo()

@routesAdmin.route('/usuarios/register', methods=['POST'])
@token_requerido
@rol_requerido(['admin'])
def registrar_Usuario():
    return controllerUsuario.registrarUsuario()

@routesAdmin.route('/profesores', methods=['GET'])
@token_requerido
def obtener_profesores_admin():
    return controllerUsuario.obtener_profesores()