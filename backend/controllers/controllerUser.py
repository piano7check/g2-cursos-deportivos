from flask import request,jsonify
from schemas.estudiantes import validarUsuario

class controllerUsuario():
    def registroUsuario(self):
        data = request.get_json()
        print(data)
        esValido, errores = validarUsuario(data)
        if esValido:
            return jsonify({"message": "Usuario registrado exitosamente!"}), 201
        
        return jsonify({"errors": errores}), 400        
            