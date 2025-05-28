from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import controllerCursos
from controllers.controllerUser import controllerUsuario

routesAdmin = Blueprint("adminRoute", __name__)


@routesAdmin.route("/cursos", methods=['GET']) 
@token_requerido
@rol_requerido(['admin'])
def mostrarCursos():
    return controllerCursos.mostrarCursos() 

@routesAdmin.route('/cursos', methods=['POST'])
@token_requerido
@rol_requerido(['admin'])
def crearCurso():
    return controllerCursos.crearCursos()

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


