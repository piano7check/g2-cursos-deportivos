from flask import request,jsonify
import bcrypt
from models.userModels import userModel
from schemas.estudiantes import validarUsuario
from utils.validarLogin import validacionLogin
from utils.tokenUsuario import generarToken
class controllerUsuario():
    @staticmethod
    def registroUsuario():
        
        data = request.get_json()
        esValido, errores = validarUsuario(data)
        if not esValido:
            return jsonify({"errors": errores}), 400

        try:
            password = data['password'].encode('utf-8')
            hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
            data['password'] = hashed_password.decode('utf-8')
            data['rol'] = 'estudiante'
            resultado = userModel.crearUsuario(data)

            if 'error' in resultado:
                return jsonify(resultado), 500 

            return jsonify({
                "message": "Usuario registrado correctamente",
                "usuario": {
                    "name": data.get('name'),
                    "lastname": data.get('lastname'),
                    "email": data.get('email'),
                    "rol": data.get('rol')
                }
            }), 201
        
        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500 
     
    @staticmethod
    def loginUsuario():
        data = request.get_json()
        resultado = validacionLogin(data)
        if 'error' in resultado:
            return jsonify(resultado),400
        token = generarToken(resultado)
        return jsonify({"token": token})
    
    @staticmethod
    def eliminarUsuario(id):
        try:
            resultado = userModel.eliminarUsuario(id)
            if "error" in resultado:
                return jsonify(resultado), 500
            
            return jsonify(resultado), 200
            
        except Exception as e:
            return jsonify({"error": f"Error inesperado: {str(e)}"}), 500 
        
    @staticmethod
    def editarUsuario(id):
        try:
            resultado = userModel.editarUsuario(id)
        except Exception as e:
            return 0