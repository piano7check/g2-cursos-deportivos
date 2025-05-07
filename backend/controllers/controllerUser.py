from flask import request,jsonify
import bcrypt
from models.userModels import userModel
from schemas.estudiantes import validarUsuario
from utils.validarLogin import validacionLogin
from utils.tokenUsuario import generarToken
class controllerUsuario():
    def registroUsuario(self):
        
        data = request.get_json()
        esValido, errores = validarUsuario(data)

        if esValido:
            password = data['password'].encode('utf-8')
            hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
            data['password'] = hashed_password.decode('utf-8')
            data['rol'] = 'estudiante'

            resultado = userModel.crearUsuario(data)

            if 'error' in resultado:
                return jsonify(resultado), 500 

            return jsonify(resultado), 201  
        
        return jsonify({"errors": errores}), 400  
     
    def loginUsuario(self):
        data = request.get_json()
        resultado = validacionLogin(data)
        if 'error' in resultado:
            return jsonify(resultado),400
        token = generarToken(resultado)
        return jsonify({"token": token})
        