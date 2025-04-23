from flask import Blueprint
from controllers.controllerUser import controllerUsuario 
usuarioController = controllerUsuario()
autentificacionesUsuario = Blueprint("autentificaion", __name__)


@autentificacionesUsuario.route('/register',methods=['POST'])
def registro():
    return usuarioController.registroUsuario()


@autentificacionesUsuario.route('/acceso', methods=['POST'])
def accesoUsuario():
    return 0
