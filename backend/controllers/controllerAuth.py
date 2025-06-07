from flask import request, jsonify, make_response
import bcrypt
from models.userModels import userModel
from utils.validarLogin import validacionLogin
from utils.tokenUsuario import generarToken 
from datetime import datetime

class controllerAuth:
    @staticmethod
    def registroUsuario():
        data = request.get_json()
        
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
            return jsonify(resultado), 400

        token = generarToken(resultado)
        
        response_data = {
            "mensaje": "Login exitoso",
            "usuario": {
                "id": resultado.get('id'),
                "name": resultado.get('name'),
                "lastname": resultado.get('lastname'),
                "email": resultado.get('email'),
                "rol": resultado.get('rol')
            }
        }

        response = make_response(jsonify(response_data), 200)
        # Asegúrate de que secure=False para HTTP en desarrollo
        response.set_cookie(
            "access_token",
            token,
            httponly=True,
            secure=False, # Esto es crucial para localhost con HTTP
            samesite="Lax", # "Lax" es generalmente suficiente para localhost
            max_age=3600 * 24, # 24 horas
            path="/"
        )
        return response

    @staticmethod
    def logoutUsuario():
        response = make_response(jsonify({"mensaje": "Sesión cerrada correctamente"}), 200)
        response.set_cookie(
            "access_token", "",
            httponly=True,
            secure=False, # Mismo valor que en login
            samesite="Lax", # Mismo valor que en login
            expires=0,
            path="/"
        )
        return response

