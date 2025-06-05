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

@routes_usuarios.route('/usuarios/<int:id>', methods=['DELETE'])
@token_requerido
@validarPermisoUsuario 
def eliminar_mi_usuario(id): 
    return userProfileController.eliminarMiCuenta()


@routes_usuarios.route('/usuarios/<int:id>', methods=['PATCH'])
@token_requerido
@validarPermisoUsuario 
def editar_mi_usuario(id):
    return userProfileController.editarMiPerfil()
