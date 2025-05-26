from flask import Blueprint
from controllers.controllerUser import controllerUsuario 


autentificacionesUsuario = Blueprint("autentificacion", __name__)


@autentificacionesUsuario.route('/register',methods=['POST'])
def registro():
    return controllerUsuario.registroUsuario()

@autentificacionesUsuario.route('/login', methods=['POST'])
def accesoUsuario():
    return controllerUsuario.loginUsuario()


