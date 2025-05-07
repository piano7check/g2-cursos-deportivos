from flask import Blueprint
from controllers.controllerUser import controllerUsuario 
usuarioController = controllerUsuario()

autentificacionesUsuario = Blueprint("autentificacion", __name__)


@autentificacionesUsuario.route('/register',methods=['POST'])
def registro():
    return usuarioController.registroUsuario()


@autentificacionesUsuario.route('/login', methods=['POST'])
def accesoUsuario():
    return usuarioController.loginUsuario()
