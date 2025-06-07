from flask import Blueprint
from controllers.controllerCategorias import ControllerCategorias
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido

routes_categorias = Blueprint("categorias_api", __name__)

@routes_categorias.before_request
@token_requerido
@rol_requerido(['admin'])
def before_request_categorias_api():
    pass

@routes_categorias.route("/categorias", methods=['GET'])
def get_all_categorias():
    return ControllerCategorias.mostrarCategorias()

@routes_categorias.route('/categorias', methods=['POST'])
def create_categoria():
    return ControllerCategorias.crearCategoria()

@routes_categorias.route('/categorias/<int:id>', methods=['GET'])
def get_categoria_by_id(id):
    return ControllerCategorias.obtenerCategoriaPorId(id)

@routes_categorias.route('/categorias/<int:id>', methods=['PATCH'])
def update_categoria(id):
    return ControllerCategorias.actualizarCategoria(id)

@routes_categorias.route('/categorias/<int:id>', methods=['DELETE'])
def delete_categoria(id):
    return ControllerCategorias.eliminarCategoria(id)

