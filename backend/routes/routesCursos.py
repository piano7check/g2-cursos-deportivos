from flask import Blueprint, jsonify, request
from utils.validarToken import token_requerido
from controllers.controllerCursos import controllerCursos

cursosEstudiante = Blueprint("courses", __name__)

@cursosEstudiante.route("/cursos", methods=['GET'])
@token_requerido
def mostrarCursos():
    return  
