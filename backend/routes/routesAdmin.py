from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import ControllerCursos
from controllers.adminUserController import adminUserController 

routes_admin = Blueprint("adminRoute", __name__)

@routes_admin.before_request
@token_requerido
@rol_requerido(['admin'])
def before_request_admin():
    pass 

@routes_admin.route("/cursos", methods=['GET'])
def mostrarCursos():
    return ControllerCursos.mostrarCursos()

@routes_admin.route('/cursos', methods=['POST'])
def crear_curso():
    return ControllerCursos.crearCurso()

@routes_admin.route('/cursos/<int:id>', methods=['DELETE'])
def eliminar_curso(id):
    return ControllerCursos.eliminarCurso(id)

@routes_admin.route('/cursos/<int:id>', methods=['PATCH'])
def editar_curso(id):
    return ControllerCursos.editarCurso(id)

@routes_admin.route('/usuarios', methods=['GET'])
def mostrar_usuarios_admin(): 
    return adminUserController.mostrarUsuarios()

@routes_admin.route('/usuarios/buscar', methods=['GET'])
def buscar_usuario_admin(): 
    return adminUserController.buscarUsuarioPorCampo()

@routes_admin.route('/usuarios/<int:id>', methods=['DELETE'])
def eliminar_usuario_admin(id): 
    return adminUserController.eliminarUsuario(id)

@routes_admin.route('/usuarios/<int:id>', methods=['PATCH'])
def editar_usuario_admin(id): 
    return adminUserController.editarUsuario(id)

@routes_admin.route('/profesores', methods=['GET'])
def obtener_profesores_admin(): 
    return adminUserController.obtenerProfesores()
