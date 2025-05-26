from flask import jsonify, request
from models.cursosModels import cursosModels
from schemas.cursos import validarCurso

class controllerCursos():
    @staticmethod
    def mostrarCursos():
        resultado = cursosModels.mostrarCursos()
        if 'error' in resultado:
            return jsonify(resultado), 500
        return jsonify(resultado), 200
    
    @staticmethod
    def crearCursos():
        data = request.get_json()
        esValido, error = validarCurso(data)

        if not esValido:
            return jsonify({"error": "Datos no validos", "detalles" : error}), 400
        
        resultado = cursosModels.crearCursos(data)
        if 'error' in resultado:
            return jsonify(resultado), 500
        return jsonify({
            "message": "Curso creado exitosamente",
             "curso": {**resultado, **data}
            }), 201