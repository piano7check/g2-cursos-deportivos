from flask import Blueprint
from controllers.controllerAuth import controllerAuth

autenticacion = Blueprint("autentificacion", __name__)

@autenticacion.route('/register', methods=['POST'])
def registro():
    return controllerAuth.registroUsuario()

@autenticacion.route('/login', methods=['POST'])
def accesoUsuario():
    return controllerAuth.loginUsuario()

@autenticacion.route('/logout', methods=['POST'])
def cerrar_sesion():
    return controllerAuth.logoutUsuario()

