from flask import request,jsonify
import bcrypt
from models.userModels import userModel
from schemas.estudiantes import validarUsuario

class controllerUsuario():
    def registroUsuario(self):
        
        data = request.get_json()
        esValido, errores = validarUsuario(data)
        print("Errores de validación:", errores)

        print("Datos recibidos:", data)
        print("Fecha de nacimiento recibida:", data.get('birthdate'))

        if esValido:
            password = data['password'].encode('utf-8')
            hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
            data['password'] = hashed_password.decode('utf-8')

            resultado = userModel.crearUsuario(data)

            if 'error' in resultado:
                return jsonify(resultado), 500 

            return jsonify(resultado), 201  
        
        return jsonify({"errors": errores}), 400  
     
