from flask import Blueprint
from controllers.userProfileController import userProfileController
from middleware.validarRol import rol_requerido
from middleware.validarToken import token_requerido
from middleware.permisoUsuario import validarPermisoUsuario

routes_usuarios = Blueprint("userRoutes", __name__)

@routes_usuarios.route('/me', methods=['GET'])
@token_requerido
def obtener_usuario_actual():
    return userProfileController.obtenerUsuarioActual()

@routes_usuarios.route('/profile', methods=['PATCH'])
@token_requerido
def editar_perfil_actual():
    return userProfileController.editarPerfil()

@routes_usuarios.route('/profile', methods=['DELETE'])
@token_requerido
def eliminar_cuenta_actual():
    return userProfileController.eliminarCuenta()

@routes_usuarios.route('/logout', methods=['POST'])
def logout():
    return userProfileController.logoutUsuario()

