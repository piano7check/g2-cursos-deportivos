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

# RUTA /profile para actualizar y eliminar el perfil del usuario actual (sin ID en la URL)
@routes_usuarios.route('/profile', methods=['PATCH'])
@token_requerido
# @validarPermisoUsuario # <-- Quita este decorador si userProfileController.editarPerfil ya no usa ID de URL
def editar_perfil_actual():
    # El ID del usuario se obtendrá de g.usuario dentro del controlador
    return userProfileController.editarPerfil()

@routes_usuarios.route('/profile', methods=['DELETE'])
@token_requerido
# @validarPermisoUsuario # <-- Quita este decorador si userProfileController.eliminarCuenta ya no usa ID de URL
def eliminar_cuenta_actual():
    # El ID del usuario se obtendrá de g.usuario dentro del controlador
    return userProfileController.eliminarCuenta()

# Mantén estas rutas si las usas para administración para editar/eliminar a otros usuarios
# @routes_usuarios.route('/usuarios/<int:id>', methods=['DELETE'])
# @token_requerido
# @validarPermisoUsuario
# def eliminar_usuario(id):
#     return userProfileController.eliminarCuenta(id)

# @routes_usuarios.route('/usuarios/<int:id>', methods=['PATCH'])
# @token_requerido
# @validarPermisoUsuario
# def editar_usuario(id):
#     return userProfileController.editarPerfil(id)

@routes_usuarios.route('/logout', methods=['POST'])
def logout():
    return userProfileController.logoutUsuario()

