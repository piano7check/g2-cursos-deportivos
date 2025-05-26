from flask import Blueprint, jsonify, request
from middleware.validarToken import token_requerido
from middleware.validarRol import rol_requerido
from controllers.controllerCursos import controllerCursos

routesAdmin = Blueprint("adminRoute", __name__)


@routesAdmin.route("/cursos", methods=['GET']) 
@token_requerido
@rol_requerido(['admin'])
def mostrarCursos():
    return controllerCursos.mostrarCursos() 

@routesAdmin.route('/cursos', methods=['POST'])
@token_requerido
@rol_requerido(['admin'])
def crearCurso():
    return controllerCursos.crearCursos()


    