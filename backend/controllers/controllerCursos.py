from flask import jsonify, request
from models.cursosModels import cursosModels

class controllerCursos():
    @staticmethod
    def mostrarCursos():
        resultado = cursosModels.mostrarCursos()
        if 'error' in resultado:
            return jsonify(resultado)
        return jsonify(resultado)
    
    @staticmethod
    def crearCursos():
        return 0
    ##falta completar 
        