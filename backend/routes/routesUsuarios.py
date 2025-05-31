from flask import Blueprint
from controllers.controllerUser import controllerUsuario
from middleware.validarRol import rol_requerido
from middleware.validarToken import token_requerido
from middleware.permisoUsuario import validarPermisoUsuario

routesUsuarios = Blueprint("userRoutes",__name__)

@routesUsuarios.route('/usuarios/<int:id>', methods=['DELETE'])
@token_requerido
@validarPermisoUsuario
def eliminar_usuario(id):
    return controllerUsuario.eliminarUsuario(id)


@routesUsuarios.route('/usuarios/<int:id>', methods=['PATCH'])
@token_requerido
@validarPermisoUsuario
def editarUsuario(id):
    return controllerUsuario.editarUsuario(id)
