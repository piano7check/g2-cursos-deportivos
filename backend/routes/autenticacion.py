from flask import Blueprint
from middleware.validarToken import token_requerido
from controllers.controllerUser import controllerUsuario 


autentificacionesUsuario = Blueprint("autentificacion", __name__)


@autentificacionesUsuario.route('/register',methods=['POST'])
def registro():
    return controllerUsuario.registroUsuario()

@autentificacionesUsuario.route('/login', methods=['POST'])
def accesoUsuario():
    return controllerUsuario.loginUsuario()

@autentificacionesUsuario.route('/usuario', methods=['GET'])
@token_requerido
def obtener_usuario_actual():
    return controllerUsuario.obtenerUsuarioActual()

